-- Tutor-assigned homework quizzes with immutable question membership.
begin;

create table if not exists public.quiz_assignments (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  assessment_key text not null,
  course_topic_key text not null,
  title text not null check (char_length(title) between 1 and 120),
  subtopic text not null default '',
  question_count integer not null check (question_count between 1 and 30),
  due_at timestamptz not null,
  status text not null default 'assigned' check (status in ('assigned', 'completed')),
  answers jsonb not null default '{}'::jsonb,
  results jsonb not null default '{}'::jsonb,
  score numeric(7,2),
  total_marks integer not null default 0 check (total_marks >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_assignment_questions (
  assignment_id uuid not null references public.quiz_assignments(id) on delete cascade,
  question_id text not null references public.assessment_question_bank(id) on delete restrict,
  question_order integer not null check (question_order between 1 and 30),
  primary key (assignment_id, question_id),
  unique (assignment_id, question_order)
);

create index if not exists quiz_assignments_student_due_idx
  on public.quiz_assignments (student_id, due_at desc);
create index if not exists quiz_assignments_tutor_created_idx
  on public.quiz_assignments (tutor_id, created_at desc);

alter table public.quiz_assignments enable row level security;
alter table public.quiz_assignment_questions enable row level security;
revoke all on public.quiz_assignments, public.quiz_assignment_questions from anon, authenticated;
grant all on public.quiz_assignments, public.quiz_assignment_questions to service_role;

drop policy if exists service_only_no_browser_access on public.quiz_assignments;
create policy service_only_no_browser_access on public.quiz_assignments
  for all to anon, authenticated using (false) with check (false);
drop policy if exists service_only_no_browser_access on public.quiz_assignment_questions;
create policy service_only_no_browser_access on public.quiz_assignment_questions
  for all to anon, authenticated using (false) with check (false);

commit;
