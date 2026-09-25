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
-- Database size is not the same as provisioned/billed disk size. Check the
-- project's Compute and Disk page and organization's Billing/Usage pages too.
