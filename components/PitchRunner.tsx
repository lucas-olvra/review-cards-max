'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { RichText } from '@/lib/render';
import { accent, buttonPrimaryClass, buttonSecondaryClass, cardClass } from '@/lib/ui';

const DURATION = 30;
const CIRCUMFERENCE = 2 * Math.PI * 88;

export function PitchRunner({
  topicId,
  topicName,
  pitch,
}: {
  topicId: string;
  topicName: string;
  pitch: string;
}) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'revealed'>('idle');
  const [remaining, setRemaining] = useState(DURATION);

  // O efeito só existe enquanto phase === 'running'; ao desmontar ou trocar
  // de fase (inclusive saindo da tela), o cleanup limpa o interval —
  // diferente da versão vanilla, aqui não há risco de timer órfão.
  useEffect(() => {
    if (phase !== 'running') return;
    const timeout = setTimeout(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setPhase('revealed');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [phase, remaining]);

  const restart = () => {
    setRemaining(DURATION);
    setPhase('idle');
  };

  const ringColor = remaining <= 5 ? '#EF4444' : '#FB6514';
  const ringOffset = CIRCUMFERENCE * (1 - remaining / DURATION);

  return (
    <div className={cardClass} style={{ textAlign: 'center', borderRadius: 24, padding: '40px 30px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 13px',
          borderRadius: 999,
          background: '#FFEBDF',
          marginBottom: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <i className="ph-fill ph-microphone-stage" style={{ color: '#FB6514', fontSize: 15 }} />
        <span style={{ font: '600 12.5px var(--font-body)', color: '#C2410C' }}>Explique em 30 segundos</span>
      </div>
      <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 26, letterSpacing: '-.02em', margin: '0 0 22px' }}>
        {topicName}
      </h2>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#6B6862', margin: '0 auto 26px', maxWidth: '40ch' }}>
              Ensine este tópico em voz alta, como se explicasse para alguém. Clique em começar
              quando estiver pronto.
            </p>
            <button
              onClick={() => setPhase('running')}
              style={{
                border: 'none',
                cursor: 'pointer',
                font: '700 16px var(--font-body)',
                color: '#fff',
                background: 'linear-gradient(120deg, #FB6514, #F5A524)',
                padding: '15px 32px',
                borderRadius: 999,
                boxShadow: '0 12px 26px -10px rgba(251,101,20,.6)',
              }}
            >
              <i className="ph-fill ph-play" /> Começar
            </button>
          </motion.div>
        )}

        {phase === 'running' && (
          <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 22px' }}>
              <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="100" cy="100" r="88" fill="none" stroke="#F0EDE6" strokeWidth="14" />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 58, letterSpacing: '-.03em', color: ringColor }}>
                  {remaining}
                  <span style={{ fontSize: 24, color: '#C9C4BB' }}>s</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 20px' }}>
              Fale sem parar. Estruture: o que é → por que → exemplo.
            </p>
            <button onClick={() => setPhase('revealed')} className={buttonSecondaryClass} style={{ borderRadius: 999 }}>
              Terminei / Pular
            </button>
          </motion.div>
        )}

        {phase === 'revealed' && (
          <motion.div key="revealed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ textAlign: 'left' }}>
            <div style={{ borderRadius: 16, padding: 20, background: '#FFF7F0', border: '1px solid #FBE2CE', margin: '0 0 22px' }}>
              <p style={{ font: '600 12px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: '#C2410C', margin: '0 0 9px' }}>
                Seu resumo de referência
              </p>
              {pitch ? (
                <div style={{ fontSize: '15.5px', lineHeight: 1.65, color: '#35322D' }}>
                  <RichText text={pitch} />
                </div>
              ) : (
                <em style={{ color: '#86827A' }}>Sem resumo salvo.</em>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={restart} className={buttonSecondaryClass}>
                <i className="ph ph-arrow-clockwise" /> Tentar de novo
              </button>
              <Link href={`/topics/${topicId}`} className={buttonPrimaryClass} style={{ background: accent }}>
                Voltar ao tópico
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
