'use client';

import { useState, useTransition } from 'react';
import { RichText } from '@/lib/render';
import { createCard, updateCard, deleteCard, type CardInput } from '@/lib/actions/cards';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import {
  buttonDangerClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
  textareaClass,
} from '@/lib/ui';
import type { Card } from '@/lib/types';

function CardForm({
  topicId,
  card,
  onDone,
}: {
  topicId: string;
  card?: Card;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4"
      action={(formData) => {
        const input: CardInput = {
          question: (formData.get('question') as string) ?? '',
          options: [0, 1, 2, 3].map((i) => (formData.get(`option${i}`) as string) ?? ''),
          correct: Math.max(0, Math.min(3, parseInt((formData.get('correct') as string) || '0', 10))),
          explanation: (formData.get('explanation') as string) ?? '',
          analogy: (formData.get('analogy') as string) ?? '',
        };
        startTransition(async () => {
          if (card) {
            await updateCard(card.id, topicId, input);
          } else {
            await createCard(topicId, input);
          }
          onDone();
        });
      }}
    >
      <div>
        <label className={labelClass}>Pergunta</label>
        <textarea name="question" defaultValue={card?.question} required className={textareaClass} />
      </div>
      {(['A', 'B', 'C', 'D'] as const).map((letter, i) => (
        <div key={letter}>
          <label className={labelClass}>Alternativa {letter}</label>
          <input
            name={`option${i}`}
            defaultValue={card?.options?.[i]}
            required
            className={inputClass}
          />
        </div>
      ))}
      <div>
        <label className={labelClass}>Resposta correta</label>
        <select name="correct" defaultValue={String(card?.correct ?? 0)} className={inputClass}>
          {(['A', 'B', 'C', 'D'] as const).map((letter, i) => (
            <option key={letter} value={i}>
              {letter}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Explicação</label>
        <textarea name="explanation" defaultValue={card?.explanation} className={textareaClass} />
      </div>
      <div>
        <label className={labelClass}>Analogia (opcional)</label>
        <textarea name="analogy" defaultValue={card?.analogy} className={textareaClass} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" onClick={onDone} className={buttonSecondaryClass}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function CardsSection({ topicId, cards }: { topicId: string; cards: Card[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Cartões</h3>
        {!creating && (
          <button onClick={() => setCreating(true)} className={buttonSecondaryClass}>
            + Cartão
          </button>
        )}
      </div>

      {creating && <CardForm topicId={topicId} onDone={() => setCreating(false)} />}

      {cards.map((card) =>
        editingId === card.id ? (
          <CardForm key={card.id} topicId={topicId} card={card} onDone={() => setEditingId(null)} />
        ) : (
          <div key={card.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="font-medium">
              <RichText text={card.question} />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setEditingId(card.id)} className={buttonSecondaryClass}>
                Editar
              </button>
              <ConfirmSubmitButton
                action={deleteCard.bind(null, card.id, topicId)}
                confirmMessage="Excluir cartão?"
                className={buttonDangerClass}
              >
                Excluir
              </ConfirmSubmitButton>
            </div>
          </div>
        )
      )}
    </div>
  );
}
