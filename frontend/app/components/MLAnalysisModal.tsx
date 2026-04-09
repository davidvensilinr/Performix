"use client";

import { useState } from "react";
import type { Employee } from "@/app/pages/organisation_dashboard/[id]/page";

type MLResult = {
    productivity: { label: string; confidence: number | null };
    firing_risk:  { label: string; confidence: number | null };
    overtime:     { label: string; confidence: number | null };
    performance:  { label: string };
    promotion:    { label: string; confidence: number | null };
};

// Model metadata — what model was used and which metrics it consumed
const MODEL_META: Record<keyof MLResult, {
    model: string;
    metrics: string[];
    advice: Record<string, string>;
}> = {
    performance: {
        model: "K-Nearest Neighbours (KNN)",
        metrics: ["Performance Score", "Attendance %", "Projects Completed", "Skills Score", "Experience"],
        advice: {
            "High":   "Excellent performance tier. Keep up the consistency and consider mentoring others.",
            "Medium": "Solid performer. Focus on skills development and increasing project output.",
            "Low":    "Performance needs improvement. Consider targeted training and closer support.",
        },
    },
    productivity: {
        model: "Logistic Regression",
        metrics: ["Avg Time per Task", "Deadlines Met", "Tasks Completed"],
        advice: {
            "Productive":     "Strong productivity. Task completion rate and time management are on point.",
            "Not Productive": "Productivity is below expectations. Review workload balance and time allocation.",
        },
    },
    promotion: {
        model: "Decision Tree",
        metrics: ["Performance Score", "Attendance %", "Projects Completed", "Skills Score", "Experience", "Leadership Score"],
        advice: {
            "Promotion Ready": "This employee meets the criteria for promotion. Consider advancing their role.",
            "Not Ready":       "Not yet ready for promotion. Focus on leadership development and project delivery.",
        },
    },
    firing_risk: {
        model: "Logistic Regression",
        metrics: ["Performance Score", "Attendance %", "Late Days", "Projects Completed", "Complaints"],
        advice: {
            "At Risk": "High risk of termination. Immediate performance review and support plan recommended.",
            "Stable":  "Employee is stable. No immediate concerns based on current metrics.",
        },
    },
    overtime: {
        model: "Gaussian Naive Bayes",
        metrics: ["Performance Score", "Workload", "Deadline Pressure", "Job Satisfaction", "Experience", "Past Overtime"],
        advice: {
            "Overtime Likely": "Overtime is likely needed. Monitor workload and ensure adequate compensation.",
            "No Overtime":     "Current workload is manageable. No overtime expected under present conditions.",
        },
    },
};

type Props = {
    employee: Employee;
    isGuest: boolean;
    onMetricsSaved: (updated: Employee) => void;
    onClose: () => void;
};

const BADGE: Record<string, string> = {
    "Productive":      "bg-green-100 text-green-700",
    "Not Productive":  "bg-red-100 text-red-700",
    "At Risk":         "bg-red-100 text-red-700",
    "Stable":          "bg-green-100 text-green-700",
    "Overtime Likely": "bg-amber-100 text-amber-700",
    "No Overtime":     "bg-green-100 text-green-700",
    "High":            "bg-green-100 text-green-700",
    "Medium":          "bg-amber-100 text-amber-700",
    "Low":             "bg-red-100 text-red-700",
    "Promotion Ready": "bg-purple-100 text-purple-700",
    "Not Ready":       "bg-gray-100 text-gray-600",
};

function Badge({ label }: { label: string }) {
    const cls = BADGE[label] ?? "bg-gray-100 text-gray-600";
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}

function ConfidenceBar({ value }: { value: number | null }) {
    if (value === null) return null;
    const color = value >= 70 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";
    return (
        <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400 w-16 shrink-0">Confidence</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-semibold w-10 text-right" style={{ color }}>{value}%</span>
        </div>
    );
}

