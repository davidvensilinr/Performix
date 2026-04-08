import { NextResponse } from "next/server";

const ML_API = process.env.ML_API_URL ?? "http://localhost:8000";

export async function GET() {
    return NextResponse.json({
        ml_api_url: ML_API,
        node_env: process.env.NODE_ENV,
    });
}

export async function POST(req: Request) {
    console.log("[ml/analyse] ML_API_URL =", ML_API);
    console.log("[ml/analyse] NODE_ENV =", process.env.NODE_ENV);

    let body: unknown;
    try {
        body = await req.json();
        console.log("[ml/analyse] request body =", JSON.stringify(body));
    } catch (e) {
        console.error("[ml/analyse] failed to parse body:", e);
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const targetUrl = `${ML_API}/predict/analyse`;
    console.log("[ml/analyse] fetching:", targetUrl);

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        console.log("[ml/analyse] render response status:", res.status);

        if (!res.ok) {
            const text = await res.text();
            console.error("[ml/analyse] render error body:", text);
            return NextResponse.json({ error: "ml_unavailable", detail: text }, { status: 503 });
        }

        const data = await res.json();
        console.log("[ml/analyse] success");
        return NextResponse.json(data);

    } catch (err: unknown) {
        const isTimeout = err instanceof Error && err.name === "AbortError";
        console.error("[ml/analyse] fetch threw:", err instanceof Error ? err.message : err);
        return NextResponse.json(
            { error: isTimeout ? "ml_timeout" : "ml_unavailable", detail: err instanceof Error ? err.message : String(err) },
            { status: 503 }
        );
    }
}
