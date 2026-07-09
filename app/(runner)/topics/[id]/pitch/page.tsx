import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/actions/topics';
import { PitchRunner } from '@/components/PitchRunner';

export default async function PitchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={`/topics/${id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-x" /> Sair
      </Link>
      <PitchRunner topicId={id} topicName={topic.name} pitch={topic.pitch} />
    </div>
  );
}
