-- Review Cards Pro — changelog + configurações do usuário (protótipo "novidades")
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0004_sections.sql.
-- IMPORTANTE: rode o arquivo inteiro de uma vez (idealmente dentro de uma transação
-- begin/commit, se seu SQL Editor permitir) — a ordem das etapas importa.

begin;

-- Entradas de novidades são cadastradas manualmente por aqui (SQL Editor) por
-- enquanto — não há admin UI neste protótipo. Visíveis para qualquer usuário
-- autenticado, sem dono por linha.
create table if not exists public.changelog_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.changelog_entries enable row level security;

drop policy if exists "Authenticated users can read changelog" on public.changelog_entries;
create policy "Authenticated users can read changelog"
  on public.changelog_entries
  for select
  using (auth.role() = 'authenticated');

-- Configurações por usuário (hoje só guarda até quando ele já viu o
-- changelog). `default now()` garante que usuários existentes não tomam uma
-- avalanche de entradas antigas assim que a linha é criada para eles.
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_changelog_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "Users manage their own settings" on public.user_settings;
create policy "Users manage their own settings"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
