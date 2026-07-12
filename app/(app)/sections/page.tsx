import { getSectionsWithCounts } from '@/lib/actions/sections';
import { SectionsList } from '@/components/SectionsList';
import { WelcomeCycleCarousel } from '@/components/WelcomeCycleCarousel';
import { accent } from '@/lib/ui';

export default async function SectionsPage() {
  const sections = await getSectionsWithCounts();

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
          Suas seções
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
          action="/sections/new"
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
            placeholder="ex: Java, Python, Inglês…"
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
            <i className="ph-bold ph-arrow-right" style={{ fontSize: 15 }} /> Criar seção
          </button>
        </form>
      </div>

      {sections.length === 0 ? (
        <WelcomeCycleCarousel />
      ) : (
        <SectionsList sections={sections} />
      )}
    </div>
  );
}
