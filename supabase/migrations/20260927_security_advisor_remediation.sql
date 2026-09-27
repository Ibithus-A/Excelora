-- Resolve the database-function warnings reported by Supabase Security Advisor.
--
-- SECURITY DEFINER implementations live in a non-exposed schema. The three
-- progress RPC names remain in public as SECURITY INVOKER wrappers so the web
-- application API is unchanged and direct table write grants are not needed.

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

-- Trigger functions do not need to resolve any application objects by an
-- ambient search path.
alter function public.sanitize_profile_access()
  set search_path = '';

do $migration$
begin
  if to_regprocedure('public.set_updated_at()') is not null then
    execute $ddl$
      alter function public.set_updated_at() set search_path = ''
    $ddl$;
  end if;
end
$migration$;

-- This predicate is used by RLS. Moving it retains all policy dependencies,
-- while removing the SECURITY DEFINER function from the exposed API schema.
alter function public.current_user_is_tutor()
  set schema private;
alter function private.current_user_is_tutor()
  set search_path = '';
revoke all on function private.current_user_is_tutor()
  from public, anon, authenticated;
grant execute on function private.current_user_is_tutor()
  to authenticated;

-- The auth.users trigger follows the function object when its schema changes.
-- It does not need to be executable through the Data API.
alter function public.handle_new_user()
  set schema private;
alter function private.handle_new_user()
  set search_path = '';
revoke all on function private.handle_new_user()
  from public, anon, authenticated;

-- Preserve the controlled progress workflow: move each privileged
-- implementation out of the exposed schema, then recreate its existing public
-- name as an invoker-rights wrapper. The wrappers cannot bypass permissions or
-- RLS themselves; they can only call these narrowly scoped private functions.
alter function public.set_current_topic(text, text, text, text)
  set schema private;
alter function private.set_current_topic(text, text, text, text)
  set search_path = '';
revoke all on function private.set_current_topic(text, text, text, text)
  from public, anon, authenticated;
grant execute on function private.set_current_topic(text, text, text, text)
  to authenticated;

create function public.set_current_topic(
  p_topic_id text,
  p_topic_title text,
  p_chapter_title text,
  p_subject_title text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.set_current_topic(
    p_topic_id,
    p_topic_title,
    p_chapter_title,
    p_subject_title
  );
$$;

alter function public.mark_topic_completed(text, text, text, text)
  set schema private;
alter function private.mark_topic_completed(text, text, text, text)
  set search_path = '';
revoke all on function private.mark_topic_completed(text, text, text, text)
  from public, anon, authenticated;
grant execute on function private.mark_topic_completed(text, text, text, text)
  to authenticated;

create function public.mark_topic_completed(
  p_topic_id text,
  p_topic_title text,
  p_chapter_title text,
  p_subject_title text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.mark_topic_completed(
    p_topic_id,
    p_topic_title,
    p_chapter_title,
    p_subject_title
  );
$$;

alter function public.mark_topic_todo(text, text, text, text)
  set schema private;
alter function private.mark_topic_todo(text, text, text, text)
  set search_path = '';
revoke all on function private.mark_topic_todo(text, text, text, text)
  from public, anon, authenticated;
grant execute on function private.mark_topic_todo(text, text, text, text)
  to authenticated;

create function public.mark_topic_todo(
  p_topic_id text,
  p_topic_title text,
  p_chapter_title text,
  p_subject_title text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.mark_topic_todo(
    p_topic_id,
    p_topic_title,
    p_chapter_title,
    p_subject_title
  );
$$;

revoke all on function public.set_current_topic(text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.mark_topic_completed(text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.mark_topic_todo(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.set_current_topic(text, text, text, text)
  to authenticated;
grant execute on function public.mark_topic_completed(text, text, text, text)
  to authenticated;
grant execute on function public.mark_topic_todo(text, text, text, text)
  to authenticated;

-- These names are leftovers from the earlier progress implementation. Current
-- policies and application code use private.current_user_is_tutor() instead.
drop function if exists public.can_read_student_progress(uuid);
drop function if exists public.is_tutor();

-- PostgreSQL grants function execution to PUBLIC by default. Make future
-- public-schema functions opt-in, so every new RPC must declare its audience.
alter default privileges in schema public
  revoke execute on functions from public, anon, authenticated;

notify pgrst, 'reload schema';

commit;
