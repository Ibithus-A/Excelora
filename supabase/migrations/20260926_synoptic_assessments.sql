-- Subject-wide 20-question synoptic papers. Papers remain immutable once started.
begin;

alter table public.student_assessment_attempt_questions
  drop constraint if exists student_assessment_attempt_questions_question_order_check;
alter table public.student_assessment_attempt_questions
  add constraint student_assessment_attempt_questions_question_order_check
  check (question_order between 1 and 20);

create or replace function public.start_synoptic_assessment(
  p_student uuid,
  p_key text,
  p_subject text,
  p_duration integer,
  p_topics text[],
  p_ids text[]
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  attempt_uuid uuid;
  next_number integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_student::text, 0));

  select id into attempt_uuid
  from student_assessment_attempts
  where student_id = p_student
    and assessment_key = p_key
    and status = 'active';
  if found then return attempt_uuid; end if;

  if p_duration <> 5400
    or p_key !~ '^synoptic:[a-z0-9-]+$'
    or cardinality(p_ids) <> 20
    or (select count(distinct id) from unnest(p_ids) as selected(id)) <> 20
    or cardinality(p_topics) not between 2 and 20
    or (select count(distinct topic) from unnest(p_topics) as supplied(topic)) <> cardinality(p_topics)
    or exists (
      select 1 from unnest(p_topics) as supplied(topic)
      where supplied.topic !~ case p_subject
        when 'Pure Mathematics' then '^pure_'
        when 'Mechanics' then '^mechanics_'
        when 'Statistics' then '^statistics_'
        else '^$'
      end
    )
    or (
      select count(*)
      from assessment_question_bank
      where id = any(p_ids)
        and course_topic_key = any(p_topics)
        and not exposed_in_notes
    ) <> 20
    or (
      select count(distinct course_topic_key)
      from assessment_question_bank
      where id = any(p_ids)
    ) <> cardinality(p_topics)
    or (select count(*) from assessment_question_bank where id = any(p_ids) and difficulty = 'Foundation') <> 5
    or (select count(*) from assessment_question_bank where id = any(p_ids) and difficulty = 'Standard') <> 10
    or (select count(*) from assessment_question_bank where id = any(p_ids) and difficulty = 'Stretch') <> 5
  then
    raise exception 'Invalid synoptic paper';
  end if;

  select coalesce(max(attempt_number), 0) + 1 into next_number
  from student_assessment_attempts
  where student_id = p_student and assessment_key = p_key;

  insert into student_assessment_attempts(
    student_id, assessment_key, bank_course_topic_key, attempt_number,
    question_count, total_marks, duration_seconds, answers, locked_questions,
    status, is_legacy, started_at, deadline_at, updated_at
  ) values (
    p_student, p_key, p_key, next_number,
    20, (select sum(marks) from assessment_question_bank where id = any(p_ids)),
    p_duration, '{}'::jsonb, '[]'::jsonb, 'active', false,
    now(), now() + make_interval(secs => p_duration), now()
  ) returning id into attempt_uuid;

  insert into student_assessment_attempt_questions(attempt_id, question_id, question_order)
  select attempt_uuid, id, ord
  from unnest(p_ids) with ordinality as selected(id, ord);

  insert into student_question_exposure(
    student_id, question_id, family, course_topic_key, subtopic, last_attempt_id
  )
  select p_student, id, family, course_topic_key, subtopic, attempt_uuid
  from assessment_question_bank
  where id = any(p_ids)
  on conflict(student_id, question_id) do update set
    times_seen = student_question_exposure.times_seen + 1,
    last_seen_at = now(),
    last_attempt_id = attempt_uuid;

  return attempt_uuid;
end;
$$;

revoke all on function public.start_synoptic_assessment(uuid,text,text,integer,text[],text[])
  from public, anon, authenticated;
grant execute on function public.start_synoptic_assessment(uuid,text,text,integer,text[],text[])
  to service_role;

commit;
