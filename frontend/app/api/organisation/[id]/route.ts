import { NextResponse } from "next/server";
import { getOrgById } from "@/lib/db/org";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const orgId = parseInt(id);

    if (isNaN(orgId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        const org = await getOrgById(orgId);
        if (!org) {
            return NextResponse.json({ error: "Organisation not found" }, { status: 404 });
        }
        return NextResponse.json(org);
    } catch (error) {
        console.error("Failed to fetch organisation:", error);
        return NextResponse.json({ error: "Failed to fetch organisation" }, { status: 500 });
    }
}
