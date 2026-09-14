import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { CHAPTER_ONE_ASSESSMENT_FORM_A } from "../src/lib/question-bank/chapter-one.ts";
import { CHAPTER_ONE_ASSESSMENT_KEY } from "../src/lib/assessment-config.ts";
import { markAssessmentAnswers } from "../src/lib/assessment-solutions.server.ts";

function serializedPrompt(question: (typeof CHAPTER_ONE_ASSESSMENT_FORM_A)[number]) {
  return question.paragraphs.flat().map((segment) => segment.value).join(" ");
}

test("Chapter 1 form has stable unique IDs, numbering and 75 marks", () => {
  assert.equal(CHAPTER_ONE_ASSESSMENT_FORM_A.length, 15);
  assert.deepEqual(CHAPTER_ONE_ASSESSMENT_FORM_A.map((question) => question.number), Array.from({ length: 15 }, (_, index) => index + 1));
  assert.equal(CHAPTER_ONE_ASSESSMENT_FORM_A.reduce((sum, question) => sum + question.marks, 0), 75);
  assert.equal(new Set(CHAPTER_ONE_ASSESSMENT_FORM_A.map((question) => question.id)).size, 15);
});

test("every released question is original, classified and has unique answer keys", () => {
  const answerKeys = CHAPTER_ONE_ASSESSMENT_FORM_A.flatMap((question) =>
    question.answerParts?.map((part) => part.key) ?? [`q${question.number}`],
  );
  assert.equal(new Set(answerKeys).size, answerKeys.length);
  for (const question of CHAPTER_ONE_ASSESSMENT_FORM_A) {
    assert.equal(question.provenance.kind, "excelora-original");
    assert.ok(question.topic.startsWith("1."), `${question.id}: missing Chapter 1 topic`);
    assert.ok(question.skills.length > 0, `${question.id}: missing skill tags`);
    assert.ok(question.paragraphs.length > 0, `${question.id}: missing prompt`);
  }
});

test("retired lesson-derived assessment questions cannot return", () => {
  const releasedPaper = CHAPTER_ONE_ASSESSMENT_FORM_A.map(serializedPrompt).join("\n");
  const retiredFragments = [
    "3x^3+2ax^2-4x+5a",
    String.raw`\sqrt{98}+\sqrt2`,
    String.raw`\frac{27^t}{3^{t-1}}=3\sqrt3`,
    "(2x+3)^2-(4-x)^2=45",
    String.raw`\frac1{\sqrt2-1}`,
    "y=5x+k",
    "12-2|2x-3|",
    "y=|x-1|",
    "x^3+3x^2-24x+20",
    "f(x)=4-3x^2",
    "x^2+(k-1)x+k+2=0",
    "y=0.84x+428",
  ];
  for (const fragment of retiredFragments) {
    assert.ok(!releasedPaper.includes(fragment), `lesson-derived item returned: ${fragment}`);
  }
});

test("distinctive assessment expressions do not occur in Chapter 1 lesson source", () => {
  const componentDirectory = new URL("../src/components/", import.meta.url);
  const lessonSource = readdirSync(componentDirectory)
    .filter((name) => name.endsWith("-native-lesson.tsx"))
    .map((name) => readFileSync(new URL(name, componentDirectory), "utf8"))
    .join("\n")
    .replace(/\s+/g, "");

  for (const question of CHAPTER_ONE_ASSESSMENT_FORM_A) {
    const distinctiveExpressions = question.paragraphs
      .flat()
      .filter((segment) => segment.type === "math")
      .map((segment) => segment.value.replace(/\s+/g, ""))
      .filter((expression) => expression.length >= 14);
    for (const expression of distinctiveExpressions) {
      assert.ok(!lessonSource.includes(expression), `${question.id}: expression is already used in a lesson: ${expression}`);
    }
  }
});

test("the server-only mark scheme awards the complete original paper correctly", () => {
  const answers = {
    q1: "x=5",
    q2_a_i: "3sqrt(3)", q2_a_ii: "-1-2sqrt(3)", q2_b: "10-5sqrt(3)",
    q3: "(3x+2)(2x-1)", q4: "x=0, x=5/4", q5: "(0,1), (4,5)",
    q6_a: "-1/3<=x<=2", q6_b: "1<x<3", q7_a: "c=5", q7_b: "(2,11)",
    q8: "-2<=x<=1", q9_a: "(-2,0), (0,0), (3,0)", q9_b: "x<-2 or 0<x<3",
    q10_a: "a=4, b=3", q10_b: "g(x)=2x^2-2x+6, p=14, q=-9",
    q11_a: "-1/(x+1)+8/(x+3)", q11_b: "2x+1+3/(x+1)",
    q12_a: "7", q12_b: "4x^2-12x+10", q12_c: "f^(-1)(x)=(x+3)/2",
    q12_d: "sqrt(x-2)+4, x>=2", q12_e: "y>=1",
    q13_a: "g(x)=x^2-4x+5", q13_b: "h(x)=-(1/2)x^2-2x",
    q14_a: "C=md+b", q14_b: "C=2d+7", q14_c: "£2 per kilometre", q14_d: "21",
    q15_a: "f(1)=0", q15_b: "(x-1)(x+1)(x-4)", q15_c: "x=-1, x=1, x=4",
    q15_d: "-1<x<1 or x>4",
  };
  const locked = Array.from({ length: 15 }, (_, index) => `q${index + 1}`);
  const result = markAssessmentAnswers(CHAPTER_ONE_ASSESSMENT_KEY, answers, locked);
  assert.equal(result.score, 75);
  assert.equal(result.totalMarks, 75);
  assert.equal(result.pendingReviewMarks, 0);
  assert.equal(result.markingVersion, "chapter-1-form-a-v1");
});

test("multipart marking distinguishes incorrect, partial and fully correct answers", () => {
  const incorrect = markAssessmentAnswers(CHAPTER_ONE_ASSESSMENT_KEY, {
    q2_a_i: "0", q2_a_ii: "0", q2_b: "0",
  }, ["q2"]);
  assert.equal(incorrect.questionScores.q2.marks, 0);

  const partial = markAssessmentAnswers(CHAPTER_ONE_ASSESSMENT_KEY, {
    q2_a_i: "3sqrt(3)", q2_a_ii: "0", q2_b: "0",
  }, ["q2"]);
  assert.equal(partial.questionScores.q2.marks, 1);

  const correct = markAssessmentAnswers(CHAPTER_ONE_ASSESSMENT_KEY, {
    q2_a_i: "3sqrt(3)", q2_a_ii: "-1-2sqrt(3)", q2_b: "5(2-sqrt(3))",
  }, ["q2"]);
  assert.equal(correct.questionScores.q2.marks, 5);
});
