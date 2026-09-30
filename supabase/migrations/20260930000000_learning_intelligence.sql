-- A compact learning-memory layer for activity heatmaps, spaced review,
-- adaptive quizzes and durable weekly/monthly report snapshots.
begin;

create table if not exists public.student_learning_events (
  id bigint generated always as identity primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('practice', 'assessment', 'quiz')),
  source_id uuid not null,
  question_id text not null references public.assessment_question_bank(id) on delete restrict,
  course_topic_key text not null,
  subtopic text not null,
  family text not null,
  marks_awarded numeric(7,2),
  available_marks integer not null check (available_marks > 0),
  is_correct boolean,
  attempted_at timestamptz not null default now(),
  unique (student_id, source_type, source_id, question_id)
);

create index if not exists student_learning_events_heatmap_idx
  on public.student_learning_events (student_id, attempted_at desc);
create index if not exists student_learning_events_topic_idx
  on public.student_learning_events (student_id, course_topic_key, subtopic, attempted_at desc);

create table if not exists public.student_review_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.assessment_question_bank(id) on delete restrict,
  origin_source_type text not null check (origin_source_type in ('practice', 'assessment', 'quiz')),
  origin_source_id uuid not null,
  state text not null default 'learning' check (state in ('learning', 'review', 'mastered')),
  due_at timestamptz not null default now(),
  interval_days integer not null default 0 check (interval_days between 0 and 3650),
  ease_factor numeric(4,2) not null default 2.50 check (ease_factor between 1.30 and 3.50),
  lapse_count integer not null default 1 check (lapse_count >= 0),
  review_count integer not null default 0 check (review_count >= 0),
  last_rating text check (last_rating is null or last_rating in ('again', 'hard', 'good', 'easy')),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, question_id)
);

create index if not exists student_review_cards_due_idx
  on public.student_review_cards (student_id, state, due_at);

create table if not exists public.student_learning_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  period_type text not null check (period_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  questions_attempted integer not null default 0,
  questions_correct integer not null default 0,
  marks_awarded numeric(10,2) not null default 0,
  available_marks integer not null default 0,
  score_percent numeric(5,2),
  active_days integer not null default 0,
  strongest_topics jsonb not null default '[]'::jsonb,
  focus_topics jsonb not null default '[]'::jsonb,
  narrative text not null default '',
  generated_at timestamptz not null default now(),
  unique (student_id, period_type, period_start)
);

create index if not exists student_learning_reports_period_idx
  on public.student_learning_reports (student_id, period_start desc);

alter table public.quiz_assignments alter column tutor_id drop not null;
alter table public.quiz_assignments
  add column if not exists assignment_source text not null default 'tutor'
    check (assignment_source in ('tutor', 'adaptive')),
  add column if not exists recommendation_reason text;

alter table public.student_learning_events enable row level security;
alter table public.student_review_cards enable row level security;
alter table public.student_learning_reports enable row level security;
revoke all on public.student_learning_events, public.student_review_cards, public.student_learning_reports from anon, authenticated;
grant all on public.student_learning_events, public.student_review_cards, public.student_learning_reports to service_role;

drop policy if exists service_only_no_browser_access on public.student_learning_events;
create policy service_only_no_browser_access on public.student_learning_events
  for all to anon, authenticated using (false) with check (false);
drop policy if exists service_only_no_browser_access on public.student_review_cards;
create policy service_only_no_browser_access on public.student_review_cards
  for all to anon, authenticated using (false) with check (false);
drop policy if exists service_only_no_browser_access on public.student_learning_reports;
create policy service_only_no_browser_access on public.student_learning_reports
  for all to anon, authenticated using (false) with check (false);

create or replace function public.capture_review_card_from_learning_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_correct is not null
    and (new.is_correct is false or coalesce(new.marks_awarded, 0) < new.available_marks) then
    if tg_op = 'INSERT' or (tg_op = 'UPDATE' and old.is_correct is null) then
      insert into student_review_cards (
        student_id, question_id, origin_source_type, origin_source_id, due_at
      ) values (
        new.student_id, new.question_id, new.source_type, new.source_id, now()
      )
      on conflict (student_id, question_id) do update set
        origin_source_type = excluded.origin_source_type,
        origin_source_id = excluded.origin_source_id,
        state = 'learning',
        due_at = least(student_review_cards.due_at, now()),
        lapse_count = student_review_cards.lapse_count + 1,
        updated_at = now();
    end if;
  elsif tg_op = 'UPDATE' then
    if new.is_correct is true and old.is_correct is not true then
      delete from student_review_cards
      where student_id = new.student_id
        and question_id = new.question_id
        and review_count = 0;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists capture_review_card_after_learning_event on public.student_learning_events;
create trigger capture_review_card_after_learning_event
after insert or update of is_correct, marks_awarded on public.student_learning_events
for each row execute function public.capture_review_card_from_learning_event();

