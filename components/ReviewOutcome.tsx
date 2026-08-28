'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { motion } from 'motion/react';
import { recordReview, type ReviewOutcome } from '@/lib/actions/reviews';
import type { ReviewMode } from '@/lib/review/ladder';

// Registro da sessão, compartilhado pelos cinco runners. O `useRef` é o que
// impede a dupla gravação: a tela de resultado pode re-renderizar (transição,
// StrictMode em dev) e cada re-render chamaria o servidor de novo.
export function useReviewRecorder(topicId: string | undefined, mode: ReviewMode) {
  const [outcome, setOutcome] = useState<ReviewOutcome | null>(null);
  const [pending, startTransition] = useTransition();
  const recorded = useRef(false);

  const record = useCallback(
    (hits: number, total: number) => {
      if (!topicId || recorded.current) return;
      recorded.current = true;
      startTransition(async () => {
        setOutcome(await recordReview(topicId, mode, hits, total));
      });
    },
    [topicId, mode]
  );

  // Refazer é uma sessão nova: libera o registro de novo.
  const reset = useCallback(() => {
    recorded.current = false;
    setOutcome(null);
  }, []);

  return { outcome, pending, record, reset };
}

// A faixa que fecha a revisão dizendo quando o tópico volta e o que ele vai
// cobrar. É o que tira a decisão da cabeça de quem estuda — sem ela o runner
// grava em silêncio e a pessoa continua sem saber o que fazer amanhã.
export function ReviewOutcomeBanner({
  outcome,
  pending,
}: {
  outcome: ReviewOutcome | null;
  pending: boolean;
}) {
  if (pending && !outcome) {
    return (
      <p style={{ fontSize: 13.5, color: '#A29E96', margin: '0 0 20px' }}>
        <i className="ph ph-circle-notch" /> Registrando revisão…
      </p>
    );
  }
  if (!outcome) return null;

  const when = outcome.days === 1 ? 'Volta amanhã' : `Volta em ${outcome.days} dias`;
  const label = outcome.demoted ? `${when} — um degrau abaixo` : when;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        flexWrap: 'wrap',
        margin: '0 0 22px',
        padding: '12px 16px',
        borderRadius: 14,
        background: outcome.passed ? '#E7F9F0' : '#FDF0DC',
        border: `1px solid ${outcome.passed ? '#BFEAD5' : '#F5DCB3'}`,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          font: '600 13.5px var(--font-body)',
          color: outcome.passed ? '#066B46' : '#8A5B08',
        }}
      >
        <i
          className={outcome.passed ? 'ph-fill ph-check-circle' : 'ph-fill ph-arrow-bend-left-down'}
          style={{ fontSize: 16 }}
        />
        {label}
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          background: '#fff',
          font: '600 12.5px var(--font-body)',
          color: outcome.nextColor,
        }}
      >
        <i className={outcome.nextIcon} style={{ fontSize: 13 }} /> {outcome.nextTitle}
      </span>
    </motion.div>
  );
}
