'use client';

import { useState, useTransition } from 'react';
import { updateTopicPanel } from '@/lib/actions/topics';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass } from '@/lib/ui';

export function TopicHeader({
  topicId,
  name,
  icon,
  color,
}: {
  topicId: string;
  name: string;
  icon: string;
  color: string;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const chip = (
    <div style={{ width: 48, height: 48, borderRadius: 13, display: 'grid', placeItems: 'center', background: color }}>
      <i className={icon} style={{ color: '#fff', fontSize: 26 }} />
    </div>
  );

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        {chip}
        <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 32, letterSpacing: '-.025em', margin: 0 }}>
          {name}
        </h1>
        <button type="button" onClick={() => setEditing(true)} className="rcp-navlink" style={{ border: '1px solid rgba(0,0,0,.1)', borderRadius: 999, fontSize: '12.5px' }}>
          Editar nome
        </button>
      </div>
    );
  }

  return (
    <form
      style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}
      action={(formData) =>
        startTransition(async () => {
          await updateTopicPanel(topicId, ['name'], formData);
          setEditing(false);
        })
      }
    >
      {chip}
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
