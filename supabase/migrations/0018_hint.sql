-- Review Cards Pro — dica com preço (Fase 13)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0017_changelog_repescagem.sql.

begin;

-- "Explique em voz alta" sem nenhum apoio é duro demais: trava por um detalhe
-- e a sessão inteira vira derrota. A analogia visual do tópico já existe e é
-- exatamente o tipo de apoio que devolve a estrutura sem entregar as palavras.
--
-- Só que dica visível durante um teste de recuperação destrói a medição: se ela
-- for grátis, quase todo mundo abre e depois marca "Bom" — e a escada infla
-- sozinha, sem ninguém estar mentindo. Por isso ela tem preço: abrir limita a
-- sessão a "Difícil", que é o grau que repete o degrau em vez de subir.
--
-- A coluna guarda esse preço no histórico. Sem ela não dá pra distinguir, depois,
-- um "Difícil" honesto de um "Bom" que só foi rebaixado pela dica.
alter table public.topic_reviews
  add column if not exists used_hint boolean not null default false;

commit;
