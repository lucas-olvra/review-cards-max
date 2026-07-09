import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, unauthorized } from '@/lib/api/auth';

const ALLOWED_UPDATE_FIELDS = [
  'name',
  'concept_what',
  'concept_why',
  'code',
  'use_cases',
  'anti_patterns',
  'common_mistakes',
  'exercise_prompt',
  'exercise_solution',
  'pitch',
] as const;

async function getOwnedTopic(
  supabase: ReturnType<typeof createAdminClient>,
  id: string,
  userId: string
) {
  const { data } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  return data;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  const supabase = createAdminClient();
  const topic = await getOwnedTopic(supabase, id, auth.userId);
  if (!topic) return Response.json({ error: 'Tópico não encontrado.' }, { status: 404 });

  const [{ data: cards }, { data: discursive }] = await Promise.all([
    supabase.from('cards').select('*').eq('topic_id', id).order('position'),
    supabase.from('discursive_questions').select('*').eq('topic_id', id).order('position'),
  ]);

  return Response.json({ ...topic, cards: cards ?? [], discursive: discursive ?? [] });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  const supabase = createAdminClient();
  const topic = await getOwnedTopic(supabase, id, auth.userId);
  if (!topic) return Response.json({ error: 'Tópico não encontrado.' }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição precisa ser JSON válido.' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in body) update[field] = body[field];
  }

  const { error } = await supabase.from('topics').update(update).eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  const supabase = createAdminClient();
  const topic = await getOwnedTopic(supabase, id, auth.userId);
  if (!topic) return Response.json({ error: 'Tópico não encontrado.' }, { status: 404 });

  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
