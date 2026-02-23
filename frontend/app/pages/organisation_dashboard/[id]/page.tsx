"use client"

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";

type Employee = {
    emp_id: number;
    emp_name: string;
    orgid: number | null;
    tasks: number | null;
    deadline_met: number | null;
    averagetime: number | null;
};

// ─── Metric Progress Bar ──────────────────────────────────────────────────────
function MetricBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <span className="text-sm font-bold" style={{ color }}>{value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className="h-2.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

// ─── Employee Detail Modal with SVG Bar Chart ─────────────────────────────────
function EmployeeModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
    const metrics = [
        { label: "Tasks", value: employee.tasks ?? 0, color: "#7825ff" },
        { label: "Deadlines", value: employee.deadline_met ?? 0, color: "#a855f7" },
        { label: "Avg Hrs", value: employee.averagetime ?? 0, color: "#6366f1" },
    ];
    const maxVal = Math.max(...metrics.map(m => m.value), 1);

    // SVG bar chart dimensions
    const BAR_W = 72;
    const GAP = 28;
    const CHART_H = 170;
    const SVG_W = metrics.length * (BAR_W + GAP) + GAP;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-5 text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none transition-colors"
                >
                    ×
                </button>

                {/* Employee header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#7825ff]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-[#7825ff]">
                            {employee.emp_name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 leading-tight">{employee.emp_name}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Employee ID: #{employee.emp_id}</p>
                    </div>
                </div>

                {/* SVG Bar Chart */}
                <div className="flex justify-center mb-6 bg-gray-50 rounded-xl p-4">
                    <svg width={SVG_W} height={CHART_H + 52} viewBox={`0 0 ${SVG_W} ${CHART_H + 52}`}>
                        {/* Horizontal guide lines */}
                        {[0.25, 0.5, 0.75, 1].map(pct => (
                            <line
                                key={pct}
                                x1={0} y1={CHART_H * (1 - pct)}
                                x2={SVG_W} y2={CHART_H * (1 - pct)}
                                stroke="#e5e7eb" strokeWidth={1}
                            />
                        ))}

                        {metrics.map((m, i) => {
                            const bh = Math.max(4, (m.value / maxVal) * CHART_H);
                            const x = GAP + i * (BAR_W + GAP);
                            const y = CHART_H - bh;
                            return (
                                <g key={m.label}>
                                    {/* Bar */}
                                    <rect x={x} y={y} width={BAR_W} height={bh} fill={m.color} rx={8} opacity={0.9} />
                                    {/* Value label above bar */}
                                    <text
                                        x={x + BAR_W / 2} y={y - 7}
                                        textAnchor="middle" fontSize={14}
                                        fontWeight="700" fill={m.color}
                                    >
                                        {m.value}
                                    </text>
                                    {/* Axis label */}
                                    <text
                                        x={x + BAR_W / 2} y={CHART_H + 18}
                                        textAnchor="middle" fontSize={11}
                                        fill="#6b7280"
                                    >
                                        {m.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Progress bar breakdown */}
                <div>
                    {metrics.map(m => (
                        <MetricBar key={m.label} label={m.label} value={m.value} max={maxVal} color={m.color} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Employee Card ────────────────────────────────────────────────────────────
function EmployeeCard({ employee, onClick }: { employee: Employee; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
        >
            <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#7825ff]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#7825ff]/20 transition-colors">
                    <span className="text-xl font-bold text-[#7825ff]">
                        {employee.emp_name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 truncate text-base leading-tight">{employee.emp_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">ID #{employee.emp_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-[#7825ff]/5 rounded-xl">
                    <p className="text-xl font-bold text-[#7825ff]">{employee.tasks ?? "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tasks</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-xl">
                    <p className="text-xl font-bold text-purple-600">{employee.deadline_met ?? "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Deadlines</p>
                </div>
                <div className="text-center p-2 bg-indigo-50 rounded-xl">
                    <p className="text-xl font-bold text-indigo-600">{employee.averagetime ?? "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Avg hrs</p>
                </div>
            </div>

            <p className="text-xs text-[#7825ff]/50 mt-4 text-right font-medium group-hover:text-[#7825ff] transition-colors">
                View metrics →
            </p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrganisationDashboard() {
    const params = useParams();
    const orgId = Number(params.id);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [orgName, setOrgName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Form state
    const [empName, setEmpName] = useState("");
    const [tasks, setTasks] = useState("");
    const [deadlineMet, setDeadlineMet] = useState("");
    const [avgTime, setAvgTime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchEmployees = () => {
        fetch(`/api/employees?orgId=${orgId}`)
            .then(r => r.json())
            .then(data => { setEmployees(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (!orgId) return;
        // Fetch org name
        fetch(`/api/organisation/${orgId}`)
            .then(r => r.json())
            .then(data => { if (data.name) setOrgName(data.name); })
            .catch(() => { });

        fetchEmployees();
    }, [orgId]);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        if (!empName.trim()) { setFormError("Employee name is required."); return; }

        setSubmitting(true);
        try {
            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emp_name: empName.trim(),
                    orgId,
                    tasks: tasks ? parseInt(tasks) : null,
                    deadline_met: deadlineMet ? parseInt(deadlineMet) : null,
                    averagetime: avgTime ? parseInt(avgTime) : null,
                }),
            });

            if (res.ok) {
                setEmpName(""); setTasks(""); setDeadlineMet(""); setAvgTime("");
                setShowForm(false);
                fetchEmployees();
            } else {
                const err = await res.json();
                setFormError(err.error || "Failed to create employee.");
            }
        } catch {
            setFormError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <p className="text-sm text-[#7825ff] font-semibold mb-1 uppercase tracking-wider">Organisation Dashboard</p>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                            {orgName || `Org #${orgId}`}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            {employees.length} employee{employees.length !== 1 ? "s" : ""} · Click a card to view metrics chart
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(!showForm); setFormError(""); }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 self-start sm:self-auto"
                    >
                        <span className="text-xl leading-none">{showForm ? "−" : "+"}</span>
                        {showForm ? "Cancel" : "Add Employee"}
                    </button>
                </div>

                {/* ── Add Employee Form ─────────────────────────────────── */}
                {showForm && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-5">New Employee</h2>
                        <form onSubmit={handleAddEmployee}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Name — spans full width */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Employee Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={empName}
                                        onChange={e => setEmpName(e.target.value)}
                                        placeholder="e.g. Alice Johnson"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                {/* Tasks */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Completed</label>
                                    <input
                                        type="number" min="0"
                                        value={tasks} onChange={e => setTasks(e.target.value)}
                                        placeholder="e.g. 42"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                {/* Deadlines Met */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadlines Met</label>
                                    <input
                                        type="number" min="0"
                                        value={deadlineMet} onChange={e => setDeadlineMet(e.target.value)}
                                        placeholder="e.g. 38"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                {/* Avg Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Average Time (hrs)</label>
                                    <input
                                        type="number" min="0"
                                        value={avgTime} onChange={e => setAvgTime(e.target.value)}
                                        placeholder="e.g. 8"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7825ff] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <p className="text-red-500 text-sm mb-3">{formError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 px-4 bg-[#7825ff] hover:bg-[#6c20e8] text-white font-bold rounded-xl shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Adding..." : "Add Employee"}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Employee Grid ─────────────────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-44 bg-gray-200 rounded-2xl" />
                        ))}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-[#7825ff]/10 rounded-2xl flex items-center justify-center mb-4">
                            <span className="text-3xl">👥</span>
                        </div>
                        <p className="text-gray-700 font-semibold text-lg">No employees yet</p>
                        <p className="text-gray-400 text-sm mt-1">Click &quot;Add Employee&quot; to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employees.map(emp => (
                            <EmployeeCard
                                key={emp.emp_id}
                                employee={emp}
                                onClick={() => setSelectedEmployee(emp)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Employee Detail Modal ─────────────────────────────────── */}
            {selectedEmployee && (
                <EmployeeModal
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                />
            )}
        </div>
    );
}