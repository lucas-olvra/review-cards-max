-- Review Cards Pro — as três peças do pitch (Fase 14: produção com diagnóstico)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0021_changelog_discriminacao.sql.
-- IMPORTANTE: rode o arquivo inteiro de uma vez.

begin;

-- Dos cinco degraus da escada, quatro cobram reconhecimento ou execução:
-- cartões reconhecem, discriminação escolhe, discursiva formula com o enunciado
-- na mão, prática executa. Só o pitch cobra PRODUÇÃO — gerar a explicação do
-- nada, que é o que uma entrevista pede.
--
-- E o pitch era o degrau mais fraco que existia: você falava no vazio, comparava
-- com o resumo de memória e se autoavaliava. Nada dizia ONDE a explicação
-- quebrou. "Sei aplicar mas me embaralho ao falar" é exatamente uma falha de
-- produção, e o app treinava produção uma vez por ciclo sem diagnóstico nenhum.
--
-- As três peças são o diagnóstico. Elas espelham campos que o tópico já separa:
--   said_what    ↔ topics.concept_what
--   said_why     ↔ topics.concept_why
--   said_example ↔ topics.use_cases
--
-- A peça do meio é o ponto todo. Muita gente explica o que a coisa faz e dá um
-- exemplo, e trava no porquê ela existe — e é o porquê que separa quem usa de
-- quem entende. Guardar as três separadas é o que permite ver, ao longo de
-- várias tentativas, que é sempre a mesma que falta.
create table if not exists public.pitch_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  -- Nulo no dia 0: ali a tentativa é registrada como linha de base, mas não há
  -- revisão porque o primeiro contato não alimenta a escada.
  review_id uuid references public.topic_reviews(id) on delete set null,

  -- O que a pessoa produziu, com as próprias palavras, antes de ver a referência.
  said_what text not null default '',
  said_why text not null default '',
  said_example text not null default '',

  -- Autoavaliação peça a peça, feita já com as duas versões lado a lado — o que
  -- é bem diferente do "consegui?" de memória que existia antes.
  hit_what boolean not null default false,
  hit_why boolean not null default false,
  hit_example boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists pitch_attempts_topic_idx on public.pitch_attempts(topic_id, created_at desc);

alter table public.pitch_attempts enable row level security;

drop policy if exists "Users manage their own pitch attempts" on public.pitch_attempts;
create policy "Users manage their own pitch attempts"
  on public.pitch_attempts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
