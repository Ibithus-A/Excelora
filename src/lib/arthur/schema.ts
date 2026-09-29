export type ArthurMessage = { role: "user" | "assistant"; content: string };

export type ArthurRequest = {
  conversationId: string | null;
  reviewAttemptId: string | null;
  practiceContext: { sessionId: string; questionId: string } | null;
  pageTitle: string;
  pdfTitle: string;
  pageNodeId: string;
  messages: ArthurMessage[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parseArthurRequest(value: unknown): ArthurRequest | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages: ArthurMessage[] = rawMessages.slice(-12).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if ((item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string") return [];
    const content = item.content.trim().slice(0, 4_000);
    return content ? [{ role: item.role, content }] : [];
  });
  if (!messages.length || messages.at(-1)?.role !== "user") return null;

  const conversationId = optionalString(body.conversationId, 64);
  const reviewAttemptId = optionalString(body.reviewAttemptId, 64);
  const practice = body.practiceContext && typeof body.practiceContext === "object"
    ? body.practiceContext as Record<string, unknown>
    : null;
  const sessionId = optionalString(practice?.sessionId, 64);
  const questionId = optionalString(practice?.questionId, 200);
  if ((sessionId && !questionId) || (!sessionId && questionId)) return null;
  if (conversationId && !UUID.test(conversationId)) return null;
  if (reviewAttemptId && !UUID.test(reviewAttemptId)) return null;
  if (sessionId && !UUID.test(sessionId)) return null;

  return {
    conversationId: conversationId || null,
    reviewAttemptId: reviewAttemptId || null,
    practiceContext: sessionId && questionId ? { sessionId, questionId } : null,
    pageTitle: optionalString(body.pageTitle, 300) || "Workspace",
    pdfTitle: optionalString(body.pdfTitle, 300),
    pageNodeId: optionalString(body.pageNodeId, 300),
    messages,
  };
}

export type AssessmentFeedback = {
  correct: boolean | null;
  score: number;
  maxScore: number;
  feedback: string;
  misconception: string | null;
  nextAction: string;
  confidence: "low" | "medium" | "high";
};

export function parseAssessmentFeedback(raw: string, expectedMaxScore: number): AssessmentFeedback | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (item.correct !== true && item.correct !== false && item.correct !== null) return null;
  if (typeof item.score !== "number" || item.score < 0 || item.score > expectedMaxScore) return null;
  if (item.maxScore !== expectedMaxScore) return null;
  if (typeof item.feedback !== "string" || !item.feedback.trim() || item.feedback.length > 2_000) return null;
  if (item.misconception !== null && typeof item.misconception !== "string") return null;
  if (typeof item.nextAction !== "string" || !item.nextAction.trim() || item.nextAction.length > 1_000) return null;
  if (item.confidence !== "low" && item.confidence !== "medium" && item.confidence !== "high") return null;
  return {
    correct: item.correct,
    score: item.score,
    maxScore: expectedMaxScore,
    feedback: item.feedback.trim(),
    misconception: typeof item.misconception === "string" ? item.misconception.trim().slice(0, 500) || null : null,
    nextAction: item.nextAction.trim(),
    confidence: item.confidence,
  };
}
