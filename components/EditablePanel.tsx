'use client';

import { useState, useTransition } from 'react';
import { RichText } from '@/lib/render';
import { buttonPrimaryClass, buttonSecondaryClass, labelClass, textareaClass } from '@/lib/ui';

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
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hasContent = fields.some((f) => f.value?.trim());

  if (!hasContent && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mb-3 w-full rounded-lg border border-dashed border-slate-700 py-3 text-sm text-slate-400 hover:border-slate-500 hover:text-slate-200"
      >
        {emptyLabel ?? `+ ${title}`}
      </button>
    );
  }

  return (
    <details className="mb-3 rounded-lg border border-slate-800 bg-slate-900" open={defaultOpen || editing}>
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-medium">
        <span>
          {icon} {title}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditing((v) => !v);
          }}
          className="ml-auto rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-700"
        >
          {editing ? 'Cancelar' : 'Editar'}
        </button>
      </summary>
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
    </details>
  );
}
