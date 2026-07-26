import type { AnalogyDiagram, AnalogyShape } from '@/lib/types';

// Plano de coordenadas de referência que a IA usa para posicionar as formas.
// O canvas de desenho livre (AnalogyCanvas) continua fixo neste tamanho; o
// diagrama, não — ele se ajusta ao conteúdo (ver `bounds` abaixo).
export const DIAGRAM_VIEW_W = 400;
export const DIAGRAM_VIEW_H = 240;

const DEFAULT_COLOR = '#2C4BE0';
const DEFAULT_BOX_W = 90;
const DEFAULT_BOX_H = 40;
const DEFAULT_CIRCLE_D = 60;
const PAD = 12;

// <text> em SVG não quebra linha: ignora \n e transborda a caixa sem aviso.
// Como a IA escreve rótulos de várias linhas ("final\nControle Remoto\n
// (variável)"), o texto precisa ser quebrado aqui, em <tspan>, ou o rótulo
// vira uma linha só atravessando o diagrama inteiro.
const CHAR_W_RATIO = 0.58; // largura média por caractere, relativa ao font-size
const LINE_RATIO = 1.25;
const MIN_FONT = 8;

function wrapLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];
  const out: string[] = [];
  let current = '';
  for (const word of line.split(/\s+/)) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      out.push(current);
      current = word;
    }
    // Palavra sozinha maior que a caixa: corta no seco, senão vaza igual.
    while (current.length > maxChars) {
      out.push(current.slice(0, maxChars));
      current = current.slice(maxChars);
    }
  }
  if (current) out.push(current);
  return out;
}

// Diminui a fonte até um piso e, se ainda não couber, deixa a caixa crescer.
// Crescer é preferível a cortar: o viewBox se ajusta ao conteúdo, então uma
// caixa mais alta continua visível — texto cortado, não.
function layoutLabel(text: string, boxW: number, boxH: number, baseFont: number) {
  const usableW = Math.max(boxW - 10, 20);

  // Rótulo curto sem quebra explícita: prefira reduzir a fonte a quebrar no
  // meio — "Aluno A" virando "Aluno" / "A" dentro de um círculo lê pior do
  // que o mesmo texto um pouco menor.
  if (!text.includes('\n')) {
    for (let font = baseFont; font >= MIN_FONT; font -= 1) {
      if (text.length * font * CHAR_W_RATIO <= usableW) {
        return { lines: [text], font, height: boxH };
      }
    }
  }

  for (let font = baseFont; font >= MIN_FONT; font -= 1) {
    const maxChars = Math.max(Math.floor(usableW / (font * CHAR_W_RATIO)), 4);
    const lines = text.split('\n').flatMap((l) => wrapLine(l.trim(), maxChars));
    const needed = lines.length * font * LINE_RATIO;
    if (needed <= boxH - 6 || font === MIN_FONT) {
      return { lines, font, height: Math.max(boxH, needed + 10) };
    }
  }
  return { lines: [text], font: baseFont, height: boxH };
}

