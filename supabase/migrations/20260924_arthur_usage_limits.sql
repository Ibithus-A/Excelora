-- Arthur makes no provider calls until the owner sets an explicit allowance.
-- This is a request allowance, not a replacement for the provider's invoice.
begin;
create table if not exists public.arthur_usage_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  monthly_request_limit integer not null default 0 check (monthly_request_limit between 0 and 100000),
  daily_user_limit integer not null default 25 check (daily_user_limit between 0 and 1000),
  plus_daily_user_limit integer not null default 25 check (plus_daily_user_limit between 1 and 1000),
  pro_daily_user_limit integer not null default 35 check (pro_daily_user_limit between 1 and 1000)
);
insert into public.arthur_usage_settings(id) values(true) on conflict do nothing;
create table if not exists public.arthur_user_limit_overrides (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_request_limit integer not null check (daily_request_limit between 1 and 1000),
  reason text,
  updated_at timestamptz not null default now()
);
create table if not exists public.arthur_monthly_usage (
  month date primary key,
  requests integer not null default 0 check(requests >= 0)
);
create table if not exists public.arthur_daily_usage (
  day date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  requests integer not null default 0 check(requests >= 0),
  primary key(day,user_id)
);
alter table public.arthur_usage_settings enable row level security;
alter table public.arthur_monthly_usage enable row level security;
alter table public.arthur_daily_usage enable row level security;
alter table public.arthur_user_limit_overrides enable row level security;
revoke all on public.arthur_usage_settings, public.arthur_monthly_usage, public.arthur_daily_usage, public.arthur_user_limit_overrides from anon, authenticated;
grant all on public.arthur_usage_settings, public.arthur_monthly_usage, public.arthur_daily_usage, public.arthur_user_limit_overrides to service_role;

drop policy if exists service_only_no_browser_access on public.arthur_user_limit_overrides;
create policy service_only_no_browser_access
  on public.arthur_user_limit_overrides
  for all to anon, authenticated
  using (false) with check (false);

create or replace function public.reserve_arthur_request(p_user_id uuid)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
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
  -- One database lock covers all server instances, users and concurrent requests.
  select * into cfg from public.arthur_usage_settings where id = true for update;
  if not found or not cfg.enabled then return 'disabled'; end if;
  select role::text, plan::text into user_role, user_plan
  from public.profiles where id = p_user_id;
  if not found then return 'invalid_user'; end if;

  -- Tutors are unrestricted for product testing. Their provider usage remains
  -- visible in arthur_request_logs, but does not consume student allowances.
  if user_role = 'tutor' then return 'allowed'; end if;

  select daily_request_limit into override_limit
  from public.arthur_user_limit_overrides where user_id = p_user_id;
  effective_daily_limit := coalesce(
    override_limit,
    case when user_plan = 'pro' then cfg.pro_daily_user_limit
         else cfg.plus_daily_user_limit end
  );

  select requests into month_count from public.arthur_monthly_usage where month=month_start;
  if coalesce(month_count,0) >= cfg.monthly_request_limit then return 'monthly_limit'; end if;
  select requests into day_count from public.arthur_daily_usage where day=today and user_id=p_user_id;
  if coalesce(day_count,0) >= effective_daily_limit then return 'daily_limit'; end if;
  insert into public.arthur_monthly_usage(month,requests) values(month_start,1)
    on conflict(month) do update set requests=arthur_monthly_usage.requests+1;
  insert into public.arthur_daily_usage(day,user_id,requests) values(today,p_user_id,1)
    on conflict(day,user_id) do update set requests=arthur_daily_usage.requests+1;
  -- Retain monthly totals; daily counters need only the current month.
  delete from public.arthur_daily_usage where day < month_start;
  return 'allowed';
end;
$$;
revoke all on function public.reserve_arthur_request(uuid) from public, anon, authenticated;
grant execute on function public.reserve_arthur_request(uuid) to service_role;
notify pgrst, 'reload schema';
commit;
