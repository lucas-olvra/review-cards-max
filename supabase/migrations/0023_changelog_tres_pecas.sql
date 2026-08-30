-- Review Cards Pro — entrada de novidades das três peças do pitch
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0022_pitch_attempts.sql.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'Explicar agora deixa rastro',
  'Dos cinco degraus, quatro cobram reconhecimento ou execução. Só o explicar em voz alta cobra ' ||
  'produção — gerar a explicação do nada, que é o que uma entrevista pede. E era o degrau mais ' ||
  'fraco que existia: você falava no vazio, comparava com o resumo de memória e se autoavaliava. ' ||
  'Nada dizia ONDE a explicação quebrou. Agora diz.',
  '[
    {"title": "1. Fale primeiro, como sempre", "text": "Os 30 segundos continuam iguais. Falar sem rede é o que mais se parece com ser perguntado — não dá pra terceirizar isso pra um formulário."},
    {"title": "2. Depois escreva as três peças", "text": "O que é, por que existe, um exemplo concreto. Do jeito que você acabou de falar: sem melhorar e sem consultar. O valor está em registrar o que saiu, não o que você gostaria que tivesse saído."},
    {"title": "3. A comparação vira lado a lado", "text": "Cada peça sua aparece junto do campo correspondente do tópico. Antes você comparava de memória contra um texto que estava lendo naquele instante — que é o pior lugar possível pra essa comparação."},
    {"title": "4. A peça do meio é o ponto", "text": "Quase todo mundo diz o que a coisa faz e dá um exemplo, e trava no porquê ela existe. É o porquê que separa quem usa de quem entende, e é a segunda pergunta de qualquer entrevista."},
    {"title": "5. O grau vem das peças", "text": "Três de três sugere Bom; uma faltando sugere Difícil; duas ou mais, Errei. Peça que o tópico não tem preenchida não conta — não dá pra cobrar o que não foi definido."},
    {"title": "6. Falhou duas vezes seguidas? Você é avisado", "text": "Uma peça isolada faltando é ruído. A mesma peça faltando de novo é um buraco — e aí o app avisa antes de você começar a falar, e de novo no fim."}
  ]'::jsonb
);

commit;
