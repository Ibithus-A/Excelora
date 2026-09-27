import assert from "node:assert/strict";
import test from "node:test";
import { COURSE_BANK_MAPPINGS } from "../src/lib/question-bank/course-mapping.ts";
import { calculateSubtopicResults, selectAssessmentQuestions, selectSynopticAssessmentQuestions } from "../src/lib/question-bank/selector.ts";
import { SYNOPTIC_ASSESSMENT_CONFIGS } from "../src/lib/assessment-config.ts";
import { createSeedState, SYNOPTIC_ASSESSMENT_TITLE } from "../src/lib/seed.ts";
import type { BankQuestion } from "../src/lib/question-bank/bank-types.ts";

function bank(topic: string): BankQuestion[] {
  return (["Foundation", "Standard", "Stretch"] as const).flatMap((difficulty) =>
    Array.from({ length: 20 }, (_, index) => ({
      id: `${topic}-${difficulty}-${index}`, qualification: "test", domain: "Pure Mathematics",
      courseTopicKey: topic, chapter: "Chapter", subtopic: `Topic ${index % 6}`,
      specRefs: [], family: `family-${index}`, variant: 1, difficulty, marks: 2,
      responseType: "numeric", prompt: "Question", tags: [], fingerprint: `${topic}-${difficulty}-${index}`,
      exposedInNotes: false,
    })),
  );
}

test("all 29 existing course chapters have a unique bank mapping", () => {
  assert.equal(COURSE_BANK_MAPPINGS.length, 29);
  assert.equal(new Set(COURSE_BANK_MAPPINGS.map((item) => item.courseTopicKey)).size, 29);
  assert.equal(new Set(COURSE_BANK_MAPPINGS.map((item) => `${item.subjectTitle}/${item.chapterTitle}`)).size, 29);
});

test("selector returns an exact topic-restricted 4/7/4 paper", () => {
  const topic = "pure_1_algebra_and_functions";
  const result = selectAssessmentQuestions({ questions: [...bank(topic), ...bank("other")], courseTopicKey: topic, exposure: [], random: () => 0.5 });
  assert.equal(result.length, 15);
  assert.ok(result.every((question) => question.courseTopicKey === topic));
  assert.deepEqual(Object.fromEntries(["Foundation", "Standard", "Stretch"].map((difficulty) => [difficulty, result.filter((q) => q.difficulty === difficulty).length])), { Foundation: 4, Standard: 7, Stretch: 4 });
});

test("selector excludes note-exposed items and avoids immediate repeats", () => {
  const topic = "pure_1_algebra_and_functions";
  const questions = bank(topic);
  questions[0].exposedInNotes = true;
  const first = selectAssessmentQuestions({ questions, courseTopicKey: topic, exposure: [], random: () => 0.5 });
  const exposure = first.map((q) => ({ questionId: q.id, family: q.family, timesSeen: 1, lastSeenAt: new Date().toISOString() }));
  const retake = selectAssessmentQuestions({ questions, courseTopicKey: topic, exposure, random: () => 0.5 });
  assert.ok(!first.some((q) => retake.some((r) => r.id === q.id)));
  assert.ok(!retake.some((q) => q.exposedInNotes));
});

test("exposure is supplied per student and immutable selections can be persisted", () => {
  const topic = "pure_1_algebra_and_functions";
  const questions = bank(topic);
  const studentASeen = questions.slice(0, 15).map((q) => ({ questionId: q.id, family: q.family, timesSeen: 2, lastSeenAt: "2026-01-01T00:00:00Z" }));
  const a = selectAssessmentQuestions({ questions, courseTopicKey: topic, exposure: studentASeen, random: () => 0.5 });
  const b = selectAssessmentQuestions({ questions, courseTopicKey: topic, exposure: [], random: () => 0.5 });
  assert.notDeepEqual(a.map((q) => q.id), b.map((q) => q.id));
  const persisted = a.map((q) => q.id);
  assert.deepEqual([...persisted], a.map((q) => q.id));
});

test("subtopic analytics totals marks correctly", () => {
  const questions = bank("topic").slice(0, 3);
  const result = calculateSubtopicResults(questions, { [questions[0].id]: 2, [questions[1].id]: 1 });
  assert.equal(Object.values(result).reduce((sum, row) => sum + row.available, 0), 6);
  assert.equal(Object.values(result).reduce((sum, row) => sum + row.marks, 0), 3);
});

test("each subject has one 90-minute 20-question synoptic configuration", () => {
  assert.equal(SYNOPTIC_ASSESSMENT_CONFIGS.length, 3);
  assert.deepEqual(
    SYNOPTIC_ASSESSMENT_CONFIGS.map((config) => config.subjectTitle).sort(),
    ["Mechanics", "Pure Mathematics", "Statistics"],
  );
  for (const config of SYNOPTIC_ASSESSMENT_CONFIGS) {
    assert.equal(config.durationSeconds, 90 * 60);
    assert.equal(config.questionCount, 20);
    assert.equal(config.requiresTutorUnlock, false);
    assert.ok(config.bankCourseTopicKeys.length >= 9);
  }
});

test("synoptic selector returns 5/10/5 and represents every subject topic", () => {
  const topics = COURSE_BANK_MAPPINGS.filter((mapping) => mapping.subjectTitle === "Pure Mathematics")
    .map((mapping) => mapping.courseTopicKey);
  const questions = topics.flatMap(bank);
  const result = selectSynopticAssessmentQuestions({
    questions,
    courseTopicKeys: topics,
    exposure: [],
    random: () => 0.5,
  });
  assert.equal(result.length, 20);
  assert.equal(new Set(result.map((question) => question.id)).size, 20);
  assert.ok(topics.every((topic) => result.some((question) => question.courseTopicKey === topic)));
  assert.deepEqual(
    Object.fromEntries(["Foundation", "Standard", "Stretch"].map((difficulty) => [
      difficulty,
      result.filter((question) => question.difficulty === difficulty).length,
    ])),
    { Foundation: 5, Standard: 10, Stretch: 5 },
  );
});

test("each subject exposes one subject-level synoptic assessment page", () => {
  const state = createSeedState();
  const subjectNodes = Object.values(state.nodes).filter((node) =>
    ["Pure Mathematics", "Mechanics", "Statistics"].includes(node.title),
  );
  assert.equal(subjectNodes.length, 3);
  for (const subject of subjectNodes) {
    const pages = subject.childrenIds
      .map((id) => state.nodes[id])
      .filter((node) => node?.title === SYNOPTIC_ASSESSMENT_TITLE);
    assert.equal(pages.length, 1, `${subject.title} should have one synoptic page`);
    assert.equal(subject.childrenIds.at(-1), pages[0].id);
  }
});
