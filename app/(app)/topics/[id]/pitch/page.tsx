import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/actions/topics';
import { PitchRunner } from '@/components/PitchRunner';

export default async function PitchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();

  return (
    <div>
      <Link href={`/topics/${id}`} className="mb-4 inline-block text-sm text-slate-400 hover:text-slate-200">
        ← Sair
      </Link>
      <h2 className="mb-4 text-xl font-bold">Explique em 30 segundos</h2>
      <PitchRunner topicId={id} topicName={topic.name} pitch={topic.pitch} />
    </div>
  );
}
