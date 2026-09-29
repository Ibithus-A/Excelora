import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  markBankResponse,
  mathematicallyEquivalent,
  numericAnswerValues,
  parseNumericAnswer,
} from "../src/lib/question-bank/marking.server.ts";
import { encodeParts } from "../src/lib/question-bank/responses.ts";

const root = process.argv[2];
if (!root) throw new Error("Provide the supplied assessment-bank directory");

const questions = [
  "Pure/pure_bank_all_chapters.json",
  "Mechanics/mechanics_bank_all_chapters.json",
  "Statistics/statistics_bank_all_chapters.json",
].flatMap((file) =>
  JSON.parse(readFileSync(path.join(root, file), "utf8")).questions,
);

const resultFor = (question, response) =>
  markBankResponse(
    question.response_type,
    response,
    {
      questionId: question.id,
      answer: question.answer,
      workedSolution: question.worked_solution,
    },
    question.marks,
  );
const passes = (question, response) => {
  const result = resultFor(question, response);
  return result.isCorrect === true && result.marks === question.marks;
};

const failures = [];
const types = {};
let exactAccepted = 0;
let flexibleNumeric = 0;
let flexibleSymbolic = 0;
let flexibleWrittenFormatting = 0;
let numericMultipart = 0;

for (const question of questions) {
  const type = (types[question.response_type] ??= {
    questions: 0,
    exactAccepted: 0,
    flexibleAccepted: 0,
  });
  type.questions += 1;
  if (passes(question, question.answer)) {
    exactAccepted += 1;
    type.exactAccepted += 1;
  } else {
    failures.push({ id: question.id, check: "exact expected answer" });
  }

  let flexible = false;
  const scalar = parseNumericAnswer(question.answer);
  if (scalar !== null) {
    const alternative = Number.isInteger(scalar)
      ? `${scalar}.0`
      : String(scalar);
    if (alternative !== question.answer && passes(question, alternative)) {
      flexibleNumeric += 1;
      flexible = true;
    }
  }

  const values = numericAnswerValues(question.answer);
  if (
    values.length > 1 &&
    ["numeric", "numeric_multi"].includes(question.response_type)
  ) {
    const response = encodeParts(
      Object.fromEntries(values.map((value, index) => [`(${index + 1})`, String(value)])),
    );
    if (passes(question, response)) {
      numericMultipart += 1;
      flexible = true;
    }
  }

  if (question.response_type === "symbolic") {
    const source = question.answer.replace(/\$/g, "").trim();
    if (
      !/[=<>\u2264\u2265;,]|\bor\b/i.test(source) &&
      mathematicallyEquivalent(source, `(${source})+0`) &&
      passes(question, `(${source})+0`)
    ) {
      flexibleSymbolic += 1;
      flexible = true;
    }
  }

  if (
    ["short_text", "symbolic_or_written"].includes(question.response_type) &&
    passes(question, question.answer.toLocaleUpperCase("en-GB"))
  ) {
    flexibleWrittenFormatting += 1;
    flexible = true;
  }
  if (flexible) type.flexibleAccepted += 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  questions: questions.length,
  exactAccepted,
  exactCoveragePercent: Number(((exactAccepted / questions.length) * 100).toFixed(2)),
  flexibleChecks: {
    numericScalarAlternative: flexibleNumeric,
    numericMultipartStructuredInput: numericMultipart,
    symbolicEquivalentTransformation: flexibleSymbolic,
    writtenCaseAndFormatting: flexibleWrittenFormatting,
  },
  types,
  failures,
  limitations: [
    "A passing expected-answer audit proves bank compatibility, not that every conceivable equivalent input can be recognised.",
    "Free-form explanations, proofs, sketches and method-mark allocation still require authored criteria or verified AI/tutor review.",
    "Symbolic equivalence is accepted only when the maths engine can prove it; unresolved expressions fail closed to review.",
  ],
};

writeFileSync(
  "docs/qa/question-marking-coverage.json",
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
