import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
  agentRules: false,
  // unpdf loads pdf.js workers dynamically and should remain a server runtime dependency.
  serverExternalPackages: ["unpdf"],
  // Keep local browser fixtures independent of an already-running app server.
  distDir:
    process.env.EXCELORA_QA_FIXTURES === "1" ? ".next/qa-review" : ".next",
};

export default nextConfig;
