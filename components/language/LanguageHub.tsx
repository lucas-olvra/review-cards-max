'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FramesPanel, type FrameEntry } from '@/components/language/FramesPanel';
import { WordsPanel } from '@/components/language/WordsPanel';
import { NarrationPanel } from '@/components/language/NarrationPanel';
import { McpHint } from '@/components/McpHint';
import { accent } from '@/lib/ui';
import type { LanguageWordGroup } from '@/lib/language/seed';
import type { NarrationStats } from '@/lib/language/stats';
import type { LanguageItem, NarrationSession } from '@/lib/types';

export type Tab = 'frames' | 'words' | 'narration';

export function parseTab(raw: string | undefined): Tab {
  return raw === 'words' || raw === 'narration' ? raw : 'frames';
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'frames', label: 'Moldes', icon: 'ph-fill ph-quotes' },
  { id: 'words', label: 'Palavras', icon: 'ph-fill ph-book-open-text' },
  { id: 'narration', label: 'Narração', icon: 'ph-fill ph-microphone-stage' },
];

const METHOD_STEPS = [
  {
    icon: 'ph-fill ph-quotes',
    color: '#2C4BE0',
    tint: '#E9ECFF',
    title: 'Moldes antes de palavras',
    text: 'Cada molde é uma frase com um espaço em branco. Troque o que está no branco e você já tem 50 frases novas — muito mais rápido do que decorar palavra solta.',
  },
  {
    icon: 'ph-fill ph-book-open-text',
    color: '#0BA5EC',
    tint: '#E0F2FE',
    title: '300 a 500 palavras, não mais',
    text: 'Verbos e conectores de alta frequência primeiro. Eles são os slots que entram nos moldes. Substantivo específico você aprende quando precisar dele.',
  },
  {
    icon: 'ph-fill ph-microphone-stage',
    color: '#161616',
    tint: '#ECECEC',
    title: 'Produzir, não só receber',
    text: 'Narre em voz alta 5-10 minutos por dia o que você está fazendo. Travou? Fala em português e segue. É produção em tempo real que treina velocidade.',
  },
];

const IGNORE = [
  'Regra de gramática abstrata — você pega a estrutura pelo uso',
  'Sotaque perfeito — vem depois, com exposição',
  'Esperar estar "pronto" pra falar — ninguém fica',
  'App de gamificação como método principal',
];

function MethodCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rcp-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 22 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 20px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ width: 34, height: 34, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: '#E9ECFF' }}>
          <i className="ph-fill ph-compass" style={{ color: accent, fontSize: 17 }} />
        </span>
        <span style={{ flex: 1 }}>
          <span className="rcp-font-display" style={{ display: 'block', fontWeight: 600, fontSize: 16 }}>
            O método
          </span>
          <span style={{ display: 'block', fontSize: 13, color: '#86827A', marginTop: 2 }}>
            Como esta seção quer que você aprenda — e o que ignorar
          </span>
        </span>
        <i className={open ? 'ph-bold ph-caret-up' : 'ph-bold ph-caret-down'} style={{ color: '#9A968E', fontSize: 14 }} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '4px 20px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {METHOD_STEPS.map((s) => (
                  <div key={s.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, flex: 'none', display: 'grid', placeItems: 'center', background: s.tint }}>
                      <i className={s.icon} style={{ color: s.color, fontSize: 14 }} />
                    </span>
                    <div>
                      <div style={{ font: '600 14px var(--font-body)' }}>{s.title}</div>
                      <p style={{ fontSize: 13, color: '#6B6862', margin: '3px 0 0', lineHeight: 1.55 }}>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px dashed rgba(0,0,0,.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                  <i className="ph-fill ph-prohibit" style={{ color: '#EF4444', fontSize: 15 }} />
                  <span style={{ font: '600 13.5px var(--font-body)' }}>Ignore completamente</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {IGNORE.map((i) => (
                    <li key={i} style={{ fontSize: 13, color: '#6B6862', display: 'flex', gap: 8, lineHeight: 1.5 }}>
                      <i className="ph-bold ph-x" style={{ color: '#EF4444', fontSize: 12, marginTop: 3, flex: 'none' }} />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Equivalente ao "Pedir um tópico pra IA" das seções de programação: lá a
// unidade é o tópico inteiro, aqui é um bloco temático de moldes + palavras.
// O exemplo acompanha a aba aberta, porque pedir molde e pedir palavra são
// pedidos diferentes.
function askExample(tab: Tab, sectionName: string, languageLabel: string) {
  const alvo = `na seção "${sectionName}"`;
  if (tab === 'words') {
    return `Adicione 30 palavras de ${languageLabel} do tema aeroporto e viagem ${alvo}, agrupadas por função na frase.`;
  }
  if (tab === 'narration') {
    return `Adicione 8 moldes e 25 palavras de ${languageLabel} sobre a minha rotina de trabalho ${alvo}, pra eu usar narrando em voz alta.`;
  }
  return `Adicione 10 moldes de frase de ${languageLabel} pra reunião de trabalho ${alvo}, cada um com 3 exemplos bem diferentes entre si.`;
}

export function LanguageHub({
  sectionId,
  sectionName,
  languageLabel,
  frames,
  masteredKeys,
  groups,
  userWords,
  totalSeedWords,
  sessions,
  stats,
  initialTab,
}: {
  sectionId: string;
  sectionName: string;
  languageLabel: string;
  frames: FrameEntry[];
  masteredKeys: string[];
  groups: LanguageWordGroup[];
  userWords: LanguageItem[];
  totalSeedWords: number;
  sessions: NarrationSession[];
  stats: NarrationStats;
  initialTab: Tab;
}) {
  // A aba é estado local, mas nasce do `?tab=` da URL: é assim que voltar da
  // tela de narração cai de novo no painel de narração, e não em "Moldes".
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <>
      <MethodCard />

      <div
        className="rcp-card"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 18px', marginBottom: 18 }}
      >
        <span style={{ fontSize: 14, color: '#6B6862', lineHeight: 1.5 }}>
          Quer moldes e palavras de um tema específico? Peça o bloco inteiro pra IA.
        </span>
        <McpHint
          label="Pedir um bloco pra IA"
          title="Peça o bloco inteiro, não item por item"
          body={`A IA adiciona moldes e palavras de ${languageLabel} direto em "${sectionName}", já agrupados e com exemplos.`}
          example={askExample(tab, sectionName, languageLabel)}
        />
      </div>

      <div className="rcp-scroll" style={{ display: 'flex', gap: 6, marginBottom: 22, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                flex: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 999,
                padding: '9px 16px',
                font: '600 13.5px var(--font-body)',
                color: active ? '#fff' : '#55524B',
                background: active ? '#161616' : '#fff',
                boxShadow: active ? 'none' : 'inset 0 0 0 1.5px rgba(0,0,0,.08)',
                transition: 'background .15s ease, color .15s ease',
              }}
            >
              <i className={t.icon} style={{ fontSize: 14 }} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'frames' && <FramesPanel sectionId={sectionId} frames={frames} masteredKeys={masteredKeys} />}
      {tab === 'words' && (
        <WordsPanel sectionId={sectionId} groups={groups} userWords={userWords} totalSeedWords={totalSeedWords} />
      )}
      {tab === 'narration' && <NarrationPanel sectionId={sectionId} sessions={sessions} stats={stats} />}
    </>
  );
}
