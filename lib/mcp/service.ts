// Lógica de negócio compartilhada entre app/api/v1/** (REST, usado pelo
// mcp-server local via stdio) e app/api/mcp (servidor MCP remoto via HTTP,
// no mesmo processo Next.js) — fonte única de verdade para as duas formas
// de um cliente de IA operar tópicos.
import { createAdminClient } from '@/lib/supabase/admin';

export class NotFoundError extends Error {}
export class ValidationError extends Error {}

export interface CardInput {
  question: string;
  options?: string[];
  correct?: number;
  explanation?: string;
  analogy?: string;
}

export interface DiscursiveInput {
  question: string;
  model_answer?: string;
}

export interface AnalogyShapeInput {
  id: string;
  type: 'box' | 'circle' | 'text';
  x: number;
  y: number;
  w?: number;
  h?: number;
  text?: string;
  color?: string;
}

export interface AnalogyArrowInput {
  from: string;
  to: string;
  label?: string;
}

export interface SectionInput {
  name: string;
  kind?: 'programming' | 'language';
  language?: 'en' | 'es' | 'fr' | 'it' | 'de';
}

export interface TopicFields {
  name?: string;
  section_id?: string;
  section_name?: string;
  concept_what?: string;
  concept_why?: string;
  code?: string;
  use_cases?: string;
  anti_patterns?: string;
  common_mistakes?: string;
  exercise_prompt?: string;
  exercise_solution?: string;
  pitch?: string;
  analogy_caption?: string;
  analogy_diagram?: { shapes?: AnalogyShapeInput[]; arrows?: AnalogyArrowInput[] };
}

export interface CreateTopicInput extends TopicFields {
  name: string;
  cards?: CardInput[];
  discursive?: DiscursiveInput[];
}

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
  'analogy_caption',
  'analogy_diagram',
] as const satisfies readonly (keyof TopicFields)[];

// Garante shapes/arrows sempre presentes (zod só valida os campos que vêm,
// então `analogy_diagram: {shapes: [...]}` sem "arrows" é uma entrada válida
// vinda da IA) — sem isso, `diagram.arrows.map(...)` quebraria na renderização.
function normalizeAnalogyDiagram(diagram?: TopicFields['analogy_diagram']) {
  return { shapes: diagram?.shapes ?? [], arrows: diagram?.arrows ?? [] };
}

async function getOwnedTopic(
  supabase: ReturnType<typeof createAdminClient>,
  id: string,
  userId: string
) {
  const { data } = await supabase.from('topics').select('*').eq('id', id).eq('user_id', userId).single();
  if (!data) throw new NotFoundError('Tópico não encontrado.');
  return data;
}

async function getOwnedSection(
  supabase: ReturnType<typeof createAdminClient>,
  id: string,
  userId: string
) {
  const { data } = await supabase.from('sections').select('*').eq('id', id).eq('user_id', userId).single();
  if (!data) throw new NotFoundError('Seção não encontrada.');
  return data;
}

