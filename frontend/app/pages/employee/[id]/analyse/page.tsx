"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useGuestStore } from "@/lib/useGuestStore";
import type { Employee } from "@/app/pages/organisation_dashboard/[id]/page";

// ─── Types ────────────────────────────────────────────────────────────────────
type MLResult = {
    productivity: { label: string; confidence: number | null };
    firing_risk:  { label: string; confidence: number | null };
    overtime:     { label: string; confidence: number | null };
    performance:  { label: string };
    promotion:    { label: string; confidence: number | null };
};

type Fields = {
    performance_score:  string;
    attendance_percent: string;
    late_days:          string;
    projects_completed: string;
    complaints:         string;
    skills_score:       string;
    experience_years:   string;
    leadership_score:   string;
    workload:           string;
    deadline_pressure:  string;
    job_satisfaction:   string;
    past_overtime:      boolean;
};

// ─── Model metadata ───────────────────────────────────────────────────────────
type ModelMeta = {
    model: string;
    inputKeys: (keyof Fields | "tasks_completed" | "deadlines_met" | "avg_time")[];
    inputLabels: Record<string, string>;
    advice: Record<string, { text: string; positive: boolean }>;
};

const MODEL_META: Record<keyof MLResult, ModelMeta> = {
    performance: {
        model: "K-Nearest Neighbours (KNN)",
        inputKeys: ["performance_score", "attendance_percent", "projects_completed", "skills_score", "experience_years"],
        inputLabels: {
            performance_score:  "Performance Score",
            attendance_percent: "Attendance %",
            projects_completed: "Projects Completed",
            skills_score:       "Skills Score",
            experience_years:   "Experience (yrs)",
        },
        advice: {
            "High":   { text: "Excellent performance tier. Keep up the consistency and consider mentoring others.", positive: true },
            "Medium": { text: "Solid performer. Focus on skills development and increasing project output.", positive: true },
            "Low":    { text: "Performance needs improvement. Consider targeted training and closer support.", positive: false },
        },
    },
    productivity: {
        model: "Logistic Regression",
        inputKeys: ["avg_time", "deadlines_met", "tasks_completed"],
        inputLabels: {
            avg_time:       "Avg Time / Task (hrs)",
            deadlines_met:  "Deadlines Met",
            tasks_completed:"Tasks Completed",
        },
        advice: {
            "Productive":     { text: "Strong productivity. Task completion rate and time management are on point.", positive: true },
            "Not Productive": { text: "Productivity is below expectations. Review workload balance and time allocation.", positive: false },
        },
    },
    promotion: {
        model: "Decision Tree",
        inputKeys: ["performance_score", "attendance_percent", "projects_completed", "skills_score", "experience_years", "leadership_score"],
        inputLabels: {
            performance_score:  "Performance Score",
            attendance_percent: "Attendance %",
            projects_completed: "Projects Completed",
            skills_score:       "Skills Score",
            experience_years:   "Experience (yrs)",
            leadership_score:   "Leadership Score",
        },
        advice: {
            "Promotion Ready": { text: "This employee meets the criteria for promotion. Consider advancing their role.", positive: true },
            "Not Ready":       { text: "Not yet ready for promotion. Focus on leadership development and project delivery.", positive: false },
        },
    },
    firing_risk: {
        model: "Logistic Regression",
        inputKeys: ["performance_score", "attendance_percent", "late_days", "projects_completed", "complaints"],
        inputLabels: {
            performance_score:  "Performance Score",
            attendance_percent: "Attendance %",
            late_days:          "Late Days",
            projects_completed: "Projects Completed",
            complaints:         "Complaints",
        },
        advice: {
            "At Risk": { text: "High risk of termination. Immediate performance review and support plan recommended.", positive: false },
            "Stable":  { text: "Employee is stable. No immediate concerns based on current metrics.", positive: true },
        },
    },
    overtime: {
        model: "Gaussian Naive Bayes",
        inputKeys: ["performance_score", "workload", "deadline_pressure", "job_satisfaction", "experience_years", "past_overtime"],
        inputLabels: {
            performance_score: "Performance Score",
            workload:          "Workload",
            deadline_pressure: "Deadline Pressure",
            job_satisfaction:  "Job Satisfaction",
            experience_years:  "Experience (yrs)",
            past_overtime:     "Past Overtime",
        },
        advice: {
            "Overtime Likely": { text: "Overtime is likely needed. Monitor workload and ensure adequate compensation.", positive: false },
            "No Overtime":     { text: "Current workload is manageable. No overtime expected under present conditions.", positive: true },
        },
    },
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

// ─── Sub-components ───────────────────────────────────────────────────────────
function Badge({ label }: { label: string }) {
    return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${BADGE[label] ?? "bg-gray-100 text-gray-600"}`}>{label}</span>;
}

function ConfidenceBar({ value }: { value: number | null }) {
    if (value === null) return null;
    const color = value >= 70 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";
    return (
        <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400 w-20 shrink-0">Confidence</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-bold w-10 text-right" style={{ color }}>{value}%</span>
        </div>
    );
}

function ResultCard({
    title, resultKey, label, confidence, fields, employee,
}: {
    title: string;
    resultKey: keyof MLResult;
    label: string;
    confidence?: number | null;
    fields: Fields;
    employee: Employee;
}) {
    const meta = MODEL_META[resultKey];
    const adv = meta.advice[label] ?? { text: "Review this metric with the employee.", positive: true };

    // Build the actual input values used
    const inputValues: { label: string; value: string }[] = meta.inputKeys.map(k => {
        const lbl = meta.inputLabels[k] ?? k;
        let val = "";
        if (k === "tasks_completed") val = String(employee.tasks ?? 0);
        else if (k === "deadlines_met") val = String(employee.deadline_met ?? 0);
        else if (k === "avg_time") val = String(employee.averagetime ?? 0);
        else if (k === "past_overtime") val = fields.past_overtime ? "Yes" : "No";
        else val = String(fields[k as keyof Omit<Fields, "past_overtime">] ?? "—");
        return { label: lbl, value: val };
    });

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
                    <p className="text-sm font-semibold text-gray-700">{meta.model}</p>
                </div>
                <Badge label={label} />
            </div>

            <div className="px-6 py-4 space-y-4">
                {/* Confidence */}
                {confidence !== undefined && confidence !== null && (
                    <ConfidenceBar value={confidence} />
                )}

                {/* Inputs used */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Inputs used</p>
                    <div className="grid grid-cols-2 gap-2">
                        {inputValues.map(iv => (
                            <div key={iv.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-xs text-gray-500">{iv.label}</span>
                                <span className="text-xs font-bold text-gray-800 ml-2">{iv.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Advice */}
                <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${adv.positive ? "bg-green-50 text-green-800 border border-green-100" : "bg-amber-50 text-amber-800 border border-amber-100"}`}>
                    <span className="font-semibold">{adv.positive ? "Keep it up — " : "Needs attention — "}</span>
                    {adv.text}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalysePage() {
    const params = useParams();
    const router = useRouter();
    const empId = Number(params.id);

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loadingEmp, setLoadingEmp] = useState(true);
    const [fields, setFields] = useState<Fields>({
        performance_score:  "7",
        attendance_percent: "85",
        late_days:          "2",
        projects_completed: "8",
        complaints:         "0",
        skills_score:       "7",
        experience_years:   "3",
        leadership_score:   "6",
        workload:           "6",
        deadline_pressure:  "5",
        job_satisfaction:   "7",
        past_overtime:      false,
    });
    const [result, setResult] = useState<MLResult | null>(null);
    const [running, setRunning] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isGuest, setIsGuest] = useState(false);

    const guest = useGuestStore();

    useEffect(() => {
        if (!empId) return;
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                fetch(`/api/employees/${empId}`)
                    .then(r => r.json())
                    .then(d => {
                        if (d?.emp_name) {
                            setEmployee(d);
                            // Pre-fill from saved metrics
                            setFields(f => ({
                                ...f,
                                performance_score:  d.performance_score?.toString()  ?? f.performance_score,
                                attendance_percent: d.attendance_percent?.toString() ?? f.attendance_percent,
                                late_days:          d.late_days?.toString()          ?? f.late_days,
                                projects_completed: d.projects_completed?.toString() ?? f.projects_completed,
                                complaints:         d.complaints?.toString()         ?? f.complaints,
                                skills_score:       d.skills_score?.toString()       ?? f.skills_score,
                                experience_years:   d.experience_years?.toString()   ?? f.experience_years,
                                leadership_score:   d.leadership_score?.toString()   ?? f.leadership_score,
                                workload:           d.workload?.toString()           ?? f.workload,
                                deadline_pressure:  d.deadline_pressure?.toString()  ?? f.deadline_pressure,
                                job_satisfaction:   d.job_satisfaction?.toString()   ?? f.job_satisfaction,
                                past_overtime:      d.past_overtime ?? false,
                            }));
                        }
                        setLoadingEmp(false);
                    })
                    .catch(() => setLoadingEmp(false));
            } else {
                setIsGuest(true);
                const stored = guest.store.employees.find(e => e.emp_id === empId);
                if (stored) setEmployee(stored as unknown as Employee);
                setLoadingEmp(false);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empId]);

    const n = (v: string) => v === "" ? 0 : Number(v);

    const runAnalysis = async () => {
        if (!employee) return;
        setRunning(true);
        setError("");
        setResult(null);
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
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error === "ml_timeout" ? "timeout" : "unavailable");
            }
            const data = await res.json();
            setResult({ productivity: data.productivity, firing_risk: data.firing_risk, overtime: data.overtime, performance: data.performance, promotion: data.promotion });

            // Save metrics
            if (!isGuest) {
                setSaving(true);
                await fetch("/api/employees", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        emp_id: employee.emp_id,
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
                }).catch(() => {}).finally(() => setSaving(false));
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "";
            setError(msg === "timeout"
                ? "The ML service is waking up. Wait 15 seconds and try again."
                : "ML backend is offline. Start it with: uvicorn main:app --reload (inside /backend)");
        } finally {
            setRunning(false);
        }
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

    if (loadingEmp) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <Navbar />
                <div className="container mx-auto px-4 py-12 max-w-5xl animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="h-64 bg-gray-200 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <Navbar />
                <div className="container mx-auto px-4 py-24 text-center">
                    <p className="text-gray-500">Employee not found.</p>
                    <button onClick={() => router.back()} className="mt-4 text-[#7825ff] underline text-sm">Go back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-5xl">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        &larr; Back
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#7825ff]/10 flex items-center justify-center">
                            <span className="text-xl font-bold text-[#7825ff]">{employee.emp_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{employee.emp_name}</h1>
                            <p className="text-xs text-gray-400">ML Analysis</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── Left: Input form ── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                            <p className="text-sm font-bold text-gray-800 mb-1">Analysis Inputs</p>
                            <p className="text-xs text-gray-400 mb-5">
                                Core stats are pre-filled from the dashboard. Overtime is predicted automatically.
                            </p>

                            {/* Pre-filled core stats */}
                            <div className="grid grid-cols-3 gap-2 mb-5 p-3 bg-gray-50 rounded-xl">
                                <div className="text-center">
                                    <p className="text-base font-bold text-[#7825ff]">{employee.tasks ?? "—"}</p>
                                    <p className="text-xs text-gray-400">Tasks</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-base font-bold text-purple-600">{employee.deadline_met ?? "—"}</p>
                                    <p className="text-xs text-gray-400">Deadlines</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-base font-bold text-indigo-600">{employee.averagetime ?? "—"}</p>
                                    <p className="text-xs text-gray-400">Avg hrs</p>
                                </div>
                            </div>

                            <div className="space-y-3">
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

                                <div>
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

                            {error && <p className="mt-4 text-xs text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}

                            <button onClick={runAnalysis} disabled={running}
                                className="mt-5 w-full py-3 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-xl transition-all disabled:opacity-60">
                                {running ? "Running models..." : "Run Analysis"}
                            </button>

                            {saving && <p className="mt-2 text-xs text-center text-gray-400">Saving metrics...</p>}
                        </div>
                    </div>

                    {/* ── Right: Results ── */}
                    <div className="lg:col-span-3 space-y-4">
                        {!result && !running && (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                                <p className="text-gray-400 text-sm">Fill in the inputs and click Run Analysis</p>
                                <p className="text-gray-300 text-xs mt-1">5 ML models will run and results will appear here</p>
                            </div>
                        )}

                        {running && (
                            <div className="space-y-4">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        )}

                        {result && !running && (
                            <>
                                <ResultCard title="Performance Tier"  resultKey="performance"  label={result.performance.label} fields={fields} employee={employee} />
                                <ResultCard title="Productivity"      resultKey="productivity"  label={result.productivity.label} confidence={result.productivity.confidence} fields={fields} employee={employee} />
                                <ResultCard title="Promotion"         resultKey="promotion"     label={result.promotion.label}    confidence={result.promotion.confidence}    fields={fields} employee={employee} />
                                <ResultCard title="Firing Risk"       resultKey="firing_risk"   label={result.firing_risk.label}  confidence={result.firing_risk.confidence}  fields={fields} employee={employee} />
                                <ResultCard title="Overtime Forecast" resultKey="overtime"      label={result.overtime.label}     confidence={result.overtime.confidence}     fields={fields} employee={employee} />

                                <button onClick={() => setResult(null)}
                                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all text-sm">
                                    Clear results
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
