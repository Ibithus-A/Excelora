import type { AIProvider } from "@/lib/ai/provider";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ArthurPracticeQuestion = {
  prompt: string;
  difficulty: "Foundation" | "Standard" | "Stretch";
  topic: string;
  source: "approved-bank" | "temporary-ai";
};

export function parseTemporaryQuestionSet(raw: string, expectedCount: number): ArthurPracticeQuestion[] | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!value || typeof value !== "object" || !Array.isArray((value as { questions?: unknown }).questions)) return null;
  const questions = (value as { questions: unknown[] }).questions;
  if (questions.length !== expectedCount) return null;
  const parsed: ArthurPracticeQuestion[] = [];
  for (const value of questions) {
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    if (typeof item.prompt !== "string" || !item.prompt.trim() || item.prompt.length > 2_000) return null;
    if (typeof item.topic !== "string" || !item.topic.trim() || item.topic.length > 300) return null;
    if (item.difficulty !== "Foundation" && item.difficulty !== "Standard" && item.difficulty !== "Stretch") return null;
    parsed.push({ prompt: item.prompt.trim(), topic: item.topic.trim(), difficulty: item.difficulty, source: "temporary-ai" });
  }
  return parsed;
}

export async function getApprovedPracticeQuestions(admin: SupabaseClient, input: {
  courseTopicKey: string; subtopic?: string; difficulty?: ArthurPracticeQuestion["difficulty"]; count?: number;
}) {
  const count = Math.min(5, Math.max(1, input.count ?? 3));
  let query = admin.from("assessment_question_bank")
    .select("prompt,difficulty,subtopic")
    .eq("course_topic_key", input.courseTopicKey)
    .eq("exposed_in_notes", false)
    .limit(count);
  if (input.subtopic) query = query.eq("subtopic", input.subtopic);
  if (input.difficulty) query = query.eq("difficulty", input.difficulty);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    prompt: String(row.prompt),
    difficulty: row.difficulty as ArthurPracticeQuestion["difficulty"],
    topic: String(row.subtopic),
    source: "approved-bank" as const,
  }));
}

export async function generateTemporaryPracticeQuestions(provider: AIProvider, input: {
  qualification: string; subject: string; topic: string; difficulty: ArthurPracticeQuestion["difficulty"]; count?: number; misconception?: string | null;
}, signal?: AbortSignal) {
  const count = Math.min(5, Math.max(1, input.count ?? 3));
  const result = await provider.generateStructured({
    schemaName: "temporary_practice_questions",
    temperature: 0.2,
    maxOutputTokens: 1_200,
    messages: [
      { role: "system", content: "Return only one JSON object with a questions array. Each question must have exactly prompt, difficulty and topic. Do not reproduce copyrighted exam questions. Do not include answers or mark schemes. These are temporary tutoring questions and will not enter the official bank." },
      { role: "user", content: `Create ${count} original ${input.difficulty} questions for ${input.qualification}, ${input.subject}, topic ${input.topic}.${input.misconception ? ` Target this evidenced misconception: ${input.misconception}.` : ""} Return JSON.` },
    ],
  }, signal);
  const questions = parseTemporaryQuestionSet(result.content, count);
  if (!questions) throw new Error("Arthur returned an invalid temporary question set.");
  return { questions, usage: result.usage };
}
