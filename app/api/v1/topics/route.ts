import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, unauthorized } from '@/lib/api/auth';

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('topics')
    .select('id, name, created_at, updated_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ topics: data });
}

interface CardInput {
  question: string;
  options?: string[];
  correct?: number;
  explanation?: string;
  analogy?: string;
}

interface DiscursiveInput {
  question: string;
  model_answer?: string;
}

interface CreateTopicBody {
  name: string;
  concept_what?: string;
  concept_why?: string;
  code?: string;
  use_cases?: string;
  anti_patterns?: string;
  common_mistakes?: string;
  exercise_prompt?: string;
  exercise_solution?: string;
  pitch?: string;
  cards?: CardInput[];
  discursive?: DiscursiveInput[];
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();

  let body: CreateTopicBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição precisa ser JSON válido.' }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return Response.json({ error: 'O campo "name" é obrigatório.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .insert({
      user_id: auth.userId,
      name: body.name,
      concept_what: body.concept_what ?? '',
      concept_why: body.concept_why ?? '',
      code: body.code ?? '',
      use_cases: body.use_cases ?? '',
      anti_patterns: body.anti_patterns ?? '',
      common_mistakes: body.common_mistakes ?? '',
      exercise_prompt: body.exercise_prompt ?? '',
      exercise_solution: body.exercise_solution ?? '',
      pitch: body.pitch ?? '',
    })
    .select('id')
    .single();

  if (topicError || !topic) {
    return Response.json(
      { error: topicError?.message ?? 'Falha ao criar tópico.' },
      { status: 500 }
    );
  }

  const cards = (body.cards ?? []).map((c, idx) => ({
    topic_id: topic.id,
    question: c.question ?? '',
    options: c.options ?? ['', '', '', ''],
    correct: c.correct ?? 0,
    explanation: c.explanation ?? '',
    analogy: c.analogy ?? '',
    position: idx,
  }));
  if (cards.length) await supabase.from('cards').insert(cards);

  const discursive = (body.discursive ?? []).map((d, idx) => ({
    topic_id: topic.id,
    question: d.question ?? '',
    model_answer: d.model_answer ?? '',
    position: idx,
  }));
  if (discursive.length) await supabase.from('discursive_questions').insert(discursive);

  return Response.json({ id: topic.id }, { status: 201 });
}
