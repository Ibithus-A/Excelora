import { getDeepSeekConfig, type AIConfig } from "./config.ts";
import type { AIChatRequest, AIProvider, AIStreamEvent, AIStructuredRequest, AIUsage } from "./provider.ts";

type DeepSeekChunk = {
  choices?: Array<{ delta?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null;
};

function usageFrom(value: DeepSeekChunk["usage"]): AIUsage | null {
  if (!value) return null;
  return {
    inputTokens: Number(value.prompt_tokens ?? 0),
    outputTokens: Number(value.completion_tokens ?? 0),
    totalTokens: Number(value.total_tokens ?? 0),
  };
}

function combineSignals(signal: AbortSignal | undefined, timeoutMs: number) {
  return signal
    ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
    : AbortSignal.timeout(timeoutMs);
}

async function providerError(response: Response) {
  const requestId = response.headers.get("x-request-id");
  try {
    await response.body?.cancel();
  } catch {
    // The status and request ID are enough to diagnose without logging a body.
  }
  console.error("[arthur.provider] deepseek request failed", {
    status: response.status,
    requestId,
  });
  throw new Error(response.status === 429 ? "The tutoring service is busy. Please try again shortly." : "The tutoring service is temporarily unavailable.");
}

export class DeepSeekProvider implements AIProvider {
  readonly name = "deepseek";
  readonly model: string;
  private readonly config: AIConfig;

  constructor(config: AIConfig = getDeepSeekConfig()) {
    this.config = config;
    this.model = config.model;
  }

  async *stream(request: AIChatRequest, signal?: AbortSignal): AsyncIterable<AIStreamEvent> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      signal: combineSignals(signal, this.config.timeoutMs),
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxOutputTokens ?? this.config.maxOutputTokens,
        stream: true,
        stream_options: { include_usage: true },
        thinking: { type: "disabled" },
      }),
    });
    if (!response.ok) await providerError(response);
    if (!response.body) throw new Error("The tutoring service returned no response stream.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          let chunk: DeepSeekChunk;
          try {
            chunk = JSON.parse(data) as DeepSeekChunk;
          } catch {
            continue;
          }
          const text = chunk.choices?.[0]?.delta?.content;
          if (text) yield { type: "text", text };
          const usage = usageFrom(chunk.usage);
          if (usage) yield { type: "usage", usage };
        }
      }
      if (done) break;
    }
    for (const line of buffer.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const chunk = JSON.parse(data) as DeepSeekChunk;
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) yield { type: "text", text };
        const usage = usageFrom(chunk.usage);
        if (usage) yield { type: "usage", usage };
      } catch {
        // Ignore an incomplete terminal frame; the route treats empty output as an error.
      }
    }
  }

  async generateStructured(request: AIStructuredRequest, signal?: AbortSignal) {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      signal: combineSignals(signal, this.config.timeoutMs),
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        temperature: request.temperature ?? 0,
        max_tokens: request.maxOutputTokens ?? this.config.maxOutputTokens,
        response_format: { type: "json_object" },
        stream: false,
        thinking: { type: "disabled" },
      }),
    });
    if (!response.ok) await providerError(response);
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: DeepSeekChunk["usage"];
    };
    const content = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) throw new Error(`The tutoring service returned an empty ${request.schemaName} response.`);
    return { content, usage: usageFrom(payload.usage) };
  }
}

export function createAIProvider(): AIProvider {
  return new DeepSeekProvider();
}
