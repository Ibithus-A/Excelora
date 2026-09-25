import test from "node:test";
import assert from "node:assert/strict";
import { resolvePracticeSubtopic } from "../src/lib/question-bank/subtopics.ts";
import { transcript } from "../src/content/notion-lessons/authoring.ts";
import { lessonCards } from "../src/lib/lessons/presentation.ts";
test("subtopic matching preserves scope and never silently selects another topic", () => {
  assert.equal(
    resolvePracticeSubtopic("10.5 Finding Mu and Sigma", [
      "The normal distribution",
      "Finding μ and σ",
    ]),
    "Finding μ and σ",
  );
  assert.equal(resolvePracticeSubtopic("5.8 The R cos Form", ["The R cos(theta ± alpha) Form"]), "The R cos(theta ± alpha) Form");
  assert.equal(resolvePracticeSubtopic("Missing", ["Available"]), null);
  assert.equal(resolvePracticeSubtopic("", ["Available"]), "");
});
test("explicit worked-example cards preserve content order", () => {
  const blocks = transcript(
    "## Worked Examples\n\n@card\n\nFirst question.\n\n$$x=1$$\n\n@card\n\nSecond question.\n\nAnswer.",
  );
  assert.equal(blocks[0].type, "group");
  if (blocks[0].type !== "group") throw new Error("missing section");
  const cards = lessonCards(blocks[0].children, "Worked Examples");
  assert.equal(cards.length, 2);
  assert.equal(cards[0][0].type, "example");
  if (cards[0][0].type === "example")
    assert.equal(cards[0][0].children.length, 2);
});
