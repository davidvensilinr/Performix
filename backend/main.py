from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="Performix ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your Vercel domain in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load models ───────────────────────────────────────────────────────────────
BASE   = os.path.dirname(__file__)
MODELS = os.path.join(BASE, "models")

productivity_model = joblib.load(os.path.join(MODELS, "productivity_model.pkl"))
firing_model       = joblib.load(os.path.join(MODELS, "firing_model.pkl"))
overtime_model     = joblib.load(os.path.join(MODELS, "overtime_decider.pkl"))
performance_model  = joblib.load(os.path.join(MODELS, "performance_analyser.pkl"))
promotion_model    = joblib.load(os.path.join(MODELS, "promotion_decision.pkl"))
quitting_model     = joblib.load(os.path.join(MODELS, "quiting_prediction.pkl"))
salary_model       = joblib.load(os.path.join(MODELS, "salary_calculator.pkl"))

# ── Column name maps (must match training data) ───────────────────────────────
COLS = {
    "productivity":  ["avg_time", "deadlines_met", "tasks_completed"],
    "firing":        ["performance_score", "attendance_percent", "late_days", "projects_completed", "complaints"],
    "overtime":      ["performance_score", "workload", "deadline_pressure", "job_satisfaction", "experience_years", "past_overtime"],
    "performance":   ["performance_score", "attendance_percent", "projects_completed", "skills_score", "experience_years"],
    "promotion":     ["performance_score", "attendance_percent", "projects_completed", "skills_score", "experience_years", "leadership_score"],
    "quitting":      ["salary", "job_satisfaction", "work_hours", "overtime", "performance_score", "experience_years"],
    "salary":        ["performance_score", "attendance_percent", "projects_completed", "skills_score", "experience_years"],
}

PERFORMANCE_LABELS = {0: "Low", 1: "Medium", 2: "High"}


def _df(key: str, values: list) -> pd.DataFrame:
    return pd.DataFrame([values], columns=COLS[key])


def _proba(model, df: pd.DataFrame) -> float | None:
    if hasattr(model, "predict_proba"):
        return round(float(model.predict_proba(df)[0][1]) * 100, 1)
    return None


# ── Schemas ───────────────────────────────────────────────────────────────────

class ProductivityInput(BaseModel):
    avg_time: float
    deadlines_met: int
    tasks_completed: int

class FiringInput(BaseModel):
    performance_score: int
    attendance_percent: float
    late_days: int
    projects_completed: int
    complaints: int

class OvertimeInput(BaseModel):
    performance_score: int
    workload: int
    deadline_pressure: int
    job_satisfaction: int
    experience_years: float
    past_overtime: int

class PerformanceInput(BaseModel):
    performance_score: int
    attendance_percent: float
    projects_completed: int
    skills_score: int
    experience_years: float

class PromotionInput(BaseModel):
    performance_score: int
    attendance_percent: float
    projects_completed: int
    skills_score: int
    experience_years: float
    leadership_score: int

class QuittingInput(BaseModel):
    salary: float
    job_satisfaction: int
    work_hours: int
    overtime: int
    performance_score: int
    experience_years: float

class SalaryInput(BaseModel):
    performance_score: int
    attendance_percent: float
    projects_completed: int
    skills_score: int
    experience_years: float

class EmployeeAnalysisInput(BaseModel):
    # Core (stored in DB)
    tasks_completed: int
    deadlines_met: int
    avg_time: float

    # Extended
    performance_score: int
    attendance_percent: float
    late_days: int = 0
    projects_completed: int
    complaints: int = 0
    skills_score: int
    experience_years: float
    leadership_score: int
    workload: int
    deadline_pressure: int
    job_satisfaction: int
    past_overtime: int = 0   # converted from yes/no on frontend


# ── Individual endpoints ──────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "Performix ML API is running"}


@app.post("/predict/productivity")
def predict_productivity(data: ProductivityInput):
    X = _df("productivity", [data.avg_time, data.deadlines_met, data.tasks_completed])
    pred = int(productivity_model.predict(X)[0])
    return {"productive": bool(pred), "label": "Productive" if pred else "Not Productive", "confidence": _proba(productivity_model, X)}


@app.post("/predict/firing")
def predict_firing(data: FiringInput):
    X = _df("firing", [data.performance_score, data.attendance_percent, data.late_days, data.projects_completed, data.complaints])
    pred = int(firing_model.predict(X)[0])
    return {"at_risk": bool(pred), "label": "At Risk" if pred else "Stable", "confidence": _proba(firing_model, X)}


