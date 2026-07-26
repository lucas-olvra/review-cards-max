import type { AnalogyDiagram, AnalogyShape, AnalogyStroke } from '@/lib/types';

// Só é importado por componente client (o pacote do Excalidraw não pode ser
// carregado no servidor). O `convertToExcalidrawElements` vem por import
// dinâmico, no mesmo chunk do editor, pra não entrar no bundle inicial.

const DEFAULT_COLOR = '#2C4BE0';
const DEFAULT_BOX_W = 90;
const DEFAULT_BOX_H = 40;
const DEFAULT_CIRCLE_D = 60;

// O Excalidraw quebra e centraliza o texto sozinho dentro do container, então
// aqui os \n dos rótulos da IA viram espaço — deixar a quebra manual junto
// com a automática produz linhas soltas no meio da caixa.
function label(text?: string) {
  if (!text?.trim()) return undefined;
  return { text: text.replace(/\s*\n\s*/g, ' ').trim(), fontSize: 16 };
}

type Skeleton = Record<string, unknown>;
type Box = { x: number; y: number; w: number; h: number; circle: boolean };

function boxOf(shape: AnalogyShape): Box {
  if (shape.type === 'circle') {
    const d = shape.w ?? DEFAULT_CIRCLE_D;
    return { x: shape.x, y: shape.y, w: d, h: d, circle: true };
  }
  if (shape.type === 'text') {
    return { x: shape.x, y: shape.y - 8, w: (shape.text?.length ?? 0) * 8, h: 20, circle: false };
  }
  return { x: shape.x, y: shape.y, w: shape.w ?? DEFAULT_BOX_W, h: shape.h ?? DEFAULT_BOX_H, circle: false };
}

// Ponto onde a seta encosta na borda da forma. Sem isso a seta nasceria no
// centro da caixa e ficaria escondida atrás dela até o Excalidraw religar o
// binding.
function edgePoint(box: Box, towardX: number, towardY: number) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const dx = towardX - cx;
  const dy = towardY - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  if (box.circle) {
    const len = Math.hypot(dx, dy);
    return { x: cx + (dx / len) * (box.w / 2), y: cy + (dy / len) * (box.h / 2) };
  }
  const sx = dx === 0 ? Infinity : box.w / 2 / Math.abs(dx);
  const sy = dy === 0 ? Infinity : box.h / 2 / Math.abs(dy);
  const s = Math.min(sx, sy);
  return { x: cx + dx * s, y: cy + dy * s };
}

// Converte o diagrama estruturado da IA em esqueletos do Excalidraw. As setas
// usam `start`/`end` com o id da forma: o Excalidraw amarra a seta aos dois
// elementos e recalcula o traçado sozinho quando o usuário arrasta a caixa —
// que é justamente o ganho de editar aqui em vez do SVG.
export function diagramToSkeletons(diagram: AnalogyDiagram): Skeleton[] {
  const boxes = new Map(diagram.shapes.map((s) => [s.id, boxOf(s)]));

  const shapes: Skeleton[] = diagram.shapes.map((shape) => {
    const strokeColor = shape.color ?? DEFAULT_COLOR;
    const common = { id: shape.id, x: shape.x, y: shape.y, strokeColor, backgroundColor: 'transparent' };

    if (shape.type === 'circle') {
      const d = shape.w ?? DEFAULT_CIRCLE_D;
      return { ...common, type: 'ellipse', width: d, height: d, label: label(shape.text) };
    }
    if (shape.type === 'text') {
      return { id: shape.id, type: 'text', x: shape.x, y: shape.y, text: shape.text ?? '', fontSize: 16, strokeColor };
    }
    return {
      ...common,
      type: 'rectangle',
      width: shape.w ?? DEFAULT_BOX_W,
      height: shape.h ?? DEFAULT_BOX_H,
      roundness: { type: 3 },
      label: label(shape.text),
    };
  });

  const arrows: Skeleton[] = [];
  for (const arrow of diagram.arrows) {
    const from = boxes.get(arrow.from);
    const to = boxes.get(arrow.to);
    if (!from || !to) continue;

    const fc = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
    const tc = { x: to.x + to.w / 2, y: to.y + to.h / 2 };
    const p1 = edgePoint(from, tc.x, tc.y);
    const p2 = edgePoint(to, fc.x, fc.y);

    // Geometria explícita e normalizada. Sem `points`, o conversor produzia um
    // elemento linear degenerado e o editor quebrava com "Linear element is
    // not normalized" — o Excalidraw exige que o primeiro ponto seja [0,0] e
    // que a posição real venha em x/y.
    arrows.push({
      type: 'arrow',
      x: p1.x,
      y: p1.y,
      width: Math.abs(p2.x - p1.x),
      height: Math.abs(p2.y - p1.y),
      points: [
        [0, 0],
        [p2.x - p1.x, p2.y - p1.y],
      ],
      strokeColor: '#6B6862',
      start: { id: arrow.from },
      end: { id: arrow.to },
      label: arrow.label ? { text: arrow.label, fontSize: 14 } : undefined,
    });
  }

  return [...shapes, ...arrows];
}

// O Excalidraw só aceita `strokeWidth` 1, 2 ou 4; o canvas antigo gravava
// 2, 4 e 7, e passar 7 direto desregula os controles de espessura do editor.
function strokeWidth(width: number): 1 | 2 | 4 {
  if (width <= 2) return 1;
  if (width <= 4) return 2;
  return 4;
}

// Traços do canvas de desenho livre anterior ao Excalidraw, convertidos uma
// única vez na primeira abertura pra ninguém perder o que já tinha rabiscado.
//
// Viram `line` e não `freedraw` de propósito: no esqueleto do Excalidraw,
// freedraw precisa vir como elemento COMPLETO (com pressures, seed, versão…),
// enquanto line aceita parcial. Um traço à mão como polilinha fica praticamente
// idêntico, e o parcial evita elemento malformado.
export function strokesToSkeletons(strokes: AnalogyStroke[]): Skeleton[] {
  return strokes
    .filter((s) => s.points.length > 1)
    .map((stroke) => {
      const [ox, oy] = stroke.points[0];
      const points = stroke.points.map(([x, y]) => [x - ox, y - oy]);
      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);
      return {
        type: 'line',
        x: ox,
        y: oy,
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
        points,
        strokeColor: stroke.color,
        strokeWidth: strokeWidth(stroke.width),
        backgroundColor: 'transparent',
      };
    });
}

export async function toExcalidrawElements(skeletons: Skeleton[]) {
  if (!skeletons.length) return [];
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw');
  // O tipo do esqueleto é grande e varia por versão; a validação real é a do
  // próprio Excalidraw, que ignora o que não reconhece.
  return convertToExcalidrawElements(skeletons as never);
}
