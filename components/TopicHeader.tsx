'use client';

import { useState, useTransition } from 'react';
import { updateTopicPanel } from '@/lib/actions/topics';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass } from '@/lib/ui';

export function TopicHeader({ topicId, name }: { topicId: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{name}</h1>
        <button
          onClick={() => setEditing(true)}
          className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-700"
        >
          Editar nome
        </button>
      </div>
    );
  }

  return (
    <form
      className="mb-4 flex items-center gap-2"
      action={(formData) =>
        startTransition(async () => {
          await updateTopicPanel(topicId, ['name'], formData);
          setEditing(false);
        })
      }
    >
      <input name="name" defaultValue={name} required className={inputClass} />
      <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
        Salvar
      </button>
      <button type="button" onClick={() => setEditing(false)} className={buttonSecondaryClass}>
        Cancelar
      </button>
    </form>
  );
}
