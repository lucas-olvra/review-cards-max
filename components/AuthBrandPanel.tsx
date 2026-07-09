import { STAGE_DEFS } from '@/lib/stages';

// Painel de marca (lado esquerdo das telas de login/signup). Portado 1:1 do
// painel escuro do design "Review Cards Pro": headline, resumo do ciclo de
// aprendizado e os "cycle dots" (ícones dos estágios, exceto "Por que existe",
// igual ao mockup) sobre dois blobs de gradiente radial.
export function AuthBrandPanel() {
  const cycleDots = STAGE_DEFS.filter((s) => s.key !== 'concept_why');

  return (
    <div
      className="rcp-auth-brand"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#161616',
        padding: 48,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: '#fff',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <i className="ph-fill ph-cards-three" style={{ color: '#161616', fontSize: 19 }} />
        </div>
        <span className="rcp-font-display" style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>
          ReviewCards
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <h2
          className="rcp-font-display"
          style={{
            fontWeight: 700,
            fontSize: 42,
            lineHeight: 1.05,
            letterSpacing: '-.03em',
            color: '#fff',
            margin: '0 0 18px',
            maxWidth: '15ch',
          }}
        >
          Domine um tópico. Do conceito à explicação em voz alta.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,.6)', margin: 0, maxWidth: '42ch' }}>
          Cada tópico é um ciclo completo: conceito → código → onde usar → erros → prática →
          revisão → pitch de 30s.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 2 }}>
        {cycleDots.map((s) => (
          <div
            key={s.key}
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              display: 'grid',
              placeItems: 'center',
              background: s.color,
            }}
          >
            <i className={s.icon} style={{ color: '#fff', fontSize: 15 }} />
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          right: -120,
          top: -80,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(44,75,224,.55), transparent 68%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 60,
          bottom: -140,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229,56,126,.4), transparent 66%)',
        }}
      />
    </div>
  );
}
