-- Review Cards Pro — schema inicial (Fase 3: fundação multiusuário)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.

create extension if not exists pgcrypto;

-- ── topics (era "seção" no app antigo) ─────────────────────────────
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  concept_what text not null default '',
  concept_why text not null default '',
  code text not null default '',
  use_cases text not null default '',
  anti_patterns text not null default '',
  common_mistakes text not null default '',
  exercise_prompt text not null default '',
  exercise_solution text not null default '',
  pitch text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists topics_user_id_idx on public.topics(user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists topics_set_updated_at on public.topics;
create trigger topics_set_updated_at
  before update on public.topics
  for each row
  execute function public.set_updated_at();

-- ── cards (flashcards de múltipla escolha) ─────────────────────────
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  question text not null,
  options jsonb not null default '["","","",""]'::jsonb,
  correct int not null default 0,
  explanation text not null default '',
  analogy text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists cards_topic_id_idx on public.cards(topic_id);

-- ── discursive_questions (perguntas discursivas autoavaliadas) ─────
create table if not exists public.discursive_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  question text not null,
  model_answer text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists discursive_questions_topic_id_idx on public.discursive_questions(topic_id);

-- ── Row Level Security: cada usuário só enxerga/edita os próprios dados ─
alter table public.topics enable row level security;
alter table public.cards enable row level security;
alter table public.discursive_questions enable row level security;

drop policy if exists "Users manage their own topics" on public.topics;
create policy "Users manage their own topics"
  on public.topics
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage cards of their own topics" on public.cards;
create policy "Users manage cards of their own topics"
  on public.cards
  for all
  using (exists (
    select 1 from public.topics
    where topics.id = cards.topic_id and topics.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.topics
    where topics.id = cards.topic_id and topics.user_id = auth.uid()
  ));

drop policy if exists "Users manage discursive questions of their own topics" on public.discursive_questions;
create policy "Users manage discursive questions of their own topics"
  on public.discursive_questions
  for all
  using (exists (
    select 1 from public.topics
    where topics.id = discursive_questions.topic_id and topics.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.topics
    where topics.id = discursive_questions.topic_id and topics.user_id = auth.uid()
  ));
