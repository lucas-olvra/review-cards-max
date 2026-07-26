'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { SectionKind } from '@/lib/types';

const KINDS: {
  kind: SectionKind;
  title: string;
  tagline: string;
  icon: string;
  bg: string;
  itemLabel: string;
}[] = [
  {
    kind: 'programming',
    title: 'Programação',
    tagline: 'Ciclo completo por tópico: conceito, código, prática, revisão e analogia visual.',
    icon: 'ph-fill ph-brain',
    bg: '#2C4BE0',
    itemLabel: 'seções',
  },
  {
    kind: 'language',
    title: 'Idiomas',
    tagline: 'Os moldes de frase e as palavras que resolvem a conversa — treinados narrando em voz alta.',
    icon: 'ph-fill ph-translate',
    bg: '#0BA5EC',
    itemLabel: 'seções',
  },
];

export function ContentKindGrid({ counts }: { counts: Record<SectionKind, number> }) {
  return (
    <motion.div
      className="rcp-two-col"
      style={{ gap: 18 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      initial="hidden"
      animate="show"
    >
      {KINDS.map((k) => (
        <motion.div key={k.kind} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
          <Link
            href={`/sections?kind=${k.kind}`}
            className="rcp-topic-card"
            style={{ background: k.bg, borderColor: k.bg, color: '#fff', minHeight: 210 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255,255,255,.2)',
                }}
              >
                <i className={k.icon} style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <i className="ph-bold ph-arrow-up-right" style={{ fontSize: 18, color: 'rgba(255,255,255,.85)' }} />
            </div>
            <div>
              <h3
                className="rcp-font-display"
                style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 8px', color: '#fff' }}
              >
                {k.title}
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,.85)', margin: '0 0 14px' }}>
                {k.tagline}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  font: '500 12.5px var(--font-body)',
                  color: '#fff',
                  background: 'rgba(255,255,255,.18)',
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                {counts[k.kind]} {k.itemLabel}
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
