-- Review Cards Pro — a pergunta que decide (Fase 10: decisão)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0011_analogy_scene.sql.
-- IMPORTANTE: rode o arquivo inteiro de uma vez.

begin;

-- Até aqui o tópico guardava o que ele é, onde usar e onde não usar — tudo em
-- prosa, e tudo lido com o nome do tópico já na tela. Nada disso ajuda no
-- momento em que o nome ainda NÃO apareceu: você está no meio de um exercício,
-- o enunciado não cita ferramenta nenhuma, e a pergunta é "isso aqui é caso
-- disso ou não?".
--
-- Estes três campos guardam esse teste, e só ele:
--   decisive_question — pergunta binária, respondível olhando o enunciado
--   decisive_yes      — o que fazer quando a resposta é sim
--   decisive_no       — o que usar no lugar quando é não
--
-- Ficam vazios de propósito quando o tópico não é uma escolha (event loop,
-- garbage collector, Big-O): não existe alternativa concorrente, então não
-- existe teste. A interface esconde o painel nesse caso, em vez de exibir uma
-- dicotomia inventada.
--
-- Homônimo consciente: topic_contrasts.decisive_question (0009) guarda o mesmo
-- tipo de teste para o par "X ou Y". Aqui o par é "X ou nada".
alter table public.topics
  add column if not exists decisive_question text not null default '',
  add column if not exists decisive_yes      text not null default '',
  add column if not exists decisive_no       text not null default '';

commit;
