'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { RichText } from '@/lib/render';
import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '@/lib/ui';
import type { ContrastDrillQuestion } from '@/lib/actions/contrasts';

const DRILL_COLOR = '#7C3AED';
const DRILL_TINT = '#F1E9FE';

export function DiscriminateRunner({
  questions,
  backHref,
  backLabel,
}: {
  questions: ContrastDrillQuestion[];
  backHref: string;
  backLabel: string;
}) {
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  if (!questions.length) {
    return (
      <div className={cardClass} style={{ padding: 30, textAlign: 'center' }}>
        <i className="ph-fill ph-target" style={{ fontSize: 32, color: DRILL_COLOR }} />
        <p style={{ fontSize: 15, color: '#6B6862', margin: '14px 0 0', lineHeight: 1.6 }}>
          Nenhum cenário de treino ainda. Abra um tópico, ligue ele ao que você confunde e adicione
          situações onde os dois competem.
        </p>
        <Link href={backHref} className={buttonSecondaryClass} style={{ marginTop: 18 }}>
          {backLabel}
        </Link>
      </div>
    );
  }

  if (idx >= questions.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cardClass}
        style={{ textAlign: 'center', borderRadius: 22, padding: '44px 30px' }}
      >
        <div style={{ width: 76, height: 76, borderRadius: 22, margin: '0 auto 20px', display: 'grid', placeItems: 'center', background: DRILL_TINT }}>
          <i className="ph-fill ph-target" style={{ color: DRILL_COLOR, fontSize: 40 }} />
        </div>
        <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-.02em', margin: '0 0 6px' }}>
          Treino concluído
        </h2>
        <p style={{ fontSize: 16, color: '#6B6862', margin: '0 0 8px' }}>Você escolheu certo</p>
        <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 52, color: DRILL_COLOR, letterSpacing: '-.03em', margin: '0 0 26px' }}>
          {hits}
          <span style={{ color: '#C9C4BB', fontSize: 32 }}>/{questions.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setIdx(0);
              setHits(0);
              setSelected(null);
            }}
            className={buttonSecondaryClass}
          >
            <i className="ph ph-arrow-clockwise" /> Refazer
          </button>
          <Link href={backHref} className={buttonPrimaryClass}>
            {backLabel}
          </Link>
        </div>
      </motion.div>
    );
  }

  const q = questions[idx];
  const pct = (idx / questions.length) * 100;
  const answered = selected !== null;
  const ok = selected === q.correctIndex;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 999, background: DRILL_COLOR }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span style={{ font: '600 13px var(--font-body)', color: '#86827A', whiteSpace: 'nowrap' }}>
          {idx + 1} / {questions.length}
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
        <p style={{ font: '600 12px var(--font-body)', letterSpacing: '.05em', textTransform: 'uppercase', color: DRILL_COLOR, margin: '0 0 10px' }}>
          Qual você usaria aqui?
        </p>
        <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 21, lineHeight: 1.35, letterSpacing: '-.01em', margin: '0 0 20px' }}>
          <RichText text={q.situation} />
        </h3>

        <div className="rcp-two-col" style={{ gap: 10 }}>
          {q.options.map((option, i) => {
            let border = 'rgba(0,0,0,.12)';
            let bg = '#fff';
            let text = '#161616';
            if (answered) {
              if (i === q.correctIndex) {
                border = '#0E9F6E';
                bg = '#E7F9F0';
                text = '#066B46';
              } else if (i === selected) {
                border = '#EF4444';
                bg = '#FDECEA';
                text = '#A81E12';
              } else {
                text = '#9A968E';
              }
            }
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => setSelected(i)}
                className="rcp-quiz-option"
                style={{ borderColor: border, background: bg, color: text, justifyContent: 'center', fontWeight: 600 }}
              >
                {option}
              </button>
            );
          })}
        </div>

        {answered && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <div style={{ margin: '18px 0 0', borderRadius: 14, padding: 16, background: ok ? '#E7F9F0' : '#FDECEA' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, font: '700 15px var(--font-display)', color: ok ? '#0E9F6E' : '#EF4444', margin: 0 }}>
                <i className={ok ? 'ph-fill ph-check-circle' : 'ph-fill ph-x-circle'} style={{ fontSize: 18 }} />
                {ok ? `Isso — ${q.options[q.correctIndex]}` : `Era ${q.options[q.correctIndex]}`}
              </p>
              {q.why && (
                <div style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#35322D', marginTop: 8 }}>
                  <RichText text={q.why} />
                </div>
              )}
            </div>

            {q.decisive_question && (
              <div style={{ margin: '10px 0 0', borderRadius: 13, padding: '13px 15px', background: DRILL_TINT, display: 'flex', gap: 10 }}>
                <i className="ph-fill ph-key" style={{ color: DRILL_COLOR, fontSize: 17, flex: 'none', marginTop: 2 }} />
                <div>
                  <span style={{ display: 'block', font: '600 12px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: DRILL_COLOR, marginBottom: 4 }}>
                    A pergunta que decide
                  </span>
                  <div style={{ fontSize: 14.5, lineHeight: 1.55, color: '#35322D' }}>
                    <RichText text={q.decisive_question} />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (ok) setHits((h) => h + 1);
                setSelected(null);
                setIdx((i) => i + 1);
              }}
              className="rcp-btn-dark"
              style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
            >
              {idx + 1 >= questions.length ? 'Ver resultado' : 'Próxima'} <i className="ph-bold ph-arrow-right" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
