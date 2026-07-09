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
      className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4"
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          💬 Perguntas Discursivas
        </h3>
        <div className="flex gap-2">
          {items.length > 0 && (
            <Link href={`/topics/${topicId}/review-discursive`} className={buttonSecondaryClass}>
              Revisar Discursivas
            </Link>
          )}
          {!creating && (
            <button onClick={() => setCreating(true)} className={buttonSecondaryClass}>
              + Pergunta Discursiva
            </button>
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

      <motion.div className="space-y-3" variants={container} initial="hidden" animate="show">
        <AnimatePresence initial={false}>
          {items.map((item) =>
            editingId === item.id ? (
              <DiscursiveForm
                key={item.id}
                topicId={topicId}
                item={item}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <motion.div
                key={item.id}
                layout
                variants={itemVariants}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-slate-800 bg-slate-900 p-4"
              >
                <div className="font-medium">
                  <RichText text={item.question} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setEditingId(item.id)} className={buttonSecondaryClass}>
                    Editar
                  </button>
                  <ConfirmSubmitButton
                    action={deleteDiscursive.bind(null, item.id, topicId)}
                    confirmMessage="Excluir pergunta discursiva?"
                    className={buttonDangerClass}
                  >
                    Excluir
                  </ConfirmSubmitButton>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