function ResultCard({ title, resultKey, label, confidence }: {
    title: string;
    resultKey: keyof MLResult;
    label: string;
    confidence?: number | null;
}) {
    const meta = MODEL_META[resultKey];
    const advice = meta.advice[label] ?? "Review this metric with the employee.";
    const isPositive = ["Productive", "Stable", "Promotion Ready", "No Overtime", "High", "Medium"].includes(label);

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800">{title}</span>
                <Badge label={label} />
            </div>
            <div className="p-4 space-y-3">
                {/* Model used */}
                <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">Model</span>
                    <span className="text-xs font-medium text-gray-600">{meta.model}</span>
                </div>
                {/* Metrics used */}
                <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">Inputs</span>
                    <div className="flex flex-wrap gap-1">
                        {meta.metrics.map(m => (
                            <span key={m} className="px-2 py-0.5 bg-[#7825ff]/8 text-[#7825ff] text-xs rounded-md font-medium">{m}</span>
                        ))}
                    </div>
                </div>
                {/* Confidence */}
                {confidence !== undefined && confidence !== null && (
                    <ConfidenceBar value={confidence} />
                )}
                {/* Advice line */}
                <div className={`text-xs rounded-lg px-3 py-2 leading-relaxed ${isPositive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {advice}
                </div>
            </div>
        </div>
    );
}

type Fields = {
    performance_score: string;
    attendance_percent: string;
    late_days: string;
    projects_completed: string;
    complaints: string;
    skills_score: string;
    experience_years: string;
    leadership_score: string;
    workload: string;
    deadline_pressure: string;
    job_satisfaction: string;
    past_overtime: boolean;
};

const NUM_FIELDS: [keyof Omit<Fields, "past_overtime">, string][] = [
    ["performance_score",  "Performance Score (1-10)"],
    ["attendance_percent", "Attendance %"],
    ["late_days",          "Late Days"],
    ["projects_completed", "Projects Completed"],
    ["complaints",         "Complaints"],
    ["skills_score",       "Skills Score (1-10)"],
    ["experience_years",   "Experience (years)"],
    ["leadership_score",   "Leadership Score (1-10)"],
    ["workload",           "Workload (1-10)"],
    ["deadline_pressure",  "Deadline Pressure (1-10)"],
    ["job_satisfaction",   "Job Satisfaction (1-10)"],
];

export default function MLAnalysisModal({ employee, isGuest, onMetricsSaved, onClose }: Props) {
    const [fields, setFields] = useState<Fields>({
        performance_score:  employee.performance_score?.toString()  ?? "7",
        attendance_percent: employee.attendance_percent?.toString() ?? "85",
        late_days:          employee.late_days?.toString()          ?? "2",
        projects_completed: employee.projects_completed?.toString() ?? "8",
        complaints:         employee.complaints?.toString()         ?? "0",
        skills_score:       employee.skills_score?.toString()       ?? "7",
        experience_years:   employee.experience_years?.toString()   ?? "3",
        leadership_score:   employee.leadership_score?.toString()   ?? "6",
        workload:           employee.workload?.toString()           ?? "6",
        deadline_pressure:  employee.deadline_pressure?.toString()  ?? "5",
        job_satisfaction:   employee.job_satisfaction?.toString()   ?? "7",
        past_overtime:      employee.past_overtime ?? false,
    });

    const [result, setResult] = useState<MLResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<"form" | "result">("form");

    const n = (v: string) => v === "" ? 0 : Number(v);

    const runAnalysis = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/ml/analyse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tasks_completed:    employee.tasks ?? 0,
                    deadlines_met:      employee.deadline_met ?? 0,
                    avg_time:           employee.averagetime ?? 0,
                    performance_score:  n(fields.performance_score),
                    attendance_percent: n(fields.attendance_percent),
                    late_days:          n(fields.late_days),
                    projects_completed: n(fields.projects_completed),
                    complaints:         n(fields.complaints),
                    skills_score:       n(fields.skills_score),
                    experience_years:   n(fields.experience_years),
                    leadership_score:   n(fields.leadership_score),
                    workload:           n(fields.workload),
                    deadline_pressure:  n(fields.deadline_pressure),
                    job_satisfaction:   n(fields.job_satisfaction),
                    past_overtime:      fields.past_overtime ? 1 : 0,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (data.error === "ml_timeout") {
                    throw new Error("timeout");
                }
                throw new Error("unavailable");
            }
            const data = await res.json();
            setResult({
                productivity: data.productivity,
                firing_risk:  data.firing_risk,
                overtime:     data.overtime,
                performance:  data.performance,
                promotion:    data.promotion,
            });
            setStep("result");

            // Auto-save metrics to DB (or guest store)
            await saveMetrics();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "";
            if (msg === "timeout") {
                setError("The ML service is waking up (Render cold start). Wait 15 seconds and try again.");
            } else {
                setError("ML backend is offline. Run:  uvicorn main:app --reload  (inside /backend)");
            }
        } finally {
            setLoading(false);
        }
    };

    const saveMetrics = async () => {
        if (isGuest) return; // guest store doesn't persist ML metrics
        setSaving(true);
        try {
            await fetch("/api/employees", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emp_id:             employee.emp_id,
                    performance_score:  n(fields.performance_score),
                    attendance_percent: n(fields.attendance_percent),
                    late_days:          n(fields.late_days),
                    projects_completed: n(fields.projects_completed),
                    complaints:         n(fields.complaints),
                    skills_score:       n(fields.skills_score),
                    experience_years:   n(fields.experience_years),
                    leadership_score:   n(fields.leadership_score),
                    workload:           n(fields.workload),
                    deadline_pressure:  n(fields.deadline_pressure),
                    job_satisfaction:   n(fields.job_satisfaction),
                    past_overtime:      fields.past_overtime,
                }),
            });
            // Propagate updated employee back to parent
            onMetricsSaved({
                ...employee,
                performance_score:  n(fields.performance_score),
                attendance_percent: n(fields.attendance_percent),
                late_days:          n(fields.late_days),
                projects_completed: n(fields.projects_completed),
                complaints:         n(fields.complaints),
                skills_score:       n(fields.skills_score),
                experience_years:   n(fields.experience_years),
                leadership_score:   n(fields.leadership_score),
                workload:           n(fields.workload),
                deadline_pressure:  n(fields.deadline_pressure),
                job_satisfaction:   n(fields.job_satisfaction),
                past_overtime:      fields.past_overtime,
            });
        } catch { /* non-fatal */ }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>

                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#7825ff]/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-[#7825ff]">{employee.emp_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 leading-tight">{employee.emp_name}</p>
                            <p className="text-xs text-gray-400">ML Analysis</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">x</button>
                </div>

                <div className="p-6">
                    {step === "form" && (
                        <>
                            <p className="text-sm text-gray-500 mb-5">
                                Core stats (tasks, deadlines, avg time) are pre-filled. Overtime is predicted automatically.
                                Metrics are saved to the employee record after analysis.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {NUM_FIELDS.map(([key, label]) => (
                                    <div key={key}>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                                        <input
                                            type="number"
                                            value={fields[key]}
                                            onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none"
                                        />
                                    </div>
                                ))}
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Has worked overtime before?</label>
                                    <div className="flex rounded-lg overflow-hidden border border-gray-200">
                                        <button type="button" onClick={() => setFields(f => ({ ...f, past_overtime: false }))}
                                            className={`flex-1 py-2 text-xs font-semibold transition-colors ${!fields.past_overtime ? "bg-[#7825ff] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                                            No
                                        </button>
                                        <button type="button" onClick={() => setFields(f => ({ ...f, past_overtime: true }))}
                                            className={`flex-1 py-2 text-xs font-semibold transition-colors ${fields.past_overtime ? "bg-[#7825ff] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                                            Yes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-lg p-3 font-mono">{error}</p>}

                            <button onClick={runAnalysis} disabled={loading}
                                className="mt-6 w-full py-3 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-xl transition-all disabled:opacity-60">
                                {loading ? "Running models..." : "Run Analysis"}
                            </button>
                        </>
                    )}

                    {step === "result" && result && (
                        <>
                            {saving && <p className="text-xs text-gray-400 mb-3 text-center">Saving metrics...</p>}
                            <div className="space-y-3">
                                <ResultCard title="Performance Tier"  resultKey="performance"  label={result.performance.label} />
                                <ResultCard title="Productivity"      resultKey="productivity"  label={result.productivity.label} confidence={result.productivity.confidence} />
                                <ResultCard title="Promotion"         resultKey="promotion"     label={result.promotion.label}    confidence={result.promotion.confidence} />
                                <ResultCard title="Firing Risk"       resultKey="firing_risk"   label={result.firing_risk.label}  confidence={result.firing_risk.confidence} />
                                <ResultCard title="Overtime Forecast" resultKey="overtime"      label={result.overtime.label}     confidence={result.overtime.confidence} />
                            </div>
                            <button onClick={() => { setStep("form"); setResult(null); }}
                                className="mt-5 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-sm">
                                Re-run with different values
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
