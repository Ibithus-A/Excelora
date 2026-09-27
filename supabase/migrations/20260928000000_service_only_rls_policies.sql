-- Document the intentional default-deny posture of server-only tables.
--
-- Application access to these tables goes through the isolated admin client.
-- anon and authenticated have neither table privileges nor an allowing RLS
-- policy. service_role retains server-only access and bypasses RLS by design.

begin;

alter table public.arthur_daily_usage enable row level security;
alter table public.arthur_monthly_usage enable row level security;
alter table public.arthur_usage_settings enable row level security;
alter table public.assessment_question_bank enable row level security;
alter table public.practice_session_questions enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.student_activity enable row level security;
alter table public.student_assessment_access enable row level security;
alter table public.student_assessment_attempt_questions enable row level security;
alter table public.student_assessment_attempts enable row level security;
alter table public.student_question_attempt_history enable row level security;
alter table public.student_question_exposure enable row level security;

revoke all on table
  public.arthur_daily_usage,
  public.arthur_monthly_usage,
  public.arthur_usage_settings,
  public.assessment_question_bank,
  public.practice_session_questions,
  public.practice_sessions,
  public.student_activity,
  public.student_assessment_access,
  public.student_assessment_attempt_questions,
  public.student_assessment_attempts,
  public.student_question_attempt_history,
  public.student_question_exposure
from anon, authenticated;

grant all on table
  public.arthur_daily_usage,
  public.arthur_monthly_usage,
  public.arthur_usage_settings,
  public.assessment_question_bank,
  public.practice_session_questions,
  public.practice_sessions,
  public.student_activity,
  public.student_assessment_access,
  public.student_assessment_attempt_questions,
  public.student_assessment_attempts,
  public.student_question_attempt_history,
  public.student_question_exposure
to service_role;

drop policy if exists service_only_no_browser_access
  on public.arthur_daily_usage;
create policy service_only_no_browser_access
  on public.arthur_daily_usage
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.arthur_monthly_usage;
create policy service_only_no_browser_access
  on public.arthur_monthly_usage
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.arthur_usage_settings;
create policy service_only_no_browser_access
  on public.arthur_usage_settings
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.assessment_question_bank;
create policy service_only_no_browser_access
  on public.assessment_question_bank
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.practice_session_questions;
create policy service_only_no_browser_access
  on public.practice_session_questions
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.practice_sessions;
create policy service_only_no_browser_access
  on public.practice_sessions
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.student_activity;
create policy service_only_no_browser_access
  on public.student_activity
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.student_assessment_access;
create policy service_only_no_browser_access
  on public.student_assessment_access
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.student_assessment_attempt_questions;
create policy service_only_no_browser_access
  on public.student_assessment_attempt_questions
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.student_assessment_attempts;
create policy service_only_no_browser_access
  on public.student_assessment_attempts
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.student_question_attempt_history;
create policy service_only_no_browser_access
  on public.student_question_attempt_history
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access
  on public.student_question_exposure;
create policy service_only_no_browser_access
  on public.student_question_exposure
  for all to anon, authenticated
  using (false) with check (false);

notify pgrst, 'reload schema';

commit;

