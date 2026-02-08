import { NextResponse } from "next/server";
import { getAllOrganisation } from "@/lib/db/org";
import {addOrganisation} from "@/lib/db/org";

export async function GET(){
    try {
        const organisation = await getAllOrganisation();
        return NextResponse.json(organisation);
    } catch (error) {
        console.error("Failed to fetch organisations:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req:Request){
    try{
        const data = await req.json();
        const newOrg= await addOrganisation({
            name: data.name,
            managed_by:data.managed_by
        });
        return NextResponse.json(newOrg,{status:201});
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error:"Failed to create"},{status:500});
    }

}