function Label({ lines, font, cx, cy, color }: { lines: string[]; font: number; cx: number; cy: number; color: string }) {
  const step = font * LINE_RATIO;
  const start = cy - ((lines.length - 1) * step) / 2;
  return (
    <text fontSize={font} fill={color} textAnchor="middle" dominantBaseline="middle">
      {lines.map((line, i) => (
        <tspan key={i} x={cx} y={start + i * step}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

type Box = { x: number; y: number; w: number; h: number };

function boxOf(shape: AnalogyShape, grownH?: number): Box {
  if (shape.type === 'circle') {
    const d = shape.w ?? DEFAULT_CIRCLE_D;
    return { x: shape.x, y: shape.y, w: d, h: d };
  }
  if (shape.type === 'text') {
    return { x: shape.x, y: shape.y - 10, w: (shape.text?.length ?? 0) * 6.5, h: 14 };
  }
  return { x: shape.x, y: shape.y, w: shape.w ?? DEFAULT_BOX_W, h: grownH ?? shape.h ?? DEFAULT_BOX_H };
}

// Onde a seta deve encostar: a borda da forma, não o centro dela. Antes as
// setas iam de centro a centro e as formas eram desenhadas por cima, então a
// ponta da seta ficava escondida dentro da caixa de destino.
function edgePoint(box: Box, towardX: number, towardY: number, circle: boolean) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const dx = towardX - cx;
  const dy = towardY - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  if (circle) {
    const r = box.w / 2;
    const len = Math.hypot(dx, dy);
    return { x: cx + (dx / len) * r, y: cy + (dy / len) * r };
  }

  // Escala o vetor até tocar o primeiro lado do retângulo.
  const sx = dx === 0 ? Infinity : box.w / 2 / Math.abs(dx);
  const sy = dy === 0 ? Infinity : box.h / 2 / Math.abs(dy);
  const s = Math.min(sx, sy);
  return { x: cx + dx * s, y: cy + dy * s };
}

// Renderiza o diagrama estruturado (formas + setas) vindo da IA como
// elementos <svg> de verdade — nunca markup bruto/dangerouslySetInnerHTML,
// mesma filosofia de `lib/render.tsx` (RichText).
export function DiagramSvg({ diagram }: { diagram: AnalogyDiagram }) {
  // Pré-calcula o layout de cada forma: caixas podem ficar mais altas do que a
  // IA pediu, e isso precisa entrar tanto no desenho quanto no viewBox.
  const laid = diagram.shapes.map((shape) => {
    const color = shape.color ?? DEFAULT_COLOR;
    if (shape.type === 'box') {
      const w = shape.w ?? DEFAULT_BOX_W;
      const h = shape.h ?? DEFAULT_BOX_H;
      const label = shape.text ? layoutLabel(shape.text, w, h, 11) : null;
      return { shape, color, box: boxOf(shape, label?.height ?? h), label };
    }
    if (shape.type === 'circle') {
      const d = shape.w ?? DEFAULT_CIRCLE_D;
      const label = shape.text ? layoutLabel(shape.text, d * 0.85, d, 11) : null;
      return { shape, color, box: boxOf(shape), label };
    }
    return { shape, color, box: boxOf(shape), label: null };
  });

  const byId = new Map(laid.map((l) => [l.shape.id, l]));

  // viewBox ajustado ao conteúdo real. Fixo em 400x240, qualquer forma que a
  // IA colocasse além disso era cortada silenciosamente — e isso acontecia de
  // verdade em diagramas já criados.
  const minX = Math.min(...laid.map((l) => l.box.x), 0);
  const minY = Math.min(...laid.map((l) => l.box.y), 0);
  const maxX = Math.max(...laid.map((l) => l.box.x + l.box.w), DIAGRAM_VIEW_W);
  const maxY = Math.max(...laid.map((l) => l.box.y + l.box.h), DIAGRAM_VIEW_H);
  const vb = `${minX - PAD} ${minY - PAD} ${maxX - minX + PAD * 2} ${maxY - minY + PAD * 2}`;

  return (
    <svg viewBox={vb} width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="analogy-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#8A867C" />
        </marker>
      </defs>

      {diagram.arrows.map((arrow, i) => {
        const from = byId.get(arrow.from);
        const to = byId.get(arrow.to);
        if (!from || !to) return null;

        const fc = { x: from.box.x + from.box.w / 2, y: from.box.y + from.box.h / 2 };
        const tc = { x: to.box.x + to.box.w / 2, y: to.box.y + to.box.h / 2 };
        const p1 = edgePoint(from.box, tc.x, tc.y, from.shape.type === 'circle');
        const p2 = edgePoint(to.box, fc.x, fc.y, to.shape.type === 'circle');

        return (
          <g key={`arrow-${i}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#8A867C" strokeWidth={1.5} markerEnd="url(#analogy-arrowhead)" />
            {arrow.label && (
              <text
                x={(p1.x + p2.x) / 2}
                y={(p1.y + p2.y) / 2 - 5}
                fontSize={9.5}
                fill="#6B6862"
                textAnchor="middle"
                paintOrder="stroke"
                stroke="#fff"
                strokeWidth={3}
                strokeLinejoin="round"
              >
                {arrow.label}
              </text>
            )}
          </g>
        );
      })}

      {laid.map(({ shape, color, box, label }) => {
        if (shape.type === 'circle') {
          const r = box.w / 2;
          return (
            <g key={shape.id}>
              <circle cx={box.x + r} cy={box.y + r} r={r} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
              {label && <Label lines={label.lines} font={label.font} cx={box.x + r} cy={box.y + r} color={color} />}
            </g>
          );
        }

        if (shape.type === 'text') {
          const lines = (shape.text ?? '').split('\n');
          return (
            <text key={shape.id} fontSize={12} fill={color}>
              {lines.map((line, i) => (
                <tspan key={i} x={shape.x} y={shape.y + i * 12 * LINE_RATIO}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        }

        return (
          <g key={shape.id}>
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
            {label && (
              <Label lines={label.lines} font={label.font} cx={box.x + box.w / 2} cy={box.y + box.h / 2} color={color} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
