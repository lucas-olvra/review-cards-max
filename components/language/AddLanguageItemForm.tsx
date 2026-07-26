'use client';

import { useRef, useState } from 'react';
import { addLanguageItem } from '@/lib/actions/language';
import { McpHint } from '@/components/McpHint';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, textareaClass } from '@/lib/ui';
import type { LanguageItemKind } from '@/lib/types';

const COPY: Record<LanguageItemKind, { cta: string; title: string; termLabel: string; termPh: string; meaningPh: string; examplesLabel: string; examplesPh: string; mcpExample: string }> = {
  frame: {
    cta: 'Adicionar molde',
    title: 'Novo molde de frase',
    termLabel: 'Molde',
    termPh: 'ex: I used to ___',
    meaningPh: 'ex: Eu costumava ___',
    examplesLabel: 'Exemplos (um por linha)',
    examplesPh: 'I used to live there.\nI used to work at night.',
    mcpExample: 'Adicione o molde "I used to ___" na minha seção de inglês, com 3 exemplos.',
  },
  word: {
    cta: 'Adicionar palavra',
    title: 'Nova palavra',
    termLabel: 'Palavra ou expressão',
    termPh: 'ex: deadline',
    meaningPh: 'ex: prazo final',
    examplesLabel: 'Exemplos de uso (um por linha)',
    examplesPh: 'The deadline is Friday.',
    mcpExample: 'Adicione na minha seção de inglês as 20 palavras mais usadas em reunião de trabalho.',
  },
};

export function AddLanguageItemForm({
  sectionId,
  kind,
  categories,
}: {
  sectionId: string;
  kind: LanguageItemKind;
  categories: string[];
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const copy = COPY[kind];

  if (!open) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setOpen(true)} className="rcp-panel-empty" style={{ width: 'auto', flex: 1, minWidth: 200 }}>
          <i className="ph ph-plus" /> {copy.cta}
        </button>
        <McpHint example={copy.mcpExample} />
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addLanguageItem(sectionId, kind, formData);
        formRef.current?.reset();
        setOpen(false);
      }}
      className="rcp-card"
      style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <h4 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>
          {copy.title}
        </h4>
        <McpHint example={copy.mcpExample} />
      </div>

      <div className="rcp-two-col" style={{ gap: 10 }}>
        <label>
          <span className="rcp-label">{copy.termLabel}</span>
          <input name="term" required placeholder={copy.termPh} className={inputClass} />
        </label>
        <label>
          <span className="rcp-label">Significado em português</span>
          <input name="meaning" placeholder={copy.meaningPh} className={inputClass} />
        </label>
      </div>

      <label>
        <span className="rcp-label">Grupo (opcional)</span>
        <input name="category" list={`cats-${kind}`} placeholder="ex: Trabalho" className={inputClass} />
        <datalist id={`cats-${kind}`}>
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <label>
        <span className="rcp-label">{copy.examplesLabel}</span>
        <textarea name="examples" placeholder={copy.examplesPh} className={textareaClass} style={{ minHeight: 76 }} />
      </label>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className={buttonPrimaryClass} style={{ padding: '10px 18px', fontSize: 14 }}>
          Salvar
        </button>
        <button type="button" onClick={() => setOpen(false)} className={buttonSecondaryClass} style={{ padding: '10px 18px' }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
