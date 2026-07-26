'use client';

import { useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { setMastered, deleteLanguageItem } from '@/lib/actions/language';
import { AddLanguageItemForm } from '@/components/language/AddLanguageItemForm';
import { accent } from '@/lib/ui';
import type { LanguageFrame } from '@/lib/language/seed';

export interface FrameEntry extends LanguageFrame {
  meaningLabel: string;
  userItemId?: string;
}

// Quantas variações o usuário precisa produzir antes de poder marcar o molde
// como dominado. Cinco é o mínimo que força trocar o slot de verdade em vez de
// repetir a mesma frase com outra palavra.
const VARIATIONS_TARGET = 5;

function FrameRow({
  frame,
  sectionId,
  mastered,
}: {
  frame: FrameEntry;
  sectionId: string;
  mastered: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const enoughVariations = variations.length >= VARIATIONS_TARGET;

  function addVariation() {
    const value = draft.trim();
    if (!value) return;
    setVariations((v) => [...v, value]);
    setDraft('');
  }

  return (
    <div
      className="rcp-list-row"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderColor: mastered ? 'rgba(18,183,106,.35)' : 'rgba(0,0,0,.07)',
        background: mastered ? '#F6FEFA' : '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        <button
          type="button"
          title={mastered ? 'Marcar como ainda não dominado' : 'Marcar como "sai sem pensar"'}
          onClick={() => startTransition(() => setMastered(sectionId, frame.id, !mastered))}
          disabled={pending}
          style={{
            flex: 'none',
            width: 26,
            height: 26,
            borderRadius: 9,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            border: `1.5px solid ${mastered ? '#12B76A' : 'rgba(0,0,0,.15)'}`,
            background: mastered ? '#12B76A' : 'transparent',
            transition: 'all .15s ease',
          }}
        >
          {mastered && <i className="ph-bold ph-check" style={{ color: '#fff', fontSize: 13 }} />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ flex: 1, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span className="rcp-font-code" style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: '#161616' }}>
            {frame.template}
          </span>
          <span style={{ display: 'block', fontSize: 13, color: '#86827A', marginTop: 3 }}>{frame.meaningLabel}</span>
        </button>

        <i
          className={open ? 'ph-bold ph-caret-up' : 'ph-bold ph-caret-down'}
          style={{ color: '#9A968E', fontSize: 14, flex: 'none' }}
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(0,0,0,.06)' }}>
              {frame.hint && (
                <p style={{ fontSize: 13, color: '#6B6862', lineHeight: 1.55, margin: '14px 0 0' }}>{frame.hint}</p>
              )}

              {frame.examples.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {frame.examples.map((ex) => (
                    <li
                      key={ex}
                      className="rcp-font-code"
                      style={{ fontSize: 13, color: '#55524B', background: '#F5F3EE', borderRadius: 9, padding: '8px 11px' }}
                    >
                      {ex}
                    </li>
                  ))}
                </ul>
              )}

              <div style={{ marginTop: 16, borderTop: '1px dashed rgba(0,0,0,.1)', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <i className="ph-fill ph-barbell" style={{ color: accent, fontSize: 15 }} />
                  <span style={{ font: '600 13px var(--font-body)' }}>
                    Troque o espaço em branco — {variations.length}/{VARIATIONS_TARGET}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: '#86827A', margin: '0 0 10px', lineHeight: 1.5 }}>
                  Escreva rápido e em voz alta. Errado vale. O objetivo é o molde virar automático, não sair perfeito.
                </p>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addVariation();
                      }
                    }}
                    placeholder={frame.template.replace('___', '…')}
                    className="rcp-input"
                    style={{ fontSize: 14 }}
                  />
                  <button type="button" onClick={addVariation} className="rcp-btn-secondary" style={{ padding: '10px 14px', flex: 'none' }}>
                    <i className="ph-bold ph-plus" />
                  </button>
                </div>

                {variations.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {variations.map((v, i) => (
                      <li
                        key={`${v}-${i}`}
                        className="rcp-font-code"
                        style={{ fontSize: 12.5, background: '#E9ECFF', color: accent, borderRadius: 999, padding: '5px 11px' }}
                      >
                        {v}
                      </li>
                    ))}
                  </ul>
                )}

                {enoughVariations && !mastered && (
                  <button
                    type="button"
                    onClick={() => startTransition(() => setMastered(sectionId, frame.id, true))}
                    disabled={pending}
                    className="rcp-btn-primary"
                    style={{ marginTop: 12, padding: '10px 16px', fontSize: 14, background: '#12B76A', boxShadow: 'none' }}
                  >
                    <i className="ph-bold ph-check" /> Esse já sai sem pensar
                  </button>
                )}
              </div>

              {frame.userItemId && (
                <button
                  type="button"
                  onClick={() => startTransition(() => deleteLanguageItem(sectionId, frame.userItemId!))}
                  disabled={pending}
                  className="rcp-pill-btn"
                  style={{ marginTop: 14, background: '#FDECEA', color: '#B42318' }}
                >
                  <i className="ph ph-trash" /> Excluir molde
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FramesPanel({
  sectionId,
  frames,
  masteredKeys,
}: {
  sectionId: string;
  frames: FrameEntry[];
  masteredKeys: string[];
}) {
  const mastered = new Set(masteredKeys);
  const masteredCount = frames.filter((f) => mastered.has(f.id)).length;
  const pct = frames.length ? Math.round((masteredCount / frames.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="rcp-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <span style={{ font: '600 14px var(--font-body)' }}>
            {masteredCount} de {frames.length} moldes já saem sem pensar
          </span>
          <span style={{ font: '700 14px var(--font-body)', color: '#12B76A' }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(0,0,0,.07)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#12B76A', transition: 'width .3s ease' }} />
        </div>
      </div>

      {frames.length === 0 && (
        <div className="rcp-card" style={{ textAlign: 'center', padding: 34 }}>
          <i className="ph-fill ph-quotes" style={{ fontSize: 30, color: '#9A968E' }} />
          <p style={{ fontSize: 14, color: '#6B6862', margin: '12px 0 0', lineHeight: 1.6 }}>
            Este idioma ainda não tem moldes. Comece por 15-20 estruturas que você usaria hoje — ou peça pra IA montar.
          </p>
        </div>
      )}

      {frames.map((f) => (
        <FrameRow key={f.id} frame={f} sectionId={sectionId} mastered={mastered.has(f.id)} />
      ))}

      <AddLanguageItemForm sectionId={sectionId} kind="frame" categories={[]} />
    </div>
  );
}
