'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { RichText } from '@/lib/render';
import { accent, buttonPrimaryClass, buttonSecondaryClass, cardClass } from '@/lib/ui';
import type { Card } from '@/lib/types';

const QUIZ_COLOR = '#0891A5';

export function QuizRunner({
  topicId,
  cards,
  conceptWhat,
}: {
  topicId: string;
  cards: Card[];
  conceptWhat: string;
}) {
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  if (!cards.length) {
    return <p style={{ color: '#86827A' }}>Sem cartões para revisar ainda.</p>;
  }

  if (idx >= cards.length) {
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
            background: '#E0F7FB',
          }}
        >
          <i className="ph-fill ph-confetti" style={{ color: QUIZ_COLOR, fontSize: 40 }} />
        </div>
        <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-.02em', margin: '0 0 6px' }}>
          Revisão concluída
        </h2>
        <p style={{ fontSize: 16, color: '#6B6862', margin: '0 0 8px' }}>Você acertou</p>
        <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 52, color: QUIZ_COLOR, letterSpacing: '-.03em', margin: '0 0 26px' }}>
          {hits}
          <span style={{ color: '#C9C4BB', fontSize: 32 }}>/{cards.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
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
          <Link href={`/topics/${topicId}`} className={buttonPrimaryClass}>
            Voltar ao tópico
          </Link>
        </div>
      </motion.div>
    );
  }

  const card = cards[idx];
  const pct = (idx / cards.length) * 100;
  const answered = selected !== null;
  const ok = selected === card.correct;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 999, background: QUIZ_COLOR }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span style={{ font: '600 13px var(--font-body)', color: '#86827A', whiteSpace: 'nowrap' }}>
          {idx + 1} / {cards.length}
        </span>
      </div>

      {conceptWhat && (
        <details className={cardClass} style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <summary
            style={{ cursor: 'pointer', padding: '14px 18px', fontSize: 14, fontWeight: 600, color: accent, listStyle: 'none' }}
          >
            <i className="ph ph-clipboard-text" /> Consultar conceito
          </summary>
          <div style={{ borderTop: '1px solid rgba(0,0,0,.07)', padding: '14px 18px', fontSize: 14, color: '#35322D' }}>
            <RichText text={conceptWhat} />
          </div>
        </details>
      )}

      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cardClass}
        style={{ borderRadius: 22, padding: 26 }}
      >
        <p style={{ font: '600 12px var(--font-body)', letterSpacing: '.05em', textTransform: 'uppercase', color: QUIZ_COLOR, margin: '0 0 10px' }}>
          Pergunta {idx + 1}
        </p>
        <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 21, lineHeight: 1.3, letterSpacing: '-.01em', margin: '0 0 20px' }}>
          <RichText text={card.question} />
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {card.options.map((option, i) => {
            let border = 'rgba(0,0,0,.12)';
            let bg = '#fff';
            let text = '#161616';
            let letterBg = '#F2F0EB';
            let letterColor = '#55524B';
            let mark = '';
            let markColor = 'transparent';
            if (answered) {
              if (i === card.correct) {
                border = '#0E9F6E';
                bg = '#E7F9F0';
                letterBg = '#0E9F6E';
                letterColor = '#fff';
                mark = 'ph-fill ph-check-circle';
                markColor = '#0E9F6E';
              } else if (i === selected) {
                border = '#EF4444';
                bg = '#FDECEA';
                letterBg = '#EF4444';
                letterColor = '#fff';
                mark = 'ph-fill ph-x-circle';
                markColor = '#EF4444';
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
                style={{ borderColor: border, background: bg, color: text }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    flex: 'none',
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                    font: '700 13px var(--font-display)',
                    background: letterBg,
                    color: letterColor,
                  }}
                >
                  {'ABCD'[i]}
                </span>
                <span style={{ flex: 1 }}>
                  <RichText text={option} />
                </span>
                {mark && <i className={mark} style={{ fontSize: 18, color: markColor }} />}
              </button>
            );
          })}
        </div>

        {answered && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <div style={{ margin: '18px 0 0', borderRadius: 14, padding: 16, background: ok ? '#E7F9F0' : '#FDECEA' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, font: '700 15px var(--font-display)', color: ok ? '#0E9F6E' : '#EF4444', margin: '0 0 8px' }}>
                <i className={ok ? 'ph-fill ph-check-circle' : 'ph-fill ph-x-circle'} style={{ fontSize: 18 }} />
                {ok ? 'Correto!' : 'Ainda não'}
              </p>
              {card.explanation && (
                <div style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#35322D' }}>
                  <RichText text={card.explanation} />
                </div>
              )}
              {card.analogy && (
                <div style={{ margin: '12px 0 0', padding: '11px 13px', borderRadius: 11, background: '#FEF2DC', display: 'flex', gap: 9 }}>
                  <i className="ph-fill ph-lightbulb" style={{ color: '#D97706', fontSize: 17, flex: 'none' }} />
                  <div style={{ fontSize: 14, lineHeight: 1.55, color: '#7C4A03' }}>
                    <b>Analogia.</b> <RichText text={card.analogy} />
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (ok) setHits((h) => h + 1);
                setSelected(null);
                setIdx((i) => i + 1);
              }}
              className="rcp-btn-dark"
              style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
            >
              {idx + 1 >= cards.length ? 'Ver resultado' : 'Próxima'} <i className="ph-bold ph-arrow-right" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