export async function listSections(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('sections')
    .select('id, name, kind, language, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createSection(userId: string, input: SectionInput) {
  if (!input.name?.trim()) throw new ValidationError('O campo "name" é obrigatório.');
  const kind = input.kind ?? 'programming';
  if (kind === 'language' && !input.language) {
    throw new ValidationError('Seções de idioma precisam do campo "language".');
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('sections')
    .insert({ user_id: userId, name: input.name, kind, language: kind === 'language' ? input.language : null })
    .select('id')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar seção.');
  return { id: data.id as string };
}

async function getOrCreateSectionByName(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  name: string,
  kind: 'programming' | 'language' = 'programming'
) {
  const { data: existing } = await supabase
    .from('sections')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('kind', kind)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from('sections')
    .insert({ user_id: userId, name, kind })
    .select('id')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar seção.');
  return data.id as string;
}

// Resolve qual seção um tópico deve usar, a partir de section_id/section_name
// opcionais vindos da IA. Se nenhum for informado: usa a única seção
// kind='programming' do usuário (cria "Programação" se não existir nenhuma),
// ou pede pra IA desambiguar se houver mais de uma.
async function resolveSectionId(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  { section_id, section_name }: Pick<TopicFields, 'section_id' | 'section_name'>
): Promise<string> {
  if (section_id) {
    const section = await getOwnedSection(supabase, section_id, userId);
    if (section.kind !== 'programming') {
      throw new ValidationError('section_id precisa apontar para uma seção do tipo "programming".');
    }
    return section_id;
  }
  if (section_name) return getOrCreateSectionByName(supabase, userId, section_name, 'programming');

  const { data: candidates } = await supabase
    .from('sections')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', 'programming');

  if (candidates && candidates.length === 1) return candidates[0].id as string;
  if (candidates && candidates.length > 1) {
    throw new ValidationError(
      'Existe mais de uma seção de programação — informe "section_id" ou "section_name" pra escolher qual usar.'
    );
  }
  return getOrCreateSectionByName(supabase, userId, 'Programação', 'programming');
}

export async function listTopics(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('topics')
    .select('id, name, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createTopic(userId: string, input: CreateTopicInput) {
  if (!input.name?.trim()) throw new ValidationError('O campo "name" é obrigatório.');

  const supabase = createAdminClient();
  const sectionId = await resolveSectionId(supabase, userId, input);
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .insert({
      user_id: userId,
      section_id: sectionId,
      name: input.name,
      concept_what: input.concept_what ?? '',
      concept_why: input.concept_why ?? '',
      code: input.code ?? '',
      use_cases: input.use_cases ?? '',
      anti_patterns: input.anti_patterns ?? '',
      common_mistakes: input.common_mistakes ?? '',
      exercise_prompt: input.exercise_prompt ?? '',
      exercise_solution: input.exercise_solution ?? '',
      pitch: input.pitch ?? '',
      analogy_caption: input.analogy_caption ?? '',
      analogy_diagram: normalizeAnalogyDiagram(input.analogy_diagram),
    })
    .select('id')
    .single();

  if (topicError || !topic) throw new Error(topicError?.message ?? 'Falha ao criar tópico.');

  const cards = (input.cards ?? []).map((c, idx) => ({
    topic_id: topic.id,
    question: c.question ?? '',
    options: c.options ?? ['', '', '', ''],
    correct: c.correct ?? 0,
    explanation: c.explanation ?? '',
    analogy: c.analogy ?? '',
    position: idx,
  }));
  if (cards.length) await supabase.from('cards').insert(cards);

  const discursive = (input.discursive ?? []).map((d, idx) => ({
    topic_id: topic.id,
    question: d.question ?? '',
    model_answer: d.model_answer ?? '',
    position: idx,
  }));
  if (discursive.length) await supabase.from('discursive_questions').insert(discursive);

  return { id: topic.id as string };
}

export async function getTopic(userId: string, id: string) {
  const supabase = createAdminClient();
  const topic = await getOwnedTopic(supabase, id, userId);

  const [{ data: cards }, { data: discursive }] = await Promise.all([
    supabase.from('cards').select('*').eq('topic_id', id).order('position'),
    supabase.from('discursive_questions').select('*').eq('topic_id', id).order('position'),
  ]);

  return { ...topic, cards: cards ?? [], discursive: discursive ?? [] };
}

export async function updateTopic(userId: string, id: string, fields: Record<string, unknown>) {
  const supabase = createAdminClient();
  await getOwnedTopic(supabase, id, userId);

  const update: Record<string, unknown> = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in fields) update[field] = fields[field];
  }
  if ('analogy_diagram' in update) {
    update.analogy_diagram = normalizeAnalogyDiagram(
      update.analogy_diagram as TopicFields['analogy_diagram']
    );
  }
  if ('section_id' in fields || 'section_name' in fields) {
    update.section_id = await resolveSectionId(supabase, userId, fields as Pick<TopicFields, 'section_id' | 'section_name'>);
  }

  const { error } = await supabase.from('topics').update(update).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteTopic(userId: string, id: string) {
  const supabase = createAdminClient();
  await getOwnedTopic(supabase, id, userId);

  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addCard(userId: string, topicId: string, card: CardInput) {
  if (!card.question?.trim()) throw new ValidationError('O campo "question" é obrigatório.');

  const supabase = createAdminClient();
  await getOwnedTopic(supabase, topicId, userId);

  const { count } = await supabase
    .from('cards')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId);

  const { data, error } = await supabase
    .from('cards')
    .insert({
      topic_id: topicId,
      question: card.question,
      options: card.options ?? ['', '', '', ''],
      correct: card.correct ?? 0,
      explanation: card.explanation ?? '',
      analogy: card.analogy ?? '',
      position: count ?? 0,
    })
    .select('id')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar cartão.');
  return { id: data.id as string };
}

export async function addDiscursive(userId: string, topicId: string, item: DiscursiveInput) {
  if (!item.question?.trim()) throw new ValidationError('O campo "question" é obrigatório.');

  const supabase = createAdminClient();
  await getOwnedTopic(supabase, topicId, userId);

  const { count } = await supabase
    .from('discursive_questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId);

  const { data, error } = await supabase
    .from('discursive_questions')
    .insert({
      topic_id: topicId,
      question: item.question,
      model_answer: item.model_answer ?? '',
      position: count ?? 0,
    })
    .select('id')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar pergunta discursiva.');
  return { id: data.id as string };
}
