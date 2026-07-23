'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { RichText } from '@/lib/render';
import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '@/lib/ui';
import type { DiscursiveQuestion } from '@/lib/types';

const DISC_COLOR = '#4F46E5';

export function DiscursiveRunner({
  topicId,
  items,
}: {
  topicId: string;
  items: DiscursiveQuestion[];
}) {
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (!items.length) {
    return <p style={{ color: '#86827A' }}>Sem perguntas discursivas para revisar ainda.</p>;
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
            background: '#E9E8FF',
          }}
        >
          <i className="ph-fill ph-check-circle" style={{ color: DISC_COLOR, fontSize: 42 }} />
        </div>
        <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-.02em', margin: '0 0 6px' }}>
          Discursivas revisadas
        </h2>
        <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 52, color: DISC_COLOR, letterSpacing: '-.03em', margin: '12px 0 26px' }}>
          {hits}
          <span style={{ color: '#C9C4BB', fontSize: 32 }}>/{items.length}</span>
        </div>
        <Link href={`/topics/${topicId}`} className={buttonPrimaryClass}>
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
            style={{ height: '100%', borderRadius: 999, background: DISC_COLOR }}
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
        <p style={{ font: '600 12px var(--font-body)', letterSpacing: '.05em', textTransform: 'uppercase', color: DISC_COLOR, margin: '0 0 10px' }}>
          Pergunta discursiva {idx + 1}
        </p>
        <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 21, lineHeight: 1.3, letterSpacing: '-.01em', margin: '0 0 18px' }}>
          <RichText text={item.question} />
        </h3>

        {!revealed ? (
          <div style={{ borderRadius: 14, padding: 22, background: '#FAFAF8', border: '1.5px dashed rgba(0,0,0,.14)', textAlign: 'center' }}>
            <p style={{ fontSize: '14.5px', color: '#86827A', margin: '0 0 16px' }}>
              Pense na sua resposta em voz alta antes de revelar.
            </p>
            <button
              onClick={() => setRevealed(true)}
              className="rcp-btn-primary"
              style={{ background: DISC_COLOR, boxShadow: `0 8px 18px -9px ${DISC_COLOR}b3` }}
            >
              <i className="ph-fill ph-eye" /> Revelar resposta modelo
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ borderRadius: 14, padding: 16, background: '#F3F2FF', border: '1px solid #E1DEFB' }}>
              <p style={{ font: '600 12px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: DISC_COLOR, margin: '0 0 8px' }}>
                Resposta modelo
              </p>
              {item.model_answer ? (
                <div style={{ fontSize: 15, lineHeight: 1.65, color: '#35322D' }}>
                  <RichText text={item.model_answer} />
                </div>
              ) : (
                <em style={{ color: '#86827A' }}>Sem resposta modelo cadastrada.</em>
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
