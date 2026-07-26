-- Review Cards Pro — contrastes entre tópicos (Fase 9: discriminação)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0008_changelog_idiomas.sql.
-- IMPORTANTE: rode o arquivo inteiro de uma vez.

begin;

-- Primeira aresta entre dois tópicos do app. Até aqui todo conteúdo era
-- intra-tópico (os 7 campos do ciclo, cartões, discursivas), o que treina
-- "o que é X" mas nunca "por que X e não Y" — o usuário passa em todos os
-- cartões de `final` e de `enum` e mesmo assim trava na hora de escolher.
--
-- O par é guardado em ordem canônica (topic_a < topic_b, comparação de uuid)
-- com índice único, então "final × enum" e "enum × final" são a mesma linha.
-- Quem escreve precisa ordenar antes de inserir (ver canonicalPair em
-- lib/actions/contrasts.ts e lib/mcp/service.ts).
create table if not exists public.topic_contrasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_a uuid not null references public.topics(id) on delete cascade,
  topic_b uuid not null references public.topics(id) on delete cascade,

  -- Por que os dois se confundem. É o campo que dá contexto: quase sempre é
  -- "os dois foram parar na mesma gaveta mental".
  confusion text not null default '',

  -- O ativo principal da tabela: a pergunta que resolve a escolha na hora.
  -- Não é definição (o usuário já tem duas) — é o teste que decide.
  decisive_question text not null default '',

  choose_a_when text not null default '',
  choose_b_when text not null default '',

  -- Exercício de discriminação: [{ situation, answer: 'a'|'b', why }].
  -- Fica aqui, e não em `cards`, porque a resposta é sempre "qual dos dois" —
  -- não faz sentido fora do par.
  scenarios jsonb not null default '[]'::jsonb,

  source text not null default 'manual' check (source in ('manual', 'mcp')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint topic_contrasts_ordered check (topic_a < topic_b)
);

create unique index if not exists topic_contrasts_pair_idx
  on public.topic_contrasts(topic_a, topic_b);
create index if not exists topic_contrasts_a_idx on public.topic_contrasts(topic_a);
create index if not exists topic_contrasts_b_idx on public.topic_contrasts(topic_b);

alter table public.topic_contrasts enable row level security;

drop policy if exists "Users manage their own topic contrasts" on public.topic_contrasts;
create policy "Users manage their own topic contrasts"
  on public.topic_contrasts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
