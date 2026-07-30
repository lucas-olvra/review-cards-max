import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/actions/topics';
import { DiscursiveRunner } from '@/components/DiscursiveRunner';
import { safeInternalHref } from '@/lib/nav';

export default async function ReviewDiscursivePage({
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

  const backHref = safeInternalHref(from, `/topics/${id}`);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={backHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-x" /> Sair da revisão
      </Link>
      <DiscursiveRunner items={topic.discursive_questions} backHref={backHref} />
    </div>
  );
}
