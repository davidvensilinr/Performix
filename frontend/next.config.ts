import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    // Allow the ML API URL to be overridden at build time for Vercel
    env: {
        ML_API_URL: process.env.ML_API_URL ?? "http://localhost:8000",
    },
};

export default nextConfig;
