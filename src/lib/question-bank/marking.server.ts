import type { BankQuestionSecret } from "./bank-types.ts";
import { answerText, decodeParts } from "./responses.ts";

/** No eval, coercion of units, comma removal, or case-folding of symbolic variables. */
export function parseNumericAnswer(value: string): number | null {
  let text = answerText(value).replace(/\$/g, "").replace(/−/g, "-").trim();
  text = text.replace(
    /^\\(?:d?frac)\{([+-]?[\d.]+)\}\{([+-]?[\d.]+)\}$/,
    "$1/$2",
  );
  const literal = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?";
  if (new RegExp(`^${literal}$`).test(text)) {
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
  }
  const fraction = new RegExp(`^(${literal})\\s*/\\s*(${literal})$`).exec(text);
  if (!fraction || Number(fraction[2]) === 0) return null;
  const n = Number(fraction[1]) / Number(fraction[2]);
  return Number.isFinite(n) ? n : null;
}

export function markBankResponse(
  _responseType: string,
  studentAnswer: string,
  secret: BankQuestionSecret,
  availableMarks: number,
) {
  const parts = Object.values(decodeParts(studentAnswer));
  if (!parts.some((p) => answerText(p)))
    return { marks: 0, isCorrect: false, requiresReview: false };
  // Some legacy bank rows contain a numeric final answer while retaining a
  // broader response_type label. Numeric equivalence is still deterministic
  // and safe whenever both sides parse as numbers.
  if (parts.length === 1) {
    const submitted = parseNumericAnswer(parts[0]);
    const expected = parseNumericAnswer(secret.answer);
    if (submitted !== null && expected !== null) {
      const isCorrect =
        Math.abs(submitted - expected) <=
        Math.max(1e-9, Math.abs(expected) * 1e-9);
      return {
        marks: isCorrect ? availableMarks : 0,
        isCorrect,
        requiresReview: false,
      };
    }
  }
  // Even identical final expressions cannot prove that required working was supplied.
  // Leave symbolic equivalence, explanation and unallocated multipart marks to review.
  return { marks: 0, isCorrect: null, requiresReview: true };
}
