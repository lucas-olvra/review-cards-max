-- Review Cards Pro — seções (Fase 7: contêiner de modo de aprendizado)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0003_topic_analogy.sql.
-- IMPORTANTE: rode o arquivo inteiro de uma vez (idealmente dentro de uma transação
-- begin/commit, se seu SQL Editor permitir) — a ordem das etapas importa.

begin;

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null default 'programming' check (kind in ('programming', 'language')),
  language text check (language in ('en', 'es', 'fr', 'it', 'de')),
  created_at timestamptz not null default now(),
  constraint sections_language_matches_kind check (
    (kind = 'language' and language is not null) or (kind = 'programming' and language is null)
  )
);

create index if not exists sections_user_id_idx on public.sections(user_id);

alter table public.sections enable row level security;

drop policy if exists "Users manage their own sections" on public.sections;
create policy "Users manage their own sections"
  on public.sections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Backfill: uma seção "Programação" por usuário que já tem tópicos ──────
-- Determinístico só porque, neste momento, cada usuário passa a ter no máximo
-- uma seção kind='programming' recém-criada aqui. Não reaproveitar esta lógica
-- de update depois que usuários puderem ter múltiplas seções de programação.
insert into public.sections (user_id, name, kind)
select distinct t.user_id, 'Programação', 'programming'
from public.topics t
where not exists (
  select 1 from public.sections s where s.user_id = t.user_id and s.kind = 'programming'
);

alter table public.topics add column if not exists section_id uuid references public.sections(id) on delete cascade;

update public.topics t
set section_id = s.id
from public.sections s
where t.section_id is null
  and s.user_id = t.user_id
  and s.kind = 'programming';

-- Trava a coluna como obrigatória só depois do backfill acima. Se esta linha
-- falhar, rode `select count(*) from public.topics where section_id is null;`
-- antes de tentar de novo — não deveria haver nenhuma linha.
alter table public.topics alter column section_id set not null;

create index if not exists topics_section_id_idx on public.topics(section_id);

commit;
