import React from 'react';

/**
 * Renderiza texto com suporte a blocos de código (```código```) e listas
 * ("- item"). Porta de js/render.js (renderText/renderNormal) da Fase 1-2 —
 * mesma sintaxe de autoria, agora como JSX (sem dangerouslySetInnerHTML).
 */
export function RichText({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  const parts = text.split('```');
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="my-2 overflow-x-auto rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100"
          >
            <code>{part.replace(/^\n/, '')}</code>
          </pre>
        ) : (
          <RichTextNormal key={i} text={part} />
        )
      )}
    </>
  );
}

function RichTextNormal({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let blockKey = 0;

  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        <ul key={`list-${blockKey++}`} className="my-2 ml-5 list-disc space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line) => {
    if (/^- (.*)/.test(line)) {
      listItems.push(line.replace(/^- /, ''));
    } else {
      flushList();
      blocks.push(
        <span key={`line-${blockKey++}`} className="whitespace-pre-wrap">
          {line}
          <br />
        </span>
      );
    }
  });
  flushList();

  return <>{blocks}</>;
}
