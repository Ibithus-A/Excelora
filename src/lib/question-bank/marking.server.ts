import type { BankQuestionSecret } from "./bank-types.ts";

function normalized(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ").replace(/[£,]/g, "").replace(/\.$/, "");
}

function singleNumber(value: string) {
  const cleaned = normalized(value).replace(/^[a-z]\s*=\s*/, "");
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(cleaned)) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

export function markBankResponse(
  responseType: string,
  studentAnswer: string,
  secret: BankQuestionSecret,
  availableMarks: number,
) {
  if (!studentAnswer.trim()) return { marks: 0, isCorrect: false, requiresReview: false };
  if (responseType === "numeric") {
    const submitted = singleNumber(studentAnswer);
    const expected = singleNumber(secret.answer);
    if (submitted !== null && expected !== null) {
      const isCorrect = Math.abs(submitted - expected) <= Math.max(1e-9, Math.abs(expected) * 1e-9);
      return { marks: isCorrect ? availableMarks : 0, isCorrect, requiresReview: false };
    }
  }
  // Exact text is safe to accept. All other symbolic, multi-part or written
  // responses are retained for a future equivalence/manual marker rather than
  // being incorrectly rejected by brittle algebraic string comparison.
  if (normalized(studentAnswer) === normalized(secret.answer)) {
    return { marks: availableMarks, isCorrect: true, requiresReview: false };
  }
  return { marks: 0, isCorrect: null, requiresReview: true };
}
