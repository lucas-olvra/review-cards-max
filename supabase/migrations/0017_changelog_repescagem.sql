-- Review Cards Pro — entrada de novidades da graduação e da repescagem
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0016_grades_retry.sql.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'Quatro graus e repescagem',
  'A revisão media com um binário: 80% de acerto passava, abaixo disso rebaixava. Isso jogava ' ||
  'fora a diferença entre "saiu limpo" e "saiu suando", e nas modalidades sem placar o app ' ||
  'estava adivinhando por você. Agora quem fecha a sessão é você, em quatro graus — e errar ' ||
  'deixou de ser um beco: dá pra pedir uma segunda chance ainda hoje.',
  '[
    {"title": "1. Você grada, não o placar", "text": "No fim de cada revisão: Errei, Difícil, Bom, Fácil. Onde existe placar o app já vem com um escolhido e você corrige se discordar; no explicar em voz alta e na prática a escolha é toda sua."},
    {"title": "2. Difícil não sobe degrau", "text": "Ele repete o degrau que acabou de custar caro, com intervalo mais curto. É o grau pra quando saiu, mas você sabe que saiu no susto."},
    {"title": "3. Fácil estica o intervalo", "text": "E ele nunca vem sugerido de propósito: dizer que foi fácil é uma afirmação sua, não uma conclusão que o app pode tirar da sua nota."},
    {"title": "4. Errei abre repescagem", "text": "O tópico volta em 10 minutos pra você tentar de novo — e dá pra mudar pra 1 hora ou mais tarde. Ela aparece numa seção própria da tela Hoje."},
    {"title": "5. A repescagem não rouba vaga", "text": "Ela fica fora do teto de 5 por dia e não mexe no agendamento: serve pra destravar, não pra recuperar pontos. Amanhã a revisão de verdade acontece do mesmo jeito, e ela some sozinha."},
    {"title": "6. Tópico dominado agora se afasta", "text": "No último degrau o intervalo dobra a cada Bom em vez de ficar preso em 60 dias — até um teto de um ano. O que você sabe há muito tempo para de encher a fila."}
  ]'::jsonb
);

commit;
