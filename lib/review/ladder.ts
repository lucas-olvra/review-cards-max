// A escada de revisão: o que revisar, em que ordem, e quando.
//
// A premissa é que "revisar um tópico" não é uma coisa só. O app já tinha cinco
// modalidades com dificuldades de recuperação bem diferentes — explicar em voz
// alta sem apoio é muito mais caro que reconhecer a alternativa certa entre
// quatro. Elas viram degraus: cada passagem cobra um pouco mais que a anterior,
// e o intervalo cresce junto.
//
// Módulo puro de propósito (sem 'use server', sem Supabase): a matemática do
// agendamento é a parte que precisa ser óbvia de ler e de testar.

export type ReviewMode = 'pitch' | 'cards' | 'discursive' | 'discriminate' | 'practice';

export interface Rung {
  mode: ReviewMode;
  /** Rótulo do degrau na fila de hoje. */
  title: string;
  /** O que a pessoa tem que fazer — em imperativo, curto. */
  hint: string;
  icon: string;
  color: string;
  tint: string;
  /** Dias de espera depois de passar neste degrau. */
  waitDays: number;
}

// Os intervalos são os saltos entre degraus, não datas absolutas: um tópico
// criado hoje cai amanhã no degrau 0, e passando em todos chega ao degrau 4
// por volta de D+35. Quem falha desce e refaz o caminho — as datas então
// deixam de bater com essa conta, que é o esperado.
export const LADDER: Rung[] = [
  {
    mode: 'pitch',
    title: 'Explicar em voz alta',
    hint: 'Sem olhar a tela. Se travar, o tópico não está sabido.',
    icon: 'ph-fill ph-microphone-stage',
    color: '#FB6514',
    tint: '#FFEBDF',
    waitDays: 2,
  },
  {
    mode: 'cards',
    title: 'Cartões',
    hint: 'Reconhecer a resposta certa entre alternativas.',
    icon: 'ph-fill ph-cards-three',
    color: '#0891A5',
    tint: '#E0F7FB',
    waitDays: 4,
  },
  {
    mode: 'discursive',
    title: 'Discursiva',
    hint: 'Formule a resposta inteira antes de revelar o gabarito.',
    icon: 'ph-fill ph-pen-nib',
    color: '#4F46E5',
    tint: '#E9E8FF',
    waitDays: 9,
  },
  {
    mode: 'discriminate',
    title: 'Discriminação',
    hint: 'O cenário chega sem etiqueta: é escolher, não lembrar.',
    icon: 'ph-fill ph-target',
    color: '#7C3AED',
    tint: '#F1E9FE',
    waitDays: 19,
  },
  {
    mode: 'practice',
    title: 'Prática',
    hint: 'Resolva o exercício escrevendo, e só então compare.',
    icon: 'ph-fill ph-barbell',
    color: '#E5387E',
    tint: '#FCE7F1',
    waitDays: 60,
  },
];

export const LAST_RUNG = LADDER.length - 1;

// Teto diário. Sem ele, a fila de quem tem 40 tópicos vira uma lista que
// ninguém começa — e dívida de revisão sempre ganha de conteúdo novo, então o
// teto é o que protege a rotina, não o que a limita.
export const DAILY_CAP = 5;

// Como a sessão foi, na voz de quem estudou. O degrau diz que tipo de teste é
// hoje; o grau diz como ele saiu — dois eixos independentes.
//
// Antes disso a medição era binária (80% passa), o que jogava fora a diferença
// entre "saiu limpo" e "saiu suando" e não dava voz nenhuma nas modalidades sem
// placar, onde o app estava adivinhando.
export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface GradeDef {
  key: Grade;
  label: string;
  hint: string;
  color: string;
  tint: string;
}

export const GRADES: GradeDef[] = [
  { key: 'again', label: 'Errei', hint: 'Volta em minutos, e amanhã um degrau abaixo', color: '#EF4444', tint: '#FDECEA' },
  { key: 'hard', label: 'Difícil', hint: 'Saiu com esforço — fica no mesmo degrau, volta antes', color: '#D97706', tint: '#FDF0DC' },
  { key: 'good', label: 'Bom', hint: 'Saiu limpo — sobe um degrau', color: '#0E9F6E', tint: '#E1FAEF' },
  { key: 'easy', label: 'Fácil', hint: 'Nem precisou pensar — sobe e estica o intervalo', color: '#0891A5', tint: '#E0F7FB' },
];

export const GRADE_BY_KEY = new Map(GRADES.map((g) => [g.key, g]));

// "Difícil" encurta o intervalo do degrau, "Fácil" estica. Fatores modestos de
// propósito: quem grada é uma pessoa cansada no fim de uma revisão, e um
// multiplicador agressivo transforma um clique impreciso em duas semanas de
// diferença.
export const HARD_FACTOR = 0.5;
export const EASY_FACTOR = 1.5;

// No último degrau o intervalo cresce sobre o anterior em vez de ficar preso
// nos 60 dias da LADDER — é o único ponto onde a escada vira multiplicativa,
// porque é o único onde ela pararia de crescer.
export const TOP_GROWTH: Record<Exclude<Grade, 'again'>, number> = { hard: 1.2, good: 2, easy: 2.6 };
export const MAX_INTERVAL_DAYS = 365;

