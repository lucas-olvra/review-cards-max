-- Review Cards Pro — analogia visual por tópico
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0002_api_tokens.sql.

alter table public.topics
  add column if not exists analogy_caption text not null default '',
  add column if not exists analogy_diagram jsonb not null default '{"shapes":[],"arrows":[]}'::jsonb,
  add column if not exists analogy_drawing jsonb not null default '[]'::jsonb;
