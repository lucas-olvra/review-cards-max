'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  addMinutes,
  capGrade,
  DAILY_CAP,
  DEFAULT_RETRY_MINUTES,
  LADDER,
  nextSchedule,
  overdueDays,
  resolveRung,
  rungOf,
  type Grade,
  type ReviewMode,
  type Rung,
  type TopicCaps,
} from '@/lib/review/ladder';

// O que o runner mostra no fim da sessão. Devolver isso é metade do ponto da
// feature: a pessoa fecha a revisão já sabendo quando o tópico volta e o que
// ele vai cobrar da próxima vez, em vez de ter que decidir isso sozinha.
export interface ReviewInput {
  mode: ReviewMode;
  hits: number;
  total: number;
  grade: Grade;
  /** Se a dica foi aberta no meio da tentativa. Limita o grau a "Difícil". */
  usedHint: boolean;
}

export interface ReviewOutcome {
  /** Grau já com o teto da dica aplicado — pode ser menor que o escolhido. */
  grade: Grade;
  /** O teto da dica realmente rebaixou o grau escolhido. */
  cappedByHint: boolean;
  /** Sessão de repescagem: registrou, mas não mexeu na escada. */
  isRetry: boolean;
  /** Se a sessão realmente rebaixou o tópico. Errar no primeiro degrau
   *  antecipa a volta sem descer nada — não há degrau abaixo dele. */
  demoted: boolean;
  /** Dias até a próxima revisão agendada. 1 = amanhã. */
  days: number;
  /** Minutos até a repescagem, quando existe uma. */
  retryMinutes: number | null;
  /** Modalidade que a próxima revisão vai cobrar. */
  nextTitle: string;
  nextIcon: string;
  nextColor: string;
}

type Client = Awaited<ReturnType<typeof createClient>>;

