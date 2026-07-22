'use server';

import { createClient } from '@/lib/supabase/server';
import type { ChangelogEntry } from '@/lib/types';

// Busca (ou cria, na primeira visita) a configuração do usuário e retorna só
// as entradas de changelog publicadas depois da última vez que ele viu o
// modal — criar a linha com `now()` na primeira visita evita jogar um
// backlog inteiro de novidades antigas em cima de um usuário novo.
export async function getUnseenChangelog(): Promise<ChangelogEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let { data: settings } = await supabase
    .from('user_settings')
    .select('last_seen_changelog_at')
    .eq('user_id', user.id)
    .single();

  if (!settings) {
    const { data: created } = await supabase
      .from('user_settings')
      .insert({ user_id: user.id })
      .select('last_seen_changelog_at')
      .single();
    settings = created;
  }
  if (!settings) return [];

  const { data: entries, error } = await supabase
    .from('changelog_entries')
    .select('*')
    .gt('created_at', settings.last_seen_changelog_at)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return entries ?? [];
}

export async function markChangelogSeen() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, last_seen_changelog_at: new Date().toISOString() });
  if (error) throw error;
}
