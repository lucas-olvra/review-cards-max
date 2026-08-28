'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  DAILY_CAP,
  LADDER,
  nextSchedule,
  overdueDays,
  passedByScore,
  resolveRung,
  rungOf,
  type ReviewMode,
  type Rung,
  type TopicCaps,
} from '@/lib/review/ladder';

// O que o runner mostra no fim da sessão. Devolver isso é metade do ponto da
// feature: a pessoa fecha a revisão já sabendo quando o tópico volta e o que
// ele vai cobrar da próxima vez, em vez de ter que decidir isso sozinha.
export interface ReviewOutcome {
  passed: boolean;
  /** Se a sessão realmente rebaixou o tópico. Falhar no primeiro degrau
   *  antecipa a volta sem descer nada — não há degrau abaixo dele. */
  demoted: boolean;
  /** Dias até a próxima revisão. 1 = amanhã. */
  days: number;
  /** Modalidade que a próxima revisão vai cobrar. */
  nextTitle: string;
  nextIcon: string;
  nextColor: string;
}

async function topicCaps(
  supabase: Awaited<ReturnType<typeof createClient>>,
  topicId: string,
  exercisePrompt: string
): Promise<TopicCaps> {
  const [cards, discursive, contrasts] = await Promise.all([
    supabase.from('cards').select('id', { count: 'exact', head: true }).eq('topic_id', topicId),
    supabase
      .from('discursive_questions')
      .select('id', { count: 'exact', head: true })
      .eq('topic_id', topicId),
    supabase
      .from('topic_contrasts')
      .select('id', { count: 'exact', head: true })
      .or(`topic_a.eq.${topicId},topic_b.eq.${topicId}`),
  ]);
  return {
    cardsN: cards.count ?? 0,
    discN: discursive.count ?? 0,
    contrastsN: contrasts.count ?? 0,
    hasExercise: Boolean(exercisePrompt?.trim()),
  };
}

