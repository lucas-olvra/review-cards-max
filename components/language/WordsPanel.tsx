'use client';

import { useMemo, useState, useTransition } from 'react';
import { deleteLanguageItem } from '@/lib/actions/language';
import { AddLanguageItemForm } from '@/components/language/AddLanguageItemForm';
import { inputClass } from '@/lib/ui';
import type { LanguageWordGroup } from '@/lib/language/seed';
import type { LanguageItem } from '@/lib/types';

function WordChip({ term, meaning }: { term: string; meaning: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid rgba(0,0,0,.07)',
        borderRadius: 12,
        padding: '9px 12px',
      }}
    >
      <span className="rcp-font-code" style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#161616' }}>
        {term}
      </span>
      <span style={{ display: 'block', fontSize: 12, color: '#86827A', marginTop: 2 }}>{meaning}</span>
    </div>
  );
}

function GroupBlock({ group, query }: { group: LanguageWordGroup; query: string }) {
  const words = useMemo(() => {
    if (!query) return group.words;
    const q = query.toLowerCase();
    return group.words.filter(([term, meaning]) => term.toLowerCase().includes(q) || meaning.toLowerCase().includes(q));
  }, [group.words, query]);

  if (words.length === 0) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            flex: 'none',
            display: 'grid',
            placeItems: 'center',
            background: group.tint,
          }}
        >
          <i className={group.icon} style={{ color: group.color, fontSize: 13 }} />
        </span>
        <h4 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 15.5, margin: 0 }}>
          {group.title}
        </h4>
        <span style={{ fontSize: 12, color: '#9A968E' }}>{words.length}</span>
      </div>
      <p style={{ fontSize: 12.5, color: '#86827A', margin: '0 0 12px', lineHeight: 1.5 }}>{group.note}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {words.map(([term, meaning], i) => (
          <WordChip key={`${term}-${i}`} term={term} meaning={meaning} />
        ))}
      </div>
    </div>
  );
}

export function WordsPanel({
  sectionId,
  groups,
  userWords,
  totalSeedWords,
}: {
  sectionId: string;
  groups: LanguageWordGroup[];
  userWords: LanguageItem[];
  totalSeedWords: number;
}) {
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();

  const filteredUserWords = useMemo(() => {
    if (!query) return userWords;
    const q = query.toLowerCase();
    return userWords.filter((w) => w.term.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q));
  }, [userWords, query]);

  const categories = useMemo(
    () => [...new Set(userWords.map((w) => w.category).filter(Boolean))],
    [userWords]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar palavra ou tradução…"
          className={inputClass}
        />
        <p style={{ fontSize: 12.5, color: '#86827A', margin: '8px 0 0' }}>
          {totalSeedWords + userWords.length} palavras no total
          {userWords.length > 0 && ` — ${userWords.length} adicionadas por você`}
        </p>
      </div>

      {groups.map((g) => (
        <GroupBlock key={g.id} group={g} query={query} />
      ))}

      {filteredUserWords.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                flex: 'none',
                display: 'grid',
                placeItems: 'center',
                background: '#E9ECFF',
              }}
            >
              <i className="ph-fill ph-star" style={{ color: '#2C4BE0', fontSize: 13 }} />
            </span>
            <h4 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 15.5, margin: 0 }}>
              Suas palavras
            </h4>
            <span style={{ fontSize: 12, color: '#9A968E' }}>{filteredUserWords.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {filteredUserWords.map((w) => (
              <div
                key={w.id}
                style={{
                  background: '#fff',
                  border: '1.5px solid rgba(0,0,0,.07)',
                  borderRadius: 12,
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="rcp-font-code" style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>
                    {w.term}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: '#86827A', marginTop: 2 }}>{w.meaning}</span>
                  {w.category && (
                    <span style={{ display: 'inline-block', fontSize: 11, color: '#9A968E', marginTop: 4 }}>{w.category}</span>
                  )}
                </div>
                <button
                  type="button"
                  title="Excluir"
                  onClick={() => startTransition(() => deleteLanguageItem(sectionId, w.id))}
                  disabled={pending}
                  className="rcp-icon-btn"
                  style={{ padding: 4, flex: 'none' }}
                >
                  <i className="ph ph-x" style={{ fontSize: 13 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.length === 0 && userWords.length === 0 && (
        <div className="rcp-card" style={{ textAlign: 'center', padding: 34 }}>
          <i className="ph-fill ph-book-open-text" style={{ fontSize: 30, color: '#9A968E' }} />
          <p style={{ fontSize: 14, color: '#6B6862', margin: '12px 0 0', lineHeight: 1.6 }}>
            Nenhuma palavra ainda. Mire nas 300-500 mais usadas — verbos e conectores antes de substantivo específico.
          </p>
        </div>
      )}

      <AddLanguageItemForm sectionId={sectionId} kind="word" categories={categories} />
    </div>
  );
}
