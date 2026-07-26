import Link from 'next/link';
import { NewSectionForm } from '@/components/NewSectionForm';
import type { SectionKind } from '@/lib/types';

function isKind(value: string | undefined): value is SectionKind {
  return value === 'programming' || value === 'language';
}

export default async function NewSectionPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; kind?: string }>;
}) {
  const params = await searchParams;
  const kind: SectionKind = isKind(params.kind) ? params.kind : 'programming';

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '30px 26px 80px' }}>
      <Link
        href={`/sections?kind=${kind}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-arrow-left" /> Voltar
      </Link>
      <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.025em', margin: '0 0 6px' }}>
        Nova seção
      </h1>
      <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 30px' }}>
        Cada seção agrupa um assunto só — uma linguagem de programação, ou um idioma —, pra não misturar tudo numa lista.
      </p>

      <div className="rcp-card" style={{ borderRadius: 22, padding: 28 }}>
        <NewSectionForm defaultName={params.name ?? ''} defaultKind={kind} />
      </div>
    </div>
  );
}
