-- Review Cards Pro — graduação em quatro botões e repescagem (Fase 12)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0015_changelog_hoje.sql.
-- IMPORTANTE: rode o arquivo inteiro de uma vez.

begin;

-- O 0014 media a sessão com um binário: 80% de acerto passa, abaixo disso
-- rebaixa. Isso joga fora a diferença entre "saiu limpo" e "saiu, mas suando",
-- e não dá voz nenhuma a quem estudou — nas modalidades sem placar (explicar
-- em voz alta, prática) o app estava adivinhando.
--
-- `grade` guarda os quatro graus. `passed` continua existindo e derivado dele
-- (qualquer coisa acima de 'again' passou), porque o histórico do 0014 já tem
-- linhas e as consultas antigas continuam valendo.
alter table public.topic_reviews
  add column if not exists grade text check (grade in ('again', 'hard', 'good', 'easy')),
  -- Repescagem não é revisão agendada: ela registra, mas não mexe na escada.
  -- Sem essa marca as duas ficariam indistinguíveis no histórico.
  add column if not exists is_retry boolean not null default false;

update public.topic_reviews
set grade = case when passed then 'good' else 'again' end
where grade is null;

alter table public.topic_reviews alter column grade set not null;

-- `retry_at` é uma pista paralela ao `due_at`, de propósito. Errar e pedir pra
-- refazer daqui a 10 minutos não pode consumir uma das vagas do teto diário —
-- se a repescagem entrasse pelo `due_at`, ela empurraria os tópicos legítimos
-- do dia pra fora da fila, que é exatamente o oposto do que ela serve.
--
-- Ela é auto-limitada sem precisar de rotina de limpeza: a fila só mostra
-- repescagem enquanto `due_at` ainda está no futuro. Quando amanhã chega e a
-- revisão de verdade vence, a repescagem simplesmente para de aparecer.
alter table public.topics
  add column if not exists retry_at timestamptz,
  -- Intervalo concedido na última revisão, em dias. Só o último degrau usa:
  -- lá o intervalo cresce sobre o anterior em vez de ficar preso nos 60 dias
  -- fixos da LADDER — sem isso um tópico dominado há um ano voltaria a cada
  -- dois meses pra sempre. 0 = nunca agendado, cai no piso do degrau.
  add column if not exists interval_days int not null default 0;

create index if not exists topics_retry_idx on public.topics(user_id, retry_at)
  where retry_at is not null;

commit;
