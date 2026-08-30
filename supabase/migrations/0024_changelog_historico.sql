-- Review Cards Pro — histórico das explicações na página do tópico
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0023_changelog_tres_pecas.sql.
-- Só insere uma linha de changelog: não altera schema nenhum.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'Suas explicações, uma embaixo da outra',
  'As três peças já ficavam guardadas a cada vez que você explicava, mas só a última era usada — ' ||
  'para avisar sobre a peça repetida dentro da revisão. Agora a página do tópico mostra o ' ||
  'histórico: as suas versões de cada peça, em sequência. "Estou melhorando?" deixa de ser ' ||
  'sensação e passa a ser uma coisa que se lê.',
  '[
    {"title": "1. Agrupado por peça, não por sessão", "text": "Três sessões soltas devolveriam a comparação pra sua memória. Suas versões do MESMO porquê, uma embaixo da outra, mostram sozinhas se ele está fechando."},
    {"title": "2. Os pontinhos dizem tudo antes da leitura", "text": "Um por tentativa, verde ou vermelho, na mesma ordem da lista. A peça que nunca fecha vira uma linha vermelha — não precisa contar nada."},
    {"title": "3. A manchete só aparece quando há tendência", "text": "Peça que falhou em todas as tentativas, com mais de uma tentativa registrada, ganha um aviso no topo. Com uma tentativa só existe um dado, não uma tendência."},
    {"title": "4. Ele fica logo acima do resumo", "text": "De propósito: a decisão que o histórico provoca — reescrever a peça que nunca fecha — se toma nos painéis do ciclo, ali em cima."}
  ]'::jsonb
);

commit;