// Registra uma sessão de revisão e reagenda o tópico. Chamada pelos runners no
// fim da sessão — inclusive quando a revisão foi aberta pela página do tópico e
// não pela fila de hoje: revisão é revisão, e o app não tinha como saber disso
// até agora.
export async function recordReview(
  topicId: string,
  mode: ReviewMode,
  hits: number,
  total: number
): Promise<ReviewOutcome | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  // A RLS já limita a leitura aos tópicos do usuário; sem linha aqui, não há o
  // que agendar.
  const { data: topic } = await supabase
    .from('topics')
    .select('id, review_step, due_at, exercise_prompt')
    .eq('id', topicId)
    .single();
  if (!topic) return null;

  const rung = rungOf(mode);
  const passed = passedByScore(hits, total);
  const stepBefore = topic.review_step as number;

  const next = nextSchedule({
    step: stepBefore,
    rung,
    passed,
    dueAt: new Date(topic.due_at as string),
  });

  const { error: insertError } = await supabase.from('topic_reviews').insert({
    user_id: user.id,
    topic_id: topicId,
    mode,
    rung,
    hits,
    total,
    passed,
    step_before: stepBefore,
    step_after: next.step,
  });
  if (insertError) throw insertError;

  const { error } = await supabase
    .from('topics')
    .update({ review_step: next.step, due_at: next.dueAt.toISOString() })
    .eq('id', topicId);
  if (error) throw error;

  revalidatePath('/today');
  revalidatePath(`/topics/${topicId}`);

  const caps = await topicCaps(supabase, topicId, topic.exercise_prompt as string);
  const nextRung = LADDER[resolveRung(next.step, caps)];
  const days = Math.max(
    1,
    Math.round((next.dueAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  );

  return {
    passed,
    demoted: next.step < stepBefore,
    days,
    nextTitle: nextRung.title,
    nextIcon: nextRung.icon,
    nextColor: nextRung.color,
  };
}

export interface TodayItem {
  topicId: string;
  topicName: string;
  sectionId: string;
  sectionName: string;
  rung: Rung;
  rungIndex: number;
  /** Quantos dias o tópico está atrasado. 0 = vence hoje. */
  overdue: number;
  href: string;
}

export interface TodayQueue {
  items: TodayItem[];
  /** Vencidos que ficaram de fora pelo teto diário. */
  waiting: number;
  /** Quando o próximo tópico vence, quando não há nada vencido hoje. */
  nextDueAt: string | null;
  /** Total de tópicos do usuário — separa "fila vazia" de "app vazio". */
  totalTopics: number;
}

function hrefFor(mode: ReviewMode, topicId: string, sectionId: string): string {
  const from = encodeURIComponent('/today');
  switch (mode) {
    case 'cards':
      return `/topics/${topicId}/review?from=${from}`;
    case 'discursive':
      return `/topics/${topicId}/review-discursive?from=${from}`;
    case 'practice':
      return `/topics/${topicId}/practice?from=${from}`;
    // O treino de discriminação é da seção inteira, mas quem chega pela fila
    // está revisando UM tópico: `topic` recorta os cenários para os contrastes
    // dele e diz contra quem a sessão será registrada.
    case 'discriminate':
      return `/sections/${sectionId}/discriminate?topic=${topicId}&from=${from}`;
    default:
      return `/topics/${topicId}/pitch?from=${from}`;
  }
}

// A fila do dia: o que venceu, na modalidade certa, já ordenado e cortado no
// teto. É a tela que responde "o que eu reviso hoje" sem exigir nenhuma decisão
// de quem chega.
export async function getTodayQueue(): Promise<TodayQueue> {
  const supabase = await createClient();
  const now = new Date();

  const { count: totalTopics } = await supabase
    .from('topics')
    .select('id', { count: 'exact', head: true });

  const { data: due, error } = await supabase
    .from('topics')
    .select('id, name, section_id, review_step, due_at, exercise_prompt')
    .lte('due_at', now.toISOString())
    .order('due_at', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;

  const rows = due ?? [];

  if (!rows.length) {
    const { data: upcoming } = await supabase
      .from('topics')
      .select('due_at')
      .order('due_at', { ascending: true })
      .limit(1);
    return {
      items: [],
      waiting: 0,
      nextDueAt: (upcoming?.[0]?.due_at as string) ?? null,
      totalTopics: totalTopics ?? 0,
    };
  }

  // Só o topo da fila precisa do material contado: o teto corta o resto de
  // qualquer jeito. Uma folga sobre o teto cobre a margem.
  const head = rows.slice(0, DAILY_CAP * 3);
  const ids = head.map((t) => t.id as string);
  const idList = ids.join(',');
  const sectionIds = [...new Set(head.map((t) => t.section_id as string))];

  const [{ data: cards }, { data: discursive }, { data: contrasts }, { data: sections }] =
    await Promise.all([
      supabase.from('cards').select('topic_id').in('topic_id', ids),
      supabase.from('discursive_questions').select('topic_id').in('topic_id', ids),
      supabase
        .from('topic_contrasts')
        .select('topic_a, topic_b')
        .or(`topic_a.in.(${idList}),topic_b.in.(${idList})`),
      supabase.from('sections').select('id, name').in('id', sectionIds),
    ]);

  const cardCounts = new Map<string, number>();
  for (const c of cards ?? []) cardCounts.set(c.topic_id, (cardCounts.get(c.topic_id) ?? 0) + 1);
  const discCounts = new Map<string, number>();
  for (const d of discursive ?? []) discCounts.set(d.topic_id, (discCounts.get(d.topic_id) ?? 0) + 1);

  // O `or` acima traz o par inteiro, inclusive o lado que não está na fila —
  // por isso o contador só soma o lado que é candidato de hoje.
  const candidates = new Set(ids);
  const contrastCounts = new Map<string, number>();
  for (const c of contrasts ?? []) {
    for (const side of [c.topic_a as string, c.topic_b as string]) {
      if (candidates.has(side)) contrastCounts.set(side, (contrastCounts.get(side) ?? 0) + 1);
    }
  }

  const sectionNames = new Map((sections ?? []).map((s) => [s.id as string, s.name as string]));

  const items: TodayItem[] = head.slice(0, DAILY_CAP).map((t) => {
    const topicId = t.id as string;
    const sectionId = t.section_id as string;
    const caps: TopicCaps = {
      cardsN: cardCounts.get(topicId) ?? 0,
      discN: discCounts.get(topicId) ?? 0,
      contrastsN: contrastCounts.get(topicId) ?? 0,
      hasExercise: Boolean((t.exercise_prompt as string)?.trim()),
    };
    const rungIndex = resolveRung(t.review_step as number, caps);
    const rung = LADDER[rungIndex];
    return {
      topicId,
      topicName: t.name as string,
      sectionId,
      sectionName: sectionNames.get(sectionId) ?? '',
      rung,
      rungIndex,
      overdue: overdueDays(new Date(t.due_at as string), now),
      href: hrefFor(rung.mode, topicId, sectionId),
    };
  });

  return {
    items,
    waiting: Math.max(0, rows.length - items.length),
    nextDueAt: null,
    totalTopics: totalTopics ?? 0,
  };
}

// Usado só pelo contador do header — mais barato que montar a fila inteira. O
// número é capado no teto porque é isso que a fila vai realmente oferecer.
export async function countDueToday(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('topics')
    .select('id', { count: 'exact', head: true })
    .lte('due_at', new Date().toISOString());
  return Math.min(count ?? 0, DAILY_CAP);
}
