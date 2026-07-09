import { getTopicsWithCounts } from '@/lib/actions/topics';
import { TopicsList } from '@/components/TopicsList';
import { AnimatedEmoji } from '@/components/AnimatedEmoji';
import { accent } from '@/lib/ui';

export default async function TopicsPage() {
  const topics = await getTopicsWithCounts();

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '44px 26px 80px' }}>
      <div style={{ textAlign: 'center', margin: '22px 0 44px' }}>
        <p
          style={{
            font: '600 13px var(--font-body)',
            letterSpacing: '.05em',
            textTransform: 'uppercase',
            color: accent,
            margin: '0 0 12px',
          }}
        >
          Seu ciclo de estudo
        </p>
        <h1
          className="rcp-font-display"
          style={{
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.04,
            letterSpacing: '-.035em',
            margin: '0 auto 26px',
            maxWidth: '16ch',
          }}
        >
          O que você quer <span style={{ color: accent }}>dominar</span> hoje?
        </h1>
        <form
          method="GET"
          action="/topics/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 640,
            margin: '0 auto',
            background: '#fff',
            border: '1.5px solid rgba(0,0,0,.1)',
            borderRadius: 18,
            padding: '8px 8px 8px 20px',
            boxShadow: '0 16px 40px -20px rgba(0,0,0,.25)',
          }}
        >
          <i className="ph ph-magnifying-glass" style={{ fontSize: 20, color: '#9A968E' }} />
          <input
            name="name"
            placeholder="ex: Closures em JavaScript, Índices em SQL…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'none',
              font: '400 16px var(--font-body)',
              color: '#161616',
            }}
          />
          <button type="submit" className="rcp-btn-dark">
            <i className="ph-bold ph-arrow-right" style={{ fontSize: 15 }} /> Criar tópico
          </button>
        </form>
      </div>

      {topics.length === 0 ? (
        <div className="rcp-card" style={{ textAlign: 'center', marginBottom: 26 }}>
          <h2 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 20, margin: '0 0 8px' }}>
            <AnimatedEmoji>👋</AnimatedEmoji> Bem-vindo ao Review Cards Pro
          </h2>
          <p style={{ maxWidth: 480, margin: '0 auto', color: '#6B6862', fontSize: 15, lineHeight: 1.6 }}>
            Cada <strong>tópico</strong> aqui é um ciclo completo de aprendizado: conceito → código
            → onde usar → onde não usar → erros comuns → prática → revisão → explicar em voz alta.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 18px' }}>
          <h2 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 20, letterSpacing: '-.01em', margin: 0 }}>
            Seus tópicos <span style={{ color: '#A29E96', fontWeight: 500 }}>· {topics.length}</span>
          </h2>
          <span style={{ fontSize: 14, color: '#86827A' }}>Ordenar por recentes</span>
        </div>
      )}

      <TopicsList topics={topics} />
    </div>
  );
}
