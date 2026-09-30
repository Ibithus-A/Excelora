-- Arthur conversations are only accessed through authenticated server routes
-- using the isolated service-role client. Browser roles remain default-deny.
begin;

alter table public.arthur_conversations enable row level security;
alter table public.arthur_messages enable row level security;
alter table public.arthur_request_logs enable row level security;

revoke all on table
  public.arthur_conversations,
  public.arthur_messages,
  public.arthur_request_logs
from anon, authenticated;

grant all on table
  public.arthur_conversations,
  public.arthur_messages,
  public.arthur_request_logs
to service_role;

drop policy if exists service_only_no_browser_access on public.arthur_conversations;
create policy service_only_no_browser_access
  on public.arthur_conversations
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access on public.arthur_messages;
create policy service_only_no_browser_access
  on public.arthur_messages
  for all to anon, authenticated
  using (false) with check (false);

drop policy if exists service_only_no_browser_access on public.arthur_request_logs;
create policy service_only_no_browser_access
  on public.arthur_request_logs
  for all to anon, authenticated
  using (false) with check (false);

notify pgrst, 'reload schema';

commit;
