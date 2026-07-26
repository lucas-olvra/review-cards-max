import type { NarrationSession } from '@/lib/types';

export interface NarrationStats {
  totalSessions: number;
  totalMinutes: number;
  streakDays: number;
  narratedToday: boolean;
}

// Streak conta dias-calendário consecutivos com pelo menos uma narração,
// terminando em hoje ou ontem — narrar duas vezes no mesmo dia não adianta
// nada, e o dia de ontem só quebra a sequência depois que hoje acabar.
export function computeNarrationStats(sessions: NarrationSession[]): NarrationStats {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
  const days = new Set(sessions.map((s) => new Date(s.created_at).toLocaleDateString('en-CA')));

  const today = new Date().toLocaleDateString('en-CA');
  const cursor = new Date();
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(cursor.toLocaleDateString('en-CA'))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalSessions: sessions.length,
    totalMinutes: Math.round(totalSeconds / 60),
    streakDays: streak,
    narratedToday: days.has(today),
  };
}
