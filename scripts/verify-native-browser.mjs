import { NOTION_LESSON_DEFINITIONS } from "../src/content/notion-lessons/definitions.ts";
import { writeFileSync, mkdirSync } from "node:fs";
import { NATIVE_DUPLICATES } from "../src/content/notion-lessons/native-duplicates.ts";
const { chromium } = await import(
  process.env.EXCELORA_PLAYWRIGHT_MODULE ?? "@playwright/test"
);
const output = "docs/qa/browser/native";
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
const results = [];
const lessons = [
  ...NATIVE_DUPLICATES,
  ...Object.values(NOTION_LESSON_DEFINITIONS),
];
try {
  for (const lesson of lessons.filter(
    (lesson) =>
      !process.env.EXCELORA_LESSON_FILTER ||
      lesson.id.includes(process.env.EXCELORA_LESSON_FILTER),
  )) {
    console.error("Checking", lesson.id);
    await page.goto(
      `http://127.0.0.1:3007/qa-fixture?mode=native&lesson=${encodeURIComponent(lesson.id)}`,
    );
    await page
      .getByRole("heading", { name: lesson.title, exact: true, level: 1 })
      .waitFor();
    await page.waitForFunction(() => {
      const math = document.querySelector(".lesson-math-inline");
      return !math || getComputedStyle(math).scrollbarWidth === "none";
    });
    for (const width of [320, 430, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => {
        const labels = [
          ...document.querySelectorAll("svg foreignObject .katex,svg text"),
        ].map((el) => {
          const b = el.getBoundingClientRect();
          return {
            text: el.textContent,
            box: { left: b.left, top: b.top, right: b.right, bottom: b.bottom },
            svg: el.closest("svg"),
          };
        });
        const labelLabelCollisions = [];
        for (let a = 0; a < labels.length; a++)
          for (let b = a + 1; b < labels.length; b++) {
            const first = labels[a],
              second = labels[b];
            if (first.svg !== second.svg) continue;
            if (
              first.box.left < second.box.right &&
              first.box.right > second.box.left &&
              first.box.top < second.box.bottom &&
              first.box.bottom > second.box.top
            )
              labelLabelCollisions.push([first.text, second.text]);
          }
        const collisions = [];
        for (const { box, text, svg } of labels)
          for (const line of svg.querySelectorAll("line")) {
            const matrix = line.getScreenCTM();
            if (!matrix) continue;
            const a = new DOMPoint(
              Number(line.getAttribute("x1")),
              Number(line.getAttribute("y1")),
            ).matrixTransform(matrix);
            const b = new DOMPoint(
              Number(line.getAttribute("x2")),
              Number(line.getAttribute("y2")),
            ).matrixTransform(matrix);
            for (let t = 0; t <= 1; t += 0.01) {
              const x = a.x + (b.x - a.x) * t,
                y = a.y + (b.y - a.y) * t;
              if (
                x > box.left - 2 &&
                x < box.right + 2 &&
                y > box.top - 2 &&
                y < box.bottom + 2
              ) {
                collisions.push(text);
                break;
              }
            }
          }
        const curveCollisions = [];
        for (const { box, text, svg } of labels)
          for (const path of svg.querySelectorAll(
            'path[fill="none"],circle[fill="none"]',
          )) {
            const matrix = path.getScreenCTM();
            if (!matrix) continue;
            const length = path.getTotalLength();
            for (let d = 0; d <= length; d += Math.max(length / 800, 0.2)) {
              const point = path.getPointAtLength(d).matrixTransform(matrix);
              if (
                point.x > box.left - 1 &&
                point.x < box.right + 1 &&
                point.y > box.top - 1 &&
                point.y < box.bottom + 1
              ) {
                curveCollisions.push(text);
                break;
              }
            }
          }
        return {
          clippedFractionGlyphs: [
            ...document.querySelectorAll(".lesson-math-inline .mfrac .mord"),
          ].filter((el) => {
            if (
              ![...el.childNodes].some(
                (n) => n.nodeType === 3 && n.textContent.trim(),
              )
            )
              return false;
            const glyph = el.getBoundingClientRect(),
              wrapper = el
                .closest(".lesson-math-inline")
                .getBoundingClientRect();
            return (
              glyph.top < wrapper.top - 1 || glyph.bottom > wrapper.bottom + 1
            );
          }).length,
          fractionScrollbars: [
            ...document.querySelectorAll(
              ".lesson-math-inline,.lesson-math-display",
            ),
          ].filter((el) => {
            const style = getComputedStyle(el);
            return (
              style.scrollbarWidth !== "none" &&
              (["auto", "scroll"].includes(style.overflowY) ||
                ["auto", "scroll"].includes(style.overflowX))
            );
          }).length,
          lessonCards: document.querySelectorAll("[data-lesson-card]").length,
          overflow: document.documentElement.scrollWidth > innerWidth,
          katexErrors: document.querySelectorAll(".katex-error").length,
          diagrams: document.querySelectorAll('svg[role="img"]').length,
          labelLineCollisions: collisions,
          labelLabelCollisions,
          labelCurveCollisions: curveCollisions,
        };
      });
      results.push({ id: lesson.id, width, ...result });
      if (width === 320 || width === 1280)
        await page.screenshot({
          path: `${output}/${lesson.id}-${width}.png`,
          fullPage: true,
        });
    }
  }
} finally {
  await browser.close();
}
writeFileSync(
  `${output}/results.json`,
  JSON.stringify(
    {
      environment:
        "Local real native renderer; source-comparison approval remains separate",
      results,
      errors,
    },
    null,
    2,
  ) + "\n",
);
const failed = results.filter(
  (r) =>
    r.fractionScrollbars ||
    r.clippedFractionGlyphs ||
    r.overflow ||
    r.katexErrors ||
    r.labelLabelCollisions.length ||
    r.labelLineCollisions.length ||
    r.labelCurveCollisions.length,
);
console.log(
  JSON.stringify(
    {
      pages: lessons.length,
      viewports: results.length,
      failed,
      errors,
    },
    null,
    2,
  ),
);
if (failed.length || errors.length) process.exitCode = 1;
