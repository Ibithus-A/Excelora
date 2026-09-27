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

test("synoptic assessment creation is server-only and validates the complete paper", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/20260926_synoptic_assessments.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /cardinality\(p_ids\) <> 20/);
  assert.match(migration, /count\(distinct course_topic_key\)/);
  assert.match(migration, /difficulty = 'Foundation'\) <> 5/);
  assert.match(migration, /difficulty = 'Standard'\) <> 10/);
  assert.match(migration, /difficulty = 'Stretch'\) <> 5/);
  assert.match(migration, /revoke all on function public\.start_synoptic_assessment[\s\S]*from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.start_synoptic_assessment[\s\S]*to service_role/);
});
