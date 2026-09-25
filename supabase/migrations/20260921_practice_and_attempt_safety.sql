-- Additive, service-only practice persistence. Formal attempts remain separate.
begin;
create table public.practice_sessions (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references auth.users(id) on delete cascade,
 course_topic_key text not null,
 subtopic text not null,
 difficulty text not null check (difficulty in ('balanced','Foundation','Standard','Stretch')),
 question_count integer not null check (question_count in (5,10,15,20)),
 status text not null default 'active' check (status in ('active','completed')),
 created_at timestamptz not null default now(), completed_at timestamptz
);
create table public.practice_session_questions (
 session_id uuid not null references public.practice_sessions(id) on delete cascade,
 question_id text not null references public.assessment_question_bank(id) on delete restrict,
 question_order integer not null check (question_order between 1 and 20),
 response text not null default '', marks_awarded numeric, is_correct boolean,
 requires_review boolean, checked_at timestamptz,
 primary key(session_id,question_id), unique(session_id,question_order)
);
create index practice_student_history_idx on public.practice_sessions(student_id,course_topic_key,created_at desc);
alter table public.practice_sessions enable row level security;
alter table public.practice_session_questions enable row level security;
revoke all on public.practice_sessions, public.practice_session_questions from anon, authenticated;
grant all on public.practice_sessions, public.practice_session_questions to service_role;

create function public.start_practice(p_student uuid, p_topic text, p_subtopic text, p_difficulty text, p_ids text[])
returns uuid language plpgsql set search_path = public as $$
declare session_uuid uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 if exists(select 1 from student_assessment_attempts where student_id=p_student and status='active') then raise exception 'Finish active formal assessment before practising'; end if;
 if cardinality(p_ids) not in (5,10,15,20) or
    (select count(*) from assessment_question_bank where id=any(p_ids) and course_topic_key=p_topic and subtopic=p_subtopic and not exposed_in_notes and (p_difficulty='balanced' or difficulty=p_difficulty)) <> cardinality(p_ids)
 then raise exception 'Invalid practice selection'; end if;
 insert into practice_sessions(student_id,course_topic_key,subtopic,difficulty,question_count)
 values(p_student,p_topic,p_subtopic,p_difficulty,cardinality(p_ids)) returning id into session_uuid;
 insert into practice_session_questions(session_id,question_id,question_order)
 select session_uuid, id, ord from unnest(p_ids) with ordinality as q(id,ord);
 return session_uuid;
end $$;
-- Saving a draft never reveals a solution or records a grade.
create function public.save_practice_draft(p_student uuid, p_session uuid, p_question text, p_response text)
returns void language plpgsql set search_path = public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 if exists(select 1 from student_assessment_attempts where student_id=p_student and status='active') then raise exception 'Finish active formal assessment before practising'; end if;
 perform 1 from practice_sessions where id=p_session and student_id=p_student and status='active' for update;
 if not found then raise exception 'Active session not found'; end if;
 if length(p_response)>150000 then raise exception 'Response too long'; end if;
 update practice_session_questions set response=p_response
 where session_id=p_session and question_id=p_question and checked_at is null;
 if not found then raise exception 'Unchecked question not found'; end if;
