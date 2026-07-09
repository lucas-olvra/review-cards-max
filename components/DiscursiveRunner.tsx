'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RichText } from '@/lib/render';
import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '@/lib/ui';
import type { DiscursiveQuestion } from '@/lib/types';

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
    return <p className="text-slate-400">Sem perguntas discursivas para revisar ainda.</p>;
  }

  if (idx >= items.length) {
    return (
      <div className={cardClass}>
        <h2 className="mb-2 text-xl font-bold">Resultado</h2>
        <p className="mb-4 text-slate-300">
          Acertos: {hits}/{items.length}
        </p>
        <Link href={`/topics/${topicId}`} className={buttonPrimaryClass}>
          Voltar ao tópico
        </Link>
      </div>
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
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mb-4 text-sm text-slate-400">
        Pergunta {idx + 1} de {items.length}
      </p>

      <div className={cardClass}>
        <h3 className="mb-3 text-lg font-semibold">
          <RichText text={item.question} />
        </h3>

        {!revealed ? (
          <>
            <p className="mb-3 text-sm text-slate-400">Pense na sua resposta antes de revelar.</p>
            <button onClick={() => setRevealed(true)} className={buttonSecondaryClass}>
              Revelar resposta modelo
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-800/60 p-4 text-sm">
              {item.model_answer ? (
                <RichText text={item.model_answer} />
              ) : (
                <em className="text-slate-400">Sem resposta modelo cadastrada.</em>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => advance(true)} className={buttonPrimaryClass}>
                ✓ Acertei
              </button>
              <button onClick={() => advance(false)} className={buttonSecondaryClass}>
                ✗ Preciso revisar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
