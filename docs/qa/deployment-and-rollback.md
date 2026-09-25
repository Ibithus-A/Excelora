# Deployment and rollback — 25 September 2026

This working tree is not deployed. See `implementation-status.md` for remaining limitations.

## Database

The owner reports applying `20260921_practice_and_attempt_safety.sql`, `20260924_chapter_wide_practice.sql`, and `20260924_arthur_usage_limits.sql`. Live schema checks confirm their tables exist. Do not reimport the existing 4,616-question bank.

The owner applied `supabase/migrations/20260924_continuous_practice_and_activity.sql`. Live schema checks and authenticated workflows now pass. No further SQL is required for these features. Preserve existing data and reconcile SQL Editor migration history before any future CLI migration push.

`scripts/verify-live-course.mjs` passed against the local production build and live Supabase, including continuous practice, tutor activity, chapter unlock, formal submission, and account isolation. Three temporary users were deleted afterwards; no emails, paid AI calls or existing-student mutations. Nine temporary users have been used across all three live runs and may count toward monthly active usage.

## Application

Run lint, unit tests, type checking and the production build. Browser fixtures must not be copied into production routes. Do not create an additional paid staging project as part of verification. Confirm hosting plan, Supabase spend cap, compute and current usage using `cost-and-capacity.md` before making cost assurances.

Keep Arthur disabled until a budget is explicitly chosen. DeepSeek is not connected yet. Preserve usage guards through deployment and rollback.

The migration and live API checks have passed. Follow `launch-setup.md` for the remaining Vercel and Supabase account configuration before launch. Check native-only navigation, scoped/topic practice, calculator, saved work and tutor access using actual accounts. Archived PDFs must remain outside public delivery.

## Rollback

Record the previous deployment before release. Revert application behavior if necessary without removing student work or exposure history. Keep Arthur's usage guard, or disable Arthur while reverting. Prefer a forward fix to database functions; do not drop new tables or restore an old database over newer student submissions without a specific recovery plan. The private PDF archive is source material and need not be publicly restored.
