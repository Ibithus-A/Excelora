# Excelora Assessment Standards

This document is the implementation checklist for every interactive assessment. Read it before creating or changing an assessment. Chapter 1 is the reference implementation.

## Access and attempts

- Assessment availability follows the plan entitlement declared in the shared assessment configuration. Never hard-code a Premium requirement in an assessment page, hook, dashboard, or API route.
- Basic includes Chapter 1 and its assessment. Premium includes assessments for all chapters otherwise available to that student.
- A student assessment remains locked until every submodule in its chapter is complete.
- Tutor manual unlock is still required after the completion requirement is met.
- A student receives one timed attempt only. Closing and returning resumes the same attempt; submission or timer expiry permanently ends it.
- Arthur and other AI help must not be available on the student assessment page.
- Tutor preview is unrestricted, untimed, repeatable, and must never create or consume a student attempt.

## Plan entitlements

- Basic is a Chapter 1 product preview: Chapter 1 notes, video walkthroughs, progress tracking, and one timed Chapter 1 assessment attempt.
- Basic students cannot use Arthur AI. Enforce this in both the interface and the Arthur API; hiding the button alone is insufficient.
- Premium provides the full course according to the student's tutor-controlled chapter access, the corresponding assessments under the standard restrictions above, and Arthur outside assessment pages.
- Pricing and upgrade copy must match these entitlements exactly. Do not describe Basic as the full notes library or imply that its Chapter 1 video walkthroughs require Premium.

## Questions and answers

- Build released papers from the reusable question-bank format in `src/lib/question-bank`; do not hard-code question JSX inside an assessment component.
- Assessment items must be Excelora-original and must not repeat a worked example, practice question, or solution visible in a lesson. The question-bank collision test is a release gate.
- Past papers and third-party resources may be used to map specification coverage, command words, difficulty and question archetypes, but their question text and distinctive data must not be copied into the product unless Excelora has explicit redistribution rights.
- Show one question at a time while keeping the question count and total marks visible.
- Every labelled question part or subpart must have its own answer box and storage key. Never combine `(a)(i)`, `(a)(ii)`, `(b)`, and similar parts into one response field.
- Keep question parts and answer boxes in the same order as the source assessment.
- Use consistent labels with a trailing colon: `Answer:`, `Answer (a):`, `Answer (a)(i):`, and so on.
- Answer labels and entered answers use the same font family, responsive size, regular weight, colour, and line-height as the main assessment text.
- Use the neutral website styling for answer boxes. Do not turn the box green after checking or locking it.
- The maths-input sidebar must insert rendered maths into the currently focused answer box, not raw LaTeX.
- Clicking an editable answer opens the maths-input sidebar. Hovering at the right edge opens it; leaving closes it smoothly using Arthur's transition and hover tolerance.
- The maths-input sidebar has no close cross.

## Confirmation and locking

- Drafts autosave without revealing correctness to a student.
- Before leaving an answered question, show a confirmation dialog containing every answer part for that question.
- A student-confirmed answer is permanently locked and immediately marked server-side.
- Server validation must reject attempts to alter any locked part or associated sketch.
- Final submission confirms and locks any remaining draft answers.
- Tutor preview may check an answer, see its marks, edit it, retry it, reset the preview, and start unlimited new previews.

## Marking and solution banks

- Every assessment requires a versioned, server-only solution bank before it can be released.
- Each mark-scheme checkpoint must target its specific question-part storage key so answers cannot satisfy the wrong part.
- Save question-level marks, total score, automated total, pending-review marks, marking version, and marking time.
- Mark confirmed answers immediately, but do not expose running correctness or scores to a student during an active assessment.
- Tutor-preview marking may return marks to tutors but must never expose the solution bank itself.
- Student results are shown only after submission.
- Sketches are excluded from deterministic marking until AI sketch review is implemented. Their marks must be shown as pending review rather than guessed or silently awarded.

## Result colours

Tutor preview uses one consistent result system in both the result badge and question navigation:

- Red: zero automated marks.
- Amber: some but not all automated marks.
- Green: full automated marks.

Student navigation must not use correctness colours during an active assessment; it may only communicate draft and locked state.

## Visual consistency

- Follow the existing Excelora/Notion visual language and spacing.
- Do not introduce one-off font families, weights, label sizes, button spacing, or coloured input backgrounds.
- Confirmation previews must use the same answer labels and neutral answer-box styling as the main question.
- Use the Chapter 1 assessment as the visual and behavioural reference before approving another chapter.

## Required verification

Before handing off any assessment change, run:

```bash
npm run lint
npx tsc --noEmit
git diff --check
npm run build
```

Also test at least one correct, incorrect, and partially correct multipart answer in tutor preview, plus the student lock and one-attempt paths.
