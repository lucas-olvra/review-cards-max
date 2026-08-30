'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { motion } from 'motion/react';
import { recordReview, setRetry, type PitchPayload, type ReviewOutcome } from '@/lib/actions/reviews';
import { capGrade, GRADES, RETRY_OPTIONS, type Grade, type ReviewMode } from '@/lib/review/ladder';

// Registro da sessão, compartilhado pelos cinco runners. O `useRef` é o que
// impede a dupla gravação: a tela de resultado pode re-renderizar (transição,
// StrictMode em dev) e cada re-render chamaria o servidor de novo.
export function useReviewRecorder(topicId: string | undefined, mode: ReviewMode) {
  const [outcome, setOutcome] = useState<ReviewOutcome | null>(null);
  const [pending, startTransition] = useTransition();
  const recorded = useRef(false);

  const record = useCallback(
    (hits: number, total: number, grade: Grade, usedHint: boolean, pitch?: PitchPayload) => {
      if (!topicId || recorded.current) return;
      recorded.current = true;
      startTransition(async () => {
        setOutcome(await recordReview(topicId, { mode, hits, total, grade, usedHint, pitch }));
      });
    },
    [topicId, mode]
  );

  const changeRetry = useCallback(
    (minutes: number) => {
      if (!topicId) return;
      startTransition(async () => {
        const applied = await setRetry(topicId, minutes);
        if (applied !== null) {
          setOutcome((o) => (o ? { ...o, retryMinutes: applied } : o));
        }
      });
    },
    [topicId]
  );

  // Refazer é uma sessão nova: libera o registro de novo.
  const reset = useCallback(() => {
    recorded.current = false;
    setOutcome(null);
  }, []);

  return { outcome, pending, record, changeRetry, reset };
}

// Os quatro graus. Nas modalidades com placar o app chega com um já escolhido
// e a pessoa só corrige se discordar — nas que não têm placar (explicar em voz
// alta, prática) ela escolhe do zero, que é a única fonte honesta ali.
export function GradeButtons({
  suggested,
  onGrade,
  capped = false,
}: {
  suggested?: Grade;
  onGrade: (grade: Grade) => void;
  /** A dica foi aberta: "Bom" e "Fácil" saem de cena nesta sessão. */
  capped?: boolean;
}) {
  const [hovered, setHovered] = useState<Grade | null>(null);
  // Com a dica aberta a sugestão desce junto — deixar "Bom" destacado e
  // desabilitado ao mesmo tempo seria só confuso.
  const pick = suggested ? capGrade(suggested, capped) : undefined;
  const shown = GRADES.find((g) => g.key === (hovered ?? pick));

  return (
    <div style={{ margin: '0 0 20px' }}>
      <p style={{ fontSize: 14, color: '#6B6862', textAlign: 'center', margin: '0 0 12px' }}>
        Como foi?
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {GRADES.map((g) => {
          const blocked = capped && (g.key === 'good' || g.key === 'easy');
          const isSuggested = g.key === pick;
          return (
            <button
              key={g.key}
              type="button"
              disabled={blocked}
              title={blocked ? 'Indisponível: você abriu a dica nesta sessão' : undefined}
              onClick={() => onGrade(g.key)}
              onMouseEnter={() => setHovered(blocked ? null : g.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(blocked ? null : g.key)}
              onBlur={() => setHovered(null)}
              style={{
                flex: '1 1 88px',
                cursor: blocked ? 'not-allowed' : 'pointer',
                padding: '11px 10px',
                borderRadius: 13,
                background: blocked ? '#F2F0EB' : isSuggested ? g.color : g.tint,
                color: blocked ? '#C9C4BB' : isSuggested ? '#fff' : g.color,
                border: `1.5px solid ${!blocked && isSuggested ? g.color : 'transparent'}`,
                font: '600 14px var(--font-body)',
                boxShadow: !blocked && isSuggested ? `0 8px 18px -10px ${g.color}` : 'none',
              }}
            >
              {g.label}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 13, color: '#86827A', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.5 }}>
        {capped ? 'Você abriu a dica — esta sessão vai até "Difícil".' : shown?.hint}
      </p>
    </div>
  );
}

// A faixa que fecha a revisão dizendo quando o tópico volta e o que ele vai
// cobrar. É o que tira a decisão da cabeça de quem estuda — sem ela o runner
// grava em silêncio e a pessoa continua sem saber o que fazer amanhã.
export function ReviewOutcomeBanner({
  outcome,
  pending,
  onChangeRetry,
}: {
  outcome: ReviewOutcome | null;
  pending: boolean;
  onChangeRetry?: (minutes: number) => void;
}) {
  if (pending && !outcome) {
    return (
      <p style={{ fontSize: 13.5, color: '#A29E96', margin: '0 0 20px' }}>
        <i className="ph ph-circle-notch" /> Registrando revisão…
      </p>
    );
  }
  if (!outcome) return null;

  const failed = outcome.grade === 'again';
  const when = outcome.days === 1 ? 'Volta amanhã' : `Volta em ${outcome.days} dias`;
  const label = outcome.isRetry
    ? `Repescagem registrada · ${when.toLowerCase()}`
    : outcome.demoted
      ? `${when} — um degrau abaixo`
      : when;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        margin: '0 0 22px',
        padding: '13px 16px',
        borderRadius: 14,
        background: failed ? '#FDF0DC' : '#E7F9F0',
        border: `1px solid ${failed ? '#F5DCB3' : '#BFEAD5'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            font: '600 13.5px var(--font-body)',
            color: failed ? '#8A5B08' : '#066B46',
          }}
        >
          <i
            className={failed ? 'ph-fill ph-arrow-bend-left-down' : 'ph-fill ph-check-circle'}
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
      </div>

      {outcome.cappedByHint && (
        <p style={{ fontSize: 12.5, color: '#8A5B08', textAlign: 'center', margin: '8px 0 0' }}>
          <i className="ph ph-lightbulb" /> Limitado a &quot;Difícil&quot; porque a dica foi aberta.
        </p>
      )}

      {/* A repescagem é a metade da classificação que pertence a quem estudou:
          o app propõe 10 minutos e a pessoa ajusta, sem que isso desloque nada
          da fila de amanhã. */}
      {outcome.retryMinutes !== null && onChangeRetry && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            flexWrap: 'wrap',
            margin: '11px 0 0',
            paddingTop: 11,
            borderTop: '1px solid rgba(0,0,0,.07)',
          }}
        >
          <span style={{ font: '500 13px var(--font-body)', color: '#8A5B08' }}>
            <i className="ph ph-arrow-u-up-left" /> Tentar de novo em
          </span>
          {RETRY_OPTIONS.map((opt) => {
            const active = Math.abs(opt.minutes - outcome.retryMinutes!) <= 1;
            return (
              <button
                key={opt.minutes}
                type="button"
                onClick={() => onChangeRetry(opt.minutes)}
                style={{
                  cursor: 'pointer',
                  padding: '4px 11px',
                  borderRadius: 999,
                  border: `1.5px solid ${active ? '#B54708' : 'rgba(0,0,0,.12)'}`,
                  background: active ? '#B54708' : '#fff',
                  color: active ? '#fff' : '#6B6862',
                  font: '600 12.5px var(--font-body)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
