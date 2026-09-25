// Checks every supplied prompt, answer and solution; never writes bank data.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import katex from "katex";
import { bankMathSegments } from "../src/lib/question-bank/math-segments.ts";
import { answerParts } from "../src/lib/question-bank/responses.ts";
const root = process.argv[2];
if (!root) throw new Error("Provide the supplied assessment-bank directory");
const questions = [
  "Pure/pure_bank_all_chapters.json",
  "Mechanics/mechanics_bank_all_chapters.json",
  "Statistics/statistics_bank_all_chapters.json",
].flatMap(
  (file) => JSON.parse(readFileSync(path.join(root, file), "utf8")).questions,
);
const errors = [],
  rawCommands = [],
  multipart = [];
let expressions = 0;
for (const q of questions) {
  const parts = answerParts(q.prompt);
  if (parts.length > 1)
    multipart.push({
      id: q.id,
      parts: parts.map((p) => ({ label: p.label, description: p.description })),
    });
  for (const field of ["prompt", "answer", "worked_solution"])
    for (const part of bankMathSegments(q[field])) {
      if (part.math) {
        expressions++;
        try {
          katex.renderToString(part.value, {
            throwOnError: true,
            strict: "ignore",
            trust: false,
          });
        } catch (error) {
          errors.push({
            id: q.id,
            field,
            expression: part.value,
            error: error.message,
          });
        }
      } else if (/\\[A-Za-z]/.test(part.value))
        rawCommands.push({ id: q.id, field });
    }
}
const report = {
  date: new Date().toISOString(),
  questions: questions.length,
  expressions,
  errors,
  rawCommands,
  multipartQuestions: multipart.length,
  multipart,
  limitation:
    "Parsing and KaTeX checks establish renderability, not semantic or editorial approval of the bank. Single vector outputs remain one field; ambiguous marking remains pending review.",
};
writeFileSync(
  "docs/qa/bank-mathematics-audit.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log({
  questions: questions.length,
  expressions,
  errors: errors.length,
  rawCommands: rawCommands.length,
  multipart: multipart.length,
});
if (errors.length || rawCommands.length) process.exitCode = 1;
