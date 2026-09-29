import type { AIProvider } from "@/lib/ai/provider";
import { parseAssessmentFeedback } from "./schema";

export async function generateDiagnosticFeedback(provider: AIProvider, input: {
  question: string; expectedAnswer: string; workedSolution: string; studentAnswer: string; deterministicResult: string; maxScore: number;
}, signal?: AbortSignal) {
  const result = await provider.generateStructured({
    schemaName: "assessment_feedback",
    temperature: 0,
    maxOutputTokens: 700,
    messages: [
      { role: "system", content: "Return only a JSON object. You provide diagnostic tutoring feedback, not authoritative marks. Never override the deterministic result. Required keys: correct (boolean or null), score (number), maxScore (number), feedback (string), misconception (string or null), nextAction (string), confidence (low, medium, or high)." },
      { role: "user", content: `Question: ${input.question}\nExpected answer: ${input.expectedAnswer}\nWorked solution: ${input.workedSolution}\nStudent answer: ${input.studentAnswer}\nDeterministic marker result: ${input.deterministicResult}\nMaximum score: ${input.maxScore}\nProduce JSON diagnostic feedback.` },
    ],
  }, signal);
  const feedback = parseAssessmentFeedback(result.content, input.maxScore);
  if (!feedback) throw new Error("Arthur returned invalid diagnostic feedback.");
  return { feedback, usage: result.usage };
}
