const { chromium } = await import(
  process.env.EXCELORA_PLAYWRIGHT_MODULE ?? "@playwright/test"
);
import { writeFileSync, mkdirSync } from "node:fs";
const output = "docs/qa/browser";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.EXCELORA_CHROME_PATH ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const report = [];
for (const [subject, chapter] of [
  ["Pure Mathematics", "Chapter 1: Algebra and Functions"],
  ["Mechanics", "Chapter 1: Modelling in Mechanics"],
  ["Statistics", "Chapter 1: Data Collection"],
]) {
  let attempt = null,
    session = null;
  const question = (i) => ({
    id: `q-${i}`,
    order: i + 1,
    question_id: `q-${i}`,
    prompt:
      i === 0
        ? "Evaluate each expression. (a) Find $\\frac{1}{2}+\\frac{1}{2}$. (b) Find $\\sqrt{4}$."
        : "Evaluate $2+2$.",
    marks: 2,
    subtopic: "Test subtopic",
    difficulty: i < 4 ? "Foundation" : i < 11 ? "Standard" : "Stretch",
    response: { value: "" },
  });
  await page.route("**/api/generated-assessments**", async (route) => {
    const body = route.request().postDataJSON();
    if (body) {
      if (body.action === "start" || body.action === "retake")
        attempt = {
          id: "qa-attempt",
          status: "active",
          attempt_number: 1,
          total_marks: 30,
          deadline_at: new Date(Date.now() + 5400000).toISOString(),
          questions: Array.from({ length: 15 }, (_, i) => question(i)),
        };
      if (body.answers && attempt)
        attempt.questions = attempt.questions.map((q) => ({
          ...q,
          response: { value: body.answers[q.id] ?? q.response.value },
        }));
      if (body.action === "lock")
        attempt.questions = attempt.questions.map((q) =>
          q.id === body.questionId ? { ...q, state: "locked" } : q,
        );
      if (body.action === "submit")
        attempt = {
          ...attempt,
          status: "submitted",
          score: 28,
          percentage: 93,
          pending_review_marks: 2,
          questions: attempt.questions.map((q) => ({
            ...q,
            answer: "$4$",
            worked_solution: "Add the numbers: $2+2=4$.",
            marksAwarded: 2,
            isCorrect: true,
          })),
        };
    }
    await route.fulfill({ json: { isUnlocked: true, attempt } });
  });
  await page.route("**/api/practice**", async (route) => {
    const body = route.request().postDataJSON();
    if (!body && new URL(route.request().url()).searchParams.has("sessionId")) {
      await route.fulfill({ json: { session } });
      return;
    }
    if (!body) {
      await route.fulfill({
        json: {
          subtopics: [
            {
              title: "Test subtopic",
              counts: {
                balanced: 60,
                Foundation: 20,
                Standard: 20,
                Stretch: 20,
              },
            },
          ],
          history: session
            ? [
                {
                  ...session,
                  created_at: new Date().toISOString(),
                  question_count: session.questions.length,
                  practice_session_questions: session.questions,
                },
              ]
            : [],
        },
      });
      return;
    }
    if (body.action === "start")
      session = {
        id: "qa-practice",
        status: "active",
        subtopic: "Test subtopic",
        questions: Array.from({ length: 5 }, (_, i) => ({
          ...question(i),
          response: "",
          checked_at: null,
        })),
      };
    if (body.action === "next") session.questions.push(...Array.from({length:5},(_,i)=>({...question(session.questions.length+i),response:"",checked_at:null})));
    if (body.action === "stop") session.status="completed";
    if (body.action === "save")
      session.questions = session.questions.map((q) =>
        q.id === body.questionId ? { ...q, response: body.response } : q,
      );
    if (body.action === "check") {
      session.questions = session.questions.map((q) =>
        q.id === body.questionId
          ? {
              ...q,
              response: body.response,
              checked_at: new Date().toISOString(),
              marks_awarded: 2,
              requires_review: false,
              answer: "$4$",
              worked_solution: "Add the numbers: $2+2=4$.",
            }
          : q,
      );

    }
    await route.fulfill({ json: { session } });
  });
  const query = new URLSearchParams({ subject, chapter });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`http://127.0.0.1:3007/qa-fixture?${query}`);
  await page
    .getByRole("button", { name: "Start assessment", exact: true })
    .click();
  for (let i = 0; i < 15; i++) {
    await page.locator('[contenteditable="true"]').first().waitFor();
    const inputs = page.locator('[contenteditable="true"]');
    for (let j = 0; j < (await inputs.count()); j++)
      await inputs.nth(j).fill("4");
    if (i === 0) {
      await page.waitForTimeout(1000);
      await page.reload();
      await page.getByText("Question 1 of 15", { exact: true }).waitFor();
      if (
        (await page
          .locator('[contenteditable="true"]')
          .first()
          .textContent()) !== "4"
      )
        throw new Error("Draft did not restore");
      for (const width of [320, 430, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const dimensions = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          width: innerWidth,
        }));
        if (dimensions.scroll > dimensions.width)
          throw new Error(`Formal overflow ${JSON.stringify(dimensions)}`);
        await page.screenshot({
          path: `${output}/${subject.split(" ")[0]}-assessment-${width}.png`,
          fullPage: true,
        });
      }
    }
    if (i < 14) {
      await page
        .getByRole("button", { name: "Next question", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Confirm answer", exact: true })
        .click();
      await page
        .getByText(`Question ${i + 2} of 15`, { exact: true })
        .waitFor();
    }
  }
  await page
    .getByRole("button", { name: "Submit assessment", exact: true })
    .click();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await page.getByText("Performance by subtopic", { exact: true }).waitFor();
  query.set("mode", "practice");
  await page.goto(`http://127.0.0.1:3007/qa-fixture?${query}`);
  await page
    .getByRole("button", { name: "Start practice", exact: true })
    .click();
  for (let i = 0; i < 5; i++) {
    await page.locator('[contenteditable="true"]').first().waitFor();
    const inputs = page.locator('[contenteditable="true"]');
    for (let j = 0; j < (await inputs.count()); j++)
      await inputs.nth(j).fill("4");
    if (i === 0) {
      await Promise.all([page.waitForResponse(r=>r.url().includes('/api/practice') && r.request().method()==='POST'),page.getByRole('button',{name:'Save draft',exact:true}).click()]);
      await page.reload();
      await page
        .getByRole("button", { name: /Test subtopic.*Resume/ })
        .click();
      await page.locator('[contenteditable="true"]').first().waitFor();
      if (
        (await page
          .locator('[contenteditable="true"]')
          .first()
          .textContent()) !== "4"
      )
        throw new Error("Practice draft did not restore");
      if (await page.getByText("2/2 marks", { exact: true }).count())
        throw new Error("Draft was graded");
    }
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await page.getByText("2/2 marks", { exact: true }).waitFor();
    if (i === 0) {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.screenshot({
        path: `${output}/${subject.split(" ")[0]}-practice-320.png`,
        fullPage: true,
      });
      if (
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )
      )
        throw new Error("Practice overflow");
    }
    if (i < 4)
      await page
        .getByRole("button", { name: "Next question", exact: true })
        .click();
  }
  await page.getByRole("button",{name:"Next question",exact:true}).click();
  await page.getByRole("main").getByText("Question 6",{exact:true}).waitFor();
  await page.locator('[contenteditable="true"]').first().fill("draft before stopping");
  await Promise.all([page.waitForResponse(r=>r.url().includes('/api/practice')&&r.request().method()==='GET'),page.getByRole("button",{name:"Stop practice",exact:true}).click()]);
  await page.getByRole("button",{name:"Back to practice",exact:true}).waitFor();
  if(!session.questions[5].response.includes("draft before stopping"))throw Error("Stop lost the current draft");
  report.push({
    subject,
    formalQuestions: 15,
    practiceQuestions: 10,
    continuousNextBatch: true,
    draftRefresh: true,
    practiceDraftRefresh: true,
    widths: [320, 430, 1280],
    pageOverflow: false,
  });
  await page.unroute("**/api/generated-assessments**");
  await page.unroute("**/api/practice**");
}
await page.goto("http://127.0.0.1:3007/qa-fixture?mode=native");
for (const width of [320, 430, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  await page
    .getByRole("heading", {
      name: "The Structure of Mathematical Proof",
      exact: true,
    })
    .waitFor();
  await page.screenshot({
    path: `output/native-${width}.png`.replace("output", output),
    fullPage: true,
  });
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw new Error("Native page overflow");
}
const unauthenticated = [];
for (const endpoint of [
  "generated-assessments",
  "practice",
  "assessments",
  "arthur",
]) {
  const methods = endpoint === "arthur" ? ["POST"] : ["GET", "POST"];
  for (const method of methods) {
    const response = await page.request.fetch(
      `http://127.0.0.1:3007/api/${endpoint}`,
      {
        method,
        ...(method === "POST"
          ? { data: { action: "start", messages: [] } }
          : {}),
      },
    );
    if (response.status() !== 401)
      throw new Error(
        `Unauthenticated ${method} ${endpoint}: ${response.status()}`,
      );
    unauthenticated.push({ endpoint, method, status: response.status() });
  }
}
await browser.close();
writeFileSync(
  `${output}/results.json`,
  JSON.stringify(
    {
      environment:
        "Local real components with mocked API responses; not authenticated Supabase end-to-end",
      report,
      unauthenticated,
      nativeWidths: [320, 430, 1280],
      errors,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ report, errors }, null, 2));
if (errors.length) process.exitCode = 1;
