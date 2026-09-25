import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
  agentRules: false,
  // Keep local browser fixtures independent of an already-running app server.
  distDir:
    process.env.EXCELORA_QA_FIXTURES === "1" ? ".next/qa-review" : ".next",
};

export default nextConfig;
