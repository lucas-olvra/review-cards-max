-- Review Cards Pro — tokens de acesso pessoal (Fase 5: servidor MCP)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0001_init.sql.

create table if not exists public.api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  token_prefix text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists api_tokens_user_id_idx on public.api_tokens(user_id);

alter table public.api_tokens enable row level security;

drop policy if exists "Users manage their own tokens" on public.api_tokens;
create policy "Users manage their own tokens"
  on public.api_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
