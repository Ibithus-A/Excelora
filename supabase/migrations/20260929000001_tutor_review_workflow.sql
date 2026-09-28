-- Make conservative auto-marking reviewable and auditable by a tutor.
begin;

alter table public.practice_session_questions
  add column if not exists review_status text not null default 'not_required'
    check (review_status in ('not_required', 'pending', 'completed')),
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

update public.practice_session_questions
set review_status = case when requires_review then 'pending' else 'not_required' end
where review_status = 'not_required' and requires_review is not null;

alter table public.student_assessment_attempt_questions
  add column if not exists review_status text not null default 'not_required'
    check (review_status in ('not_required', 'pending', 'completed')),
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

update public.student_assessment_attempt_questions
set review_status = case when is_correct is null and marked_at is not null then 'pending' else 'not_required' end
where review_status = 'not_required';

create index if not exists practice_pending_review_idx
  on public.practice_session_questions (review_status, checked_at desc)
  where review_status = 'pending';
create index if not exists assessment_pending_review_idx
  on public.student_assessment_attempt_questions (review_status, marked_at desc)
  where review_status = 'pending';

create or replace function public.sync_tutor_review_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.review_status = 'completed' then return new; end if;
  if tg_table_name = 'practice_session_questions' then
    new.review_status := case when coalesce(new.requires_review, false) then 'pending' else 'not_required' end;
  else
    new.review_status := case when new.marked_at is not null and new.is_correct is null then 'pending' else 'not_required' end;
  end if;
  return new;
end $$;

drop trigger if exists sync_practice_tutor_review_status on public.practice_session_questions;
create trigger sync_practice_tutor_review_status
before insert or update of requires_review on public.practice_session_questions
for each row execute function public.sync_tutor_review_status();

drop trigger if exists sync_assessment_tutor_review_status on public.student_assessment_attempt_questions;
create trigger sync_assessment_tutor_review_status
before insert or update of is_correct, marked_at on public.student_assessment_attempt_questions
for each row execute function public.sync_tutor_review_status();

commit;
