import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("active assessment query selects public fields without secrets", () => {
  const source = readFileSync(new URL("../src/app/api/generated-assessments/route.ts", import.meta.url), "utf8");
  const publicFields = /const PUBLIC_FIELDS = ([^;]+);/.exec(source)?.[1] ?? "";
  assert.ok(!publicFields.includes("answer"));
  assert.ok(!publicFields.includes("worked_solution"));
  assert.match(source, /if \(!reveal\).*delete safe\.answer/);
});

test("assessment progress uses the shared Excelora green token", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const component = readFileSync(new URL("../src/components/chapter-one-interactive-assessment.tsx", import.meta.url), "utf8");
  assert.match(css, /--excelora-green:\s*#22c55e/);
  assert.match(component, /data-assessment-progress-fill/);
  assert.match(component, /bg-\[var\(--excelora-green\)\]/);
});