// Repescagem: a segunda chance no mesmo dia. Só aparece depois de um "Errei".
export const RETRY_OPTIONS = [
  { minutes: 10, label: '10 min' },
  { minutes: 60, label: '1 hora' },
  { minutes: 240, label: 'mais tarde' },
];
export const DEFAULT_RETRY_MINUTES = 10;

export function rungOf(mode: ReviewMode): number {
  const i = LADDER.findIndex((r) => r.mode === mode);
  return i < 0 ? 0 : i;
}

// Nas modalidades com placar o app chega com um grau já escolhido e a pessoa
// só corrige se discordar. "Fácil" nunca é sugerido: ele estica o intervalo, e
// isso é uma afirmação que tem que partir de quem estudou.
export function suggestGrade(hits: number, total: number): Grade {
  if (total <= 0) return 'again';
  const ratio = hits / total;
  if (ratio < 0.8) return 'again';
  if (ratio < 1) return 'hard';
  return 'good';
}

// O que o tópico tem material para cobrar. Um degrau sem material não é
// reprovação nem espera: é pulado.
export interface TopicCaps {
  cardsN: number;
  discN: number;
  contrastsN: number;
  hasExercise: boolean;
}

export function rungAvailable(rung: number, caps: TopicCaps): boolean {
  switch (LADDER[rung]?.mode) {
    case 'cards':
      return caps.cardsN > 0;
    case 'discursive':
      return caps.discN > 0;
    case 'discriminate':
      return caps.contrastsN > 0;
    case 'practice':
      return caps.hasExercise;
    // Explicar em voz alta não depende de nada cadastrado — é o degrau que
    // sempre existe, e por isso o fundo garantido da busca abaixo.
    default:
      return true;
  }
}

// Do degrau atual pra frente até achar um que tenha material; se não houver
// nenhum à frente, volta procurando. O degrau 0 sempre serve, então isto
// sempre termina em índice válido.
export function resolveRung(step: number, caps: TopicCaps): number {
  const start = Math.min(Math.max(step, 0), LAST_RUNG);
  for (let i = start; i <= LAST_RUNG; i++) if (rungAvailable(i, caps)) return i;
  for (let i = start - 1; i >= 0; i--) if (rungAvailable(i, caps)) return i;
  return 0;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * DAY_MS);
}

export function addMinutes(from: Date, minutes: number): Date {
  return new Date(from.getTime() + minutes * 60 * 1000);
}

export interface ScheduleInput {
  /** Degrau guardado no tópico antes desta sessão. */
  step: number;
  /** Degrau que a sessão cobrou. */
  rung: number;
  grade: Grade;
  /** Vencimento atual do tópico. */
  dueAt: Date;
  /** Intervalo concedido na última revisão, em dias. 0 = nunca agendado. */
  intervalDays: number;
  now?: Date;
}

export interface Schedule {
  step: number;
  dueAt: Date;
  intervalDays: number;
  /** Quando a repescagem fica disponível. `null` quando não há uma. */
  retryAt: Date | null;
}

// Quanto esperar depois de um grau que não foi "Errei".
function waitFor(rung: number, grade: Exclude<Grade, 'again'>, intervalDays: number): number {
  const base = LADDER[rung]?.waitDays ?? 1;
  if (rung !== LAST_RUNG) {
    if (grade === 'hard') return Math.max(1, Math.round(base * HARD_FACTOR));
    if (grade === 'easy') return Math.round(base * EASY_FACTOR);
    return base;
  }
  // Último degrau: cresce sobre o intervalo anterior, com o piso do degrau.
  const previous = intervalDays > 0 ? intervalDays : base;
  return Math.min(MAX_INTERVAL_DAYS, Math.max(base, Math.round(previous * TOP_GROWTH[grade])));
}

// Errei: desce pra baixo do degrau que caiu, volta amanhã e abre repescagem
// para hoje ainda. Não tem `max` nenhum — um erro é notícia mesmo quando o
// tópico só venceria daqui a um mês.
//
// Difícil: fica no degrau, volta antes. Bom e Fácil sobem, mudando só o quanto
// o intervalo estica.
//
// Os `max` nos três últimos existem por causa da revisão fora da fila: refazer
// o quiz por vontade própria nunca pode encurtar um intervalo já conquistado
// nem saltar degraus que ainda não foram cobrados.
export function nextSchedule({
  step,
  rung,
  grade,
  dueAt,
  intervalDays,
  now = new Date(),
}: ScheduleInput): Schedule {
  if (grade === 'again') {
    return {
      step: Math.min(step, Math.max(0, rung - 1)),
      dueAt: addDays(now, 1),
      intervalDays: 1,
      retryAt: addMinutes(now, DEFAULT_RETRY_MINUTES),
    };
  }

  const candidate = addDays(now, waitFor(rung, grade, intervalDays));
  const due = candidate > dueAt ? candidate : dueAt;
  return {
    // "Difícil" não avança: ele repete o degrau que acabou de custar caro.
    step: Math.min(LAST_RUNG, Math.max(step, grade === 'hard' ? rung : rung + 1)),
    dueAt: due,
    intervalDays: Math.max(1, Math.round((due.getTime() - now.getTime()) / DAY_MS)),
    retryAt: null,
  };
}

/** Dias de atraso, arredondados pra baixo. 0 = vence hoje. */
export function overdueDays(dueAt: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - dueAt.getTime()) / (24 * 60 * 60 * 1000)));
}
