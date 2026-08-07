-- Review Cards Pro — entrada de novidades da "pergunta que decide"
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de 0012_topic_decision.sql.

begin;

insert into public.changelog_entries (title, description, steps)
values (
  'A pergunta que decide',
  'Todo campo do tópico é lido com o nome do tópico já na tela — o que treina lembrar, mas ' ||
  'não treina escolher. No exercício de verdade o enunciado não cita ferramenta nenhuma. ' ||
  'Agora cada tópico pode guardar o teste binário que resolve "é caso disso ou não", no topo ' ||
  'da página, antes do ciclo de estudo.',
  '[
    {"title": "1. Escreva a pergunta", "text": "No topo do tópico, em A pergunta que decide. Binária, e respondível só lendo um enunciado — sem citar o nome do tópico. Ex: o conjunto de valores pode crescer sem recompilar?"},
    {"title": "2. Ela precisa poder dar não", "text": "Se nenhuma situação plausível responde não, aquilo é definição disfarçada, não teste. Refaça até existir um caso claro que cai fora."},
    {"title": "3. Diga o que usar no lugar", "text": "O campo Se não → pede a alternativa concreta. Não use sozinho não decide nada: o que decide é saber o que entra no lugar."},
    {"title": "4. Tópico que não é escolha fica vazio", "text": "Event loop, garbage collector, Big-O não têm rival — sem alternativa não existe teste. Deixe vazio e o painel some, em vez de inventar uma dicotomia."},
    {"title": "5. Peça pra IA preencher", "text": "Com o MCP conectado, tópicos novos já vêm com a pergunta pronta, e dá pra pedir só ela para os tópicos que você já tem."}
  ]'::jsonb
);

commit;
