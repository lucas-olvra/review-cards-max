'use client';

import { useState, useTransition } from 'react';
import { RichText } from '@/lib/render';
import { buttonPrimaryClass, labelClass, textareaClass } from '@/lib/ui';

type FieldDef = { name: string; label: string; value: string };

export function EditablePanel({
  icon,
  title,
  color,
  tint,
  fields,
  action,
  emptyLabel,
  isCode,
}: {
  icon: string;
  title: string;
  color: string;
  tint: string;
  fields: FieldDef[];
  action: (formData: FormData) => Promise<void>;
  emptyLabel?: string;
  isCode?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hasContent = fields.some((f) => f.value?.trim());

  if (!hasContent && !editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="rcp-panel-empty" style={{ marginBottom: 14 }}>
        {emptyLabel ?? `+ ${title}`}
      </button>
    );
  }

  return (
    <div className="rcp-stage-panel" style={{ marginBottom: 14 }}>
      <div style={{ height: 4, background: color }} />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', background: tint }}>
            <i className={icon} style={{ color, fontSize: 18 }} />
          </span>
          <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.01em', margin: 0, flex: 1 }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rcp-pill-btn"
            style={{ background: tint, color }}
          >
            {editing ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {editing ? (
          <form
            action={(formData) =>
              startTransition(async () => {
                await action(formData);
                setEditing(false);
              })
            }
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {fields.map((f) => (
              <div key={f.name}>
                <label className={labelClass}>{f.label}</label>
                <textarea name={f.name} defaultValue={f.value} className={textareaClass} />
              </div>
            ))}
            <button type="submit" disabled={isPending} className={buttonPrimaryClass} style={{ alignSelf: 'flex-start' }}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        ) : isCode ? (
          <pre
            className="rcp-scroll rcp-font-code"
            style={{
              margin: 0,
              overflowX: 'auto',
              background: '#161616',
              borderRadius: 12,
              padding: 16,
              fontSize: 13,
              lineHeight: 1.6,
              color: '#E6E6E6',
            }}
          >
            <code>{fields[0]?.value}</code>
          </pre>
        ) : (
          fields.map((f) => (
            <div key={f.name} style={{ fontSize: 15, lineHeight: 1.65, color: '#35322D' }}>
              <RichText text={f.value} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
