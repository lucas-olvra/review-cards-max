import type { AnalogyDiagram, AnalogyStroke } from '@/lib/types';

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

// Converte o diagrama estruturado da IA em esqueletos do Excalidraw. As setas
// usam `start`/`end` com o id da forma: o Excalidraw amarra a seta aos dois
// elementos e recalcula o traçado sozinho quando o usuário arrasta a caixa —
// que é justamente o ganho de editar aqui em vez do SVG.
export function diagramToSkeletons(diagram: AnalogyDiagram): Skeleton[] {
  const ids = new Set(diagram.shapes.map((s) => s.id));

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

  const arrows: Skeleton[] = diagram.arrows
    .filter((a) => ids.has(a.from) && ids.has(a.to))
    .map((arrow) => ({
      type: 'arrow',
      x: 0,
      y: 0,
      strokeColor: '#6B6862',
      start: { id: arrow.from },
      end: { id: arrow.to },
      label: arrow.label ? { text: arrow.label, fontSize: 14 } : undefined,
    }));

  return [...shapes, ...arrows];
}

// Traços do canvas de desenho livre anterior ao Excalidraw. Convertidos uma
// única vez, na primeira abertura, pra ninguém perder o que já tinha
// rabiscado. Os pontos do Excalidraw são relativos à origem do elemento.
export function strokesToSkeletons(strokes: AnalogyStroke[]): Skeleton[] {
  return strokes
    .filter((s) => s.points.length > 1)
    .map((stroke) => {
      const [ox, oy] = stroke.points[0];
      return {
        type: 'freedraw',
        x: ox,
        y: oy,
        strokeColor: stroke.color,
        strokeWidth: stroke.width,
        points: stroke.points.map(([x, y]) => [x - ox, y - oy]),
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
