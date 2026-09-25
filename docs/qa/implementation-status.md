# Implementation status — 25 September 2026

Working-tree changes; not deployed. The owner applied the three earlier practice/Arthur migrations. Live checks confirm those tables exist. The additional `20260924_continuous_practice_and_activity.sql` migration is now installed and verified against the live project.

## Implemented

- Native-only course navigation: 114 lessons (12 original Chapter 1 pages, 102 structured conversions). Canonical lesson IDs and progress are retained when retiring duplicate PDF/review entries. All 170 public PDFs are preserved privately under `archives/course-pdfs`, outside public delivery.
- Chapter 1 presentation shared across structured pages: introductory text, grey formula panels, distinct worked-example/practice/solution cards and numbered solution steps. All 114 pages pass checks at 320, 430 and 1280 pixels, including fraction clipping and visible maths scrollbars.
- Practice and generated assessments share the question renderer, header and right-hand calculator drawer. Practice has Start, Next and Stop; no question-count picker or AI interface. It selects existing bank questions without paid generation. Every lesson maps to an available practice subtopic.
- Continuous student sessions append questions in batches, retain checked work, autosave drafts after 900ms, save before Stop, and resume/review saved sessions. Database functions enforce ownership, formal-assessment exclusion, answer secrecy and checked-answer immutability. Explicit Save draft remains available. Leaving through in-app navigation before debounce can still discard the newest unsaved edit.
- Lesson progress maps by subject/chapter/title across devices, rather than fragile local tree IDs. Notes can be completed independently of watching a video. Actual video completion is recorded separately.
- Tutor dashboard displays last-seen page/mode, recent practice, assessment results and saved responses. Activity stores one row per student, refreshed every 45 seconds in a visible student tab; tutor dashboard refreshes every 30 seconds. This records recent app activity, not continuous surveillance or proof of attention. Saved-response detail is a snapshot. Stale student/chapter requests cannot overwrite newer results.
- Tutor assessment unlock controls cover all 29 chapters. No fabricated student statistics remain in the dashboard.
- Arthur has database-backed global monthly/per-user daily limits and defaults to disabled. No AI is available during student practice or formal assessment. DeepSeek is not connected yet.
- Auth callback return paths now remain on the application origin, including password-recovery redirects.
- Next.js and matching ESLint configuration updated to 16.3.6; compatible dependency fixes leave zero reported npm vulnerabilities.

## Release limitations

1. Authenticated production-build API tests now pass against live Supabase: continuous start/resume/check/extend/save/stop/refresh, tutor activity/response review, notes completion, chapter unlock and formal submission. Account isolation and formal-attempt practice blocking also pass. Three temporary users were removed after this run. Vercel deployment and production-domain email flows remain to be verified.
2. The source fidelity of all 102 converted drafts has not received exhaustive owner approval. Automated rendering checks do not establish mathematical correctness. Existing source errors are documented in `source-quality-issues.md`.
3. Conservative marking preserves ambiguous symbolic/multi-answer work as requiring review. Tutor response viewing exists; manual mark adjustment/adjudication is not implemented. Provisional results must not be treated as final grades.
4. Hosting plan, actual Supabase billing settings, total database size and future video volumes remain unknown. See `cost-and-capacity.md`; application limits cannot guarantee an account-wide bill.
5. No deployment, paid AI call or exhaustive real video playback test was performed.

See `validation-results.md` for the distinction between mocked browser, disposable database and authenticated live checks.
