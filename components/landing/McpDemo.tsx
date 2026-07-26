'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const PROMPT = 'Crie um tópico completo sobre enum em Java na seção "Java Orientada a Objetos".';

const FIELDS = [
  'O que é',
  'Por que existe',
  'Código',
  'Onde usar',
  'Onde não usar',
  'Erros comuns',
  'Prática',
  '4 cartões',
  '2 discursivas',
  'Analogia visual',
];

// Digita o prompt e vai carimbando os campos preenchidos. É a promessa mais
// forte do app pra quem já usa um assistente com MCP: você não preenche nada.
// Quem pediu menos movimento vê o resultado final direto, sem digitação. Isso
// é decidido no inicializador do estado (e não dentro do efeito) pra não
// disparar um render em cascata só pra corrigir o valor inicial.
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function McpDemo() {
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? PROMPT.length : 0));
  const [done, setDone] = useState(() => (prefersReducedMotion() ? FIELDS.length : 0));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;

    function run() {
      setTyped(0);
      setDone(0);

      for (let i = 1; i <= PROMPT.length; i++) {
        timers.current.push(setTimeout(() => !cancelled && setTyped(i), i * 26));
      }
      const afterTyping = PROMPT.length * 26 + 400;
      for (let f = 1; f <= FIELDS.length; f++) {
        timers.current.push(setTimeout(() => !cancelled && setDone(f), afterTyping + f * 220));
      }
      // Recomeça depois de uma pausa, pra quem chegou no meio ver do início.
      timers.current.push(setTimeout(() => !cancelled && run(), afterTyping + FIELDS.length * 220 + 3200));
    }

    run();
    const list = timers.current;
    return () => {
      cancelled = true;
      list.forEach(clearTimeout);
    };
  }, []);

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,.07)', background: '#0E0E10' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: 999, background: c }} />
        ))}
        <span style={{ font: '500 12px var(--font-body)', color: 'rgba(255,255,255,.45)', marginLeft: 8 }}>
          seu assistente · MCP
        </span>
      </div>

      <div style={{ padding: '20px 18px 22px' }}>
        <div
          className={typed < PROMPT.length ? 'rcp-font-code rcp-lp-caret' : 'rcp-font-code'}
          style={{ fontSize: 13.5, lineHeight: 1.6, color: '#C9D2FF', minHeight: '3.2em' }}
        >
          <span style={{ color: 'rgba(255,255,255,.35)' }}>&gt; </span>
          {PROMPT.slice(0, typed)}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 18, minHeight: 84 }}>
          <AnimatePresence>
            {FIELDS.slice(0, done).map((f) => (
              <motion.span
                key={f}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  font: '500 12.5px var(--font-body)',
                  color: '#8CE9C0',
                  background: 'rgba(14,159,110,.16)',
                  border: '1px solid rgba(14,159,110,.35)',
                  padding: '6px 11px',
                  borderRadius: 999,
                }}
              >
                <i className="ph-bold ph-check" style={{ fontSize: 11 }} /> {f}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {done >= FIELDS.length && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ font: '500 13px var(--font-body)', color: 'rgba(255,255,255,.5)', margin: '14px 0 0' }}
          >
            Tópico criado. Ele já está na sua seção, pronto pra revisar.
          </motion.p>
        )}
      </div>
    </div>
  );
}
