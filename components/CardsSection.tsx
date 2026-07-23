'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
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

const CARD_COLOR = '#0891A5';
const CARD_TINT = '#E0F7FB';

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
      className="rcp-card"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
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
      <div style={{ display: 'flex', gap: 8 }}>
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function CardsSection({ topicId, cards }: { topicId: string; cards: Card[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center', background: CARD_TINT }}>
            <i className="ph-fill ph-cards" style={{ color: CARD_COLOR, fontSize: 16 }} />
          </span>
          <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 17, margin: 0 }}>
            Cartões <span style={{ color: '#A29E96', fontWeight: 500 }}>· {cards.length}</span>
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!creating && (
            <button type="button" onClick={() => setCreating(true)} className={buttonSecondaryClass}>
              <i className="ph-bold ph-plus" style={{ fontSize: 12 }} /> Cartão
            </button>
          )}
          {cards.length > 0 && (
            <Link
              href={`/topics/${topicId}/review`}
              className="rcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: CARD_COLOR, boxShadow: `0 6px 16px -7px ${CARD_COLOR}b3` }}
            >
              <i className="ph-fill ph-play" style={{ fontSize: 12 }} /> Revisar cartões
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {creating && (
          <motion.div
            key="new-card-form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CardForm topicId={topicId} onDone={() => setCreating(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} variants={container} initial="hidden" animate="show">
        <AnimatePresence initial={false}>
          {cards.map((card, i) =>
            editingId === card.id ? (
              <CardForm key={card.id} topicId={topicId} card={card} onDone={() => setEditingId(null)} />
            ) : (
              <motion.div
                key={card.id}
                layout
                variants={item}
                exit={{ opacity: 0, height: 0 }}
                className="rcp-list-row"
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    flex: 'none',
                    borderRadius: 8,
                    background: CARD_TINT,
                    color: CARD_COLOR,
                    display: 'grid',
                    placeItems: 'center',
                    font: '600 13px var(--font-display)',
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, fontSize: 15, color: '#35322D', lineHeight: 1.4 }}>
                  <RichText text={card.question} />
                </div>
                <button type="button" onClick={() => setEditingId(card.id)} className="rcp-icon-btn">
                  <i className="ph ph-pencil-simple" style={{ fontSize: 16 }} />
                </button>
                <ConfirmSubmitButton
                  action={deleteCard.bind(null, card.id, topicId)}
                  confirmMessage="Excluir cartão?"
                  className={buttonDangerClass}
                >
                  Excluir
                </ConfirmSubmitButton>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
