-- A blank subtopic explicitly selects the whole chapter; existing sessions remain intact.
begin;
create or replace function public.start_practice(p_student uuid, p_topic text, p_subtopic text, p_difficulty text, p_ids text[])
returns uuid language plpgsql set search_path = public as $$
declare session_uuid uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
 if exists(select 1 from student_assessment_attempts where student_id=p_student and status='active') then raise exception 'Finish active formal assessment before practising'; end if;
 if p_subtopic is null or cardinality(p_ids) not in (5,10,15,20) or
    (select count(*) from assessment_question_bank where id=any(p_ids) and course_topic_key=p_topic and (p_subtopic='' or subtopic=p_subtopic) and not exposed_in_notes and (p_difficulty='balanced' or difficulty=p_difficulty)) <> cardinality(p_ids)
 then raise exception 'Invalid practice selection'; end if;
 insert into practice_sessions(student_id,course_topic_key,subtopic,difficulty,question_count)
 values(p_student,p_topic,p_subtopic,p_difficulty,cardinality(p_ids)) returning id into session_uuid;
 insert into practice_session_questions(session_id,question_id,question_order)
 select session_uuid, id, ord from unnest(p_ids) with ordinality as q(id,ord);
 return session_uuid;
end $$;
revoke all on function public.start_practice(uuid,text,text,text,text[]) from public,anon,authenticated;
grant execute on function public.start_practice(uuid,text,text,text,text[]) to service_role;
notify pgrst, 'reload schema';
commit;
