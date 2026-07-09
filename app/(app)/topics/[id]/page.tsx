import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic, updateTopicPanel } from '@/lib/actions/topics';
import { EditablePanel } from '@/components/EditablePanel';
import { CardsSection } from '@/components/CardsSection';
import { DiscursiveSection } from '@/components/DiscursiveSection';
import { TopicHeader } from '@/components/TopicHeader';
import { buttonSecondaryClass } from '@/lib/ui';

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();

  return (
    <div>
      <Link href="/topics" className="mb-4 inline-block text-sm text-slate-400 hover:text-slate-200">
        ← Voltar
      </Link>

      <TopicHeader topicId={topic.id} name={topic.name} />

      <EditablePanel
        icon="🧠"
        title="O que é / Por que existe"
        fields={[
          { name: 'concept_what', label: 'O que é', value: topic.concept_what },
          { name: 'concept_why', label: 'Por que existe', value: topic.concept_why },
        ]}
        action={updateTopicPanel.bind(null, topic.id, ['concept_what', 'concept_why'])}
        defaultOpen
      />

      <EditablePanel
        icon="💻"
        title="Código"
        fields={[{ name: 'code', label: 'Código de exemplo (use ``` para destacar como bloco)', value: topic.code }]}
        action={updateTopicPanel.bind(null, topic.id, ['code'])}
        emptyLabel="+ Código de exemplo"
      />

      <EditablePanel
        icon="✅"
        title="Onde usar"
        fields={[{ name: 'use_cases', label: 'Onde usar — casos reais', value: topic.use_cases }]}
        action={updateTopicPanel.bind(null, topic.id, ['use_cases'])}
      />

      <EditablePanel
        icon="🚫"
        title="Onde não usar"
        fields={[
          { name: 'anti_patterns', label: 'Onde não usar — limitações/trade-offs', value: topic.anti_patterns },
        ]}
        action={updateTopicPanel.bind(null, topic.id, ['anti_patterns'])}
      />

      <EditablePanel
        icon="⚠️"
        title="Erros comuns"
        fields={[{ name: 'common_mistakes', label: 'Erros comuns', value: topic.common_mistakes }]}
        action={updateTopicPanel.bind(null, topic.id, ['common_mistakes'])}
      />

      <EditablePanel
        icon="🏋️"
        title="Prática"
        fields={[
          { name: 'exercise_prompt', label: 'Enunciado do exercício', value: topic.exercise_prompt },
          { name: 'exercise_solution', label: 'Gabarito / solução', value: topic.exercise_solution },
        ]}
        action={updateTopicPanel.bind(null, topic.id, ['exercise_prompt', 'exercise_solution'])}
        emptyLabel="+ Exercício de prática"
      />

      <div className="my-6 border-t border-slate-800" />

      <CardsSection topicId={topic.id} cards={topic.cards} />
      {topic.cards.length > 0 && (
        <div className="mt-3">
          <Link href={`/topics/${topic.id}/review`} className={buttonSecondaryClass}>
            Revisar Cartões
          </Link>
        </div>
      )}

      <div className="my-6 border-t border-slate-800" />

      <DiscursiveSection topicId={topic.id} items={topic.discursive_questions} />

      <div className="my-6 border-t border-slate-800" />

      <EditablePanel
        icon="🎤"
        title="Explicar em 30 segundos"
        fields={[{ name: 'pitch', label: 'Resumo de 30 segundos', value: topic.pitch }]}
        action={updateTopicPanel.bind(null, topic.id, ['pitch'])}
        emptyLabel="+ Resumo de 30 segundos"
      />
      {topic.pitch && (
        <Link href={`/topics/${topic.id}/pitch`} className={buttonSecondaryClass}>
          🎤 Praticar (30s)
        </Link>
      )}
    </div>
  );
}
