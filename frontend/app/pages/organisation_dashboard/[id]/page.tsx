"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import DBErrorPopup from "@/app/components/DBErrorPopup";
import MLAnalysisModal from "@/app/components/MLAnalysisModal";
import { createClient } from "@/lib/supabase/client";
import { useGuestStore } from "@/lib/useGuestStore";
import Link from "next/link";

export type Employee = {
    emp_id: number;
    emp_name: string;
    orgid: number | null;
    // basic
    tasks: number | null;
    deadline_met: number | null;
    averagetime: number | null;
    // ml metrics
    performance_score: number | null;
    attendance_percent: number | null;
    late_days: number | null;
    projects_completed: number | null;
    complaints: number | null;
    skills_score: number | null;
    experience_years: number | null;
    leadership_score: number | null;
    workload: number | null;
    deadline_pressure: number | null;
    job_satisfaction: number | null;
    past_overtime: boolean | null;
};

// ─── Edit Employee Modal ──────────────────────────────────────────────────────
function EditEmployeeModal({
    employee,
    isGuest,
    onSave,
    onClose,
}: {
    employee: Employee;
    isGuest: boolean;
    onSave: (updated: Employee) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState({
        emp_name:          employee.emp_name,
        tasks:             employee.tasks?.toString() ?? "",
        deadline_met:      employee.deadline_met?.toString() ?? "",
        averagetime:       employee.averagetime?.toString() ?? "",
        performance_score: employee.performance_score?.toString() ?? "",
        attendance_percent:employee.attendance_percent?.toString() ?? "",
        late_days:         employee.late_days?.toString() ?? "",
        projects_completed:employee.projects_completed?.toString() ?? "",
        complaints:        employee.complaints?.toString() ?? "",
        skills_score:      employee.skills_score?.toString() ?? "",
        experience_years:  employee.experience_years?.toString() ?? "",
        leadership_score:  employee.leadership_score?.toString() ?? "",
        workload:          employee.workload?.toString() ?? "",
        deadline_pressure: employee.deadline_pressure?.toString() ?? "",
        job_satisfaction:  employee.job_satisfaction?.toString() ?? "",
        past_overtime:     employee.past_overtime ?? false,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const n = (v: string) => v === "" ? null : Number(v);

    const handleSave = async () => {
        if (!form.emp_name.trim()) { setError("Name is required."); return; }
        setSaving(true);
        setError("");

        const payload: Partial<Employee> = {
            emp_name:          form.emp_name.trim(),
            tasks:             n(form.tasks),
            deadline_met:      n(form.deadline_met),
            averagetime:       n(form.averagetime),
            performance_score: n(form.performance_score),
            attendance_percent:n(form.attendance_percent),
            late_days:         n(form.late_days),
            projects_completed:n(form.projects_completed),
            complaints:        n(form.complaints),
            skills_score:      n(form.skills_score),
            experience_years:  n(form.experience_years),
            leadership_score:  n(form.leadership_score),
            workload:          n(form.workload),
            deadline_pressure: n(form.deadline_pressure),
            job_satisfaction:  n(form.job_satisfaction),
            past_overtime:     form.past_overtime,
        };

        if (!isGuest) {
            try {
                const res = await fetch("/api/employees", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ emp_id: employee.emp_id, ...payload }),
                });
                if (!res.ok) { setError("Failed to save. Try again."); setSaving(false); return; }
            } catch {
                setError("Network error."); setSaving(false); return;
            }
        }

        onSave({ ...employee, ...payload });
        setSaving(false);
        onClose();
    };

    const field = (label: string, key: keyof typeof form, type = "number") => (
        <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                value={form[key] as string}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                    <div>
                        <p className="font-bold text-gray-800">Edit Employee</p>
                        <p className="text-xs text-gray-400">{employee.emp_name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">x</button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Basic Metrics</p>
                        <div className="grid grid-cols-2 gap-3">
                            {field("Employee Name", "emp_name", "text")}
                            {field("Tasks Completed", "tasks")}
                            {field("Deadlines Met", "deadline_met")}
                            {field("Avg Time (hrs)", "averagetime")}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ML Metrics</p>
                        <div className="grid grid-cols-2 gap-3">
                            {field("Performance Score (1-10)", "performance_score")}
                            {field("Attendance %", "attendance_percent")}
                            {field("Late Days", "late_days")}
                            {field("Projects Completed", "projects_completed")}
                            {field("Complaints", "complaints")}
                            {field("Skills Score (1-10)", "skills_score")}
                            {field("Experience (years)", "experience_years")}
                            {field("Leadership Score (1-10)", "leadership_score")}
                            {field("Workload (1-10)", "workload")}
                            {field("Deadline Pressure (1-10)", "deadline_pressure")}
                            {field("Job Satisfaction (1-10)", "job_satisfaction")}
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Has worked overtime before?</label>
                                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                                    <button type="button" onClick={() => setForm(f => ({ ...f, past_overtime: false }))}
                                        className={`flex-1 py-2 text-xs font-semibold transition-colors ${!form.past_overtime ? "bg-[#7825ff] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                                        No
                                    </button>
                                    <button type="button" onClick={() => setForm(f => ({ ...f, past_overtime: true }))}
                                        className={`flex-1 py-2 text-xs font-semibold transition-colors ${form.past_overtime ? "bg-[#7825ff] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                                        Yes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button onClick={handleSave} disabled={saving}
                        className="w-full py-3 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-xl transition-all disabled:opacity-60">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Employee Detail Modal ────────────────────────────────────────────────────
function EmployeeDetailModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
    const basic = [
        { label: "Tasks", value: employee.tasks ?? 0, color: "#7825ff" },
        { label: "Deadlines", value: employee.deadline_met ?? 0, color: "#a855f7" },
        { label: "Avg Hrs", value: employee.averagetime ?? 0, color: "#6366f1" },
    ];
    const maxVal = Math.max(...basic.map(m => m.value), 1);
    const BAR_W = 72, GAP = 28, CHART_H = 170;
    const SVG_W = basic.length * (BAR_W + GAP) + GAP;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">x</button>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#7825ff]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-[#7825ff]">{employee.emp_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 leading-tight">{employee.emp_name}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">ID #{employee.emp_id}</p>
                    </div>
                </div>
                <div className="flex justify-center mb-6 bg-gray-50 rounded-xl p-4">
                    <svg width={SVG_W} height={CHART_H + 52} viewBox={`0 0 ${SVG_W} ${CHART_H + 52}`}>
                        {[0.25, 0.5, 0.75, 1].map(pct => (
                            <line key={pct} x1={0} y1={CHART_H * (1 - pct)} x2={SVG_W} y2={CHART_H * (1 - pct)} stroke="#e5e7eb" strokeWidth={1} />
                        ))}
                        {basic.map((m, i) => {
                            const bh = Math.max(4, (m.value / maxVal) * CHART_H);
                            const x = GAP + i * (BAR_W + GAP);
                            const y = CHART_H - bh;
                            return (
                                <g key={m.label}>
                                    <rect x={x} y={y} width={BAR_W} height={bh} fill={m.color} rx={8} opacity={0.9} />
                                    <text x={x + BAR_W / 2} y={y - 7} textAnchor="middle" fontSize={14} fontWeight="700" fill={m.color}>{m.value}</text>
                                    <text x={x + BAR_W / 2} y={CHART_H + 18} textAnchor="middle" fontSize={11} fill="#6b7280">{m.label}</text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
                {basic.map(m => {
                    const pct = maxVal > 0 ? Math.min((m.value / maxVal) * 100, 100) : 0;
                    return (
                        <div key={m.label} className="mb-4">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-medium text-gray-600">{m.label}</span>
                                <span className="text-sm font-bold" style={{ color: m.color }}>{m.value}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Employee Card ────────────────────────────────────────────────────────────
function EmployeeCard({ employee, onEdit, onAnalyse }: {
    employee: Employee;
    onEdit: () => void;
    onAnalyse: () => void;
}) {
    const router = useRouter();
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => router.push(`/pages/employee/${employee.emp_id}`)}>
                <div className="w-11 h-11 rounded-xl bg-[#7825ff]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-[#7825ff]">{employee.emp_name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 truncate text-sm leading-tight">{employee.emp_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">ID #{employee.emp_id}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 cursor-pointer" onClick={() => router.push(`/pages/employee/${employee.emp_id}`)}>
                <div className="text-center p-2 bg-[#7825ff]/5 rounded-xl">
                    <p className="text-lg font-bold text-[#7825ff]">{employee.tasks ?? "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tasks</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-xl">
                    <p className="text-lg font-bold text-purple-600">{employee.deadline_met ?? "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Deadlines</p>
                </div>
                <div className="text-center p-2 bg-indigo-50 rounded-xl">
                    <p className="text-lg font-bold text-indigo-600">{employee.averagetime ?? "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Avg hrs</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
                <button onClick={() => router.push(`/pages/employee/${employee.emp_id}`)}
                    className="py-1.5 text-xs text-[#7825ff] border border-[#7825ff]/20 rounded-lg hover:bg-[#7825ff]/5 transition-colors font-medium">
                    Dashboard
                </button>
                <button onClick={onEdit}
                    className="py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Edit
                </button>
                <button onClick={onAnalyse}
                    className="py-1.5 text-xs bg-[#7825ff] text-white rounded-lg hover:bg-[#6c20e8] transition-colors font-medium">
                    Analyse
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrganisationDashboard() {
    const params = useParams();
    const orgId = Number(params.id);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [orgName, setOrgName] = useState("");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
    const [analysingEmployee, setAnalysingEmployee] = useState<Employee | null>(null);
    const [dbError, setDbError] = useState(false);
    const [isGuest, setIsGuest] = useState(false);

    const [empName, setEmpName] = useState("");
    const [tasks, setTasks] = useState("");
    const [deadlineMet, setDeadlineMet] = useState("");
    const [avgTime, setAvgTime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const guest = useGuestStore();

    useEffect(() => {
        if (!orgId) return;
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                fetch(`/api/organisation/${orgId}`)
                    .then(r => r.json())
                    .then(d => { if (d.name) setOrgName(d.name); })
                    .catch(() => {});
                fetchFromDB();
            } else {
                setIsGuest(true);
                const org = guest.getOrgById(orgId);
                if (org) setOrgName(org.name);
                setEmployees(guest.getEmployeesByOrg(orgId) as unknown as Employee[]);
                setLoading(false);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId]);

    const fetchFromDB = () => {
        fetch(`/api/employees?orgId=${orgId}`)
            .then(r => r.json())
            .then(data => { setEmployees(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setDbError(true); setLoading(false); });
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        if (!empName.trim()) { setFormError("Employee name is required."); return; }
        setSubmitting(true);
        try {
            if (isGuest) {
                const emp = guest.addEmployee({
                    emp_name: empName.trim(),
                    orgid: orgId,
                    tasks: tasks ? parseInt(tasks) : null,
                    deadline_met: deadlineMet ? parseInt(deadlineMet) : null,
                    averagetime: avgTime ? parseInt(avgTime) : null,
                });
                setEmployees(prev => [...prev, emp as unknown as Employee]);
                setEmpName(""); setTasks(""); setDeadlineMet(""); setAvgTime("");
                setShowForm(false);
            } else {
                const res = await fetch("/api/employees", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        emp_name: empName.trim(), orgId,
                        tasks: tasks ? parseInt(tasks) : null,
                        deadline_met: deadlineMet ? parseInt(deadlineMet) : null,
                        averagetime: avgTime ? parseInt(avgTime) : null,
                    }),
                });
                if (res.ok) {
                    setEmpName(""); setTasks(""); setDeadlineMet(""); setAvgTime("");
                    setShowForm(false);
                    fetchFromDB();
                } else {
                    const err = await res.json();
                    if (res.status === 503 || err.error === "db_unavailable") setDbError(true);
                    else setFormError(err.error || "Failed to create employee.");
                }
            }
        } catch { setFormError("Network error."); }
        finally { setSubmitting(false); }
    };

    const handleEmployeeUpdated = (updated: Employee) => {
        setEmployees(prev => prev.map(e => e.emp_id === updated.emp_id ? updated : e));
        if (analysingEmployee?.emp_id === updated.emp_id) setAnalysingEmployee(updated);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            {isGuest && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
                    Demo mode — data resets on refresh.{" "}
                    <Link href="/pages/signup" className="font-bold underline hover:text-amber-900">Sign up</Link>{" "}
                    to save permanently.
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <p className="text-sm text-[#7825ff] font-semibold mb-1 uppercase tracking-wider">Organisation Dashboard</p>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{orgName || `Org #${orgId}`}</h1>
                        <p className="text-gray-500 mt-1 text-sm">{employees.length} employee{employees.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={() => { setShowForm(!showForm); setFormError(""); }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 self-start sm:self-auto">
                        <span className="text-xl leading-none">{showForm ? "−" : "+"}</span>
                        {showForm ? "Cancel" : "Add Employee"}
                    </button>
                </div>

                {showForm && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-5">New Employee</h2>
                        <form onSubmit={handleAddEmployee}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name <span className="text-red-500">*</span></label>
                                    <input value={empName} onChange={e => setEmpName(e.target.value)} placeholder="e.g. Alice Johnson"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Completed</label>
                                    <input type="number" min="0" value={tasks} onChange={e => setTasks(e.target.value)} placeholder="e.g. 42"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadlines Met</label>
                                    <input type="number" min="0" value={deadlineMet} onChange={e => setDeadlineMet(e.target.value)} placeholder="e.g. 38"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Average Time (hrs)</label>
                                    <input type="number" min="0" value={avgTime} onChange={e => setAvgTime(e.target.value)} placeholder="e.g. 8"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all" />
                                </div>
                            </div>
                            {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
                            <button type="submit" disabled={submitting}
                                className="w-full py-3 px-4 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                                {submitting ? "Adding..." : "Add Employee"}
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-44 bg-gray-200 rounded-2xl" />)}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-700 font-semibold text-lg">No employees yet</p>
                        <p className="text-gray-400 text-sm mt-1">Click &quot;Add Employee&quot; to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employees.map(emp => (
                            <EmployeeCard
                                key={emp.emp_id}
                                employee={emp}
                                onEdit={() => setEditEmployee(emp)}
                                onAnalyse={() => setAnalysingEmployee(emp)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {editEmployee && (
                <EditEmployeeModal
                    employee={editEmployee}
                    isGuest={isGuest}
                    onSave={handleEmployeeUpdated}
                    onClose={() => setEditEmployee(null)}
                />
            )}
            {analysingEmployee && (
                <MLAnalysisModal
                    employee={analysingEmployee}
                    isGuest={isGuest}
                    onMetricsSaved={handleEmployeeUpdated}
                    onClose={() => setAnalysingEmployee(null)}
                />
            )}
            {dbError && <DBErrorPopup onClose={() => setDbError(false)} />}
        </div>
    );
}
