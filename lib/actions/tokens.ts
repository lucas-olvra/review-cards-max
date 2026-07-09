'use server';

import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { hashToken } from '@/lib/api/auth';
import { revalidatePath } from 'next/cache';

export interface ApiTokenSummary {
  id: string;
  name: string;
  token_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export async function getTokens(): Promise<ApiTokenSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('api_tokens')
    .select('id, name, token_prefix, created_at, last_used_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createToken(name: string): Promise<{ token: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('Nome é obrigatório');

  const raw = `rcp_${randomBytes(24).toString('base64url')}`;

  const { error } = await supabase.from('api_tokens').insert({
    user_id: user.id,
    name: trimmedName,
    token_hash: hashToken(raw),
    token_prefix: raw.slice(0, 12),
  });
  if (error) throw error;

  revalidatePath('/settings/tokens');
  return { token: raw };
}

export async function deleteToken(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('api_tokens').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/settings/tokens');
}
