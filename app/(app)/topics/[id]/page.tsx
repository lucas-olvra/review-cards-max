import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic, getTopics, updateTopicPanel, deleteTopic } from '@/lib/actions/topics';
import { EditablePanel } from '@/components/EditablePanel';
import { AnalogyPanel } from '@/components/AnalogyPanel';
import { CardsSection } from '@/components/CardsSection';
import { DiscursiveSection } from '@/components/DiscursiveSection';
import { TopicHeader } from '@/components/TopicHeader';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { buttonDangerClass } from '@/lib/ui';
import { SIMPLE_STAGE_DEFS, PRACTICE_STAGE_DEF } from '@/lib/stages';
import { paletteFor } from '@/lib/palette';

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();

  const topics = await getTopics(topic.section_id);
  const idx = topics.findIndex((t) => t.id === id);
  const palette = paletteFor(idx < 0 ? 0 : idx);

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={`/sections/${topic.section_id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 20 }}
      >
        <i className="ph ph-arrow-left" /> Todos os tópicos
      </Link>

      <TopicHeader topicId={topic.id} name={topic.name} icon={palette.icon} color={palette.bg} />

      <div
        className="rcp-scroll"
        style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 2px 16px', marginBottom: 8 }}
      >
        {[...SIMPLE_STAGE_DEFS, PRACTICE_STAGE_DEF].map((s) => (
          <div
            key={s.key}
            style={{
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 13px 8px 8px',
              borderRadius: 999,
              background: s.tint,
            }}
          >
            <span style={{ width: 26, height: 26, borderRadius: 8, display: 'grid', placeItems: 'center', background: s.color }}>
              <i className={s.icon} style={{ color: '#fff', fontSize: 13 }} />
            </span>
            <span style={{ font: '600 12.5px var(--font-body)', color: s.color, whiteSpace: 'nowrap' }}>{s.short}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 14 }}>
        {SIMPLE_STAGE_DEFS.map((s) => (
          <EditablePanel
            key={s.key}
            icon={s.icon}
            title={s.title}
            color={s.color}
            tint={s.tint}
            isCode={s.isCode}
            fields={[{ name: s.key, label: s.title, value: topic[s.key] }]}
            action={updateTopicPanel.bind(null, topic.id, [s.key])}
            emptyLabel={`+ ${s.title}`}
          />
        ))}

        <EditablePanel
          icon={PRACTICE_STAGE_DEF.icon}
          title={PRACTICE_STAGE_DEF.title}
          color={PRACTICE_STAGE_DEF.color}
          tint={PRACTICE_STAGE_DEF.tint}
          fields={[
            { name: 'exercise_prompt', label: 'Enunciado do exercício', value: topic.exercise_prompt },
            { name: 'exercise_solution', label: 'Gabarito / solução', value: topic.exercise_solution },
          ]}
          action={updateTopicPanel.bind(null, topic.id, ['exercise_prompt', 'exercise_solution'])}
          emptyLabel="+ Prática"
        />
      </div>

      <div style={{ margin: '26px 0 0' }}>
        <CardsSection topicId={topic.id} cards={topic.cards} />
      </div>

      <div style={{ margin: '26px 0 0' }}>
        <DiscursiveSection topicId={topic.id} items={topic.discursive_questions} />
      </div>

      <div style={{ margin: '26px 0 0' }}>
        <AnalogyPanel topic={topic} />
      </div>

      <div
        style={{
          margin: '26px 0 0',
          background: 'linear-gradient(120deg, #FB6514, #F5A524)',
          borderRadius: 20,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div
            style={{
              width: 48,
              height: 48,
              flex: 'none',
              borderRadius: 14,
              background: 'rgba(255,255,255,.22)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <i className="ph-fill ph-microphone-stage" style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div>
            <h3 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 19, color: '#fff', margin: '0 0 3px' }}>
              Explique em 30 segundos
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.85)', margin: 0 }}>
              O teste final: ensine o tópico em voz alta, no tempo.
            </p>
          </div>
        </div>
        <Link
          href={`/topics/${topic.id}/pitch`}
          className="rcp-btn-secondary"
          style={{ flex: 'none', border: 'none', color: '#C2410C', background: '#fff', fontWeight: 700 }}
        >
          <i className="ph-fill ph-play" style={{ fontSize: 13 }} /> Praticar
        </Link>
      </div>

      <div style={{ margin: '14px 0 0' }}>
        <EditablePanel
          icon="ph-fill ph-microphone-stage"
          title="Resumo de 30 segundos"
          color="#FB6514"
          tint="#FFEBDF"
          fields={[{ name: 'pitch', label: 'Resumo de 30 segundos', value: topic.pitch }]}
          action={updateTopicPanel.bind(null, topic.id, ['pitch'])}
          emptyLabel="+ Resumo de 30 segundos"
        />
      </div>

      <div style={{ margin: '30px 0 0', textAlign: 'right' }}>
        <ConfirmSubmitButton
          action={deleteTopic.bind(null, topic.id)}
          confirmMessage="Tem certeza que deseja excluir este tópico? Essa ação não pode ser desfeita."
          className={buttonDangerClass}
        >
          <i className="ph ph-trash" /> Excluir tópico
        </ConfirmSubmitButton>
      </div>
    </div>
  );
}
