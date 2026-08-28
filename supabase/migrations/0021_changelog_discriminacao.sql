-- Review Cards Pro — dica no treino de discriminação
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0020_changelog_dia0.sql.
-- Só mexe em changelog: não altera schema nenhum.

begin;

-- A entrada da dica (0019) dizia que o treino de discriminação tinha ficado de
-- fora, e a razão era boa: o único apoio à mão era a pergunta que decide, que é
-- a chave da resposta. O campo "o que se confunde" resolve isso — ele devolve o
-- eixo em que os dois tópicos se separam sem dizer qual vence NESTE cenário.
--
-- O passo antigo agora é falso, então é corrigido em vez de deixado no arquivo.
update public.changelog_entries
set steps = '[
    {"title": "1. Travou? Abra a dica", "text": "Durante a tentativa aparece um botão. No explicar em voz alta ele mostra a analogia visual do tópico — a estrutura do conceito, sem as palavras da explicação."},
    {"title": "2. O preço é o teto Difícil", "text": "Abrir a dica desabilita Bom e Fácil naquela sessão. Você destrava e aprende, mas o tópico repete o degrau em vez de subir: com o material na tela não houve recuperação, e é isso que a escada mede."},
    {"title": "3. Depois de tentar, é de graça", "text": "Terminado o pitch, a analogia aparece junto do resumo sem cobrar nada. Ali não há mais o que medir, e reencontrar a estrutura logo depois de tentar recuperá-la é justamente o que fixa."},
    {"title": "4. O Consultar conceito dos cartões mudou", "text": "Ele era grátis e aberto no meio da pergunta, o que inflava a escada sem ninguém perceber. Agora é a mesma dica, com o mesmo preço."},
    {"title": "5. No treino de discriminação, a dica é o que se confunde", "text": "Nunca a pergunta que decide — essa é a chave da resposta. O que se confunde devolve só o eixo em que os dois tópicos se separam; aplicar o eixo ao cenário continua sendo com você."}
  ]'::jsonb
where title = 'A dica que custa um degrau';

insert into public.changelog_entries (title, description, steps)
values (
  'O treino de discriminação também tem dica',
  'Quando a dica com preço chegou, o treino de discriminação ficou de fora — o único apoio à ' ||
  'mão ali era a pergunta que decide, e mostrá-la antes da escolha não assistiria, entregaria. ' ||
  'O campo "o que se confunde" resolve: ele diz em que eixo os dois tópicos se separam, sem ' ||
  'dizer qual deles vence no cenário que está na sua frente.',
  '[
    {"title": "1. Preencha o que se confunde", "text": "No painel Confundo com de um tópico. Uma frase sobre por que os dois se misturam na sua cabeça — é ela que vira a dica do treino."},
    {"title": "2. Mesmo preço dos outros degraus", "text": "Abrir limita a sessão a Difícil. E vale pelo treino inteiro: pago uma vez, fica aberto nos cenários seguintes."},
    {"title": "3. Só conta quando o treino é de um tópico", "text": "Aberto pela seção, o treino continua sem gradação e sem registro — ali ele não pertence a tópico nenhum. Pela fila de hoje, sim."}
  ]'::jsonb
);

commit;
