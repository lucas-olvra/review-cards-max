import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSection } from '@/lib/actions/sections';
import { getSectionDrill } from '@/lib/actions/contrasts';
import { DiscriminateRunner } from '@/components/DiscriminateRunner';

export default async function DiscriminatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = await getSection(id);
  if (!section) notFound();

  const questions = await getSectionDrill(id);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={`/sections/${id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-x" /> Sair do treino
      </Link>
      <DiscriminateRunner sectionId={id} questions={questions} />
    </div>
  );
}
