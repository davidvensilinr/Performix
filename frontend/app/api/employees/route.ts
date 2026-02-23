import { NextResponse } from "next/server";
import { addEmployee, getEmployeesByOrg } from "@/lib/db/employee";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orgIdParam = searchParams.get("orgId");

    if (!orgIdParam) {
        return NextResponse.json({ error: "orgId query param is required" }, { status: 400 });
    }

    const orgId = parseInt(orgIdParam);
    if (isNaN(orgId)) {
        return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
    }

    try {
        const employees = await getEmployeesByOrg(orgId);
        return NextResponse.json(employees);
    } catch (error) {
        console.error("Failed to fetch employees:", error);
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        if (!data.emp_name || data.orgId === undefined) {
            return NextResponse.json({ error: "emp_name and orgId are required" }, { status: 400 });
        }

        const employee = await addEmployee({
            emp_name: data.emp_name,
            orgId: Number(data.orgId),
            tasks: data.tasks !== undefined ? Number(data.tasks) : null,
            deadline_met: data.deadline_met !== undefined ? Number(data.deadline_met) : null,
            averagetime: data.averagetime !== undefined ? Number(data.averagetime) : null,
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        console.error("Failed to create employee:", error);
        return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
    }
}
