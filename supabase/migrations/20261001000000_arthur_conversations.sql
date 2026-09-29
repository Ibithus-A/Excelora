-- Persistent, service-mediated Arthur conversations. Browser clients cannot
-- query these tables directly; the authenticated API always scopes by user_id.
begin;

create table if not exists public.arthur_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  context_key text not null check (char_length(context_key) between 1 and 500),
  page_title text not null check (char_length(page_title) between 1 and 300),
  subject_title text,
  chapter_title text,
  topic_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.arthur_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.arthur_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 20000),
  status text not null default 'complete' check (status in ('complete', 'interrupted')),
  created_at timestamptz not null default now()
);

create table if not exists public.arthur_request_logs (
  id bigint generated always as identity primary key,
  request_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.arthur_conversations(id) on delete set null,
  provider text not null,
  model text not null,
  status text not null check (status in ('completed', 'interrupted', 'failed')),
  latency_ms integer not null check (latency_ms >= 0),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  total_tokens integer check (total_tokens >= 0),
  tool_names text[] not null default array[]::text[],
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists arthur_conversations_user_context_idx
  on public.arthur_conversations (user_id, context_key, updated_at desc);
create index if not exists arthur_messages_conversation_idx
  on public.arthur_messages (conversation_id, created_at);
create index if not exists arthur_request_logs_user_created_idx
  on public.arthur_request_logs (user_id, created_at desc);

alter table public.arthur_conversations enable row level security;
alter table public.arthur_messages enable row level security;
alter table public.arthur_request_logs enable row level security;

revoke all on public.arthur_conversations, public.arthur_messages, public.arthur_request_logs from anon, authenticated;
grant all on public.arthur_conversations, public.arthur_messages, public.arthur_request_logs to service_role;

notify pgrst, 'reload schema';
commit;
