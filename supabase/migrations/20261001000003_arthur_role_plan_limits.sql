-- Role-aware Arthur allowances:
--   tutors: no daily or global monthly application allowance
--   Plus students: 25 requests/day
--   Premium (`pro`) students: 35 requests/day
--   selected QA accounts: explicit per-user override
-- The global monthly limit remains a circuit breaker for student usage.
begin;

alter table public.arthur_usage_settings
  add column if not exists plus_daily_user_limit integer not null default 25
    check (plus_daily_user_limit between 1 and 1000),
  add column if not exists pro_daily_user_limit integer not null default 35
    check (pro_daily_user_limit between 1 and 1000);

update public.arthur_usage_settings
set daily_user_limit = 25,
    plus_daily_user_limit = 25,
    pro_daily_user_limit = 35
where id = true;

create table if not exists public.arthur_user_limit_overrides (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_request_limit integer not null check (daily_request_limit between 1 and 1000),
  reason text,
  updated_at timestamptz not null default now()
);

alter table public.arthur_user_limit_overrides enable row level security;
revoke all on table public.arthur_user_limit_overrides from anon, authenticated;
grant all on table public.arthur_user_limit_overrides to service_role;

drop policy if exists service_only_no_browser_access on public.arthur_user_limit_overrides;
create policy service_only_no_browser_access
  on public.arthur_user_limit_overrides
  for all to anon, authenticated
  using (false) with check (false);

create or replace function public.reserve_arthur_request(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  cfg public.arthur_usage_settings%rowtype;
  user_role text;
  user_plan text;
  override_limit integer;
  effective_daily_limit integer;
  today date := (now() at time zone 'UTC')::date;
  month_start date := date_trunc('month', now() at time zone 'UTC')::date;
  month_count integer;
  day_count integer;
begin
  select * into cfg
  from public.arthur_usage_settings
  where id = true
  for update;

  if not found or not cfg.enabled then return 'disabled'; end if;

  select role::text, plan::text into user_role, user_plan
  from public.profiles
  where id = p_user_id;
  if not found then return 'invalid_user'; end if;

  if user_role = 'tutor' then return 'allowed'; end if;

  select daily_request_limit into override_limit
  from public.arthur_user_limit_overrides
  where user_id = p_user_id;

  effective_daily_limit := coalesce(
    override_limit,
    case
      when user_plan = 'pro' then cfg.pro_daily_user_limit
      else cfg.plus_daily_user_limit
    end
  );

  select requests into month_count
  from public.arthur_monthly_usage
  where month = month_start;
  if coalesce(month_count, 0) >= cfg.monthly_request_limit then return 'monthly_limit'; end if;

  select requests into day_count
  from public.arthur_daily_usage
  where day = today and user_id = p_user_id;
  if coalesce(day_count, 0) >= effective_daily_limit then return 'daily_limit'; end if;

  insert into public.arthur_monthly_usage(month, requests)
  values (month_start, 1)
  on conflict (month) do update
  set requests = arthur_monthly_usage.requests + 1;

  insert into public.arthur_daily_usage(day, user_id, requests)
  values (today, p_user_id, 1)
  on conflict (day, user_id) do update
  set requests = arthur_daily_usage.requests + 1;

  delete from public.arthur_daily_usage where day < month_start;
  return 'allowed';
end;
$$;

revoke all on function public.reserve_arthur_request(uuid) from public, anon, authenticated;
grant execute on function public.reserve_arthur_request(uuid) to service_role;

notify pgrst, 'reload schema';

commit;
