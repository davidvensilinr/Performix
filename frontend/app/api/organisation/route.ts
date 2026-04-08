import { NextResponse } from "next/server";
import { getAllOrganisation, addOrganisation } from "@/lib/db/org";
import { createClient } from "@/lib/supabase/server";
import { ensureTables } from "@/lib/db/ensureTables";

export async function GET() {
    console.log("[org GET] DATABASE_URL set:", !!process.env.DATABASE_URL);
    console.log("[org GET] SUPABASE_URL set:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    try {
        console.log("[org GET] calling ensureTables...");
        await ensureTables();
        console.log("[org GET] ensureTables done");

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log("[org GET] user:", user?.id ?? "null", "authError:", authError?.message ?? "none");

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const organisations = await getAllOrganisation(user.id);
        console.log("[org GET] fetched", organisations.length, "orgs");
        return NextResponse.json(organisations);
    } catch (error) {
        console.error("[org GET] CAUGHT ERROR:", error);
        return NextResponse.json({ error: "db_unavailable", detail: String(error) }, { status: 503 });
    }
}

export async function POST(req: Request) {
    try {
        await ensureTables();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        if (!data.name || !data.managed_by) {
            return NextResponse.json({ error: "name and managed_by are required" }, { status: 400 });
        }

        const newOrg = await addOrganisation({
            name: data.name,
            managed_by: data.managed_by,
            user_id: user.id,
        });
        return NextResponse.json(newOrg, { status: 201 });
    } catch (error) {
        console.error("[org POST] CAUGHT ERROR:", error);
        return NextResponse.json({ error: "db_unavailable", detail: String(error) }, { status: 503 });
    }
}
