-- Review Cards Pro — agenda de revisão (Fase 11: a escada)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0013_changelog_decisao.sql.
-- IMPORTANTE: rode o arquivo inteiro de uma vez.

begin;

-- Até aqui o app sabia construir e rodar conteúdo, e não lembrava de nada: o
-- placar do quiz vivia em useState e morria ao sair da página. Sem memória de
-- revisão, "o que eu estudo amanhã?" é uma pergunta que só a cabeça do usuário
-- responde — e é exatamente a pergunta que ele não quer ter que responder.
--
-- Duas colunas resolvem o agendamento, e uma tabela guarda o histórico.

-- `review_step` é o degrau da escada em que o tópico está — índice em LADDER
-- (lib/review/ladder.ts). 0 = ainda não passou por nada. O degrau decide a
-- MODALIDADE da próxima revisão, não só quando ela acontece: explicar em voz
-- alta, cartões, discursiva, discriminação e prática cobram recuperação em
-- graus diferentes, e subir a escada é subir a dificuldade.
--
-- `due_at` é quando o tópico volta pra fila. Tópico novo entra amanhã: revisar
-- no mesmo dia em que se escreveu o conteúdo não testa memória nenhuma.
alter table public.topics
  add column if not exists review_step int not null default 0,
  add column if not exists due_at timestamptz not null default (now() + interval '1 day');

-- Tópicos que já existiam nunca foram revisados, então todos vencem de uma vez.
-- Isso é correto e não é um problema: a tela "Hoje" tem teto diário (DAILY_CAP)
-- e mostra os mais atrasados primeiro — o resto espera a vez em vez de virar
-- uma lista de 40 itens que ninguém começa.
update public.topics set due_at = created_at + interval '1 day';

create index if not exists topics_due_idx on public.topics(user_id, due_at);

-- O histórico fica separado das duas colunas de propósito: `topics` guarda o
-- estado atual (barato de ler na fila), `topic_reviews` guarda o que aconteceu.
-- Sem o histórico não dá pra responder "esse tópico vive caindo?" depois.
create table if not exists public.topic_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  mode text not null check (mode in ('pitch', 'cards', 'discursive', 'discriminate', 'practice')),
  -- Degrau que essa sessão cobrou. Pode ser diferente de topics.review_step:
  -- abrir os cartões pela página do tópico, fora da fila, é revisão legítima e
  -- fica registrada — só não adianta a escada além do degrau que ela cobrou.
  rung int not null default 0,
  hits int not null default 0,
  total int not null default 0,
  passed boolean not null,
  step_before int not null default 0,
  step_after int not null default 0,
  reviewed_at timestamptz not null default now()
);

create index if not exists topic_reviews_topic_idx on public.topic_reviews(topic_id, reviewed_at desc);
create index if not exists topic_reviews_user_idx on public.topic_reviews(user_id, reviewed_at desc);

alter table public.topic_reviews enable row level security;

drop policy if exists "Users manage their own reviews" on public.topic_reviews;
create policy "Users manage their own reviews"
  on public.topic_reviews
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
