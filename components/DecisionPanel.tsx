import { RichText } from '@/lib/render';
import { EditablePanel } from '@/components/EditablePanel';
import { updateTopicPanel } from '@/lib/actions/topics';
import type { Topic } from '@/lib/types';

// Roxo de propósito: é a mesma família de "Confundo com" e do treino de
// discriminação. Os dois respondem "qual eu uso" — a diferença é que lá a
// disputa é contra outro tópico e aqui é contra não usar nada.
const DECISION_COLOR = '#7C3AED';
const DECISION_TINT = '#F1E9FE';

function Branch({
  label,
  text,
  color,
  bg,
  icon,
}: {
  label: string;
  text: string;
  color: string;
  bg: string;
  icon: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', borderRadius: 13, padding: '12px 14px', background: bg }}>
      <span
        style={{
          flex: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          font: '700 12px var(--font-body)',
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          color,
          marginTop: 2,
        }}
      >
        <i className={icon} style={{ fontSize: 14 }} />
        {label}
      </span>
      {/* <div>, nunca <p>: RichText emite <ul>/<pre> e quebraria a hidratação. */}
      <div style={{ fontSize: 14.5, lineHeight: 1.55, color: '#35322D' }}>
        <RichText text={text} />
      </div>
    </div>
  );
}

export function DecisionPanel({ topic }: { topic: Topic }) {
  // As colunas vêm da migration 0012, que é aplicada à mão no SQL Editor do
  // Supabase. O `?? ''` cobre a janela entre subir o código e rodar o SQL:
  // sem ele, a página de todo tópico quebraria na renderização.
  const question = topic.decisive_question ?? '';
  const yes = topic.decisive_yes ?? '';
  const no = topic.decisive_no ?? '';

  const preview = (
    <div>
      <div style={{ fontSize: 18, lineHeight: 1.4, fontWeight: 600, color: '#161616', marginBottom: 12 }}>
        <RichText text={question} />
      </div>
      {(yes.trim() || no.trim()) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {yes.trim() && <Branch label="Sim" text={yes} color="#0E9F6E" bg="#E1FAEF" icon="ph-fill ph-check-circle" />}
          {no.trim() && (
            <Branch label="Não" text={no} color="#EF4444" bg="#FEECEA" icon="ph-fill ph-arrow-bend-up-right" />
          )}
        </div>
      )}
    </div>
  );

  return (
    <EditablePanel
      icon="ph-fill ph-key"
      title="A pergunta que decide"
      color={DECISION_COLOR}
      tint={DECISION_TINT}
      fields={[
        { name: 'decisive_question', label: 'A pergunta — binária, respondível só lendo o enunciado', value: question },
        { name: 'decisive_yes', label: 'Se sim →', value: yes },
        { name: 'decisive_no', label: 'Se não → use isto no lugar', value: no },
      ]}
      action={updateTopicPanel.bind(null, topic.id, ['decisive_question', 'decisive_yes', 'decisive_no'])}
      emptyLabel="+ A pergunta que decide"
      preview={preview}
    />
  );
}
