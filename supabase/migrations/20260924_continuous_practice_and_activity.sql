begin;
alter table public.practice_sessions add column if not exists continuous boolean not null default false;
alter table public.practice_sessions drop constraint if exists practice_sessions_question_count_check;
alter table public.practice_sessions add constraint practice_sessions_question_count_check check(question_count between 1 and 10000);
alter table public.practice_session_questions drop constraint if exists practice_session_questions_question_order_check;
alter table public.practice_session_questions add constraint practice_session_questions_question_order_check check(question_order between 1 and 10000);
create or replace function public.start_practice_run(p_student uuid,p_topic text,p_subtopic text,p_ids text[])
returns uuid language plpgsql set search_path=public as $$
declare sid uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 if exists(select 1 from student_assessment_attempts where student_id=p_student and status='active') then raise exception 'Finish active formal assessment first'; end if;
 select id into sid from practice_sessions where student_id=p_student and course_topic_key=p_topic and subtopic=p_subtopic and continuous and status='active' order by created_at desc limit 1;
 if sid is not null then return sid; end if;
 -- Explicitly starting a new scope finishes the old run, preserving all answers.
 update practice_sessions set status='completed',completed_at=now() where student_id=p_student and continuous and status='active';
 sid := start_practice(p_student,p_topic,p_subtopic,'balanced',p_ids);
 update practice_sessions set continuous=true where id=sid;
 return sid;
end $$;
create or replace function public.extend_practice_run(p_student uuid,p_session uuid,p_ids text[])
returns void language plpgsql set search_path=public as $$
declare s practice_sessions%rowtype;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 if exists(select 1 from student_assessment_attempts where student_id=p_student and status='active') then raise exception 'Finish active formal assessment first'; end if;
 select * into s from practice_sessions where id=p_session and student_id=p_student and continuous and status='active' for update;
 if not found then raise exception 'Practice is stopped'; end if;
 -- A repeated Next request cannot append two batches.
 if exists(select 1 from practice_session_questions where session_id=p_session and checked_at is null) then return; end if;
 if cardinality(p_ids) not between 1 and 5 or
   (select count(*) from assessment_question_bank q where q.id=any(p_ids) and q.course_topic_key=s.course_topic_key and (s.subtopic='' or q.subtopic=s.subtopic) and not q.exposed_in_notes and not exists(select 1 from practice_session_questions pq where pq.session_id=p_session and pq.question_id=q.id)) <> cardinality(p_ids)
 then raise exception 'Invalid next questions'; end if;
 insert into practice_session_questions(session_id,question_id,question_order)
 select p_session,id,s.question_count+ord from unnest(p_ids) with ordinality as q(id,ord);
 update practice_sessions set question_count=question_count+cardinality(p_ids) where id=p_session;
end $$;
create or replace function public.stop_practice_run(p_student uuid,p_session uuid)
returns void language plpgsql set search_path=public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 update practice_sessions set status='completed',completed_at=coalesce(completed_at,now()) where id=p_session and student_id=p_student;
 if not found then raise exception 'Session not found'; end if;
end $$;
create or replace function public.check_practice(p_student uuid,p_session uuid,p_question text,p_response text,p_marks numeric,p_correct boolean,p_review boolean)
returns void language plpgsql set search_path=public as $$
declare is_continuous boolean; session_status text;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 if exists(select 1 from student_assessment_attempts where student_id=p_student and status='active') then raise exception 'Finish active formal assessment before practising'; end if;
 select continuous,status into is_continuous,session_status from practice_sessions where id=p_session and student_id=p_student for update;
 if not found then raise exception 'Session not found'; end if;
 if session_status <> 'active' then
  if exists(select 1 from practice_session_questions where session_id=p_session and question_id=p_question and checked_at is not null) then return; end if;
  raise exception 'Practice is stopped';
 end if;
 update practice_session_questions set response=p_response,marks_awarded=p_marks,is_correct=p_correct,requires_review=p_review,checked_at=now() where session_id=p_session and question_id=p_question and checked_at is null;
 if not is_continuous and not exists(select 1 from practice_session_questions where session_id=p_session and checked_at is null) then
 update practice_sessions set status='completed',completed_at=coalesce(completed_at,now()) where id=p_session;
 end if;
end $$;
revoke all on function public.start_practice_run(uuid,text,text,text[]),public.extend_practice_run(uuid,uuid,text[]),public.stop_practice_run(uuid,uuid) from public,anon,authenticated;
grant execute on function public.start_practice_run(uuid,text,text,text[]),public.extend_practice_run(uuid,uuid,text[]),public.stop_practice_run(uuid,uuid) to service_role;

-- One current activity row per student; no chat/keystroke surveillance or growing heartbeat log.
create table if not exists public.student_activity (
 student_id uuid primary key references auth.users(id) on delete cascade,
 page_title text not null check(length(page_title)<=250),
 mode text not null check(mode in ('notes','video','practice','assessment','dashboard')),
 last_seen_at timestamptz not null default now()
);
alter table public.student_activity enable row level security;
revoke all on public.student_activity from anon,authenticated;
grant all on public.student_activity to service_role;
notify pgrst,'reload schema';
commit;
