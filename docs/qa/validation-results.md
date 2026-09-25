# Validation — 25 September 2026

- Native browser audit after dependency updates: 114 lessons × 3 widths = 342 passes; no recorded page errors, overflow, KaTeX errors, visible maths scrollbars, clipped fraction glyphs or diagram label collisions. Report: `browser/native/results.json`.
- Practice/formal browser workflows: Pure, Mechanics and Statistics; mocked APIs. Covers exact 15-question formal papers, response persistence, checking, continuous append, saving before Stop and refresh. Report: `browser/results.json`.
- Calculator insertion, mobile overflow, absence of practice AI and tutor chapter switching: 320/1280 widths. Report: `browser/native-only/ui-results.json`.
- Disposable PostgreSQL tests apply real migrations and import all 4,616 bank records. Cover continuous start/resume/check/append/stop, ownership, premature append rejection, formal timing/locking/submission and service-only permissions. Report: `database-test-results.json`.
- Full practice coverage audit: all 114 lessons resolve to bank subtopics. Report: `practice-coverage.json`.
- Authenticated live API checks against the production build and live Supabase pass: notes completion without claiming video watched, student isolation/RLS, tutor preview, continuous start/resume/check/extend/save/stop/refresh, tutor activity and responses, chapter unlock, exact-15 formal paper, practice exclusion during a formal attempt, and formal submission. Report: `live-course-tests.json`. These API checks do not verify the Vercel deployment or real email delivery.
- Nine temporary auth identities across three live test runs were created and deleted; no emails, paid AI requests or existing-student mutations. These identities may count toward monthly active usage.
- Auth callback tests verify that external/protocol-relative/backslash return paths cannot receive recovery parameters. Local production smoke checks pass and `/qa-fixture` returns 404. Report: `auth-callback-tests.json`.
- npm audit after compatible fixes reports zero vulnerabilities. Next.js/eslint-config-next 16.3.6. Report: `dependency-audit.json`.
- All 157 unit tests pass. Production build and its TypeScript stage pass on Next.js 16.3.6. The build retains an existing dynamic-import warning from the optional `unpdf` Arthur fallback. No QA route appears in the production route list. Results: `unit-test-results.txt` and `production-build.txt`.

Automated checks are not exhaustive visual/source sign-off, verification of billing settings, or evidence of deployment. See `implementation-status.md` for material remaining limitations.
