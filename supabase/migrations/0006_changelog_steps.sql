-- Review Cards Pro — passo-a-passo interativo nas novidades
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0005_changelog.sql.

begin;

-- Passos opcionais de uma entrada de changelog, ex:
-- [{"title": "1. Instale o servidor local", "text": "cd mcp-server && npm install && npm run build"}, ...]
-- Null/vazio = a entrada mostra só o `description` de sempre, sem carrossel.
alter table public.changelog_entries add column if not exists steps jsonb;

commit;