async function topicCaps(
  supabase: Client,
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

function daysUntil(date: Date, now: Date): number {
  return Math.max(1, Math.round((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
}

// Registra uma sessão e reagenda o tópico. Chamada pelos runners no fim da
// sessão — inclusive quando a revisão foi aberta pela página do tópico e não
// pela fila: revisão é revisão, e o app não tinha como saber disso até o 0014.
export async function recordReview(
  topicId: string,
  { mode, hits, total, grade: chosen, usedHint }: ReviewInput
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
    .select('id, review_step, due_at, retry_at, interval_days, exercise_prompt')
    .eq('id', topicId)
    .single();
  if (!topic) return null;

  const now = new Date();
  const rung = rungOf(mode);
  const stepBefore = topic.review_step as number;
  // O teto da dica é reaplicado aqui de propósito: a interface já desabilita
  // "Bom" e "Fácil", mas uma server action é alcançável por POST direto.
  const grade = capGrade(chosen, usedHint);
  const dueAt = new Date(topic.due_at as string);

  // Repescagem é toda sessão que acontece com uma pendente e com a revisão de
  // verdade ainda no futuro. Ela registra e devolve outra chance, mas não toca
  // em degrau nem em vencimento: acertar 40 minutos depois de reler prova que
  // você recodificou, não que fixou — voltar amanhã num degrau mais fácil
  // continua sendo o tratamento certo.
  const isRetry = topic.retry_at !== null && dueAt > now;

  const next = isRetry
    ? {
        step: stepBefore,
        dueAt,
        intervalDays: topic.interval_days as number,
        retryAt: grade === 'again' ? addMinutes(now, DEFAULT_RETRY_MINUTES) : null,
      }
    : nextSchedule({
        step: stepBefore,
        rung,
        grade,
        dueAt,
        intervalDays: topic.interval_days as number,
        now,
      });

  const { error: insertError } = await supabase.from('topic_reviews').insert({
    user_id: user.id,
    topic_id: topicId,
    mode,
    rung,
    hits,
    total,
    grade,
    passed: grade !== 'again',
    is_retry: isRetry,
    used_hint: usedHint,
    step_before: stepBefore,
    step_after: next.step,
  });
  if (insertError) throw insertError;

  const { error } = await supabase
    .from('topics')
    .update({
      review_step: next.step,
      due_at: next.dueAt.toISOString(),
      interval_days: next.intervalDays,
      retry_at: next.retryAt?.toISOString() ?? null,
    })
    .eq('id', topicId);
  if (error) throw error;

  revalidatePath('/today');
  revalidatePath(`/topics/${topicId}`);

  const caps = await topicCaps(supabase, topicId, topic.exercise_prompt as string);
  const nextRung = LADDER[resolveRung(next.step, caps)];

  return {
    grade,
    cappedByHint: grade !== chosen,
    isRetry,
    demoted: next.step < stepBefore,
    days: daysUntil(next.dueAt, now),
    retryMinutes: next.retryAt
      ? Math.max(1, Math.round((next.retryAt.getTime() - now.getTime()) / 60000))
      : null,
    nextTitle: nextRung.title,
    nextIcon: nextRung.icon,
    nextColor: nextRung.color,
  };
}

// Troca o horário da repescagem. O app propõe 10 minutos e quem estudou ajusta
// — é a metade da classificação que pertence ao usuário. Só vale enquanto a
// revisão agendada ainda está no futuro: no dia seguinte a escada assume.
export async function setRetry(topicId: string, minutes: number): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: topic } = await supabase
    .from('topics')
    .select('id, due_at')
    .eq('id', topicId)
    .single();
  if (!topic) return null;

  const now = new Date();
  if (new Date(topic.due_at as string) <= now) return null;

  const safe = Math.min(Math.max(Math.round(minutes), 1), 12 * 60);
  const { error } = await supabase
    .from('topics')
    .update({ retry_at: addMinutes(now, safe).toISOString() })
    .eq('id', topicId);
  if (error) throw error;

  revalidatePath('/today');
  return safe;
}

// O dia 0 de um tópico é a janela entre criá-lo e a primeira revisão vencer.
// Duas condições, e as duas importam: nunca revisado separa tópico novo de
// tópico que caiu de volta pro degrau 0 depois de um erro; ainda não vencido
// evita que o bloco de dia 0 apareça amanhã de manhã, competindo com a revisão
// de verdade que acabou de entrar na fila.
export async function isFirstDay(topicId: string, dueAt: string): Promise<boolean> {
  if (new Date(dueAt) <= new Date()) return false;

  const supabase = await createClient();
  const { count } = await supabase
    .from('topic_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId);
  return (count ?? 0) === 0;
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
  /** Repescagens prontas. Ficam fora do teto diário de propósito. */
  retries: TodayItem[];
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

type TopicRow = {
  id: string;
  name: string;
  section_id: string;
  review_step: number;
  due_at: string;
  exercise_prompt: string;
};

// Conta o material de vários tópicos de uma vez, pra resolver o degrau de cada
// um sem uma consulta por tópico.
async function capsFor(supabase: Client, ids: string[]): Promise<Map<string, TopicCaps>> {
  const caps = new Map<string, TopicCaps>();
  if (!ids.length) return caps;

  const idList = ids.join(',');
  const [{ data: cards }, { data: discursive }, { data: contrasts }] = await Promise.all([
    supabase.from('cards').select('topic_id').in('topic_id', ids),
    supabase.from('discursive_questions').select('topic_id').in('topic_id', ids),
    supabase
      .from('topic_contrasts')
      .select('topic_a, topic_b')
      .or(`topic_a.in.(${idList}),topic_b.in.(${idList})`),
  ]);

  for (const id of ids) {
    caps.set(id, { cardsN: 0, discN: 0, contrastsN: 0, hasExercise: false });
  }
  for (const c of cards ?? []) {
    const entry = caps.get(c.topic_id as string);
    if (entry) entry.cardsN += 1;
  }
  for (const d of discursive ?? []) {
    const entry = caps.get(d.topic_id as string);
    if (entry) entry.discN += 1;
  }
  // O `or` traz o par inteiro, inclusive o lado que não está na lista — por
  // isso só o lado pedido é contado.
  for (const c of contrasts ?? []) {
    for (const side of [c.topic_a as string, c.topic_b as string]) {
      const entry = caps.get(side);
      if (entry) entry.contrastsN += 1;
    }
  }
  return caps;
}

function toItem(
  row: TopicRow,
  caps: Map<string, TopicCaps>,
  sectionNames: Map<string, string>,
  now: Date
): TodayItem {
  const cap = caps.get(row.id) ?? { cardsN: 0, discN: 0, contrastsN: 0, hasExercise: false };
  cap.hasExercise = Boolean(row.exercise_prompt?.trim());
  const rungIndex = resolveRung(row.review_step, cap);
  const rung = LADDER[rungIndex];
  return {
    topicId: row.id,
    topicName: row.name,
    sectionId: row.section_id,
    sectionName: sectionNames.get(row.section_id) ?? '',
    rung,
    rungIndex,
    overdue: overdueDays(new Date(row.due_at), now),
    href: hrefFor(rung.mode, row.id, row.section_id),
  };
}

// A fila do dia: o que venceu, na modalidade certa, já ordenado e cortado no
// teto. É a tela que responde "o que eu reviso hoje" sem exigir nenhuma decisão
// de quem chega. As repescagens vêm à parte, fora do teto.
export async function getTodayQueue(): Promise<TodayQueue> {
  const supabase = await createClient();
  const now = new Date();
  const nowISO = now.toISOString();
  const columns = 'id, name, section_id, review_step, due_at, exercise_prompt';

  const [{ count: totalTopics }, { data: due, error }, { data: retryRows }] = await Promise.all([
    supabase.from('topics').select('id', { count: 'exact', head: true }),
    supabase
      .from('topics')
      .select(columns)
      .lte('due_at', nowISO)
      .order('due_at', { ascending: true })
      .order('created_at', { ascending: true }),
    // A repescagem só existe enquanto a revisão de verdade não venceu. É o que
    // a mantém limitada ao dia sem nenhuma rotina de limpeza: amanhã o `due_at`
    // passa, o tópico entra na fila principal e ela some sozinha.
    supabase
      .from('topics')
      .select(columns)
      .not('retry_at', 'is', null)
      .lte('retry_at', nowISO)
      .gt('due_at', nowISO)
      .order('retry_at', { ascending: true }),
  ]);
  if (error) throw error;

  const rows = (due ?? []) as TopicRow[];
  const retryReady = (retryRows ?? []) as TopicRow[];

  if (!rows.length && !retryReady.length) {
    const { data: upcoming } = await supabase
      .from('topics')
      .select('due_at')
      .order('due_at', { ascending: true })
      .limit(1);
    return {
      items: [],
      retries: [],
      waiting: 0,
      nextDueAt: (upcoming?.[0]?.due_at as string) ?? null,
      totalTopics: totalTopics ?? 0,
    };
  }

  // Só o topo da fila precisa do material contado: o teto corta o resto de
  // qualquer jeito. Uma folga sobre o teto cobre a margem.
  const head = rows.slice(0, DAILY_CAP);
  const relevant = [...head, ...retryReady];
  const sectionIds = [...new Set(relevant.map((t) => t.section_id))];

  const [caps, { data: sections }] = await Promise.all([
    capsFor(
      supabase,
      relevant.map((t) => t.id)
    ),
    supabase.from('sections').select('id, name').in('id', sectionIds),
  ]);
  const sectionNames = new Map((sections ?? []).map((s) => [s.id as string, s.name as string]));

  return {
    items: head.map((row) => toItem(row, caps, sectionNames, now)),
    retries: retryReady.map((row) => toItem(row, caps, sectionNames, now)),
    waiting: Math.max(0, rows.length - head.length),
    nextDueAt: null,
    totalTopics: totalTopics ?? 0,
  };
}

// Usado só pelo contador do header — mais barato que montar a fila inteira. O
// número de vencidos é capado no teto porque é isso que a fila vai oferecer; a
// repescagem soma por fora, que é justamente o ponto dela.
export async function countDueToday(): Promise<number> {
  const supabase = await createClient();
  const nowISO = new Date().toISOString();
  const [{ count: dueCount }, { count: retryCount }] = await Promise.all([
    supabase.from('topics').select('id', { count: 'exact', head: true }).lte('due_at', nowISO),
    supabase
      .from('topics')
      .select('id', { count: 'exact', head: true })
      .not('retry_at', 'is', null)
      .lte('retry_at', nowISO)
      .gt('due_at', nowISO),
  ]);
  return Math.min(dueCount ?? 0, DAILY_CAP) + (retryCount ?? 0);
}
