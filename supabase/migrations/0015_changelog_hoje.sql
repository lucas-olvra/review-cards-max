-- Review Cards Pro — entrada de novidades da fila de hoje
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0014_reviews.sql.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'Hoje: a fila que decide por você',
  'O app sabia construir e rodar conteúdo, mas não lembrava de nada — o placar do quiz morria ' ||
  'ao sair da página, e decidir o que revisar amanhã sobrava pra sua cabeça. Agora cada sessão ' ||
  'fica registrada, cada tópico tem uma data de volta, e a tela Hoje entrega a fila pronta: ' ||
  'os mais atrasados primeiro, cada um já na modalidade certa.',
  '[
    {"title": "1. Abra Hoje, no topo", "text": "O número ao lado do link é quanto venceu. A fila já vem ordenada pelo mais atrasado — não escolha nada, comece pelo primeiro item."},
    {"title": "2. Cada dia cobra de um jeito", "text": "São 5 degraus, do mais barato ao mais caro de fingir: explicar em voz alta, cartões, discursiva, discriminação e prática. O tópico sobe um degrau a cada passagem boa."},
    {"title": "3. Errou, desce", "text": "Menos de 80% de acerto rebaixa o tópico um degrau e traz ele de volta amanhã. Acertou, ele some da fila pelo intervalo do degrau — de 2 a 60 dias."},
    {"title": "4. Teto de 5 por dia", "text": "Se venceram 30, a fila mostra 5. Isso é de propósito: lista de 30 ninguém começa, e dívida de revisão sempre ganha de conteúdo novo."},
    {"title": "5. Revisão fora da fila também conta", "text": "Abrir os cartões pela página do tópico registra igual. O que ela nunca faz é encurtar um intervalo já conquistado nem pular degrau que ainda não foi cobrado."}
  ]'::jsonb
);

commit;
