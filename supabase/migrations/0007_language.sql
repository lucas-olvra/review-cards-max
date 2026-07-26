-- Review Cards Pro — seções de idioma (Fase 8: moldes, vocabulário e narração)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0006_changelog_steps.sql.
-- IMPORTANTE: rode o arquivo inteiro de uma vez (idealmente dentro de uma transação
-- begin/commit, se seu SQL Editor permitir) — a ordem das etapas importa.

begin;

-- Itens que o usuário adiciona por cima do plano curado que já vem no código
-- (lib/language/seed.ts). O plano-base NÃO é copiado pra cá: fica no repo pra
-- poder ser corrigido/expandido sem migração e sem duplicar ~340 linhas por
-- usuário. Esta tabela guarda só o que é do usuário — manual ou via MCP.
create table if not exists public.language_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  kind text not null check (kind in ('word', 'frame')),
  term text not null,
  meaning text not null default '',
  examples jsonb not null default '[]'::jsonb,
  category text not null default '',
  source text not null default 'manual' check (source in ('manual', 'mcp')),
  created_at timestamptz not null default now()
);

create index if not exists language_items_section_idx on public.language_items(section_id);

alter table public.language_items enable row level security;

drop policy if exists "Users manage their own language items" on public.language_items;
create policy "Users manage their own language items"
  on public.language_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- "Esse molde já sai sem pensar." Chaveado por `item_key` (texto) em vez de
-- FK porque o item dominado pode vir do seed no código (ex: 'en:frame:need-to')
-- ou de language_items (ex: 'db:<uuid>') — as duas origens convivem na mesma
-- lista da interface.
create table if not exists public.language_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  item_key text not null,
  mastered boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (section_id, item_key)
);

create index if not exists language_progress_section_idx on public.language_progress(section_id);

alter table public.language_progress enable row level security;

drop policy if exists "Users manage their own language progress" on public.language_progress;
create policy "Users manage their own language progress"
  on public.language_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Uma linha por sessão de narração em voz alta. `audio_path` aponta pro objeto
-- no bucket `narrations`; fica nulo se a gravação falhar ou o usuário só usar
-- o cronômetro.
create table if not exists public.narration_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  prompt text not null default '',
  duration_seconds integer not null default 0,
  audio_path text,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists narration_sessions_section_idx on public.narration_sessions(section_id, created_at desc);

alter table public.narration_sessions enable row level security;

drop policy if exists "Users manage their own narration sessions" on public.narration_sessions;
create policy "Users manage their own narration sessions"
  on public.narration_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Storage: áudios das narrações ────────────────────────────────────────
-- Bucket privado. O app nunca serve a URL pública: gera uma signed URL de
-- curta duração na hora de tocar (lib/actions/language.ts).
insert into storage.buckets (id, name, public)
values ('narrations', 'narrations', false)
on conflict (id) do nothing;

-- Cada usuário só enxerga objetos dentro da própria pasta <user_id>/… — é o
-- primeiro segmento do path que decide o dono, então o app precisa sempre
-- gravar em `<user_id>/<section_id>/<arquivo>`.
drop policy if exists "Users read their own narrations" on storage.objects;
create policy "Users read their own narrations"
  on storage.objects
  for select
  using (bucket_id = 'narrations' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users upload their own narrations" on storage.objects;
create policy "Users upload their own narrations"
  on storage.objects
  for insert
  with check (bucket_id = 'narrations' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete their own narrations" on storage.objects;
create policy "Users delete their own narrations"
  on storage.objects
  for delete
  using (bucket_id = 'narrations' and (storage.foldername(name))[1] = auth.uid()::text);

commit;
