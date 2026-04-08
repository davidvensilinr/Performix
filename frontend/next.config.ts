import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        ML_API_URL: process.env.ML_API_URL ?? "http://localhost:8000",
    },
};

export default nextConfig;
