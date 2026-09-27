-- Preserve the student's selected practice difficulty when a continuous run starts
-- and when later batches are appended. Selection remains server-validated.
begin;

create or replace function public.start_practice_run(
  p_student uuid,
  p_topic text,
  p_subtopic text,
  p_difficulty text,
  p_ids text[]
)
returns uuid
language plpgsql
set search_path = public
as $$
declare sid uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_student::text, 0));
  if p_difficulty not in ('balanced', 'Foundation', 'Standard', 'Stretch') then
    raise exception 'Invalid practice difficulty';
  end if;
  if exists(
    select 1 from student_assessment_attempts
    where student_id = p_student and status = 'active'
  ) then
    raise exception 'Finish active formal assessment first';
  end if;
  select id into sid
  from practice_sessions
  where student_id = p_student
    and course_topic_key = p_topic
    and subtopic = p_subtopic
    and difficulty = p_difficulty
    and continuous
    and status = 'active'
  order by created_at desc
  limit 1;
  if sid is not null then return sid; end if;
  update practice_sessions
  set status = 'completed', completed_at = now()
  where student_id = p_student and continuous and status = 'active';
  sid := start_practice(
    p_student,
    p_topic,
    p_subtopic,
    p_difficulty,
    p_ids
  );
  update practice_sessions set continuous = true where id = sid;
  return sid;
end
$$;

create or replace function public.extend_practice_run(
  p_student uuid,
  p_session uuid,
  p_ids text[]
)
returns void
language plpgsql
set search_path = public
as $$
declare s practice_sessions%rowtype;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_student::text, 0));
  if exists(
    select 1 from student_assessment_attempts
    where student_id = p_student and status = 'active'
  ) then
    raise exception 'Finish active formal assessment first';
  end if;
  select * into s
  from practice_sessions
  where id = p_session
    and student_id = p_student
    and continuous
    and status = 'active'
  for update;
  if not found then raise exception 'Practice is stopped'; end if;
  if exists(
    select 1 from practice_session_questions
    where session_id = p_session and checked_at is null
  ) then return; end if;
  if cardinality(p_ids) not between 1 and 5 or (
    select count(*)
    from assessment_question_bank q
    where q.id = any(p_ids)
      and q.course_topic_key = s.course_topic_key
      and (s.subtopic = '' or q.subtopic = s.subtopic)
      and (s.difficulty = 'balanced' or q.difficulty = s.difficulty)
      and not q.exposed_in_notes
      and not exists(
        select 1 from practice_session_questions pq
        where pq.session_id = p_session and pq.question_id = q.id
      )
  ) <> cardinality(p_ids) then
    raise exception 'Invalid next questions';
  end if;
  insert into practice_session_questions(session_id, question_id, question_order)
  select p_session, id, s.question_count + ord
  from unnest(p_ids) with ordinality as q(id, ord);
  update practice_sessions
  set question_count = question_count + cardinality(p_ids)
  where id = p_session;
end
$$;

revoke all on function public.start_practice_run(uuid,text,text,text,text[])
  from public, anon, authenticated;
grant execute on function public.start_practice_run(uuid,text,text,text,text[])
  to service_role;

notify pgrst, 'reload schema';
commit;
