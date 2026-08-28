import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/actions/topics';
import { PitchRunner } from '@/components/PitchRunner';
import { safeInternalHref } from '@/lib/nav';

export default async function PitchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; day0?: string }>;
}) {
  const { id } = await params;
  const { from, day0 } = await searchParams;
  const topic = await getTopic(id);
  if (!topic) notFound();

  const backHref = safeInternalHref(from, `/topics/${id}`);

  // A analogia visual é o apoio certo pra este degrau: ela devolve a estrutura
  // do conceito sem entregar as palavras da explicação. Sem diagrama, o "o que
  // é" faz o papel — pior, porque entrega mais, mas melhor que nada.
  const hint = topic.analogy_diagram.shapes.length
    ? { diagram: topic.analogy_diagram, caption: topic.analogy_caption }
    : { text: topic.concept_what };

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={backHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-x" /> Sair
      </Link>
      <PitchRunner
        topicName={topic.name}
        pitch={topic.pitch}
        backHref={backHref}
        topicId={topic.id}
        decisiveQuestion={topic.decisive_question}
        hint={hint}
        day0={day0 === '1'}
      />
    </div>
  );
}
