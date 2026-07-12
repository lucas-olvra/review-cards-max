'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { paletteFor } from '@/lib/palette';
import type { Topic } from '@/lib/types';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function TopicsList({
  topics,
  newTopicHref,
}: {
  topics: (Topic & { cardsN: number; discN: number })[];
  newTopicHref: string;
}) {
  return (
    <motion.div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {topics.map((topic, i) => {
        const p = paletteFor(i);
        return (
          <motion.div key={topic.id} variants={item}>
            <Link
              href={`/topics/${topic.id}`}
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
                  <i className={p.icon} style={{ color: '#fff', fontSize: 22 }} />
                </div>
                <i className="ph-bold ph-arrow-up-right" style={{ fontSize: 18, color: 'rgba(255,255,255,.85)' }} />
              </div>
              <div>
                <h3
                  className="rcp-font-display"
                  style={{ fontWeight: 600, fontSize: 20, lineHeight: 1.15, letterSpacing: '-.01em', margin: '0 0 12px', color: '#fff' }}
                >
                  {topic.name}
                </h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                    <i className="ph-fill ph-cards" style={{ fontSize: 12 }} /> {topic.cardsN} cartões
                  </span>
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
                    <i className="ph-fill ph-chat-circle-dots" style={{ fontSize: 12 }} /> {topic.discN}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
      <Link href={newTopicHref} className="rcp-add-card">
        <div style={{ textAlign: 'center' }}>
          <i className="ph ph-plus-circle" style={{ fontSize: 30 }} />
          <div style={{ font: '500 14px var(--font-body)', marginTop: 8 }}>Novo tópico</div>
        </div>
      </Link>
    </motion.div>
  );
}
