# Assessment bank integration

## Repository audit

- Runtime: Next.js 16 App Router, React 19, TypeScript, Node 24 LTS.
- Authentication and persistence: Supabase Auth/Postgres. Privileged assessment queries use the server-only service-role client.
- Course structure: `src/lib/seed.ts`; existing workspace node IDs are preserved locally, so integrations resolve the real node through its exact subject/chapter path.
- Notes and videos: native lesson components and lesson video assets remain unchanged.
- Arthur: remains available for learning and review. Generated active-assessment payloads select public question fields explicitly and never include `answer` or `worked_solution`.
- Brand progress colour: `--excelora-green` (`#22c55e`) in `src/app/globals.css`.

## Course mapping and data QA

All 29 live chapters map one-to-one to bank `course_topic_key` values in `src/lib/question-bank/course-mapping.ts`: 10 Pure, 9 Mechanics and 10 Statistics. There are no unmatched chapters.

Validation of the supplied v1 package found:

- 4,616 questions
- 4,616 unique permanent IDs
- 4,616 unique fingerprints
- 29 mapped bank topics
- no missing required text fields, invalid difficulty values or invalid marks
- no unbalanced inline-maths delimiters and no KaTeX-unrenderable prompt segments
- no topic with fewer than 15 questions

Pure v1 records omit `course_topic_key`; the importer deterministically resolves it from the package's own domain/chapter mapping. Nothing is silently discarded.

## Selection and marking

Every paper is validated as exactly 4 Foundation, 7 Standard and 4 Stretch. Note-exposed questions are excluded. The selector prioritises unseen IDs, less-seen families, subtopic breadth and least-recently-seen fallback. The selected IDs are persisted in `student_assessment_attempt_questions`, so reloads cannot change a paper.

Only numeric answers that can be parsed unambiguously and exact accepted answers are automatically awarded. Symbolic, multi-part and written responses that do not exactly match are retained as requiring review; they are not incorrectly rejected using brittle string comparison. A mathematical-equivalence service can later consume these records without a schema change.

## Deployment

1. Run `supabase/migrations/20260915_generated_assessment_bank.sql` in the Supabase SQL editor after the existing complete schema.
2. Export `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in a secure local shell. Never expose the service key to the browser.
3. Validate: `npm run bank:import -- /path/to/Excelora_All_Maths_Assessment_Banks_v1 --validate-only`.
4. Import: `npm run bank:import -- /path/to/Excelora_All_Maths_Assessment_Banks_v1`.
5. Confirm `assessment_question_bank` contains 4,616 rows.

The migration retains legacy attempts and scores (`is_legacy = true`), removes only the old single-attempt uniqueness restriction, and adds generated-paper tables. Rollback should disable generated assessment routes first; do not drop the new tables until their attempt history has been exported.
