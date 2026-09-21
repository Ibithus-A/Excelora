-- Generated assessment bank, immutable papers, retakes and exposure history.
-- Non-destructive: legacy attempt rows and scores are retained.
begin;

create table if not exists public.assessment_question_bank (
  id text primary key,
  qualification text not null,
  domain text not null,
  course_stage text,
  course_topic_key text not null,
  chapter text not null,
  subtopic text not null,
  spec_refs text[] not null default array[]::text[],
  family text not null,
  variant integer not null check (variant > 0),
  difficulty text not null check (difficulty in ('Foundation', 'Standard', 'Stretch')),
  marks integer not null check (marks > 0),
  response_type text not null,
  prompt text not null,
  answer text not null,
  worked_solution text not null,
  tags text[] not null default array[]::text[],
  fingerprint text not null unique,
  exposed_in_notes boolean not null default false,
  generated_original boolean not null default false,
  source_version text not null default 'v1',
  imported_at timestamptz not null default now()
);

create index if not exists assessment_question_bank_selector_idx
  on public.assessment_question_bank (course_topic_key, exposed_in_notes, difficulty, subtopic, family);

alter table public.student_assessment_attempts
  add column if not exists bank_course_topic_key text,
  add column if not exists attempt_number integer,
  add column if not exists percentage numeric(5,2),
  add column if not exists is_legacy boolean not null default true;

update public.student_assessment_attempts
set attempt_number = 1
where attempt_number is null;

alter table public.student_assessment_attempts
  alter column attempt_number set default 1,
  alter column attempt_number set not null;

do $$
declare constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.student_assessment_attempts'::regclass
    and contype = 'u'
    and pg_get_constraintdef(oid) ilike '%(student_id, assessment_key)%'
  limit 1;
  if constraint_name is not null then
    execute format('alter table public.student_assessment_attempts drop constraint %I', constraint_name);
  end if;
end $$;

create unique index if not exists student_assessment_attempt_number_unique
  on public.student_assessment_attempts (student_id, assessment_key, attempt_number);
create unique index if not exists student_assessment_one_active_unique
  on public.student_assessment_attempts (student_id, assessment_key)
  where status = 'active';

create table if not exists public.student_assessment_attempt_questions (
  attempt_id uuid not null references public.student_assessment_attempts(id) on delete cascade,
  question_id text not null references public.assessment_question_bank(id) on delete restrict,
  question_order integer not null check (question_order between 1 and 15),
  student_answer jsonb not null default '{}'::jsonb,
  submission_state text not null default 'unanswered'
    check (submission_state in ('unanswered', 'draft', 'locked', 'marked')),
  marks_awarded numeric(7,2),
  is_correct boolean,
  marked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (attempt_id, question_id),
  unique (attempt_id, question_order)
);

create table if not exists public.student_question_exposure (
  student_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.assessment_question_bank(id) on delete cascade,
  family text not null,
  course_topic_key text not null,
  subtopic text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  times_seen integer not null default 1 check (times_seen > 0),
  times_attempted integer not null default 0 check (times_attempted >= 0),
  last_correct boolean,
  total_marks_awarded numeric(10,2) not null default 0,
  last_attempt_id uuid references public.student_assessment_attempts(id) on delete set null,
  primary key (student_id, question_id)
);

create table if not exists public.student_question_attempt_history (
  id bigint generated always as identity primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null references public.student_assessment_attempts(id) on delete cascade,
  question_id text not null references public.assessment_question_bank(id) on delete restrict,
  family text not null,
  course_topic_key text not null,
  subtopic text not null,
  marks_awarded numeric(7,2),
  available_marks integer not null,
  is_correct boolean,
  attempted_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists student_question_exposure_selector_idx
  on public.student_question_exposure (student_id, course_topic_key, times_seen, last_seen_at);
create index if not exists student_question_history_topic_idx
  on public.student_question_attempt_history (student_id, course_topic_key, attempted_at desc);

alter table public.assessment_question_bank enable row level security;
alter table public.student_assessment_attempt_questions enable row level security;
alter table public.student_question_exposure enable row level security;
alter table public.student_question_attempt_history enable row level security;

revoke all on public.assessment_question_bank from anon, authenticated;
revoke all on public.student_assessment_attempt_questions from anon, authenticated;
revoke all on public.student_question_exposure from anon, authenticated;
revoke all on public.student_question_attempt_history from anon, authenticated;
grant all on public.assessment_question_bank to service_role;
grant all on public.student_assessment_attempt_questions to service_role;
grant all on public.student_question_exposure to service_role;
grant all on public.student_question_attempt_history to service_role;

commit;
