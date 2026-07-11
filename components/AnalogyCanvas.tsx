'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { updateTopicAnalogyDrawing } from '@/lib/actions/topics';
import { DIAGRAM_VIEW_W, DIAGRAM_VIEW_H } from '@/lib/diagram';
import { TOPIC_PALETTE } from '@/lib/palette';
import type { AnalogyStroke } from '@/lib/types';
import { buttonSecondaryClass } from '@/lib/ui';

const PEN_WIDTHS = [2, 4, 7];
// Resolução interna do canvas maior que o plano lógico (400x240) só pra
// desenhar com traços nítidos em telas grandes/HiDPI — as coordenadas
// salvas continuam no mesmo plano lógico usado por DiagramSvg.
const RESOLUTION_SCALE = 2;

export function AnalogyCanvas({ topicId, initialStrokes }: { topicId: string; initialStrokes: AnalogyStroke[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<[number, number][] | null>(null);
  const [strokes, setStrokes] = useState<AnalogyStroke[]>(initialStrokes);
  const [color, setColor] = useState<string>(TOPIC_PALETTE[0].bg);
  const [penWidth, setPenWidth] = useState(PEN_WIDTHS[1]);
  const [isPending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  const redraw = (allStrokes: AnalogyStroke[], live?: AnalogyStroke) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.setTransform(RESOLUTION_SCALE, 0, 0, RESOLUTION_SCALE, 0, 0);
    ctx.clearRect(0, 0, DIAGRAM_VIEW_W, DIAGRAM_VIEW_H);
    for (const stroke of live ? [...allStrokes, live] : allStrokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
      for (const point of stroke.points.slice(1)) ctx.lineTo(point[0], point[1]);
      ctx.stroke();
    }
  };

  useEffect(() => {
    redraw(strokes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * DIAGRAM_VIEW_W, ((e.clientY - rect.top) / rect.height) * DIAGRAM_VIEW_H];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = [toCanvasPoint(e)];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current.push(toCanvasPoint(e));
    redraw(strokes, { points: drawingRef.current, color, width: penWidth });
  };

  const finishStroke = () => {
    const points = drawingRef.current;
    drawingRef.current = null;
    if (!points || points.length < 2) return;
    setStrokes((prev) => {
      const next = [...prev, { points, color, width: penWidth }];
      redraw(next);
      return next;
    });
    setDirty(true);
  };

  const handleUndo = () => {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      redraw(next);
      return next;
    });
    setDirty(true);
  };

  const handleClear = () => {
    redraw([]);
    setStrokes([]);
    setDirty(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateTopicAnalogyDrawing(topicId, strokes);
      setDirty(false);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        {TOPIC_PALETTE.map((p) => (
          <button
            key={p.bg}
            type="button"
            aria-label={`Cor ${p.bg}`}
            onClick={() => setColor(p.bg)}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: p.bg,
              border: color === p.bg ? '2px solid #161616' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
        <span style={{ width: 1, height: 20, background: '#E4E1D8', margin: '0 4px' }} />
        {PEN_WIDTHS.map((w) => (
          <button
            key={w}
            type="button"
            aria-label={`Espessura ${w}`}
            onClick={() => setPenWidth(w)}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              background: penWidth === w ? '#F0EEE7' : 'transparent',
              border: '1px solid #E4E1D8',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span style={{ width: w, height: w, borderRadius: '50%', background: '#35322D' }} />
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button type="button" onClick={handleUndo} disabled={!strokes.length} className={buttonSecondaryClass}>
          Desfazer
        </button>
        <button type="button" onClick={handleClear} disabled={!strokes.length} className={buttonSecondaryClass}>
          Limpar
        </button>
        <button type="button" onClick={handleSave} disabled={isPending || !dirty} className={buttonSecondaryClass}>
          {isPending ? 'Salvando...' : 'Salvar desenho'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={DIAGRAM_VIEW_W * RESOLUTION_SCALE}
        height={DIAGRAM_VIEW_H * RESOLUTION_SCALE}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        style={{
          width: '100%',
          aspectRatio: `${DIAGRAM_VIEW_W} / ${DIAGRAM_VIEW_H}`,
          borderRadius: 12,
          background: '#FCFBF8',
          border: '1px solid #E4E1D8',
          touchAction: 'none',
          cursor: 'crosshair',
          display: 'block',
        }}
      />
    </div>
  );
}