create or replace function public.capture_practice_learning_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.checked_at is null then return new; end if;
  insert into student_learning_events (
    student_id, source_type, source_id, question_id, course_topic_key,
    subtopic, family, marks_awarded, available_marks, is_correct, attempted_at
  )
  select s.student_id, 'practice', s.id, new.question_id, q.course_topic_key,
    q.subtopic, q.family, new.marks_awarded, q.marks, new.is_correct, new.checked_at
  from practice_sessions s
  join assessment_question_bank q on q.id = new.question_id
  where s.id = new.session_id
  on conflict (student_id, source_type, source_id, question_id) do update set
    marks_awarded = excluded.marks_awarded,
    is_correct = excluded.is_correct,
    attempted_at = excluded.attempted_at;
  return new;
end $$;

drop trigger if exists capture_practice_learning_event on public.practice_session_questions;
create trigger capture_practice_learning_event
after insert or update of checked_at, marks_awarded, is_correct on public.practice_session_questions
for each row when (new.checked_at is not null)
execute function public.capture_practice_learning_event();

create or replace function public.capture_assessment_learning_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into student_learning_events (
    student_id, source_type, source_id, question_id, course_topic_key,
    subtopic, family, marks_awarded, available_marks, is_correct, attempted_at
  ) values (
    new.student_id, 'assessment', new.attempt_id, new.question_id,
    new.course_topic_key, new.subtopic, new.family, new.marks_awarded,
    new.available_marks, new.is_correct, new.attempted_at
  )
  on conflict (student_id, source_type, source_id, question_id) do update set
    marks_awarded = excluded.marks_awarded,
    is_correct = excluded.is_correct,
    attempted_at = excluded.attempted_at;
  return new;
end $$;

drop trigger if exists capture_assessment_learning_event on public.student_question_attempt_history;
create trigger capture_assessment_learning_event
after insert on public.student_question_attempt_history
for each row execute function public.capture_assessment_learning_event();

create or replace function public.refresh_reviewed_assessment_learning_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.marked_at is null then return new; end if;
  update student_learning_events
  set marks_awarded = new.marks_awarded,
      is_correct = new.is_correct,
      attempted_at = coalesce(new.reviewed_at, new.marked_at, attempted_at)
  where source_type = 'assessment'
    and source_id = new.attempt_id
    and question_id = new.question_id;
  return new;
end $$;

drop trigger if exists refresh_reviewed_assessment_learning_event on public.student_assessment_attempt_questions;
create trigger refresh_reviewed_assessment_learning_event
after update of marks_awarded, is_correct, review_status on public.student_assessment_attempt_questions
for each row execute function public.refresh_reviewed_assessment_learning_event();

create or replace function public.capture_quiz_learning_events()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'completed' then return new; end if;
  insert into student_learning_events (
    student_id, source_type, source_id, question_id, course_topic_key,
    subtopic, family, marks_awarded, available_marks, is_correct, attempted_at
  )
  select new.student_id, 'quiz', new.id, q.id, q.course_topic_key,
    q.subtopic, q.family,
    case when result.value ? 'marks' then (result.value ->> 'marks')::numeric else null end,
    q.marks,
    case when result.value ->> 'isCorrect' is null then null else (result.value ->> 'isCorrect')::boolean end,
    coalesce(new.completed_at, now())
  from jsonb_each(new.results) result
  join assessment_question_bank q on q.id = result.key
  on conflict (student_id, source_type, source_id, question_id) do update set
    marks_awarded = excluded.marks_awarded,
    is_correct = excluded.is_correct,
    attempted_at = excluded.attempted_at;
  return new;
end $$;

drop trigger if exists capture_quiz_learning_events on public.quiz_assignments;
create trigger capture_quiz_learning_events
after insert or update of status, results on public.quiz_assignments
for each row when (new.status = 'completed')
execute function public.capture_quiz_learning_events();

