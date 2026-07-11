import { DiagramSvg } from '@/lib/diagram';
import { RichText } from '@/lib/render';
import { AnalogyCanvas } from '@/components/AnalogyCanvas';
import type { Topic } from '@/lib/types';

const COLOR = '#0BA5EC';
const TINT = '#E0F2FE';

// Analogia visual do tópico: um diagrama estruturado gerado pela IA (via MCP,
// tool `set_topic_analogy`) mais um canvas de desenho livre onde o usuário
// pode fazer/redesenhar a própria versão. Painel sempre "aberto" (sem
// edit-toggle como o EditablePanel) porque o canvas já é interativo por si só.
export function AnalogyPanel({ topic }: { topic: Topic }) {
  const hasDiagram = topic.analogy_diagram.shapes.length > 0;

  return (
    <div className="rcp-stage-panel" style={{ marginBottom: 14 }}>
      <div style={{ height: 4, background: COLOR }} />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', background: TINT }}>
            <i className="ph-fill ph-palette" style={{ color: COLOR, fontSize: 18 }} />
          </span>
          <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.01em', margin: 0, flex: 1 }}>
            Analogia visual
          </h3>
        </div>

        {hasDiagram ? (
          <div style={{ marginBottom: 18 }}>
            <div style={{ background: TINT, borderRadius: 12, padding: 10, marginBottom: 10 }}>
              <DiagramSvg diagram={topic.analogy_diagram} />
            </div>
            {topic.analogy_caption && (
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#35322D' }}>
                <RichText text={topic.analogy_caption} />
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              background: TINT,
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 18,
              fontSize: 14,
              lineHeight: 1.6,
              color: '#35322D',
            }}
          >
            Peça para o assistente conectado via MCP: <em>&quot;crie uma analogia visual para este tópico&quot;</em> — ele
            vai preencher este painel com um diagrama explicando o conceito. Enquanto isso, você já pode desenhar sua
            própria versão logo abaixo, a qualquer momento.
          </div>
        )}

        <p className="rcp-label" style={{ marginBottom: 8 }}>
          Seu desenho
        </p>
        <AnalogyCanvas topicId={topic.id} initialStrokes={topic.analogy_drawing} />
      </div>
    </div>
  );
}
