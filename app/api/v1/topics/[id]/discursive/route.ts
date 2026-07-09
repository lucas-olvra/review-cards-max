import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, unauthorized } from '@/lib/api/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: topic } = await supabase
    .from('topics')
    .select('id')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .single();
  if (!topic) return Response.json({ error: 'Tópico não encontrado.' }, { status: 404 });

  let body: { question: string; model_answer?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição precisa ser JSON válido.' }, { status: 400 });
  }
  if (!body.question?.trim()) {
    return Response.json({ error: 'O campo "question" é obrigatório.' }, { status: 400 });
  }

  const { count } = await supabase
    .from('discursive_questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', id);

  const { data, error } = await supabase
    .from('discursive_questions')
    .insert({
      topic_id: id,
      question: body.question,
      model_answer: body.model_answer ?? '',
      position: count ?? 0,
    })
    .select('id')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ id: data.id }, { status: 201 });
}
