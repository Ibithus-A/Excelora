export type AIMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
};

export type AIUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type AIStreamEvent =
  | { type: "text"; text: string }
  | { type: "usage"; usage: AIUsage };

export type AIChatRequest = {
  messages: AIMessage[];
  temperature?: number;
  maxOutputTokens?: number;
};

export type AIStructuredRequest = AIChatRequest & {
  schemaName: string;
};

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  stream(request: AIChatRequest, signal?: AbortSignal): AsyncIterable<AIStreamEvent>;
  generateStructured(request: AIStructuredRequest, signal?: AbortSignal): Promise<{
    content: string;
    usage: AIUsage | null;
  }>;
}
