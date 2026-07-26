'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSection } from '@/lib/actions/sections';
import { LANGUAGE_LABELS } from '@/lib/language/seed';
import { accent, buttonPrimaryClass, buttonSecondaryClass, inputClass } from '@/lib/ui';
import type { LanguageCode, SectionKind } from '@/lib/types';

const KIND_OPTIONS: { kind: SectionKind; label: string; icon: string; color: string; tint: string; note: string; placeholder: string }[] = [
  {
    kind: 'programming',
    label: 'Programação',
    icon: 'ph-fill ph-brain',
    color: '#2C4BE0',
    tint: '#F3F4FF',
    note: 'Conceito, código, prática, revisão e analogia visual.',
    placeholder: 'ex: Java, Python, Estrutura de dados…',
  },
  {
    kind: 'language',
    label: 'Idiomas',
    icon: 'ph-fill ph-translate',
    color: '#0BA5EC',
    tint: '#E0F2FE',
    note: 'Moldes de frase, núcleo de vocabulário e narração em voz alta.',
    placeholder: 'ex: Inglês do trabalho, Inglês de viagem…',
  },
];

const LANGUAGES = Object.keys(LANGUAGE_LABELS) as LanguageCode[];

export function NewSectionForm({
  defaultName,
  defaultKind,
}: {
  defaultName: string;
  defaultKind: SectionKind;
}) {
  const [kind, setKind] = useState<SectionKind>(defaultKind);
  const [language, setLanguage] = useState<LanguageCode>('en');

  const selected = KIND_OPTIONS.find((o) => o.kind === kind)!;

  return (
    <form action={createSection} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <input type="hidden" name="kind" value={kind} />

      <div>
        <span style={{ display: 'block', font: '600 13.5px var(--font-body)', color: '#161616', marginBottom: 8 }}>
          Tipo de conteúdo
        </span>
        <div className="rcp-two-col" style={{ gap: 10 }}>
          {KIND_OPTIONS.map((o) => {
            const active = o.kind === kind;
            return (
              <button
                key={o.kind}
                type="button"
                onClick={() => setKind(o.kind)}
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: `1.5px solid ${active ? o.color : 'rgba(0,0,0,.08)'}`,
                  background: active ? o.tint : '#F7F6F2',
                  borderRadius: 14,
                  padding: '14px 16px',
                  transition: 'border-color .15s ease, background .15s ease',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    color: active ? o.color : '#6B6862',
                  }}
                >
                  <i className={o.icon} /> {o.label}
                </span>
                <span style={{ display: 'block', fontSize: 12.5, color: '#6B6862', marginTop: 6 }}>{o.note}</span>
              </button>
            );
          })}
        </div>
      </div>

      {kind === 'language' && (
        <label style={{ display: 'block' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 13.5px var(--font-body)', color: '#161616', marginBottom: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: '#E0F2FE', display: 'grid', placeItems: 'center' }}>
              <i className="ph-bold ph-globe" style={{ color: '#0BA5EC', fontSize: 12 }} />
            </span>
            Idioma
          </span>
          <select
            name="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className={inputClass}
          >
            {LANGUAGES.map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_LABELS[code]}
                {code === 'en' ? ' — plano pronto' : ' — você monta o plano'}
              </option>
            ))}
          </select>
          <span style={{ display: 'block', fontSize: 12.5, color: '#86827A', marginTop: 7, lineHeight: 1.5 }}>
            {language === 'en'
              ? 'O inglês já vem com 20 moldes de frase e o núcleo de vocabulário prontos. Você pode acrescentar o que quiser por cima.'
              : 'Este idioma ainda não tem plano curado — a seção abre vazia e você monta os moldes e as palavras na mão ou pedindo pra IA.'}
          </span>
        </label>
      )}

      <label style={{ display: 'block' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 13.5px var(--font-body)', color: '#161616', marginBottom: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: 7, background: '#E9ECFF', display: 'grid', placeItems: 'center' }}>
            <i className="ph-bold ph-text-aa" style={{ color: accent, fontSize: 12 }} />
          </span>
          Nome da seção
        </span>
        <input name="name" required defaultValue={defaultName} placeholder={selected.placeholder} className={inputClass} />
      </label>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="submit" className={buttonPrimaryClass}>
          Criar seção
        </button>
        <Link href={`/sections?kind=${kind}`} className={buttonSecondaryClass}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
