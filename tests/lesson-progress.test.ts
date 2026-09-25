import test from "node:test";
import assert from "node:assert/strict";
import { createSeedState, insertALevelMathsTree } from "../src/lib/seed.ts";
import { mapLessonProgress } from "../src/lib/lesson-progress.ts";
import type { TopicProgressRow } from "../src/types/topic-progress.ts";
const row: TopicProgressRow = {
  id: "saved",
  student_id: "student",
  topic_id: "old-browser-node",
  topic_title: "1.1 Laws of Indices",
  subject_title: "Pure Mathematics",
  chapter_title: "Chapter 1: Algebra and Functions",
  status: "completed",
  watched_video: true,
  started_at: null,
  completed_at: null,
  updated_at: "2026-09-24T12:00:00Z",
};
test("progress follows the lesson across browsers and native-only reconciliation", () => {
  const state = createSeedState(),
    node = Object.values(state.nodes).find((n) => n.title === row.topic_title)!;
  const mapped = mapLessonProgress(state, [row]);
  assert.equal(mapped.lessonProgress[node.id], true);
  assert.equal(mapped.recordsByNode[node.id].topic_id, "old-browser-node");
});
test("latest record wins without marking an untouched lesson ongoing", () => {
  const state = createSeedState(),
    node = Object.values(state.nodes).find((n) => n.title === row.topic_title)!;
  const mapped = mapLessonProgress(state, [
    row,
    {
      ...row,
      status: "todo",
      watched_video: false,
      updated_at: "2026-09-24T13:00:00Z",
    },
  ]);
  assert.equal(mapped.lessonProgress[node.id], false);
  assert.equal(mapped.currentSubtopicId, null);
});
test("retired PDF and review siblings resolve to the existing canonical page", () => {
  const state = createSeedState(),
    node = Object.values(state.nodes).find(
      (n) => n.title === "6.2 Logarithms and Their Laws",
    )!;
  const copy = {
    ...node,
    id: "old-review",
    title: node.title + " — Native review",
  };
  state.nodes[copy.id] = copy;
  state.nodes[node.parentId!].childrenIds.push(copy.id);
  state.selectedId = copy.id;
  const next = insertALevelMathsTree(state);
  assert.equal(next.selectedId, node.id);
  assert.ok(next.nodes[node.id]);
  assert.equal(next.nodes[copy.id], undefined);
  assert.ok(
    !Object.values(next.nodes).some((n) =>
      / — (Native review|Original PDF)$/.test(n.title),
    ),
  );
});
test("same lesson title in another subject does not inherit progress", () => {
  const state = createSeedState(),
    node = Object.values(state.nodes).find((n) => n.title === row.topic_title)!;
  assert.equal(
    mapLessonProgress(state, [{ ...row, subject_title: "Statistics" }])
      .lessonProgress[node.id],
    undefined,
  );
});
