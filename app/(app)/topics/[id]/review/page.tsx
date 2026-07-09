import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/actions/topics';
import { QuizRunner } from '@/components/QuizRunner';

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();

  return (
    <div>
      <Link href={`/topics/${id}`} className="mb-4 inline-block text-sm text-slate-400 hover:text-slate-200">
        ← Sair
      </Link>
      <h2 className="mb-4 text-xl font-bold">Revisão</h2>
      <QuizRunner topicId={id} cards={topic.cards} conceptWhat={topic.concept_what} />
    </div>
  );
}
