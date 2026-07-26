'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';
import { updateTopicAnalogyScene } from '@/lib/actions/topics';
import { diagramToSkeletons, strokesToSkeletons, toExcalidrawElements } from '@/lib/excalidraw-scene';
import { buttonPrimaryClass, buttonSecondaryClass } from '@/lib/ui';
import type { AnalogyDiagram, AnalogyScene, AnalogyStroke } from '@/lib/types';

// O Excalidraw só roda no cliente e é pesado — entra por import dinâmico, num
// chunk separado que só é baixado quando a página do tópico é aberta.
const Excalidraw = dynamic(async () => (await import('@excalidraw/excalidraw')).Excalidraw, {
  ssr: false,
  loading: () => <CanvasPlaceholder text="Carregando o editor…" />,
});

function CanvasPlaceholder({ text }: { text: string }) {
  return (
    <div
      style={{
        height: 420,
        borderRadius: 12,
        border: '1.5px solid rgba(0,0,0,.09)',
        display: 'grid',
        placeItems: 'center',
        background: '#FAFAF8',
        font: '500 14px var(--font-body)',
        color: '#86827A',
      }}
    >
      {text}
    </div>
  );
}

type ExcalidrawApi = {
  getSceneElements: () => readonly unknown[];
  updateScene: (data: { elements: readonly unknown[] }) => void;
  scrollToContent: (target?: unknown, opts?: { fitToContent?: boolean }) => void;
};

export function AnalogyStudio({
  topicId,
  diagram,
  initialScene,
  legacyStrokes,
}: {
  topicId: string;
  diagram: AnalogyDiagram;
  initialScene: AnalogyScene;
  legacyStrokes: AnalogyStroke[];
}) {
  const [initialElements, setInitialElements] = useState<readonly unknown[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const apiRef = useRef<ExcalidrawApi | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      // Cena já salva ganha de tudo — é o que o usuário editou por último.
      if (initialScene.length) return initialScene;
      // Sem cena salva, aproveita os traços do canvas antigo pra ninguém
      // abrir a tela e achar que o desenho sumiu.
      if (legacyStrokes.length) return toExcalidrawElements(strokesToSkeletons(legacyStrokes));
      return [];
    }

    prepare().then((els) => {
      if (!cancelled) setInitialElements(els);
    });

    return () => {
      cancelled = true;
    };
  }, [initialScene, legacyStrokes]);

  async function copyDiagram() {
    const api = apiRef.current;
    if (!api) return;
    const incoming = await toExcalidrawElements(diagramToSkeletons(diagram));
    if (!incoming.length) return;
    api.updateScene({ elements: [...api.getSceneElements(), ...incoming] });
    api.scrollToContent(incoming as unknown, { fitToContent: true });
  }

  function save() {
    const api = apiRef.current;
    if (!api) return;
    // getSceneElements devolve os elementos vivos do editor; serializa antes
    // de mandar pro server action, que só aceita dado plano.
    const elements = JSON.parse(JSON.stringify(api.getSceneElements()));
    startTransition(async () => {
      await updateTopicAnalogyScene(topicId, elements);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function clear() {
    apiRef.current?.updateScene({ elements: [] });
  }

  const hasDiagram = diagram.shapes.length > 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {hasDiagram && (
          <button type="button" onClick={copyDiagram} className={buttonSecondaryClass} style={{ padding: '9px 14px', fontSize: 13.5 }}>
            <i className="ph-bold ph-copy" style={{ fontSize: 13 }} /> Copiar o diagrama da IA pra cá
          </button>
        )}
        <button type="button" onClick={clear} className={buttonSecondaryClass} style={{ padding: '9px 14px', fontSize: 13.5 }}>
          <i className="ph ph-trash" style={{ fontSize: 13 }} /> Limpar
        </button>
        <span style={{ flex: 1 }} />
        {saved && (
          <span style={{ font: '600 13px var(--font-body)', color: '#0E9F6E' }}>
            <i className="ph-fill ph-check-circle" /> Salvo
          </span>
        )}
        <button type="button" onClick={save} disabled={isPending} className={buttonPrimaryClass} style={{ padding: '9px 16px', fontSize: 13.5 }}>
          {isPending ? 'Salvando…' : 'Salvar desenho'}
        </button>
      </div>

      {initialElements === null ? (
        <CanvasPlaceholder text="Preparando o desenho…" />
      ) : (
        <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,.09)' }}>
          <Excalidraw
            // O Excalidraw só lê initialData na montagem, por isso o editor só
            // é renderizado depois que os elementos iniciais estão prontos.
            initialData={{
              elements: initialElements as never,
              appState: { viewBackgroundColor: '#ffffff' },
              scrollToContent: true,
            }}
            excalidrawAPI={(api) => {
              apiRef.current = api as unknown as ExcalidrawApi;
            }}
            langCode="pt-BR"
            UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false } }}
          />
        </div>
      )}

      <p style={{ fontSize: 12.5, color: '#86827A', lineHeight: 1.55, margin: '10px 0 0' }}>
        O desenho não salva sozinho — clique em <b>Salvar desenho</b> quando terminar.
      </p>
    </div>
  );
}