create or replace function public.ensure_adaptive_quiz_for_student(p_student uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  focus record;
  selected_ids text[];
  selected_marks integer;
  created_assignment_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('adaptive-quiz:' || p_student::text, 0));

  -- Never create more than one automated homework set in the same week.
  select id into created_assignment_id
  from quiz_assignments
  where student_id = p_student
    and assignment_source = 'adaptive'
    and created_at >= date_trunc('week', now())
  order by created_at desc
  limit 1;
  if found then return created_assignment_id; end if;

  -- Require enough evidence, then choose the lowest-scoring recent subtopic.
  select
    course_topic_key,
    subtopic,
    count(*)::integer as questions,
    round(100 * sum(coalesce(marks_awarded, 0)) / nullif(sum(available_marks), 0))::integer as score_percent
  into focus
  from student_learning_events
  where student_id = p_student
    and attempted_at >= now() - interval '120 days'
    and is_correct is not null
  group by course_topic_key, subtopic
  having count(*) >= 3
    and sum(coalesce(marks_awarded, 0)) / nullif(sum(available_marks), 0) < 0.85
  order by
    sum(coalesce(marks_awarded, 0)) / nullif(sum(available_marks), 0) asc,
    count(*) desc
  limit 1;
  if not found then return null; end if;

  -- Due mistake cards come first; stable question ordering prevents noisy repeats.
  select array_agg(candidate.id order by candidate.priority, candidate.id), sum(candidate.marks)::integer
  into selected_ids, selected_marks
  from (
    select q.id, q.marks,
      case when c.id is not null and c.state <> 'mastered' and c.due_at <= now() then 0 else 1 end as priority
    from assessment_question_bank q
    left join student_review_cards c
      on c.student_id = p_student and c.question_id = q.id
    where q.course_topic_key = focus.course_topic_key
      and q.subtopic = focus.subtopic
      and not q.exposed_in_notes
    order by priority, q.id
    limit 5
  ) candidate;
  if coalesce(cardinality(selected_ids), 0) = 0 then return null; end if;

  insert into quiz_assignments (
    tutor_id, student_id, assessment_key, course_topic_key, title, subtopic,
    question_count, due_at, total_marks, assignment_source, recommendation_reason
  ) values (
    null,
    p_student,
    focus.course_topic_key,
    focus.course_topic_key,
    left('Smart review · ' || focus.subtopic, 120),
    focus.subtopic,
    cardinality(selected_ids),
    now() + interval '7 days',
    coalesce(selected_marks, 0),
    'adaptive',
    format('%s is the clearest focus area at %s%% across %s recent questions.', focus.subtopic, focus.score_percent, focus.questions)
  ) returning id into created_assignment_id;

  insert into quiz_assignment_questions (assignment_id, question_id, question_order)
  select created_assignment_id, question_id, ordinality::integer
  from unnest(selected_ids) with ordinality as selected(question_id, ordinality);

  return created_assignment_id;
end $$;

revoke all on function public.ensure_adaptive_quiz_for_student(uuid) from public, anon, authenticated;
grant execute on function public.ensure_adaptive_quiz_for_student(uuid) to service_role;

create or replace function public.ensure_adaptive_quiz_from_learning_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform ensure_adaptive_quiz_for_student(new.student_id);
  return new;
end $$;

-- Trigger functions execute through their owning triggers. They must not be
-- exposed as callable RPCs to PostgREST client roles.
revoke all on function
  public.capture_assessment_learning_event(),
  public.capture_practice_learning_event(),
  public.capture_quiz_learning_events(),
  public.capture_review_card_from_learning_event(),
  public.ensure_adaptive_quiz_from_learning_event(),
  public.refresh_reviewed_assessment_learning_event()
from public, anon, authenticated;

drop trigger if exists ensure_adaptive_quiz_after_learning_event on public.student_learning_events;
create trigger ensure_adaptive_quiz_after_learning_event
after insert or update of marks_awarded, is_correct on public.student_learning_events
for each row execute function public.ensure_adaptive_quiz_from_learning_event();

-- Backfill all retained marked work. Conflict handling keeps this migration rerunnable.
insert into public.student_learning_events (
  student_id, source_type, source_id, question_id, course_topic_key,
  subtopic, family, marks_awarded, available_marks, is_correct, attempted_at
)
select s.student_id, 'practice', s.id, pq.question_id, q.course_topic_key,
  q.subtopic, q.family, pq.marks_awarded, q.marks, pq.is_correct, pq.checked_at
from public.practice_session_questions pq
join public.practice_sessions s on s.id = pq.session_id
join public.assessment_question_bank q on q.id = pq.question_id
where pq.checked_at is not null
on conflict (student_id, source_type, source_id, question_id) do nothing;

insert into public.student_learning_events (
  student_id, source_type, source_id, question_id, course_topic_key,
  subtopic, family, marks_awarded, available_marks, is_correct, attempted_at
)
select h.student_id, 'assessment', h.attempt_id, h.question_id, h.course_topic_key,
  h.subtopic, h.family, h.marks_awarded, h.available_marks, h.is_correct, h.attempted_at
from public.student_question_attempt_history h
on conflict (student_id, source_type, source_id, question_id) do nothing;

insert into public.student_learning_events (
  student_id, source_type, source_id, question_id, course_topic_key,
  subtopic, family, marks_awarded, available_marks, is_correct, attempted_at
)
select a.student_id, 'quiz', a.id, q.id, q.course_topic_key,
  q.subtopic, q.family,
  case when result.value ? 'marks' then (result.value ->> 'marks')::numeric else null end,
  q.marks,
  case when result.value ->> 'isCorrect' is null then null else (result.value ->> 'isCorrect')::boolean end,
  coalesce(a.completed_at, a.updated_at)
from public.quiz_assignments a
cross join lateral jsonb_each(a.results) result
join public.assessment_question_bank q on q.id = result.key
where a.status = 'completed'
on conflict (student_id, source_type, source_id, question_id) do nothing;

notify pgrst, 'reload schema';
commit;
