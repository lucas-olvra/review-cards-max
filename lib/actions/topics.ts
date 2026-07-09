'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Card, DiscursiveQuestion, Topic, TopicWithChildren } from '@/lib/types';

export async function getTopics(): Promise<Topic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Usado pela home: cartões da grade mostram quantos cartões/discursivas cada
// tópico tem, sem carregar o conteúdo completo de cada um.
export async function getTopicsWithCounts(): Promise<(Topic & { cardsN: number; discN: number })[]> {
  const topics = await getTopics();
  if (!topics.length) return [];

  const supabase = await createClient();
  const ids = topics.map((t) => t.id);
  const [{ data: cards }, { data: discursive }] = await Promise.all([
    supabase.from('cards').select('topic_id').in('topic_id', ids),
    supabase.from('discursive_questions').select('topic_id').in('topic_id', ids),
  ]);

  const cardCounts = new Map<string, number>();
  for (const c of cards ?? []) cardCounts.set(c.topic_id, (cardCounts.get(c.topic_id) ?? 0) + 1);
  const discCounts = new Map<string, number>();
  for (const d of discursive ?? []) discCounts.set(d.topic_id, (discCounts.get(d.topic_id) ?? 0) + 1);

  return topics.map((t) => ({
    ...t,
    cardsN: cardCounts.get(t.id) ?? 0,
    discN: discCounts.get(t.id) ?? 0,
  }));
}

export async function getTopic(id: string): Promise<TopicWithChildren | null> {
  const supabase = await createClient();
  const { data: topic, error } = await supabase.from('topics').select('*').eq('id', id).single();
  if (error || !topic) return null;

  const [{ data: cards }, { data: discursive }] = await Promise.all([
    supabase.from('cards').select('*').eq('topic_id', id).order('position'),
    supabase.from('discursive_questions').select('*').eq('topic_id', id).order('position'),
  ]);

  return {
    ...(topic as Topic),
    cards: (cards ?? []) as Card[],
    discursive_questions: (discursive ?? []) as DiscursiveQuestion[],
  };
}

export async function createTopic(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const name = (formData.get('name') as string)?.trim();
  if (!name) throw new Error('Nome é obrigatório');

  const { data, error } = await supabase
    .from('topics')
    .insert({
      user_id: user.id,
      name,
      concept_what: (formData.get('concept_what') as string) ?? '',
      concept_why: (formData.get('concept_why') as string) ?? '',
      use_cases: (formData.get('use_cases') as string) ?? '',
      anti_patterns: (formData.get('anti_patterns') as string) ?? '',
      common_mistakes: (formData.get('common_mistakes') as string) ?? '',
    })
    .select('id')
    .single();
  if (error) throw error;

  revalidatePath('/topics');
  redirect(`/topics/${data.id}`);
}

// Campos editáveis individualmente pelos painéis do Hub do Tópico.
// Uma única action genérica evita repetir a mesma lógica de update por painel.
const EDITABLE_FIELDS = [
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
export type EditableTopicField = (typeof EDITABLE_FIELDS)[number];

export async function updateTopicPanel(
  topicId: string,
  fields: EditableTopicField[],
  formData: FormData
) {
  const supabase = await createClient();
  const update: Record<string, string> = {};
  for (const field of fields) {
    update[field] = (formData.get(field) as string) ?? '';
  }
  const { error } = await supabase.from('topics').update(update).eq('id', topicId);
  if (error) throw error;
  revalidatePath(`/topics/${topicId}`);
}

export async function deleteTopic(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/topics');
  redirect('/topics');
}
