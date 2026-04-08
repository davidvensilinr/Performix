import { NextResponse } from "next/server";

const ML_API = process.env.ML_API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s — Render cold start can take ~15s

        const res = await fetch(`${ML_API}/predict/analyse`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
            return NextResponse.json({ error: "ml_unavailable" }, { status: 503 });
        }

        return NextResponse.json(await res.json());
    } catch (err: unknown) {
        const isTimeout = err instanceof Error && err.name === "AbortError";
        return NextResponse.json(
            { error: isTimeout ? "ml_timeout" : "ml_unavailable" },
            { status: 503 }
        );
    }
}
