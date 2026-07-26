-- Review Cards Pro — entrada de novidades dos contrastes entre tópicos
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0009_topic_contrasts.sql.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'Confundo com: por que este e não aquele',
  'Até agora todo conteúdo vivia dentro de um tópico só, o que treina "o que é X" mas nunca ' ||
  '"por que X e não Y". Agora dois tópicos podem ser ligados como alternativas concorrentes, ' ||
  'com a pergunta que decide a escolha e um treino de cenários embaralhados.',
  '[
    {"title": "1. Ligue os dois tópicos", "text": "No painel Confundo com, dentro de um tópico, escolha aquele que você troca com ele. O contraste aparece nos dois lados automaticamente."},
    {"title": "2. Guarde a pergunta que decide", "text": "Não a definição de cada um — você já tem duas. O que resolve na hora é o teste, tipo: esse valor tem irmãos? consigo listar todos?"},
    {"title": "3. Adicione cenários", "text": "Situações concretas onde os dois competem. Escreva sem citar o nome dos tópicos, senão a resposta vaza."},
    {"title": "4. Treine sem etiqueta", "text": "Treinar discriminação embaralha os cenários de toda a seção e não diz de qual tópico cada um veio. É a parte que a revisão dentro de um tópico não consegue fazer."},
    {"title": "5. Peça pra IA montar", "text": "Com o MCP conectado, peça o contraste entre dois tópicos e a IA preenche a pergunta que decide e os cenários de treino."}
  ]'::jsonb
);

commit;
