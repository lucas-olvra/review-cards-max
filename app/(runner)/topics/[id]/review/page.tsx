import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/actions/topics';
import { QuizRunner } from '@/components/QuizRunner';
import { safeInternalHref } from '@/lib/nav';

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const topic = await getTopic(id);
  if (!topic) notFound();

  // O `from` traz a âncora do painel de cartões, pra voltar já na altura da
  // página em que a revisão foi aberta.
  const backHref = safeInternalHref(from, `/topics/${id}`);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={backHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-x" /> Sair da revisão
      </Link>
      <QuizRunner cards={topic.cards} conceptWhat={topic.concept_what} backHref={backHref} />
    </div>
  );
}
