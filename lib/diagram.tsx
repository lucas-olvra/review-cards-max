import type { AnalogyDiagram } from '@/lib/types';

// Plano de coordenadas fixo em que a IA posiciona as formas do diagrama —
// mesmo espaço usado pelo canvas de desenho livre (AnalogyCanvas), para as
// duas camadas ficarem alinhadas visualmente.
export const DIAGRAM_VIEW_W = 400;
export const DIAGRAM_VIEW_H = 240;

const DEFAULT_COLOR = '#2C4BE0';

// Renderiza o diagrama estruturado (formas + setas) vindo da IA como
// elementos <svg> de verdade — nunca markup bruto/dangerouslySetInnerHTML,
// mesma filosofia de `lib/render.tsx` (RichText).
export function DiagramSvg({ diagram }: { diagram: AnalogyDiagram }) {
  const shapesById = new Map(diagram.shapes.map((s) => [s.id, s]));

  return (
    <svg viewBox={`0 0 ${DIAGRAM_VIEW_W} ${DIAGRAM_VIEW_H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="analogy-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#8A867C" />
        </marker>
      </defs>

      {diagram.arrows.map((arrow, i) => {
        const from = shapesById.get(arrow.from);
        const to = shapesById.get(arrow.to);
        if (!from || !to) return null;
        const x1 = from.x + (from.w ?? 0) / 2;
        const y1 = from.y + (from.h ?? 0) / 2;
        const x2 = to.x + (to.w ?? 0) / 2;
        const y2 = to.y + (to.h ?? 0) / 2;
        return (
          <g key={`arrow-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8A867C" strokeWidth={1.5} markerEnd="url(#analogy-arrowhead)" />
            {arrow.label && (
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} fontSize={10} fill="#6B6862" textAnchor="middle">
                {arrow.label}
              </text>
            )}
          </g>
        );
      })}

      {diagram.shapes.map((shape) => {
        const color = shape.color ?? DEFAULT_COLOR;
        if (shape.type === 'circle') {
          const r = (shape.w ?? 60) / 2;
          return (
            <g key={shape.id}>
              <circle cx={shape.x + r} cy={shape.y + r} r={r} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
              {shape.text && (
                <text x={shape.x + r} y={shape.y + r} fontSize={11} fill={color} textAnchor="middle" dominantBaseline="middle">
                  {shape.text}
                </text>
              )}
            </g>
          );
        }
        if (shape.type === 'text') {
          return (
            <text key={shape.id} x={shape.x} y={shape.y} fontSize={12} fill={color}>
              {shape.text}
            </text>
          );
        }
        const w = shape.w ?? 90;
        const h = shape.h ?? 40;
        return (
          <g key={shape.id}>
            <rect x={shape.x} y={shape.y} width={w} height={h} rx={8} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
            {shape.text && (
              <text x={shape.x + w / 2} y={shape.y + h / 2} fontSize={11} fill={color} textAnchor="middle" dominantBaseline="middle">
                {shape.text}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
