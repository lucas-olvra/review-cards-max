import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/actions/topics';
import { DiscursiveRunner } from '@/components/DiscursiveRunner';

export default async function ReviewDiscursivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();

  return (
    <div>
      <Link href={`/topics/${id}`} className="mb-4 inline-block text-sm text-slate-400 hover:text-slate-200">
        ← Sair
      </Link>
      <h2 className="mb-4 text-xl font-bold">Revisão Discursiva</h2>
      <DiscursiveRunner topicId={id} items={topic.discursive_questions} />
    </div>
  );
}
