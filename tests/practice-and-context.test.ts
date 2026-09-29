import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { selectPracticeQuestions } from "../src/lib/question-bank/practice-selector.ts";
import { selectAssessmentQuestions } from "../src/lib/question-bank/selector.ts";
import {
  markBankResponse,
  parseNumericAnswer,
} from "../src/lib/question-bank/marking.server.ts";
import {
  answerParts,
  encodeParts,
  responseHasContent,
} from "../src/lib/question-bank/responses.ts";
import { encodeAssessmentAnswer } from "../src/lib/assessment-answer.ts";
import { serializeLesson } from "../src/lib/lessons/schema.ts";
import { PROOF_STRUCTURE } from "../src/content/notion-lessons/proof-structure.ts";
import type { BankQuestion } from "../src/lib/question-bank/bank-types.ts";
const bank: BankQuestion[] = [
  "Pure Mathematics",
  "Mechanics",
  "Statistics",
].flatMap((domain) =>
  (["Foundation", "Standard", "Stretch"] as const).flatMap((difficulty) =>
    Array.from({ length: 30 }, (_, i) => ({
      id: `${domain}-${difficulty}-${i}`,
      qualification: "test",
      domain,
      courseTopicKey: domain,
      chapter: "test",
      subtopic: i < 25 ? "chosen" : "other",
      specRefs: [],
      family: `family-${i}`,
      variant: i + 1,
      difficulty,
      marks: 2,
      responseType: "numeric",
      prompt: "Find $2+2$.",
      tags: [],
      fingerprint: `${domain}-${difficulty}-${i}`,
      exposedInNotes: false,
    })),
  ),
);
for (const topic of ["Pure Mathematics", "Mechanics", "Statistics"]) {
  test(`${topic}: complete practice and formal selection/marking, refresh and exposure`, () => {
    for (const count of [5, 10, 15, 20]) {
      const practice = selectPracticeQuestions({
        questions: bank,
        courseTopicKey: topic,
        subtopic: "chosen",
        count,
        difficulty: "balanced",
        exposure: [],
        random: () => 0.5,
      });
      assert.equal(practice.length, count);
      assert.ok(
        practice.every(
          (q) => q.subtopic === "chosen" && q.courseTopicKey === topic,
        ),
      );
      const exposure = practice.map((q) => ({
        questionId: q.id,
        family: q.family,
        timesSeen: 1,
        lastSeenAt: "2026-09-21T00:00:00Z",
      }));
      const formal = selectAssessmentQuestions({
        questions: bank,
        courseTopicKey: topic,
        exposure,
        random: () => 0.5,
      });
      assert.equal(formal.length, 15);
      assert.ok(formal.every((q) => !practice.some((p) => p.id === q.id)));
      assert.deepEqual(
        ["Foundation", "Standard", "Stretch"].map(
          (d) => formal.filter((q) => q.difficulty === d).length,
        ),
        [4, 7, 4],
      );
      assert.deepEqual(
        JSON.parse(JSON.stringify(formal.map((q) => q.id))),
        formal.map((q) => q.id),
      );
      const grades = [...practice, ...formal].map((q) =>
        markBankResponse(
          q.responseType,
          "4",
          { questionId: q.id, answer: "4", workedSolution: "2+2=4" },
          q.marks,
        ),
      );
      assert.ok(grades.every((g) => g.isCorrect === true));
    }
  });
}
test("practice rejects invalid counts, scarcity and unknown difficulty", () => {
  for (const options of [
    { count: 0, difficulty: "balanced" },
    { count: 20, difficulty: "invalid" },
    { count: 20, difficulty: "balanced", subtopic: "missing" },
  ])
    assert.throws(() =>
      selectPracticeQuestions({
        questions: bank,
        courseTopicKey: "Mechanics",
        subtopic: "chosen",
        exposure: [],
        ...options,
      } as Parameters<typeof selectPracticeQuestions>[0]),
    );
});
test("marking accepts equivalent numeric, symbolic and multipart answer forms", () => {
  const encoded = encodeAssessmentAnswer([
    { type: "math", latex: "\\frac{1}{2}" },
  ]);
  assert.equal(parseNumericAnswer(encoded), 0.5);
  assert.equal(parseNumericAnswer("1,2"), null);
  assert.equal(parseNumericAnswer("1/0"), null);
  assert.equal(parseNumericAnswer("2 metres"), null);
  assert.deepEqual(
    markBankResponse(
      "numeric",
      encoded,
      { questionId: "q", answer: "0.5", workedSolution: "" },
      3,
    ),
    { marks: 3, isCorrect: true, requiresReview: false },
  );
  assert.deepEqual(
    markBankResponse(
      "short_text",
      "2",
      { questionId: "legacy-numeric", answer: "2", workedSolution: "" },
      2,
    ),
    { marks: 2, isCorrect: true, requiresReview: false },
  );
  assert.equal(
    markBankResponse(
      "numeric",
      "7",
      { questionId: "q", answer: "8", workedSolution: "" },
      3,
    ).isCorrect,
    false,
  );
  assert.deepEqual(
    markBankResponse(
      "symbolic",
      "2(x+1)",
      { questionId: "symbolic", answer: "2x+2", workedSolution: "" },
      3,
    ),
    { marks: 3, isCorrect: true, requiresReview: false },
  );
  assert.deepEqual(
    markBankResponse(
      "symbolic",
      "\\sqrt{32}",
      { questionId: "surd", answer: "4\\sqrt{2}", workedSolution: "" },
      2,
    ),
    { marks: 2, isCorrect: true, requiresReview: false },
  );
  assert.deepEqual(
    markBankResponse(
      "numeric_multi",
      encodeParts({ "(a)": "4.47213595", "(b)": "26.6" }),
      {
        questionId: "vector",
        answer: "Magnitude 4.472 N, angle 26.6°",
        workedSolution: "",
      },
      3,
    ),
    { marks: 3, isCorrect: true, requiresReview: false },
  );
  assert.equal(
    markBankResponse(
      "symbolic",
      "X",
      { questionId: "case-sensitive", answer: "x", workedSolution: "" },
      3,
    ).requiresReview,
    true,
  );
});
test("multipart labels and rich empty values are distinguished", () => {
  assert.deepEqual(
    answerParts(
      "Find $f(a)$. (a) Calculate $x$. (b)(i) Explain. (b)(ii) Evaluate.",
    ).map((p) => p.label),
    ["Answer (a):", "Answer (b)(i):", "Answer (b)(ii):"],
  );
  assert.equal(responseHasContent(encodeAssessmentAnswer([])), false);
  assert.equal(
    responseHasContent(
      encodeParts({
        "(a)": encodeAssessmentAnswer([{ type: "math", latex: "2" }]),
        "(b)": "",
      }),
    ),
    true,
  );
});
test("native lesson context contains source meaning and truncates on block boundaries", () => {
  const context = serializeLesson(PROOF_STRUCTURE);
  assert.match(context, /Subject: Pure Mathematics/);
  assert.match(context, /Proof by contradiction/);
  assert.match(context, /Assume the opposite/);
  assert.ok(!context.includes("<"));
  const truncated = serializeLesson(PROOF_STRUCTURE, 700);
  assert.ok(truncated.length <= 700);
  assert.match(truncated, /Further lesson content omitted/);
  assert.ok(!truncated.endsWith("mathema"));
  const mathematical = serializeLesson({
    ...PROOF_STRUCTURE,
    blocks: [
      { type: "math", latex: "x^2=4" },
      { type: "diagram", description: "Parabola with roots -2 and 2." },
    ],
  });
  assert.match(mathematical, /\$\$x\^2=4\$\$/);
  assert.match(mathematical, /Diagram: Parabola/);
});
test("Arthur blocks active attempts on server before context construction and provider fetch", () => {
  const source = readFileSync(
    new URL("../src/app/api/arthur/route.ts", import.meta.url),
    "utf8",
  );
  const post = source.slice(source.indexOf("export async function POST"));
  assert.match(post, /await hasActiveAssessment\(auth\.admin, auth\.user\.id\)[\s\S]*Finish your active formal assessment/);
  assert.ok(post.indexOf("await hasActiveAssessment") < post.indexOf("getCanonicalCourseContext(body.pageTitle"));
  assert.match(post, /getCanonicalCourseContext\(body\.pageTitle, body\.pdfTitle\)/);
  assert.doesNotMatch(source, /COHERE_API_URL|COHERE_API_KEY/);
  assert.match(source, /\.eq\("status", "submitted"\)/);
  assert.match(source, /\.eq\("student_id", userId\)/);
});
test("practice has no formal persistence or timer and only reveals checked solutions", () => {
  const source = readFileSync(
    new URL("../src/app/api/practice/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /filter\(\(r\) => r.checked_at\)/);
  assert.match(source, /\.eq\("student_id",\s*studentId\)/);
  assert.match(source, /if \(!hasAttempt\)/);
  assert.match(source, /\.from\("practice_sessions"\)\s*\.delete\(\)/);
  assert.ok(!source.includes("deadline_at"));
  assert.ok(!source.includes("start_generated_assessment"));
  const ui = readFileSync(
    new URL("../src/components/practice-questions.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(!ui.includes("setInterval"));
  assert.match(ui, /Untimed/);
});

test("unlabelled bank compound tasks get separate descriptive fields", () => {
  assert.deepEqual(
    answerParts(
      "Find its time of flight, horizontal range and greatest height.",
    ),
    [
      { key: "(a)", label: "Answer (a):", description: "Time of flight" },
      { key: "(b)", label: "Answer (b):", description: "Horizontal range" },
      { key: "(c)", label: "Answer (c):", description: "Greatest height" },
    ],
  );
  assert.equal(answerParts("Find its velocity after 4 s.").length, 1);
  assert.deepEqual(
    answerParts("(a) Find its speed and displacement after 2 s. (b) Explain."),
    [
      { key: "(a)", label: "Answer (a):" },
      { key: "(b)", label: "Answer (b):" },
    ],
  );
});
