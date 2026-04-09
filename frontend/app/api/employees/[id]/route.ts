import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ensureTables } from "@/lib/db/ensureTables";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await ensureTables();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const empId = parseInt(id);
        if (isNaN(empId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

        const employee = await prisma.employees.findUnique({ where: { emp_id: empId } });
        if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Failed to fetch employee:", error);
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
}
