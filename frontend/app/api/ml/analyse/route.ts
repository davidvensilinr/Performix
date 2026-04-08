import { NextResponse } from "next/server";

const ML_API = process.env.ML_API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const res = await fetch(`${ML_API}/predict/analyse`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            return NextResponse.json({ error: "ml_unavailable" }, { status: 503 });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "ml_unavailable" }, { status: 503 });
    }
}
