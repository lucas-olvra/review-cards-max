import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/actions/topics';
import { DiscursiveRunner } from '@/components/DiscursiveRunner';
import { safeInternalHref } from '@/lib/nav';

// Último degrau da escada: o exercício do painel "Prática", cobrado como
// revisão. Reaproveita o runner das discursivas na variante `practice` — a
// mecânica é a mesma (formular inteiro de cabeça, revelar, se autoavaliar), o
// que muda é o que se formula.
export default async function PracticePage({
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

  // O exercício não é uma linha de tabela — vive em dois campos do tópico. Aqui
  // ele veste o formato que o runner consome, sem inventar uma tabela nova só
  // para caber.
  const items = topic.exercise_prompt.trim()
    ? [
        {
          id: `${topic.id}-practice`,
          topic_id: topic.id,
          question: topic.exercise_prompt,
          model_answer: topic.exercise_solution,
          position: 0,
          created_at: topic.created_at,
        },
      ]
    : [];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={backHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-x" /> Sair da prática
      </Link>
      {/* Na prática o apoio é o código de referência do tópico, não o gabarito
          do exercício — esse é a resposta, e revelar tem botão próprio. */}
      <DiscursiveRunner
        items={items}
        backHref={backHref}
        topicId={topic.id}
        variant="practice"
        hint={{ text: topic.code || topic.concept_what }}
        day0={day0 === '1'}
      />
    </div>
  );
}
