'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type DiscursiveInput = {
  question: string;
  model_answer: string;
};

export async function createDiscursive(topicId: string, input: DiscursiveInput) {
  const supabase = await createClient();
  const { count } = await supabase
    .from('discursive_questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId);

  const { error } = await supabase.from('discursive_questions').insert({
    topic_id: topicId,
    ...input,
    position: count ?? 0,
  });
  if (error) throw error;
  revalidatePath(`/topics/${topicId}`);
}

export async function updateDiscursive(id: string, topicId: string, input: DiscursiveInput) {
  const supabase = await createClient();
  const { error } = await supabase.from('discursive_questions').update(input).eq('id', id);
  if (error) throw error;
  revalidatePath(`/topics/${topicId}`);
}

export async function deleteDiscursive(id: string, topicId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('discursive_questions').delete().eq('id', id);
  if (error) throw error;
  revalidatePath(`/topics/${topicId}`);
}
