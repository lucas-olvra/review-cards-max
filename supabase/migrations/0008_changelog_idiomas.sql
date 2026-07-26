-- Review Cards Pro — entrada de novidades da seção de idiomas
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0007_language.sql.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'Idiomas: moldes de frase, núcleo de vocabulário e narração em voz alta',
  'A home agora começa pela escolha do conteúdo — Programação ou Idiomas — e só então mostra suas seções. ' ||
  'Seções de idioma ganharam um plano completo: 20 moldes de frase reutilizáveis, o núcleo de palavras de ' ||
  'alta frequência e o exercício de narração em voz alta com gravação.',
  '[
    {"title": "1. Escolha o conteúdo", "text": "Na home você vê Programação e Idiomas. Clique em Idiomas para ver e criar suas seções de idioma."},
    {"title": "2. Treine os moldes", "text": "Cada molde tem um espaço em branco. Produza 5 variações trocando esse espaço e marque quando ele já sair sem pensar."},
    {"title": "3. Use as palavras como encaixe", "text": "O núcleo de vocabulário é agrupado por função na frase — verbos e conectores primeiro, substantivo específico por último."},
    {"title": "4. Narre 5 minutos por dia", "text": "Escolha algo da sua rotina e narre em tempo real. Travou numa palavra? Fala em português e segue. O app grava e guarda para você ouvir depois."},
    {"title": "5. Peça mais pra IA", "text": "Com o MCP conectado, peça moldes e palavras de um tema específico e eles entram direto na seção."}
  ]'::jsonb
);

commit;