@app.post("/predict/overtime")
def predict_overtime(data: OvertimeInput):
    X = _df("overtime", [data.performance_score, data.workload, data.deadline_pressure, data.job_satisfaction, data.experience_years, data.past_overtime])
    pred = int(overtime_model.predict(X)[0])
    return {"needs_overtime": bool(pred), "label": "Overtime Likely" if pred else "No Overtime", "confidence": _proba(overtime_model, X)}


@app.post("/predict/performance")
def predict_performance(data: PerformanceInput):
    X = _df("performance", [data.performance_score, data.attendance_percent, data.projects_completed, data.skills_score, data.experience_years])
    pred = int(performance_model.predict(X)[0])
    return {"performance_label": pred, "label": PERFORMANCE_LABELS.get(pred, "Unknown")}


@app.post("/predict/promotion")
def predict_promotion(data: PromotionInput):
    X = _df("promotion", [data.performance_score, data.attendance_percent, data.projects_completed, data.skills_score, data.experience_years, data.leadership_score])
    pred = int(promotion_model.predict(X)[0])
    return {"promoted": bool(pred), "label": "Promotion Ready" if pred else "Not Ready", "confidence": _proba(promotion_model, X)}


@app.post("/predict/quitting")
def predict_quitting(data: QuittingInput):
    X = _df("quitting", [data.salary, data.job_satisfaction, data.work_hours, data.overtime, data.performance_score, data.experience_years])
    pred = int(quitting_model.predict(X)[0])
    return {"will_quit": bool(pred), "label": "Flight Risk" if pred else "Likely to Stay", "confidence": _proba(quitting_model, X)}


@app.post("/predict/salary")
def predict_salary(data: SalaryInput):
    X = _df("salary", [data.performance_score, data.attendance_percent, data.projects_completed, data.skills_score, data.experience_years])
    return {"estimated_salary": round(float(salary_model.predict(X)[0]), 2)}


# ── Full analysis (all 7 models in one call) ──────────────────────────────────

@app.post("/predict/analyse")
def analyse_employee(data: EmployeeAnalysisInput):
    results = {}

    X = _df("productivity", [data.avg_time, data.deadlines_met, data.tasks_completed])
    pred = int(productivity_model.predict(X)[0])
    results["productivity"] = {"productive": bool(pred), "label": "Productive" if pred else "Not Productive", "confidence": _proba(productivity_model, X)}

    X = _df("firing", [data.performance_score, data.attendance_percent, data.late_days, data.projects_completed, data.complaints])
    pred = int(firing_model.predict(X)[0])
    results["firing_risk"] = {"at_risk": bool(pred), "label": "At Risk" if pred else "Stable", "confidence": _proba(firing_model, X)}

    X = _df("overtime", [data.performance_score, data.workload, data.deadline_pressure, data.job_satisfaction, data.experience_years, data.past_overtime])
    pred = int(overtime_model.predict(X)[0])
    results["overtime"] = {"needs_overtime": bool(pred), "label": "Overtime Likely" if pred else "No Overtime", "confidence": _proba(overtime_model, X)}
    predicted_overtime = pred  # pipe into quitting model

    X = _df("performance", [data.performance_score, data.attendance_percent, data.projects_completed, data.skills_score, data.experience_years])
    pred = int(performance_model.predict(X)[0])
    results["performance"] = {"performance_label": pred, "label": PERFORMANCE_LABELS.get(pred, "Unknown")}

    X = _df("promotion", [data.performance_score, data.attendance_percent, data.projects_completed, data.skills_score, data.experience_years, data.leadership_score])
    pred = int(promotion_model.predict(X)[0])
    results["promotion"] = {"promoted": bool(pred), "label": "Promotion Ready" if pred else "Not Ready", "confidence": _proba(promotion_model, X)}

    # overtime fed from prediction above, not from user input
    # quitting model runs internally but result is not returned to frontend
    X = _df("quitting", [0.0, data.job_satisfaction, 40, predicted_overtime, data.performance_score, data.experience_years])
    pred = int(quitting_model.predict(X)[0])
    # (quitting_risk intentionally omitted from response)

    X = _df("salary", [data.performance_score, data.attendance_percent, data.projects_completed, data.skills_score, data.experience_years])
    # salary estimate intentionally omitted from response

    return results
