import { NextResponse } from "next/server";
import { getAllOrganisation, addOrganisation } from "@/lib/db/org";
import { createClient } from "@/lib/supabase/server";
import { ensureTables } from "@/lib/db/ensureTables";

export async function GET(req: Request) {
    try {
        await ensureTables();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const organisations = await getAllOrganisation(user.id);
        return NextResponse.json(organisations);
    } catch (error) {
        console.error("DB error fetching organisations:", error);
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
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
        console.error("DB error creating organisation:", error);
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
}
