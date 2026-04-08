import { NextResponse } from "next/server";
import { addEmployee, updateEmployee, getEmployeesByOrg } from "@/lib/db/employee";
import { createClient } from "@/lib/supabase/server";
import { ensureTables } from "@/lib/db/ensureTables";

export async function GET(req: Request) {
    try {
        await ensureTables();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const orgIdParam = searchParams.get("orgId");
        if (!orgIdParam) return NextResponse.json({ error: "orgId is required" }, { status: 400 });

        const orgId = parseInt(orgIdParam);
        if (isNaN(orgId)) return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });

        const employees = await getEmployeesByOrg(orgId);
        return NextResponse.json(employees);
    } catch (error) {
        console.error("Failed to fetch employees:", error);
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
}

export async function POST(req: Request) {
    try {
        await ensureTables();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await req.json();
        if (!data.emp_name || data.orgId === undefined) {
            return NextResponse.json({ error: "emp_name and orgId are required" }, { status: 400 });
        }

        const employee = await addEmployee({
            emp_name: data.emp_name,
            orgId: Number(data.orgId),
            tasks: data.tasks ?? null,
            deadline_met: data.deadline_met ?? null,
            averagetime: data.averagetime ?? null,
            performance_score: data.performance_score ?? null,
            attendance_percent: data.attendance_percent ?? null,
            late_days: data.late_days ?? null,
            projects_completed: data.projects_completed ?? null,
            complaints: data.complaints ?? null,
            skills_score: data.skills_score ?? null,
            experience_years: data.experience_years ?? null,
            leadership_score: data.leadership_score ?? null,
            workload: data.workload ?? null,
            deadline_pressure: data.deadline_pressure ?? null,
            job_satisfaction: data.job_satisfaction ?? null,
            past_overtime: data.past_overtime ?? null,
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        console.error("Failed to create employee:", error);
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
}

export async function PATCH(req: Request) {
    try {
        await ensureTables();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await req.json();
        if (!data.emp_id) return NextResponse.json({ error: "emp_id is required" }, { status: 400 });

        const updated = await updateEmployee(Number(data.emp_id), data);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update employee:", error);
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
}