end $$;
revoke all on function public.save_practice_draft(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.save_practice_draft(uuid,uuid,text,text) to service_role;

create function public.check_practice(p_student uuid, p_session uuid, p_question text, p_response text, p_marks numeric, p_correct boolean, p_review boolean)
returns void language plpgsql set search_path = public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 if exists(select 1 from student_assessment_attempts where student_id=p_student and status='active') then raise exception 'Finish active formal assessment before practising'; end if;
 perform 1 from practice_sessions where id=p_session and student_id=p_student for update;
 if not found then raise exception 'Session not found'; end if;
 update practice_session_questions set response=p_response, marks_awarded=p_marks, is_correct=p_correct, requires_review=p_review, checked_at=now()
 where session_id=p_session and question_id=p_question and checked_at is null;
 if not exists(select 1 from practice_session_questions where session_id=p_session and checked_at is null) then
 update practice_sessions set status='completed',completed_at=coalesce(completed_at,now()) where id=p_session;
 end if;
end $$;

-- Start the attempt, its exact paper and formal exposure in one transaction.
create function public.start_generated_assessment(p_student uuid, p_key text, p_topic text, p_duration integer, p_ids text[])
returns uuid language plpgsql set search_path=public as $$
declare attempt_uuid uuid; next_number integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 select id into attempt_uuid from student_assessment_attempts where student_id=p_student and assessment_key=p_key and status='active';
 if found then return attempt_uuid; end if;
 if cardinality(p_ids)<>15 or
 (select count(*) from assessment_question_bank where id=any(p_ids) and course_topic_key=p_topic and not exposed_in_notes)<>15 or
 (select count(*) from assessment_question_bank where id=any(p_ids) and difficulty='Foundation')<>4 or
 (select count(*) from assessment_question_bank where id=any(p_ids) and difficulty='Standard')<>7 or
 (select count(*) from assessment_question_bank where id=any(p_ids) and difficulty='Stretch')<>4
 then raise exception 'Invalid formal paper'; end if;
 select coalesce(max(attempt_number),0)+1 into next_number from student_assessment_attempts where student_id=p_student and assessment_key=p_key;
 insert into student_assessment_attempts(student_id,assessment_key,bank_course_topic_key,attempt_number,question_count,total_marks,duration_seconds,answers,locked_questions,status,is_legacy,started_at,deadline_at,updated_at)
 values(p_student,p_key,p_topic,next_number,15,(select sum(marks) from assessment_question_bank where id=any(p_ids)),p_duration,'{}','[]','active',false,now(),now()+make_interval(secs=>p_duration),now()) returning id into attempt_uuid;
 insert into student_assessment_attempt_questions(attempt_id,question_id,question_order)
 select attempt_uuid,id,ord from unnest(p_ids) with ordinality q(id,ord);
 insert into student_question_exposure(student_id,question_id,family,course_topic_key,subtopic,last_attempt_id)
 select p_student,id,family,course_topic_key,subtopic,attempt_uuid from assessment_question_bank where id=any(p_ids)
 on conflict(student_id,question_id) do update set times_seen=student_question_exposure.times_seen+1,last_seen_at=now(),last_attempt_id=attempt_uuid;
 return attempt_uuid;
end $$;

-- All generated saves and submissions take the same row lock. Deadline is checked
-- in the transaction; a racing save cannot alter a submitted paper.
create function public.save_generated_answers(p_student uuid,p_attempt uuid,p_answers jsonb)
returns void language plpgsql set search_path=public as $$
declare a student_assessment_attempts;
begin
 select * into a from student_assessment_attempts where id=p_attempt and student_id=p_student for update;
 if not found or a.status<>'active' or a.deadline_at<=now() then raise exception 'Attempt closed'; end if;
 if exists(select 1 from student_assessment_attempt_questions q join jsonb_each_text(p_answers) e on e.key=q.question_id where q.attempt_id=p_attempt and q.submission_state in ('locked','marked') and coalesce(q.student_answer->>'value','')<>e.value) then raise exception 'Confirmed answers cannot be changed'; end if;
 update student_assessment_attempt_questions q set student_answer=jsonb_build_object('value',e.value),submission_state='draft',updated_at=now()
 from jsonb_each_text(p_answers) e where q.attempt_id=p_attempt and q.question_id=e.key and q.submission_state in ('unanswered','draft');
end $$;

create function public.lock_generated_answer(p_student uuid,p_attempt uuid,p_question text,p_response text,p_marks numeric,p_correct boolean)
returns void language plpgsql set search_path=public as $$
declare a student_assessment_attempts;
begin
 select * into a from student_assessment_attempts where id=p_attempt and student_id=p_student for update;
 if not found or a.status<>'active' or a.deadline_at<=now() then raise exception 'Attempt closed'; end if;
 if not exists(select 1 from student_assessment_attempt_questions where attempt_id=p_attempt and question_id=p_question and coalesce(student_answer->>'value','')=p_response) then raise exception 'Answers changed; confirm again'; end if;
 update student_assessment_attempt_questions set submission_state='locked',marks_awarded=p_marks,is_correct=p_correct,marked_at=now(),updated_at=now() where attempt_id=p_attempt and question_id=p_question;
end $$;
revoke all on function public.lock_generated_answer(uuid,uuid,text,text,numeric,boolean) from public,anon,authenticated;
grant execute on function public.lock_generated_answer(uuid,uuid,text,text,numeric,boolean) to service_role;

create function public.submit_generated_assessment(p_student uuid,p_attempt uuid,p_grades jsonb)
returns void language plpgsql set search_path=public as $$
declare a student_assessment_attempts; r record; total numeric:=0; pending numeric:=0;
begin
 select * into a from student_assessment_attempts where id=p_attempt and student_id=p_student for update;
 if not found then raise exception 'Attempt not found'; end if;
 if a.status='submitted' then return; end if;
 if jsonb_array_length(p_grades)<>a.question_count or (select count(distinct g.id) from jsonb_to_recordset(p_grades) as g(id text))<>a.question_count then raise exception 'Incomplete or duplicate marking'; end if;
 -- Optimistic check: marking must use precisely the persisted responses.
 for r in select * from jsonb_to_recordset(p_grades) as g(id text,response text,marks numeric,correct boolean,review boolean) loop
  if not exists(select 1 from student_assessment_attempt_questions where attempt_id=p_attempt and question_id=r.id and coalesce(student_answer->>'value','')=r.response) then raise exception 'Answers changed; retry submission'; end if;
  update student_assessment_attempt_questions set submission_state='marked',marks_awarded=r.marks,is_correct=r.correct,marked_at=now(),updated_at=now() where attempt_id=p_attempt and question_id=r.id;
  total:=total+r.marks;
  if r.review then pending:=pending+(select marks from assessment_question_bank where id=r.id); end if;
  insert into student_question_attempt_history(student_id,attempt_id,question_id,family,course_topic_key,subtopic,marks_awarded,available_marks,is_correct)
  select p_student,p_attempt,id,family,course_topic_key,subtopic,r.marks,marks,r.correct from assessment_question_bank where id=r.id;
  update student_question_exposure set times_attempted=times_attempted+1,total_marks_awarded=total_marks_awarded+r.marks,last_correct=r.correct where student_id=p_student and question_id=r.id;
 end loop;
 update student_assessment_attempts set status='submitted',score=total,percentage=round(100*total/total_marks,2),pending_review_marks=pending,automated_total_marks=total_marks-pending,submitted_at=now(),updated_at=now(),last_marked_at=now(),marking_version='bank-v2-conservative' where id=p_attempt;
end $$;
revoke all on function public.start_practice(uuid,text,text,text,text[]), public.check_practice(uuid,uuid,text,text,numeric,boolean,boolean), public.start_generated_assessment(uuid,text,text,integer,text[]), public.save_generated_answers(uuid,uuid,jsonb), public.submit_generated_assessment(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.start_practice(uuid,text,text,text,text[]), public.check_practice(uuid,uuid,text,text,numeric,boolean,boolean), public.start_generated_assessment(uuid,text,text,integer,text[]), public.save_generated_answers(uuid,uuid,jsonb), public.submit_generated_assessment(uuid,uuid,jsonb) to service_role;
commit;
