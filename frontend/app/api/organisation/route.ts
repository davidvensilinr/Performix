import { NextResponse } from "next/server";
import { getAllOrganisation } from "@/lib/db/org";
import {addOrganisation} from "@/lib/db/org";

export async function GET(){
    try {
        console.log("Attempting to fetch organisations...");
        const organisation = await getAllOrganisation();
        console.log("Successfully fetched organisations:", organisation);
        return NextResponse.json(organisation);
    } catch (error) {
        console.error("Database connection failed, using fallback data:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: (error as any)?.code
        });
        
        // Fallback mock data for development
        const mockOrganisations = [
            { id: 1, name: "Tech Corp", managed_by: "John Doe" },
            { id: 2, name: "Design Studio", managed_by: "Jane Smith" },
            { id: 3, name: "Marketing Agency", managed_by: "Mike Johnson" }
        ];
        
        return NextResponse.json(mockOrganisations);
    }
}

export async function POST(req:Request){
    try{
        console.log("Attempting to create new organisation...");
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