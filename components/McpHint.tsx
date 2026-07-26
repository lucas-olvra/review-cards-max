'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { accent } from '@/lib/ui';

// Explicação de uma frase sobre pedir conteúdo pra IA. Quem já usa MCP resolve
// aqui mesmo; quem não entendeu cai na página de Tokens & MCP, que tem o
// passo a passo completo de configuração.
export function McpHint({ example }: { example: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rcp-pill-btn"
        style={{ background: '#E9ECFF', color: accent, display: 'inline-flex', alignItems: 'center', gap: 5 }}
      >
        <i className="ph-fill ph-robot" style={{ fontSize: 13 }} /> Pedir pra IA
      </button>

      <AnimatePresence>
        {open && (
          <>
            <span onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="rcp-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                // Ancorado à direita porque o botão fica sempre no fim da
                // linha — abrir pela esquerda estouraria a borda da viewport
                // e criaria scroll horizontal na página inteira.
                right: 0,
                zIndex: 40,
                width: 290,
                maxWidth: 'min(290px, calc(100vw - 52px))',
                padding: 15,
                display: 'block',
              }}
            >
              <span style={{ display: 'block', font: '600 13.5px var(--font-body)', marginBottom: 6 }}>
                Conecte seu assistente e peça
              </span>
              <span style={{ display: 'block', fontSize: 13, color: '#6B6862', lineHeight: 1.55, marginBottom: 10 }}>
                Com o MCP ligado, você pede em linguagem natural e o conteúdo entra direto nesta seção.
              </span>
              <code
                className="rcp-font-code"
                style={{
                  display: 'block',
                  fontSize: 12,
                  background: '#F5F3EE',
                  borderRadius: 9,
                  padding: '9px 11px',
                  color: '#55524B',
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {example}
              </code>
              <Link
                href="/settings/tokens"
                onClick={() => setOpen(false)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
              >
                Não entendi — como configuro? <i className="ph-bold ph-arrow-right" style={{ fontSize: 12 }} />
              </Link>
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </span>
  );
}
