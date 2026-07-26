'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { LanguageItem, LanguageItemKind, NarrationSession } from '@/lib/types';

export async function getLanguageItems(sectionId: string): Promise<LanguageItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('language_items')
    .select('*')
    .eq('section_id', sectionId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Chaves dos itens que o usuário já marcou como "sai sem pensar". Vem como Set
// porque a interface consulta item a item enquanto renderiza as listas.
export async function getMasteredKeys(sectionId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('language_progress')
    .select('item_key')
    .eq('section_id', sectionId)
    .eq('mastered', true);
  if (error) throw error;
  return (data ?? []).map((row) => row.item_key);
}

export async function setMastered(sectionId: string, itemKey: string, mastered: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { error } = await supabase.from('language_progress').upsert(
    {
      user_id: user.id,
      section_id: sectionId,
      item_key: itemKey,
      mastered,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'section_id,item_key' }
  );
  if (error) throw error;
  revalidatePath(`/sections/${sectionId}`);
}

export async function addLanguageItem(sectionId: string, kind: LanguageItemKind, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const term = (formData.get('term') as string)?.trim();
  if (!term) throw new Error('O termo é obrigatório');

  const examplesRaw = ((formData.get('examples') as string) ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const { error } = await supabase.from('language_items').insert({
    user_id: user.id,
    section_id: sectionId,
    kind,
    term,
    meaning: ((formData.get('meaning') as string) ?? '').trim(),
    examples: examplesRaw,
    category: ((formData.get('category') as string) ?? '').trim(),
    source: 'manual',
  });
  if (error) throw error;
  revalidatePath(`/sections/${sectionId}`);
}

export async function deleteLanguageItem(sectionId: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('language_items').delete().eq('id', id);
  if (error) throw error;
  revalidatePath(`/sections/${sectionId}`);
}

export async function getNarrationSessions(sectionId: string): Promise<NarrationSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('narration_sessions')
    .select('*')
    .eq('section_id', sectionId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// O áudio é enviado pelo navegador direto pro Storage (evita o limite de corpo
// das Server Actions); esta action só registra a sessão depois que o upload
// terminou. `audioPath` chega nulo quando o usuário narrou sem gravar.
export async function createNarrationSession(input: {
  sectionId: string;
  prompt: string;
  durationSeconds: number;
  audioPath: string | null;
  notes: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { error } = await supabase.from('narration_sessions').insert({
    user_id: user.id,
    section_id: input.sectionId,
    prompt: input.prompt,
    duration_seconds: Math.max(0, Math.round(input.durationSeconds)),
    audio_path: input.audioPath,
    notes: input.notes,
  });
  if (error) throw error;
  revalidatePath(`/sections/${input.sectionId}`);
}

export async function deleteNarrationSession(sectionId: string, id: string) {
  const supabase = await createClient();
  const { data: session } = await supabase
    .from('narration_sessions')
    .select('audio_path')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('narration_sessions').delete().eq('id', id);
  if (error) throw error;

  if (session?.audio_path) {
    await supabase.storage.from('narrations').remove([session.audio_path]);
  }
  revalidatePath(`/sections/${sectionId}`);
}

// O bucket é privado, então tocar um áudio antigo exige uma URL assinada na
// hora. Uma hora é folga suficiente pra sessão de escuta sem deixar o link
// utilizável se vazar depois.
export async function getNarrationAudioUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from('narrations').createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}

