"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useGuestStore } from "@/lib/useGuestStore";
import type { Employee } from "@/app/pages/organisation_dashboard/[id]/page";

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; max: number; color: string }[] }) {
    const BAR_W = 52, GAP = 20, CHART_H = 160, PAD_L = 32;
    const SVG_W = PAD_L + data.length * (BAR_W + GAP) + GAP;

    return (
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${CHART_H + 56}`} className="overflow-visible">
            {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                <g key={pct}>
                    <line x1={PAD_L} y1={CHART_H * (1 - pct)} x2={SVG_W} y2={CHART_H * (1 - pct)} stroke="#f3f4f6" strokeWidth={1} />
                    <text x={PAD_L - 4} y={CHART_H * (1 - pct) + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                        {Math.round(pct * 100)}
                    </text>
                </g>
            ))}
            {data.map((d, i) => {
                const pct = d.max > 0 ? Math.min(d.value / d.max, 1) : 0;
                const bh = Math.max(3, pct * CHART_H);
                const x = PAD_L + GAP + i * (BAR_W + GAP);
                const y = CHART_H - bh;
                return (
                    <g key={d.label}>
                        <rect x={x} y={y} width={BAR_W} height={bh} fill={d.color} rx={6} opacity={0.9} />
                        <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight="700" fill={d.color}>{d.value}</text>
                        <text x={x + BAR_W / 2} y={CHART_H + 16} textAnchor="middle" fontSize={10} fill="#6b7280">{d.label}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// ─── SVG Radar Chart ──────────────────────────────────────────────────────────
function RadarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
    const CX = 160, CY = 150, R = 110;
    const n = data.length;
    const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const pt = (i: number, r: number) => ({
        x: CX + r * Math.cos(angle(i)),
        y: CY + r * Math.sin(angle(i)),
    });

    const gridLevels = [0.25, 0.5, 0.75, 1];
    const dataPoints = data.map((d, i) => {
        const pct = d.max > 0 ? Math.min(d.value / d.max, 1) : 0;
        return pt(i, pct * R);
    });
    const polyPoints = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <svg width="100%" viewBox="0 0 320 300" className="overflow-visible">
            {/* Grid */}
            {gridLevels.map(lvl => (
                <polygon key={lvl}
                    points={data.map((_, i) => { const p = pt(i, lvl * R); return `${p.x},${p.y}`; }).join(" ")}
                    fill="none" stroke="#f3f4f6" strokeWidth={1} />
            ))}
            {/* Axes */}
            {data.map((_, i) => {
                const p = pt(i, R);
                return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={1} />;
            })}
            {/* Data polygon */}
            <polygon points={polyPoints} fill="#7825ff" fillOpacity={0.15} stroke="#7825ff" strokeWidth={2} />
            {/* Data points */}
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill="#7825ff" />
            ))}
            {/* Labels */}
            {data.map((d, i) => {
                const p = pt(i, R + 22);
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#374151" fontWeight="500">
                        {d.label}
                    </text>
                );
            })}
        </svg>
    );
}

// ─── Horizontal metric bar ────────────────────────────────────────────────────
function MetricRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">{label}</span>
                <span className="text-xs font-bold" style={{ color }}>{value}<span className="text-gray-400 font-normal">/{max}</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

export default function EmployeeDashboard() {
    const params = useParams();
    const router = useRouter();
    const empId = Number(params.id);

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const guest = useGuestStore();

    useEffect(() => {
        if (!empId) return;
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                fetch(`/api/employees/${empId}`)
                    .then(r => r.json())
                    .then(d => {
                        if (d && d.emp_name) setEmployee(d);
                        setLoading(false);
                    })
                    .catch(() => setLoading(false));
            } else {
                // Guest — find from session storage across all orgs
                const stored = guest.store.employees.find(e => e.emp_id === empId);
                if (stored) setEmployee(stored as unknown as Employee);
                setLoading(false);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <Navbar />
                <div className="container mx-auto px-4 py-12 animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}</div>
                    <div className="h-64 bg-gray-200 rounded-xl" />
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

    const e = employee;

    const basicBar = [
        { label: "Tasks", value: e.tasks ?? 0, max: 100, color: "#7825ff" },
        { label: "Deadlines", value: e.deadline_met ?? 0, max: 100, color: "#a855f7" },
        { label: "Avg Hrs", value: e.averagetime ?? 0, max: 12, color: "#6366f1" },
    ];

    const mlBar = [
        { label: "Perf", value: e.performance_score ?? 0, max: 10, color: "#7825ff" },
        { label: "Attend", value: e.attendance_percent ?? 0, max: 100, color: "#06b6d4" },
        { label: "Skills", value: e.skills_score ?? 0, max: 10, color: "#8b5cf6" },
        { label: "Leader", value: e.leadership_score ?? 0, max: 10, color: "#ec4899" },
        { label: "Satisf.", value: e.job_satisfaction ?? 0, max: 10, color: "#10b981" },
    ];

    const radarData = [
        { label: "Performance", value: e.performance_score ?? 0, max: 10 },
        { label: "Skills", value: e.skills_score ?? 0, max: 10 },
        { label: "Leadership", value: e.leadership_score ?? 0, max: 10 },
        { label: "Satisfaction", value: e.job_satisfaction ?? 0, max: 10 },
        { label: "Attendance", value: (e.attendance_percent ?? 0) / 10, max: 10 },
        { label: "Workload", value: e.workload ?? 0, max: 10 },
    ];

    const mlMetrics = [
        { label: "Performance Score", value: e.performance_score ?? 0, max: 10, color: "#7825ff" },
        { label: "Attendance", value: e.attendance_percent ?? 0, max: 100, color: "#06b6d4" },
        { label: "Skills Score", value: e.skills_score ?? 0, max: 10, color: "#8b5cf6" },
        { label: "Leadership Score", value: e.leadership_score ?? 0, max: 10, color: "#ec4899" },
        { label: "Job Satisfaction", value: e.job_satisfaction ?? 0, max: 10, color: "#10b981" },
        { label: "Workload", value: e.workload ?? 0, max: 10, color: "#f59e0b" },
        { label: "Deadline Pressure", value: e.deadline_pressure ?? 0, max: 10, color: "#ef4444" },
        { label: "Experience (yrs)", value: e.experience_years ?? 0, max: 20, color: "#6366f1" },
        { label: "Projects Completed", value: e.projects_completed ?? 0, max: 50, color: "#14b8a6" },
        { label: "Late Days", value: e.late_days ?? 0, max: 30, color: "#f97316" },
        { label: "Complaints", value: e.complaints ?? 0, max: 20, color: "#dc2626" },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-5xl">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        &larr; Back
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#7825ff]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl font-bold text-[#7825ff]">{e.emp_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{e.emp_name}</h1>
                            <p className="text-sm text-gray-400">Employee ID #{e.emp_id}</p>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Tasks Completed" value={e.tasks ?? "—"} />
                    <StatCard label="Deadlines Met" value={e.deadline_met ?? "—"} />
                    <StatCard label="Avg Time / Task" value={e.averagetime ? `${e.averagetime}h` : "—"} />
                    <StatCard label="Experience" value={e.experience_years ? `${e.experience_years}y` : "—"} />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Bar chart — basic */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="text-sm font-semibold text-gray-700 mb-4">Core Performance</p>
                        <BarChart data={basicBar} />
                    </div>

                    {/* Bar chart — ML scores */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="text-sm font-semibold text-gray-700 mb-4">ML Metric Scores</p>
                        <BarChart data={mlBar} />
                    </div>
                </div>

                {/* Radar + metric rows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="text-sm font-semibold text-gray-700 mb-4">Competency Radar</p>
                        <RadarChart data={radarData} />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="text-sm font-semibold text-gray-700 mb-4">All Metrics</p>
                        <div className="overflow-y-auto max-h-72 pr-1">
                            {mlMetrics.map(m => (
                                <MetricRow key={m.label} label={m.label} value={m.value} max={m.max} color={m.color} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Past overtime badge */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Has worked overtime before</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${e.past_overtime ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {e.past_overtime ? "Yes" : "No"}
                    </span>
                </div>
            </div>
        </div>
    );
}
