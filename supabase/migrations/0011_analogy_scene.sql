-- Review Cards Pro — cena editável da analogia visual (Excalidraw)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0010_changelog_contrastes.sql.

begin;

-- A analogia passa a ter duas camadas com papéis distintos:
--
--   analogy_diagram (já existia) — o que a IA gerou, em formato estruturado
--     (formas + setas). Continua sendo o que a tool MCP set_topic_analogy
--     escreve, e o que o app desenha como SVG somente-leitura.
--
--   analogy_scene (esta coluna) — a cena do Excalidraw que o usuário edita.
--     Guarda os elementos no formato do próprio Excalidraw. É onde o usuário
--     copia o diagrama da IA pra mexer, ou redesenha do zero.
--
-- São separadas de propósito: se fossem a mesma coluna, pedir uma analogia
-- nova pra IA apagaria o desenho do usuário sem aviso.
alter table public.topics
  add column if not exists analogy_scene jsonb not null default '[]'::jsonb;

-- `analogy_drawing` (traços do canvas antigo) fica no banco de propósito: o
-- app não escreve mais nela, mas os desenhos antigos são convertidos para a
-- cena do Excalidraw na primeira abertura, e a coluna serve de backup caso a
-- conversão saia errada.
comment on column public.topics.analogy_drawing is
  'Obsoleto desde 0011 — traços do canvas de desenho livre anterior ao Excalidraw. Mantido como backup; a UI lê e converte para analogy_scene.';

commit;
