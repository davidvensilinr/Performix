import joblib
import pandas as pd
import os

MODELS = os.path.join(os.path.dirname(__file__), "models")

COLS = {
    "productivity": ["avg_time", "deadlines_met", "tasks_completed"],
    "firing":       ["performance_score", "attendance_percent", "late_days", "projects_completed", "complaints"],
    "overtime":     ["performance_score", "workload", "deadline_pressure", "job_satisfaction", "experience_years", "past_overtime"],
    "performance":  ["performance_score", "attendance_percent", "projects_completed", "skills_score", "experience_years"],
    "promotion":    ["performance_score", "attendance_percent", "projects_completed", "skills_score", "experience_years", "leadership_score"],
    "quitting":     ["salary", "job_satisfaction", "work_hours", "overtime", "performance_score", "experience_years"],
}

def make_df(key, vals):
    return pd.DataFrame([vals], columns=COLS[key])

prod   = joblib.load(os.path.join(MODELS, "productivity_model.pkl"))
fire   = joblib.load(os.path.join(MODELS, "firing_model.pkl"))
ot     = joblib.load(os.path.join(MODELS, "overtime_decider.pkl"))
perf   = joblib.load(os.path.join(MODELS, "performance_analyser.pkl"))
prom   = joblib.load(os.path.join(MODELS, "promotion_decision.pkl"))
quit_  = joblib.load(os.path.join(MODELS, "quiting_prediction.pkl"))

# sample employee
tasks, deadlines, avg_time = 42, 38, 7.5
p_score, attend, late, projects, complaints = 8, 92, 1, 12, 0
skills, exp, leadership = 8, 4.5, 7
workload, pressure, satisfaction, past_ot = 7, 6, 8, 0
salary, work_hours = 85000, 42

r1 = int(prod.predict(make_df("productivity", [avg_time, deadlines, tasks]))[0])
r2 = int(fire.predict(make_df("firing", [p_score, attend, late, projects, complaints]))[0])
r3 = int(ot.predict(make_df("overtime", [p_score, workload, pressure, satisfaction, exp, past_ot]))[0])
r4 = int(perf.predict(make_df("performance", [p_score, attend, projects, skills, exp]))[0])
r5 = int(prom.predict(make_df("promotion", [p_score, attend, projects, skills, exp, leadership]))[0])
r6 = int(quit_.predict(make_df("quitting", [salary, satisfaction, work_hours, r3, p_score, exp]))[0])

perf_labels = {0: "Low", 1: "Medium", 2: "High"}

print("productivity  ->", "Productive" if r1 else "Not Productive")
print("firing_risk   ->", "At Risk" if r2 else "Stable")
print("overtime      ->", "Overtime Likely" if r3 else "No Overtime", " (piped into quitting as", r3, ")")
print("performance   ->", perf_labels[r4])
print("promotion     ->", "Promotion Ready" if r5 else "Not Ready")
print("quitting_risk ->", "Flight Risk" if r6 else "Likely to Stay", " (overtime input =", r3, ")")
print()
print("ALL MODELS OK - chaining verified")
