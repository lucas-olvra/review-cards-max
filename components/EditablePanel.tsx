'use client';

import { useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RichText } from '@/lib/render';
import { buttonPrimaryClass, labelClass, textareaClass } from '@/lib/ui';

type FieldDef = { name: string; label: string; value: string };

export function EditablePanel({
  icon,
  title,
  fields,
  action,
  defaultOpen,
  emptyLabel,
}: {
  icon: string;
  title: string;
  fields: FieldDef[];
  action: (formData: FormData) => Promise<void>;
  defaultOpen?: boolean;
  emptyLabel?: string;
}) {
  // manualOpen === null significa "sem override do usuário ainda" -> usa defaultOpen.
  // Isso espelha o comportamento anterior (open={defaultOpen || editing} num <details>
  // nativo), só que como estado explícito, necessário para animar com Motion.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hasContent = fields.some((f) => f.value?.trim());
  const open = editing || (manualOpen ?? !!defaultOpen);

  const toggleOpen = () => setManualOpen((o) => !(o ?? !!defaultOpen));

  if (!hasContent && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mb-3 w-full rounded-lg border border-dashed border-slate-700 py-3 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
      >
        {emptyLabel ?? `+ ${title}`}
      </button>
    );
  }

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        }}
        className="flex cursor-pointer items-center gap-2 px-4 py-3 font-medium select-none"
      >
        <span>
          {icon} {title}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditing((v) => !v);
          }}
          className="ml-auto rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-indigo-300 transition-colors hover:bg-slate-700"
        >
          {editing ? 'Cancelar' : 'Editar'}
        </button>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-slate-500"
        >
          ▸
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-800 px-4 py-4">
              {editing ? (
                <form
                  action={(formData) =>
                    startTransition(async () => {
                      await action(formData);
                      setEditing(false);
                    })
                  }
                  className="space-y-3"
                >
                  {fields.map((f) => (
                    <div key={f.name}>
                      <label className={labelClass}>{f.label}</label>
                      <textarea name={f.name} defaultValue={f.value} className={textareaClass} />
                    </div>
                  ))}
                  <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
                    {isPending ? 'Salvando...' : 'Salvar'}
                  </button>
                </form>
              ) : (
                fields.map((f) => <RichText key={f.name} text={f.value} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
