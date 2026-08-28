'use client';

import { motion } from 'motion/react';
import { DiagramSvg } from '@/lib/diagram';
import { RichText } from '@/lib/render';
import type { AnalogyDiagram } from '@/lib/types';

// O material de apoio de um degrau. Cada runner passa o que faz sentido ali:
// a analogia visual no "explique em voz alta", o conceito nos cartões e nas
// discursivas, o código na prática.
export interface HintData {
  text?: string;
  diagram?: AnalogyDiagram;
  caption?: string;
}

export function hasHint(hint: HintData | undefined): boolean {
  return Boolean(hint && (hint.text?.trim() || hint.diagram?.shapes.length));
}

const HINT_COLOR = '#0BA5EC';
const HINT_TINT = '#E0F2FE';

// O conteúdo puro, sem cadeado. É o que aparece depois da tentativa, de graça:
// ali já não há o que medir, e reencontrar a estrutura é justamente o objetivo.
export function HintContent({ hint, label }: { hint: HintData; label: string }) {
  return (
    <div style={{ borderRadius: 14, padding: 15, background: HINT_TINT, textAlign: 'left' }}>
      <p
        style={{
          font: '600 12px var(--font-body)',
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          color: '#0369A1',
          margin: '0 0 9px',
        }}
      >
        {label}
      </p>
      {hint.diagram && hint.diagram.shapes.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 8, marginBottom: hint.caption || hint.text ? 10 : 0 }}>
          <DiagramSvg diagram={hint.diagram} />
        </div>
      )}
      {hint.caption && (
        <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#35322D' }}>
          <RichText text={hint.caption} />
        </div>
      )}
      {hint.text && !hint.caption && (
        <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#35322D' }}>
          <RichText text={hint.text} />
        </div>
      )}
    </div>
  );
}

// A dica com preço, para uso DURANTE a tentativa.
//
// Dica visível no meio de um teste de recuperação destrói a medição: se ela for
// grátis, quase todo mundo abre e depois marca "Bom" — e a escada infla sozinha,
// sem ninguém estar mentindo. Por isso o cadeado diz o preço antes de ser aberto
// e a sessão fica limitada a "Difícil" depois. A dica continua generosa (ela te
// destrava e você aprende), só não sobe degrau.
export function ReviewHint({
  hint,
  label,
  used,
  onUse,
}: {
  hint: HintData;
  label: string;
  used: boolean;
  onUse: () => void;
}) {
  if (!hasHint(hint)) return null;

  if (used) {
    return (
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ marginBottom: 16 }}>
        <HintContent hint={hint} label={label} />
        <p style={{ fontSize: 12.5, color: '#86827A', margin: '7px 2px 0' }}>
          <i className="ph ph-info" /> Dica aberta — esta sessão vai até &quot;Difícil&quot;.
        </p>
      </motion.div>
    );
  }

  return (
    <button
      type="button"
      onClick={onUse}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        marginBottom: 16,
        padding: '12px 15px',
        borderRadius: 14,
        cursor: 'pointer',
        textAlign: 'left',
        background: '#fff',
        border: '1.5px dashed rgba(0,0,0,.16)',
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          flex: 'none',
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          background: HINT_TINT,
        }}
      >
        <i className="ph-fill ph-lightbulb" style={{ color: HINT_COLOR, fontSize: 16 }} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', font: '600 14px var(--font-body)', color: '#161616' }}>
          Travei — abrir {label.toLowerCase()}
        </span>
        <span style={{ display: 'block', fontSize: 12.5, color: '#86827A', marginTop: 2, lineHeight: 1.45 }}>
          Destrava você agora, mas limita esta sessão a &quot;Difícil&quot;.
        </span>
      </span>
    </button>
  );
}
