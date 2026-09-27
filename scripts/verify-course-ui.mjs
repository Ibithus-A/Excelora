const { chromium } = await import(
  process.env.EXCELORA_PLAYWRIGHT_MODULE ?? "@playwright/test"
);
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const output = "docs/qa/browser/native-only";
mkdirSync(output, { recursive: true });
const b = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage();
p.on("dialog", (d) => d.accept());
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.route("**/api/student-progress**", (r) =>
  r.fulfill({
    json: {
      activity: [
        {
          student_id: "qa-student",
          page_title: "6.2 Logarithms and Their Laws",
          mode: "practice",
          last_seen_at: new Date().toISOString(),
        },
      ],
      practice: [
        {
          id: "run-1",
          subtopic: "Logarithms and Their Laws",
          status: "active",
          practice_session_questions: [
            { checked_at: "2026-09-24", requires_review: true },
          ],
        },
      ],
      assessments: [
        {
          id: "a1",
          assessment_key: "pure-mathematics:chapter-1",
          status: "submitted",
          score: 10,
          total_marks: 75,
          pending_review_marks: 60,
          started_at: new Date().toISOString(),
        },
      ],
      asOf: new Date().toISOString(),
    },
  }),
);
const keys = [];
await p.route("**/api/generated-assessments**", (r) => {
  keys.push(new URL(r.request().url()).searchParams.get("assessmentKey"));
  return r.fulfill({
    json: {
      isUnlocked: false,
      prerequisite: { isComplete: true, completedCount: 5, totalCount: 5 },
      attempt: null,
    },
  });
});
await p.route("**/api/practice**", (r) =>
  r.fulfill({
    json:
      r.request().method() === "GET"
        ? {
            subtopics: [
              { title: "Logarithms and Their Laws", counts: { balanced: 50 } },
              { title: "Exponential Functions", counts: { balanced: 50 } },
            ],
            history: [],
          }
        : {
            session: {
              id: "preview",
              preview: true,
              status: "active",
              questions: [
                {
                  id: "q1",
                  prompt: "Simplify $\\frac{2x}{4}$.",
                  subtopic: "Logarithms and Their Laws",
                  marks: 2,
                  response: "",
                  checked_at: null,
                },
              ],
            },
          },
  }),
);
for (const width of [320, 1280]) {
  await p.setViewportSize({ width, height: 950 });
  await p.goto(
    "http://127.0.0.1:3007/qa-fixture?mode=practice&chapter=Chapter%206:%20Exponentials%20and%20Logarithms",
  );
  await p
    .getByRole("button", { name: "Start practice", exact: true })
    .waitFor();
  assert.equal(await p.getByText("Session length", { exact: true }).count(), 0);
  await p.screenshot({
    path: `${output}/practice-start-${width}.png`,
    fullPage: true,
  });
  await p.getByRole("button", { name: "Start practice", exact: true }).click();
  await p.getByRole("button", { name: "Calculator", exact: true }).click();
  await p.getByRole("dialog", { name: "Maths input", exact: true }).waitFor();
  await p.getByRole("textbox", { name: "Expression", exact: true }).fill("2/3");
  await p.waitForTimeout(350);
  await p.screenshot({
    path: `${output}/practice-calculator-${width}.png`,
    fullPage: true,
  });
  await p
    .getByRole("button", { name: "Insert expression", exact: true })
    .click();
  await p.locator("[contenteditable=true] .math-chip").waitFor();
  assert.equal(
    await p.getByRole("button", { name: "Open AI assistant" }).count(),
    0,
  );
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await p.goto("http://127.0.0.1:3007/qa-fixture?mode=tutor");
  await p.getByRole("heading", { name: "Student Activity" }).waitFor();
  await p.getByText("Review Marked Questions").first().waitFor();
  await p
    .getByRole("combobox", { name: "Chapter", exact: true })
    .selectOption({ index: 12 });
  await p
    .getByRole("button", { name: "Unlock assessment", exact: true })
    .waitFor();
  await p.waitForTimeout(100);
  assert.ok(keys.at(-1) !== keys[0]);
  await p.screenshot({
    path: `${output}/tutor-progress-${width}.png`,
    fullPage: true,
  });
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
}
assert.deepEqual(errors, []);
writeFileSync(
  `${output}/ui-results.json`,
  JSON.stringify(
    {
      widths: [320, 1280],
      startStopUI: true,
      calculatorInsertion: true,
      noAssistantInPractice: true,
      tutorChapterSwitch: true,
      pageErrors: errors,
    },
    null,
    2,
  ),
);
await b.close();
