'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// A ideia dos moldes é difícil de explicar e óbvia de ver: o molde fica
// parado, só o espaço em branco troca. A animação faz exatamente isso.
const FILLS = [
  'leave early today',
  'call the doctor',
  'pay this bill',
  'find another way',
  'practice more',
];

export function FrameSwapper() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % FILLS.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rcp-card" style={{ padding: 26 }}>
      <span style={{ font: '600 11.5px var(--font-body)', letterSpacing: '.06em', textTransform: 'uppercase', color: '#0BA5EC' }}>
        Um molde, cinquenta frases
      </span>

      <div
        className="rcp-font-code"
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 9, fontSize: 'clamp(19px, 3.2vw, 27px)', margin: '16px 0 0', color: '#161616' }}
      >
        <span>I need to</span>
        <span style={{ position: 'relative', display: 'inline-flex', minHeight: '1.4em', alignItems: 'baseline' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
              style={{
                background: 'linear-gradient(transparent 62%, #BAE6FD 62%)',
                color: '#0369A1',
                paddingRight: 2,
              }}
            >
              {FILLS[i]}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#6B6862', margin: '18px 0 0' }}>
        Você aprende <b>20 moldes</b> e o núcleo de <b>300 a 500 palavras</b> que resolve a conversa. Depois narra
        a própria rotina em voz alta, 5 minutos por dia — travou, fala em português e segue.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 16 }}>
        {['Can you ___?', "I'm ___ing", 'How much is ___?', "I'm looking for ___"].map((f) => (
          <span
            key={f}
            className="rcp-font-code"
            style={{ font: '400 12.5px var(--font-code)', color: '#0369A1', background: '#E0F2FE', padding: '6px 11px', borderRadius: 999 }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
