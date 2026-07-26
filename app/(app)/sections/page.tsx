import Link from 'next/link';
import { getSectionsWithCounts } from '@/lib/actions/sections';
import { SectionsList } from '@/components/SectionsList';
import { ContentKindGrid } from '@/components/ContentKindGrid';
import { WelcomeCycleCarousel } from '@/components/WelcomeCycleCarousel';
import { accent } from '@/lib/ui';
import type { SectionKind } from '@/lib/types';

const KIND_COPY: Record<SectionKind, { eyebrow: string; title: string; highlight: string; placeholder: string }> = {
  programming: {
    eyebrow: 'Programação',
    title: 'O que você quer',
    highlight: 'dominar',
    placeholder: 'ex: Java, Python, Estrutura de dados…',
  },
  language: {
    eyebrow: 'Idiomas',
    title: 'Qual idioma você quer',
    highlight: 'destravar',
    placeholder: 'ex: Inglês, Espanhol…',
  },
};

function isKind(value: string | undefined): value is SectionKind {
  return value === 'programming' || value === 'language';
}

export default async function SectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const sections = await getSectionsWithCounts();

  // Sem `kind` na URL esta é a home: escolher o conteúdo primeiro. Só depois
  // de escolher é que aparecem as seções daquele conteúdo e o botão de criar.
  if (!isKind(kind)) {
    const counts: Record<SectionKind, number> = {
      programming: sections.filter((s) => s.kind === 'programming').length,
      language: sections.filter((s) => s.kind === 'language').length,
    };

    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '44px 26px 80px' }}>
        <div style={{ textAlign: 'center', margin: '22px 0 38px' }}>
          <p
            style={{
              font: '600 13px var(--font-body)',
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: accent,
              margin: '0 0 12px',
            }}
          >
            Seus conteúdos
          </p>
          <h1
            className="rcp-font-display"
            style={{
              fontWeight: 700,
              fontSize: 46,
              lineHeight: 1.04,
              letterSpacing: '-.035em',
              margin: '0 auto 14px',
              maxWidth: '16ch',
            }}
          >
            O que você quer <span style={{ color: accent }}>estudar</span> hoje?
          </h1>
          <p style={{ fontSize: 15.5, color: '#6B6862', margin: '0 auto', maxWidth: '46ch', lineHeight: 1.6 }}>
            Escolha o conteúdo para ver suas seções — ou criar uma nova dentro dele.
          </p>
        </div>

        <ContentKindGrid counts={counts} />

        {sections.length === 0 && (
          <div style={{ marginTop: 34 }}>
            <WelcomeCycleCarousel />
          </div>
        )}
      </div>
    );
  }

  const copy = KIND_COPY[kind];
  const visible = sections.filter((s) => s.kind === kind);

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '26px 26px 80px' }}>
      <Link
        href="/sections"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A' }}
      >
        <i className="ph ph-arrow-left" /> Todos os conteúdos
      </Link>

      <div style={{ textAlign: 'center', margin: '20px 0 44px' }}>
        <p
          style={{
            font: '600 13px var(--font-body)',
            letterSpacing: '.05em',
            textTransform: 'uppercase',
            color: accent,
            margin: '0 0 12px',
          }}
        >
          {copy.eyebrow}
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
          {copy.title} <span style={{ color: accent }}>{copy.highlight}</span>?
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
          <input type="hidden" name="kind" value={kind} />
          <i className="ph ph-magnifying-glass" style={{ fontSize: 20, color: '#9A968E' }} />
          <input
            name="name"
            placeholder={copy.placeholder}
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

      <SectionsList sections={visible} kind={kind} />
    </div>
  );
}
