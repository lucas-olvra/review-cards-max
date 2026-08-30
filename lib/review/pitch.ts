// As três peças de uma explicação.
//
// O pitch cobra produção, e produção falha por partes: quase todo mundo
// consegue dizer o que a coisa faz e dar um exemplo, e trava em por que ela
// existe. É o porquê que separa quem usa de quem entende — e é a pergunta que
// uma entrevista faz depois que você respondeu o "o quê".
//
// Separar as três é o que transforma "me embaralhei" numa informação acionável:
// ao longo de algumas tentativas fica visível que é sempre a mesma peça que
// falta.
//
// Módulo puro, como `ladder.ts`: sem Supabase, sem 'use server'.

import type { Grade } from '@/lib/review/ladder';

export type PieceKey = 'what' | 'why' | 'example';

export interface PieceDef {
  key: PieceKey;
  label: string;
  /** O que pedir de quem está escrevendo. */
  prompt: string;
  placeholder: string;
  icon: string;
  color: string;
  tint: string;
  /** Rótulo do campo do tópico com que a peça é comparada. */
  referenceLabel: string;
}

export const PIECES: PieceDef[] = [
  {
    key: 'what',
    label: 'O que é',
    prompt: 'A ideia central, em uma ou duas frases.',
    placeholder: 'Do jeito que você acabou de falar…',
    icon: 'ph-fill ph-brain',
    color: '#2C4BE0',
    tint: '#E9ECFF',
    referenceLabel: 'O que é (do tópico)',
  },
  {
    key: 'why',
    label: 'Por que existe',
    prompt: 'Que problema isso resolve — e o que se fazia antes.',
    placeholder: 'A peça que costuma faltar…',
    icon: 'ph-fill ph-question',
    color: '#7C3AED',
    tint: '#F1E9FE',
    referenceLabel: 'Por que existe (do tópico)',
  },
  {
    key: 'example',
    label: 'Exemplo concreto',
    prompt: 'Uma situação real onde você usaria.',
    placeholder: 'Um caso, não uma definição…',
    icon: 'ph-fill ph-check-circle',
    color: '#0E9F6E',
    tint: '#E1FAEF',
    referenceLabel: 'Onde usar (do tópico)',
  },
];

export type PitchSaid = Record<PieceKey, string>;
export type PitchHits = Record<PieceKey, boolean>;

export const EMPTY_SAID: PitchSaid = { what: '', why: '', example: '' };
export const EMPTY_HITS: PitchHits = { what: false, why: false, example: false };

/**
 * Peças que dá pra cobrar: só conta a que tem referência salva no tópico.
 * Sem `concept_why` preenchido não há com o que comparar, e reprovar alguém por
 * uma peça que o próprio tópico não define seria só ruído.
 */
export function availablePieces(reference: Record<PieceKey, string>): PieceKey[] {
  return PIECES.filter((p) => reference[p.key]?.trim()).map((p) => p.key);
}

// Um deslize numa peça é "Difícil" — voltou mais cedo, mesmo degrau. Duas ou
// mais peças fora significa que a explicação não existe ainda, e aí é "Errei".
// Sem nenhuma peça comparável o app não tem opinião e deixa a escolha aberta.
export function gradeFromPieces(hits: PitchHits, available: PieceKey[]): Grade | undefined {
  if (!available.length) return undefined;
  const missed = available.filter((k) => !hits[k]).length;
  if (missed === 0) return 'good';
  if (missed === 1) return 'hard';
  return 'again';
}

/**
 * A peça que falhou nesta tentativa E na anterior. É o sinal que o degrau
 * existe pra produzir: uma falha isolada é ruído, a mesma falha duas vezes
 * seguidas é um buraco.
 */
export function repeatedMisses(hits: PitchHits, previous: PitchHits | null): PieceKey[] {
  if (!previous) return [];
  return PIECES.filter((p) => !hits[p.key] && !previous[p.key]).map((p) => p.key);
}
