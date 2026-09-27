# Supabase SQL map

The files in `migrations/` are an ordered, append-only history. Run them in
filename order on a new database. On an existing database, apply only migrations
that are not already recorded in `supabase_migrations.schema_migrations`.

Do not merge, rename, reorder, or edit migrations that have already been applied
to a Supabase project. Add a later migration for every change instead. This
keeps local, preview, and production databases reproducible.

## Where to make a change

| Area | Migration | Purpose |
| --- | --- | --- |
| Profile access bootstrap | `20260414_access_control.sql` | Historical first version of tagged chapters, profile sanitization, and new-user bootstrap. |
| Expanded subject access | `20260420_expand_math_topic_access.sql` | Historical expansion from Pure Mathematics to Mechanics and Statistics chapters. |
| Assessment persistence | `20260827_interactive_assessments.sql` | Initial assessment access and attempt tables. |
| Assessment scoring | `20260828_assessment_scoring.sql` | Score, marking, and review fields and constraints. |
| Locked answers | `20260829_locked_assessment_answers.sql` | Additional invariants for confirmed assessment answers. |
| Consolidated core schema | `20260831_complete_excelora_schema.sql` | Canonical profiles, progress, assessment tables, RLS, Auth trigger, and student progress RPCs. This supersedes the earlier profile/progress definitions without deleting their migration history. |
| Generated question bank | `20260915_generated_assessment_bank.sql` | Question bank, immutable paper membership, exposure, and attempt history. |
| Practice persistence | `20260921_practice_and_attempt_safety.sql` | Practice sessions and server-only practice/generated-assessment functions. |
| Arthur limits | `20260924_arthur_usage_limits.sql` | Service-only monthly and per-user daily request reservation. |
| Whole-chapter practice | `20260924_chapter_wide_practice.sql` | Allows a blank subtopic to mean the whole chapter. |
| Continuous practice | `20260924_continuous_practice_and_activity.sql` | Continuous runs, run extension/stopping, and current student activity. |
| Practice preferences | `20260926_practice_preferences.sql` | Preserves the chosen difficulty in continuous practice runs. |
| Synoptic assessment | `20260926_synoptic_assessments.sql` | Immutable 20-question, subject-wide papers. |
| Security Advisor remediation | `20260927_security_advisor_remediation.sql` | Fixed function search paths, private definer functions, safe public RPC wrappers, removal of obsolete helpers, and secure future function defaults. |
| Explicit service-only policies | `20260928000000_service_only_rls_policies.sql` | Documents and enforces that sensitive assessment, practice, activity, question-bank, and Arthur tables are inaccessible to browser roles. |

## How the supplied SQL maps to this history

1. **Profile Access Sanitization And Tutor Bootstrap** became the two historical
   `20260414` and `20260420` migrations. Its final definitions are consolidated
   in `20260831_complete_excelora_schema.sql`.
2. **Student Profile And Progress** is represented by
   `20260831_complete_excelora_schema.sql`.
3. **Adding Question Banks** is
   `20260915_generated_assessment_bank.sql`.
4. **Practise Setup** is
   `20260921_practice_and_attempt_safety.sql`.
5. **Whole Chapter Practise** is
   `20260924_chapter_wide_practice.sql`.
6. **Arthur Usage Limits** is
   `20260924_arthur_usage_limits.sql`.
7. **Continuous practice and activity** (the previously unlabelled additional
   SQL) is `20260924_continuous_practice_and_activity.sql`.
8. **Practise Preferences** is
   `20260926_practice_preferences.sql`.
9. **Synoptic Assessment** is
   `20260926_synoptic_assessments.sql`.
10. **Supabase warning fixes** are isolated in
    `20260927_security_advisor_remediation.sql`.
11. **Service-only RLS documentation** is isolated in
    `20260928000000_service_only_rls_policies.sql`.

## Security conventions

- The `public` schema is API-exposed. Its callable RPCs should normally be
  `SECURITY INVOKER` and granted only to the roles that need them.
- A genuinely privileged `SECURITY DEFINER` function belongs in the unexposed
  `private` schema, uses `set search_path = ''`, schema-qualifies every database
  object, and has explicit execution grants.
- Service-only functions revoke execution from `public`, `anon`, and
  `authenticated`, then grant it to `service_role`.
- Tables exposed to browser roles require RLS plus explicit policies. RLS does
  not protect function execution by itself.
- The Auth setting **Leaked Password Protection** is not a SQL migration. Enable
  it in the Supabase Dashboard under Authentication password security (Pro plan
  or above), then rerun Security Advisor.
