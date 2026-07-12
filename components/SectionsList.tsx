'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { paletteFor } from '@/lib/palette';
import type { Section } from '@/lib/types';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function SectionCard({ section, index }: { section: Section & { itemsN: number }; index: number }) {
  const p = paletteFor(index);
  const icon = section.kind === 'language' ? 'ph-fill ph-translate' : p.icon;
  const itemLabel = section.kind === 'language' ? 'lições' : 'tópicos';

  return (
    <motion.div variants={item}>
      <Link
        href={`/sections/${section.id}`}
        className="rcp-topic-card"
        style={{ background: p.bg, borderColor: p.bg, color: '#fff' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(255,255,255,.2)',
            }}
          >
            <i className={icon} style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <i className="ph-bold ph-arrow-up-right" style={{ fontSize: 18, color: 'rgba(255,255,255,.85)' }} />
        </div>
        <div>
          <h3
            className="rcp-font-display"
            style={{ fontWeight: 600, fontSize: 20, lineHeight: 1.15, letterSpacing: '-.01em', margin: '0 0 12px', color: '#fff' }}
          >
            {section.name}
          </h3>
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
            {section.itemsN} {itemLabel}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function SectionsList({ sections }: { sections: (Section & { itemsN: number })[] }) {
  const programming = sections.filter((s) => s.kind === 'programming');
  const language = sections.filter((s) => s.kind === 'language');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <div>
        <h2 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 18, margin: '0 0 14px' }}>
          Programação
        </h2>
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {programming.map((s, i) => (
            <SectionCard key={s.id} section={s} index={i} />
          ))}
          <Link href="/sections/new?kind=programming" className="rcp-add-card">
            <div style={{ textAlign: 'center' }}>
              <i className="ph ph-plus-circle" style={{ fontSize: 30 }} />
              <div style={{ font: '500 14px var(--font-body)', marginTop: 8 }}>Nova seção</div>
            </div>
          </Link>
        </motion.div>
      </div>

      {language.length > 0 && (
        <div>
          <h2 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 18, margin: '0 0 14px' }}>
            Idiomas
          </h2>
          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}
            variants={container}
            initial="hidden"
            animate="show"
          >
            {language.map((s, i) => (
              <SectionCard key={s.id} section={s} index={i} />
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
