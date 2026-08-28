'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { RichText } from '@/lib/render';
import { GradeButtons, ReviewOutcomeBanner, useReviewRecorder } from '@/components/ReviewOutcome';
import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '@/lib/ui';
import type { DiscursiveQuestion } from '@/lib/types';
import { suggestGrade, type ReviewMode } from '@/lib/review/ladder';

// Dois degraus da escada têm exatamente a mesma mecânica — enunciado, formular
// a resposta inteira de cabeça, revelar, se autoavaliar — e mudam só no que
// cobram: a discursiva pede a explicação, a prática pede o código escrito. Uma
// variante evita um segundo runner idêntico.
type Variant = 'discursive' | 'practice';

const VARIANTS: Record<
  Variant,
  {
    mode: ReviewMode;
    color: string;
    tint: string;
    border: string;
    doneIcon: string;
    doneTitle: string;
    eyebrow: (n: number, total: number) => string;
    prompt: string;
    revealLabel: string;
    answerLabel: string;
    missingAnswer: string;
    empty: string;
  }
> = {
  discursive: {
    mode: 'discursive',
    color: '#4F46E5',
    tint: '#F3F2FF',
    border: '#E1DEFB',
    doneIcon: 'ph-fill ph-check-circle',
    doneTitle: 'Discursivas revisadas',
    eyebrow: (n) => `Pergunta discursiva ${n}`,
    prompt: 'Pense na sua resposta em voz alta antes de revelar.',
    revealLabel: 'Revelar resposta modelo',
    answerLabel: 'Resposta modelo',
    missingAnswer: 'Sem resposta modelo cadastrada.',
    empty: 'Sem perguntas discursivas para revisar ainda.',
  },
  practice: {
    mode: 'practice',
    color: '#E5387E',
    tint: '#FCE7F1',
    border: '#F8CFE0',
    doneIcon: 'ph-fill ph-barbell',
    doneTitle: 'Prática concluída',
    eyebrow: () => 'Exercício',
    prompt: 'Resolva escrevendo de verdade — só depois compare com o gabarito.',
    revealLabel: 'Revelar gabarito',
    answerLabel: 'Gabarito',
    missingAnswer: 'Sem gabarito cadastrado.',
    empty: 'Este tópico ainda não tem exercício de prática.',
  },
};

export function DiscursiveRunner({
  items,
  backHref,
  topicId,
  variant = 'discursive',
}: {
  items: DiscursiveQuestion[];
  backHref: string;
  topicId: string;
  variant?: Variant;
}) {
  const v = VARIANTS[variant];
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const { outcome, pending, record, changeRetry } = useReviewRecorder(topicId, v.mode);

  if (!items.length) {
    return <p style={{ color: '#86827A' }}>{v.empty}</p>;
  }

  if (idx >= items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cardClass}
        style={{ textAlign: 'center', borderRadius: 22, padding: '44px 30px' }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            margin: '0 auto 20px',
            display: 'grid',
            placeItems: 'center',
            background: v.tint,
          }}
        >
          <i className={v.doneIcon} style={{ color: v.color, fontSize: 42 }} />
        </div>
        <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-.02em', margin: '0 0 6px' }}>
          {v.doneTitle}
        </h2>
        <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 52, color: v.color, letterSpacing: '-.03em', margin: '12px 0 26px' }}>
          {hits}
          <span style={{ color: '#C9C4BB', fontSize: 32 }}>/{items.length}</span>
        </div>
        {!outcome && !pending ? (
          <GradeButtons
            suggested={suggestGrade(hits, items.length)}
            onGrade={(grade) => record(hits, items.length, grade)}
          />
        ) : (
          <ReviewOutcomeBanner outcome={outcome} pending={pending} onChangeRetry={changeRetry} />
        )}
        <Link href={backHref} className={buttonPrimaryClass}>
          Voltar ao tópico
        </Link>
      </motion.div>
    );
  }

  const item = items[idx];
  const pct = (idx / items.length) * 100;

  const advance = (ok: boolean) => {
    if (ok) setHits((h) => h + 1);
    setRevealed(false);
    setIdx((i) => i + 1);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 999, background: v.color }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span style={{ font: '600 13px var(--font-body)', color: '#86827A', whiteSpace: 'nowrap' }}>
          {idx + 1} / {items.length}
        </span>
      </div>

      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cardClass}
        style={{ borderRadius: 22, padding: 26 }}
      >
        <p style={{ font: '600 12px var(--font-body)', letterSpacing: '.05em', textTransform: 'uppercase', color: v.color, margin: '0 0 10px' }}>
          {v.eyebrow(idx + 1, items.length)}
        </p>
        <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 21, lineHeight: 1.3, letterSpacing: '-.01em', margin: '0 0 18px' }}>
          <RichText text={item.question} />
        </h3>

        {!revealed ? (
          <div style={{ borderRadius: 14, padding: 22, background: '#FAFAF8', border: '1.5px dashed rgba(0,0,0,.14)', textAlign: 'center' }}>
            <p style={{ fontSize: '14.5px', color: '#86827A', margin: '0 0 16px' }}>{v.prompt}</p>
            <button
              onClick={() => setRevealed(true)}
              className="rcp-btn-primary"
              style={{ background: v.color, boxShadow: `0 8px 18px -9px ${v.color}b3` }}
            >
              <i className="ph-fill ph-eye" /> {v.revealLabel}
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ borderRadius: 14, padding: 16, background: v.tint, border: `1px solid ${v.border}` }}>
              <p style={{ font: '600 12px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: v.color, margin: '0 0 8px' }}>
                {v.answerLabel}
              </p>
              {item.model_answer ? (
                <div style={{ fontSize: 15, lineHeight: 1.65, color: '#35322D' }}>
                  <RichText text={item.model_answer} />
                </div>
              ) : (
                <em style={{ color: '#86827A' }}>{v.missingAnswer}</em>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '16px 0 0' }}>
              <button
                onClick={() => advance(true)}
                className="rcp-btn-primary"
                style={{ flex: '1 1 140px', background: '#12B76A', boxShadow: 'none', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
              >
                <i className="ph-bold ph-check" /> Acertei
              </button>
              <button onClick={() => advance(false)} className={buttonSecondaryClass} style={{ flex: '1 1 140px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <i className="ph-bold ph-arrow-counter-clockwise" /> Preciso revisar
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
