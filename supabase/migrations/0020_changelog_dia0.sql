-- Review Cards Pro — entrada de novidades do bloco de dia 0
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0019_changelog_dica.sql.
-- Só insere uma linha de changelog: não altera schema nenhum.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'Dia 0: três coisas provam que você sabe',
  'A fila de hoje começa em D+1 — revisar no mesmo dia em que você escreveu não testa memória ' ||
  'nenhuma. Só que isso deixava o dia da criação sem orientação: dez painéis com o mesmo peso ' ||
  'visual e nada dizendo por onde começar nem quando parar. O cansaço ali não vinha do volume ' ||
  'de informação, vinha de não haver alvo. Agora tem.',
  '[
    {"title": "1. Explicar, decidir, implementar", "text": "No topo do tópico recém-criado aparece um bloco com três desafios. São eles que provam que você sabe: dizer o que é em voz alta, reconhecer quando o tópico é o caso, e escrever o código."},
    {"title": "2. O resto é consulta", "text": "O que é, por que existe, onde usar, onde não usar, erros comuns, analogia — tudo isso continua ali, mas como material que você abre quando trava num dos três. Não é para ler tudo antes."},
    {"title": "3. Hoje é com o material aberto", "text": "Dia 0 é primeiro contato, não teste. As dicas não cobram nada aqui, e a explicação vem com o resumo na tela."},
    {"title": "4. Nada disso mexe no agendamento", "text": "Marque três, um ou nenhum: o tópico entra na fila amanhã do mesmo jeito, cobrando o primeiro degrau. É de propósito — dia 0 é codificação, e punir codificação não faria sentido."},
    {"title": "5. Falta algum campo? O desafio vira escrever ele", "text": "Sem resumo de 30 segundos, o primeiro desafio pede que você escreva. Sem exercício, o terceiro pede o exercício. O bloco se adapta ao que o tópico ainda não tem."},
    {"title": "6. Ele some sozinho", "text": "O bloco só existe entre criar o tópico e a primeira revisão vencer. Depois disso quem manda na sua atenção é a fila de hoje."}
  ]'::jsonb
);

commit;
