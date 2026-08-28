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

// Uma sessão passa com 80% de acerto. Exigir 100% transformaria um deslize em
// rebaixamento; aceitar metade deixaria subir sem saber.
export const PASS_RATIO = 0.8;

export function rungOf(mode: ReviewMode): number {
  const i = LADDER.findIndex((r) => r.mode === mode);
  return i < 0 ? 0 : i;
}

export function passedByScore(hits: number, total: number): boolean {
  return total > 0 && hits / total >= PASS_RATIO;
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

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

export interface ScheduleInput {
  /** Degrau guardado no tópico antes desta sessão. */
  step: number;
  /** Degrau que a sessão cobrou. */
  rung: number;
  passed: boolean;
  /** Vencimento atual do tópico. */
  dueAt: Date;
  now?: Date;
}

// Passou: sobe pro degrau seguinte ao que foi cobrado e espera o intervalo dele.
// Os `max` existem por causa da revisão fora da fila — refazer o quiz ou abrir
// os cartões por vontade própria nunca pode encurtar o intervalo já conquistado
// nem saltar degraus que ainda não foram cobrados.
//
// Falhou: desce pra baixo do degrau que caiu e volta amanhã, sem `max` nenhum —
// um erro é notícia mesmo quando o tópico só venceria daqui a um mês.
export function nextSchedule({ step, rung, passed, dueAt, now = new Date() }: ScheduleInput): {
  step: number;
  dueAt: Date;
} {
  if (!passed) {
    return { step: Math.min(step, Math.max(0, rung - 1)), dueAt: addDays(now, 1) };
  }
  const next = addDays(now, LADDER[rung]?.waitDays ?? 1);
  return {
    step: Math.min(LAST_RUNG, Math.max(step, rung + 1)),
    dueAt: next > dueAt ? next : dueAt,
  };
}

/** Dias de atraso, arredondados pra baixo. 0 = vence hoje. */
export function overdueDays(dueAt: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - dueAt.getTime()) / (24 * 60 * 60 * 1000)));
}
