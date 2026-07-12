import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSection, deleteSection } from '@/lib/actions/sections';
import { getTopicsWithCounts } from '@/lib/actions/topics';
import { TopicsList } from '@/components/TopicsList';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { buttonDangerClass } from '@/lib/ui';

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = await getSection(id);
  if (!section) notFound();

  const topics = section.kind === 'programming' ? await getTopicsWithCounts(id) : [];

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href="/sections"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 20 }}
      >
        <i className="ph ph-arrow-left" /> Todas as seções
      </Link>

      <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 32, letterSpacing: '-.025em', margin: '0 0 26px' }}>
        {section.name}
      </h1>

      {section.kind === 'programming' ? (
        <TopicsList topics={topics} newTopicHref={`/topics/new?section_id=${section.id}`} />
      ) : (
        <div className="rcp-card" style={{ textAlign: 'center', padding: 40 }}>
          <i className="ph-fill ph-translate" style={{ fontSize: 32, color: '#0BA5EC' }} />
          <p style={{ fontSize: 15, color: '#6B6862', margin: '14px 0 0' }}>
            O modo de aprendizado de idiomas ainda está a caminho.
          </p>
        </div>
      )}

      <div style={{ margin: '40px 0 0', textAlign: 'right' }}>
        <ConfirmSubmitButton
          action={deleteSection.bind(null, section.id)}
          confirmMessage={`Excluir a seção "${section.name}"? Isso apaga todos os ${topics.length} tópicos dentro dela. Essa ação não pode ser desfeita.`}
          className={buttonDangerClass}
        >
          <i className="ph ph-trash" /> Excluir seção
        </ConfirmSubmitButton>
      </div>
    </div>
  );
}
