-- Read-only: paste into Supabase SQL Editor. No student content is returned.
select pg_size_pretty(pg_database_size(current_database())) as database_size,
       pg_database_size(current_database()) as database_bytes;
select schemaname, relname as table_name,
       pg_size_pretty(pg_total_relation_size(relid)) as size_including_indexes,
       n_live_tup as estimated_rows
from pg_stat_user_tables order by pg_total_relation_size(relid) desc;
select count(*) as stored_files,
       coalesce(sum(case when metadata->>'size' ~ '^[0-9]+$'
         then (metadata->>'size')::numeric else 0 end),0) as stored_file_bytes
from storage.objects;

-- Learning-history growth and the current tutor review queue. These totals
-- contain no student responses and are safe to use for weekly operations.
select
  count(distinct ps.id) as practice_sessions,
  count(psq.question_id) as stored_practice_answers,
  count(*) filter (where psq.review_status = 'pending') as pending_tutor_reviews,
  pg_size_pretty(pg_total_relation_size('public.practice_sessions')) as session_storage,
  pg_size_pretty(pg_total_relation_size('public.practice_session_questions')) as answer_storage
from public.practice_sessions ps
left join public.practice_session_questions psq on psq.session_id = ps.id;

select
  date_trunc('week', ps.created_at) as week,
  count(distinct ps.id) as sessions,
  count(psq.question_id) as answers_saved,
  pg_size_pretty(sum(pg_column_size(psq))::bigint) as approximate_answer_payload
from public.practice_sessions ps
join public.practice_session_questions psq on psq.session_id = ps.id
where ps.created_at >= now() - interval '12 weeks'
group by 1
order by 1 desc;

-- Database size is not the same as provisioned/billed disk size. Check the
-- project's Compute and Disk page and organization's Billing/Usage pages too.
