import { NextResponse } from "next/server";
import { getAllOrganisation } from "@/lib/db/org";

export async function GET(){
    const organisation = await getAllOrganisation();
    return NextResponse.json(organisation);
}