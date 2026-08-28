-- Review Cards Pro — entrada de novidades da dica com preço
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0018_hint.sql.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'A dica que custa um degrau',
  'Explicar em voz alta sem nenhum apoio é duro: trava por um detalhe e a sessão inteira vira ' ||
  'derrota. Agora existe apoio no meio da tentativa — a analogia visual no explicar, o conceito ' ||
  'nos cartões e nas discursivas, o código na prática. Ele tem preço, e o preço é o que impede ' ||
  'a dica de corroer a medição em silêncio.',
  '[
    {"title": "1. Travou? Abra a dica", "text": "Durante a tentativa aparece um botão. No explicar em voz alta ele mostra a analogia visual do tópico — a estrutura do conceito, sem as palavras da explicação."},
    {"title": "2. O preço é o teto Difícil", "text": "Abrir a dica desabilita Bom e Fácil naquela sessão. Você destrava e aprende, mas o tópico repete o degrau em vez de subir: com o material na tela não houve recuperação, e é isso que a escada mede."},
    {"title": "3. Depois de tentar, é de graça", "text": "Terminado o pitch, a analogia aparece junto do resumo sem cobrar nada. Ali não há mais o que medir, e reencontrar a estrutura logo depois de tentar recuperá-la é justamente o que fixa."},
    {"title": "4. O Consultar conceito dos cartões mudou", "text": "Ele era grátis e aberto no meio da pergunta, o que inflava a escada sem ninguém perceber. Agora é a mesma dica, com o mesmo preço."},
    {"title": "5. O treino de discriminação ficou de fora", "text": "Lá o único apoio possível seria a pergunta que decide — que é a chave da resposta. Mostrá-la antes de você escolher não assistiria, entregaria."}
  ]'::jsonb
);

commit;
