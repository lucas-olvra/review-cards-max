import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSection } from '@/lib/actions/sections';
import { getSectionDrill } from '@/lib/actions/contrasts';
import { DiscriminateRunner } from '@/components/DiscriminateRunner';
import { isTopicHref, safeInternalHref } from '@/lib/nav';

export default async function DiscriminatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const section = await getSection(id);
  if (!section) notFound();

  const questions = await getSectionDrill(id);

  // O treino é da seção inteira, mas quem entra pelo painel "Confundo com" de
  // um tópico espera voltar pro tópico — e não pra lista de tópicos da seção.
  const backHref = safeInternalHref(from, `/sections/${id}`);
  const backLabel = isTopicHref(backHref) ? 'Voltar ao tópico' : 'Voltar à seção';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={backHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-x" /> Sair do treino
      </Link>
      <DiscriminateRunner questions={questions} backHref={backHref} backLabel={backLabel} />
    </div>
  );
}
