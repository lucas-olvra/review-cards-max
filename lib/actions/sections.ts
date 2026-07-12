'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Section, SectionKind, LanguageCode } from '@/lib/types';

export async function getSections(): Promise<Section[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Usado na home: cada card de seção mostra quantos tópicos ela tem (Fase 8
// vai somar lições também). Mesma forma de getTopicsWithCounts.
export async function getSectionsWithCounts(): Promise<(Section & { itemsN: number })[]> {
  const sections = await getSections();
  if (!sections.length) return [];

  const supabase = await createClient();
  const ids = sections.map((s) => s.id);
  const { data: topics } = await supabase.from('topics').select('section_id').in('section_id', ids);

  const counts = new Map<string, number>();
  for (const t of topics ?? []) counts.set(t.section_id, (counts.get(t.section_id) ?? 0) + 1);

  return sections.map((s) => ({ ...s, itemsN: counts.get(s.id) ?? 0 }));
}

export async function getSection(id: string): Promise<Section | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sections').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Section;
}

export async function createSection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const name = (formData.get('name') as string)?.trim();
  if (!name) throw new Error('Nome é obrigatório');

  const kind = (formData.get('kind') as SectionKind) || 'programming';
  const language = kind === 'language' ? ((formData.get('language') as LanguageCode) || null) : null;

  const { data, error } = await supabase
    .from('sections')
    .insert({ user_id: user.id, name, kind, language })
    .select('id')
    .single();
  if (error) throw error;

  revalidatePath('/sections');
  redirect(`/sections/${data.id}`);
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sections').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/sections');
  redirect('/sections');
}
