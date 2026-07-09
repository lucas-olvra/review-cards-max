'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CardInput = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  analogy: string;
};

export async function createCard(topicId: string, input: CardInput) {
  const supabase = await createClient();
  const { count } = await supabase
    .from('cards')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId);

  const { error } = await supabase.from('cards').insert({
    topic_id: topicId,
    ...input,
    position: count ?? 0,
  });
  if (error) throw error;
  revalidatePath(`/topics/${topicId}`);
}

export async function updateCard(id: string, topicId: string, input: CardInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('cards').update(input).eq('id', id);
  if (error) throw error;
  revalidatePath(`/topics/${topicId}`);
}

export async function deleteCard(id: string, topicId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw error;
  revalidatePath(`/topics/${topicId}`);
}
