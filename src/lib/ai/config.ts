function integerFromEnv(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export type AIConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
};

export function getDeepSeekConfig(): AIConfig {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim() ?? "";
  if (!apiKey) throw new Error("DeepSeek is not configured.");

  return {
    apiKey,
    baseUrl: (process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com").replace(/\/$/, ""),
    model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-flash",
    timeoutMs: integerFromEnv(process.env.DEEPSEEK_TIMEOUT_MS, 45_000, 5_000, 120_000),
    maxOutputTokens: integerFromEnv(process.env.DEEPSEEK_MAX_OUTPUT_TOKENS, 1_200, 128, 4_096),
  };
}
