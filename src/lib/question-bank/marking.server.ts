import { ComputeEngine } from "@cortex-js/compute-engine";
import type { BankQuestionSecret } from "./bank-types.ts";
import { normalizeBankLatex } from "./math-segments.ts";
import { answerText, decodeParts } from "./responses.ts";

const computeEngine = new ComputeEngine();
computeEngine.precision = 30;

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

function normalizedAnswer(value: string, caseInsensitive = false) {
  const normalized = normalizeBankLatex(answerText(value))
    .replace(/\$/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/\\left|\\right/g, "")
    .replace(/\s+/g, "")
    .replace(/[.;]+$/g, "")
    .trim();
  return caseInsensitive ? normalized.toLocaleLowerCase("en-GB") : normalized;
}

function mathSource(value: string) {
  return normalizeBankLatex(answerText(value))
    .replace(/\$/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/[×·]/g, "\\times ")
    .replace(/÷/g, "/")
    .replace(/\\left|\\right/g, "")
    .replace(/\bsqrt\s*\(([^()]*)\)/gi, "\\sqrt{$1}")
    .trim();
}

function hasParseErrors(
  expression: NonNullable<ReturnType<ComputeEngine["parse"]>>,
) {
  return expression.errors.length > 0;
}

/** Returns true only when symbolic equivalence can be demonstrated. */
export function mathematicallyEquivalent(leftValue: string, rightValue: string) {
  const leftSource = mathSource(leftValue);
  const rightSource = mathSource(rightValue);
  if (!leftSource || !rightSource) return false;
  try {
    const left = computeEngine.parse(leftSource, { parseNumbers: "rational" });
    const right = computeEngine.parse(rightSource, { parseNumbers: "rational" });
    if (!left || !right || hasParseErrors(left) || hasParseErrors(right))
      return false;
    if (left.isSame(right) || left.isEqual(right) === true) return true;
    const difference = computeEngine
      .box(["Subtract", left, right])
      .simplify();
    return difference.is(0) || difference.isEqual(0) === true;
  } catch {
    return false;
  }
}

type NumericToken = { value: number; tolerance: number };

function numericTokens(value: string): NumericToken[] {
  let source = normalizeBankLatex(answerText(value))
    .replace(/\$/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/,/g, " ")
    // Indices on unit/label symbols are not answer values (s^-2, x_1, etc.).
    .replace(/\b[A-Za-z]+\s*[_^]\s*\{?[+-]?\d+\}?/g, (match) =>
      match.replace(/[_^].*$/, ""),
    );
  for (let pass = 0; pass < 4; pass += 1) {
    const next = source.replace(
      /\\(?:d?frac)\s*\{\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\}\s*\{\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\}/g,
      (_match, numerator: string, denominator: string) => {
        const divisor = Number(denominator);
        return divisor ? String(Number(numerator) / divisor) : _match;
      },
    );
    if (next === source) break;
    source = next;
  }
  source = source.replace(
    /([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\/\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/g,
    (match, numerator: string, denominator: string) => {
      const divisor = Number(denominator);
      return divisor ? String(Number(numerator) / divisor) : match;
    },
  );
  const literal = /[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/g;
  return [...source.matchAll(literal)].flatMap((match) => {
    const parsed = Number(match[0]);
    if (!Number.isFinite(parsed)) return [];
    const mantissa = match[0].split(/[eE]/)[0];
    const decimalPlaces = mantissa.includes(".")
      ? mantissa.split(".")[1].length
      : 0;
    return [{
      value: parsed,
      tolerance: decimalPlaces > 0
        ? 0.5 * 10 ** -decimalPlaces + 1e-12
        : Math.max(1e-9, Math.abs(parsed) * 1e-9),
    }];
  });
}

export function numericAnswerValues(value: string) {
  return numericTokens(value).map((token) => token.value);
}

function equivalentNumericSequence(studentParts: string[], expectedValue: string) {
  const submitted = studentParts.flatMap(numericTokens);
  const expected = numericTokens(expectedValue);
  if (expected.length < 2 || submitted.length !== expected.length) return false;
  return expected.every(
    (item, index) =>
      Math.abs(submitted[index].value - item.value) <= item.tolerance,
  );
}

export function markBankResponse(
  responseType: string,
  studentAnswer: string,
  secret: BankQuestionSecret,
  availableMarks: number,
) {
  const parts = Object.values(decodeParts(studentAnswer));
  if (!parts.some((p) => answerText(p)))
    return { marks: 0, isCorrect: false, requiresReview: false };
  const expectedText = normalizedAnswer(secret.answer);
  const submittedText = parts.length === 1 ? normalizedAnswer(parts[0]) : "";
  if (submittedText && submittedText === expectedText)
    return { marks: availableMarks, isCorrect: true, requiresReview: false };
  if (
    parts.length === 1 &&
    ["short_text", "symbolic_or_written"].includes(responseType) &&
    normalizedAnswer(parts[0], true) === normalizedAnswer(secret.answer, true)
  )
    return { marks: availableMarks, isCorrect: true, requiresReview: false };
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
  if (
    responseType === "symbolic" &&
    parts.length === 1 &&
    mathematicallyEquivalent(parts[0], secret.answer)
  )
    return { marks: availableMarks, isCorrect: true, requiresReview: false };
  if (
    ["numeric", "numeric_multi"].includes(responseType) &&
    equivalentNumericSequence(parts, secret.answer)
  )
    return { marks: availableMarks, isCorrect: true, requiresReview: false };
  // Written reasoning, sketches and unresolved multipart allocation stay neutral.
  return { marks: 0, isCorrect: null, requiresReview: true };
}
