'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { RichText } from '@/lib/render';
import {
  createDiscursive,
  updateDiscursive,
  deleteDiscursive,
  type DiscursiveInput,
} from '@/lib/actions/discursive';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import {
  buttonDangerClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  labelClass,
  textareaClass,
} from '@/lib/ui';
import type { DiscursiveQuestion } from '@/lib/types';

const DISC_COLOR = '#4F46E5';
const DISC_TINT = '#E9E8FF';

function DiscursiveForm({
  topicId,
  item,
  onDone,
}: {
  topicId: string;
  item?: DiscursiveQuestion;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="rcp-card"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      action={(formData) => {
        const input: DiscursiveInput = {
          question: (formData.get('question') as string) ?? '',
          model_answer: (formData.get('model_answer') as string) ?? '',
        };
        startTransition(async () => {
          if (item) {
            await updateDiscursive(item.id, topicId, input);
          } else {
            await createDiscursive(topicId, input);
          }
          onDone();
        });
      }}
    >
      <div>
        <label className={labelClass}>Pergunta</label>
        <textarea name="question" defaultValue={item?.question} required className={textareaClass} />
      </div>
      <div>
        <label className={labelClass}>Resposta modelo (o que uma boa resposta deveria cobrir)</label>
        <textarea name="model_answer" defaultValue={item?.model_answer} className={textareaClass} />
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
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function DiscursiveSection({
  topicId,
  items,
}: {
  topicId: string;
  items: DiscursiveQuestion[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center', background: DISC_TINT }}>
            <i className="ph-fill ph-chat-circle-dots" style={{ color: DISC_COLOR, fontSize: 16 }} />
          </span>
          <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 17, margin: 0 }}>
            Discursivas <span style={{ color: '#A29E96', fontWeight: 500 }}>· {items.length}</span>
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!creating && (
            <button type="button" onClick={() => setCreating(true)} className={buttonSecondaryClass}>
              <i className="ph-bold ph-plus" style={{ fontSize: 12 }} /> Discursiva
            </button>
          )}
          {items.length > 0 && (
            <Link
              href={`/topics/${topicId}/review-discursive`}
              className="rcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DISC_COLOR, boxShadow: `0 6px 16px -7px ${DISC_COLOR}b3` }}
            >
              <i className="ph-fill ph-play" style={{ fontSize: 12 }} /> Revisar discursivas
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {creating && (
          <motion.div
            key="new-discursive-form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <DiscursiveForm topicId={topicId} onDone={() => setCreating(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} variants={container} initial="hidden" animate="show">
        <AnimatePresence initial={false}>
          {items.map((item) =>
            editingId === item.id ? (
              <DiscursiveForm key={item.id} topicId={topicId} item={item} onDone={() => setEditingId(null)} />
            ) : (
              <motion.div
                key={item.id}
                layout
                variants={itemVariants}
                exit={{ opacity: 0, height: 0 }}
                className="rcp-list-row"
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <i className="ph ph-quotes" style={{ color: DISC_COLOR, fontSize: 18 }} />
                <div style={{ flex: 1, fontSize: 15, color: '#35322D', lineHeight: 1.4 }}>
                  <RichText text={item.question} />
                </div>
                <button type="button" onClick={() => setEditingId(item.id)} className="rcp-icon-btn">
                  <i className="ph ph-pencil-simple" style={{ fontSize: 16 }} />
                </button>
                <ConfirmSubmitButton
                  action={deleteDiscursive.bind(null, item.id, topicId)}
                  confirmMessage="Excluir pergunta discursiva?"
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
