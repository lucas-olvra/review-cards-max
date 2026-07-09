'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RichText } from '@/lib/render';
import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '@/lib/ui';
import type { Card } from '@/lib/types';

export function QuizRunner({
  topicId,
  cards,
  conceptWhat,
}: {
  topicId: string;
  cards: Card[];
  conceptWhat: string;
}) {
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  if (!cards.length) {
    return <p className="text-slate-400">Sem cartões para revisar ainda.</p>;
  }

  if (idx >= cards.length) {
    return (
      <div className={cardClass}>
        <h2 className="mb-2 text-xl font-bold">Resultado</h2>
        <p className="mb-4 text-slate-300">
          Acertos: {hits}/{cards.length}
        </p>
        <Link href={`/topics/${topicId}`} className={buttonPrimaryClass}>
          Voltar ao tópico
        </Link>
      </div>
    );
  }

  const card = cards[idx];
  const pct = (idx / cards.length) * 100;
  const answered = selected !== null;
  const ok = selected === card.correct;

  return (
    <div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mb-4 text-sm text-slate-400">
        Pergunta {idx + 1} de {cards.length}
      </p>

      {conceptWhat && (
        <details className="mb-4 rounded-lg border border-slate-800 bg-slate-900">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-indigo-300">
            📋 Consultar Conceito
          </summary>
          <div className="border-t border-slate-800 px-4 py-3 text-sm text-slate-300">
            <RichText text={conceptWhat} />
          </div>
        </details>
      )}

      <div className={cardClass}>
        <h3 className="mb-4 text-lg font-semibold">
          <RichText text={card.question} />
        </h3>

        <div className="space-y-2">
          {card.options.map((option, i) => (
            <button
              key={i}
              disabled={answered}
              onClick={() => setSelected(i)}
              className={`w-full rounded-lg border px-4 py-2.5 text-left transition-colors ${
                answered && i === card.correct
                  ? 'border-emerald-600 bg-emerald-950'
                  : answered && i === selected
                    ? 'border-red-600 bg-red-950'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <RichText text={option} />
            </button>
          ))}
        </div>

        {answered && (
          <div className={`mt-4 space-y-3 rounded-lg p-4 ${ok ? 'bg-emerald-950' : 'bg-red-950'}`}>
            <p className="font-bold">{ok ? '✓ Correto' : '✗ Incorreto'}</p>
            {!ok && (
              <p className="text-sm">
                Resposta correta: <strong>{card.options[card.correct]}</strong>
              </p>
            )}
            {card.explanation && (
              <p className="text-sm">
                📖 <RichText text={card.explanation} />
              </p>
            )}
            {card.analogy && (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-amber-300">
                  💡 Ver analogia
                </summary>
                <div className="mt-2 text-sm text-amber-200">
                  <RichText text={card.analogy} />
                </div>
              </details>
            )}
            <button
              onClick={() => {
                if (ok) setHits((h) => h + 1);
                setSelected(null);
                setIdx((i) => i + 1);
              }}
              className={buttonSecondaryClass}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
