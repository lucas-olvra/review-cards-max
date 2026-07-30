import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSection, deleteSection } from '@/lib/actions/sections';
import { getTopicsWithCounts } from '@/lib/actions/topics';
import { countSectionDrill } from '@/lib/actions/contrasts';
import { getLanguageItems, getMasteredKeys, getNarrationSessions } from '@/lib/actions/language';
import { TopicsList } from '@/components/TopicsList';
import { LanguageHub, parseTab } from '@/components/language/LanguageHub';
import { type FrameEntry } from '@/components/language/FramesPanel';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { McpHint } from '@/components/McpHint';
import { LANGUAGE_LABELS, countSeedWords, planFor } from '@/lib/language/seed';
import { computeNarrationStats } from '@/lib/language/stats';
import { buttonDangerClass } from '@/lib/ui';

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const section = await getSection(id);
  if (!section) notFound();

  const isLanguage = section.kind === 'language';
  const topics = isLanguage ? [] : await getTopicsWithCounts(id);

  const [items, masteredKeys, sessions] = isLanguage
    ? await Promise.all([getLanguageItems(id), getMasteredKeys(id), getNarrationSessions(id)])
    : [[], [], []];

  const drillN = isLanguage ? 0 : await countSectionDrill(id);

  const plan = planFor(isLanguage ? section.language : null);

  // Os moldes do seed e os que o usuário criou entram na mesma lista — o que
  // muda é a chave de progresso: seed usa o id do catálogo, item do usuário usa
  // `db:<uuid>`, pra os dois nunca colidirem em language_progress.
  const frames: FrameEntry[] = [
    ...plan.frames.map((f) => ({ ...f, meaningLabel: f.meaning })),
    ...items
      .filter((i) => i.kind === 'frame')
      .map((i) => ({
        id: `db:${i.id}`,
        template: i.term,
        meaning: i.meaning,
        meaningLabel: i.meaning || 'Seu molde',
        hint: i.category,
        examples: i.examples,
        userItemId: i.id,
      })),
  ];

  const deleteWarning = isLanguage
    ? `Excluir a seção "${section.name}"? Isso apaga seus moldes, palavras e gravações de narração. Essa ação não pode ser desfeita.`
    : `Excluir a seção "${section.name}"? Isso apaga todos os ${topics.length} tópicos dentro dela. Essa ação não pode ser desfeita.`;

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '26px 26px 90px' }}>
      <Link
        href={`/sections?kind=${section.kind}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 20 }}
      >
        <i className="ph ph-arrow-left" /> {isLanguage ? 'Todos os idiomas' : 'Todas as seções'}
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '0 0 26px' }}>
        <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 32, letterSpacing: '-.025em', margin: 0 }}>
          {section.name}
        </h1>
        {isLanguage && section.language && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              font: '600 12.5px var(--font-body)',
              color: '#0BA5EC',
              background: '#E0F2FE',
              padding: '5px 11px',
              borderRadius: 999,
            }}
          >
            <i className="ph-fill ph-translate" /> {LANGUAGE_LABELS[section.language]}
          </span>
        )}
      </div>

      {isLanguage ? (
        <LanguageHub
          sectionId={section.id}
          sectionName={section.name}
          languageLabel={section.language ? LANGUAGE_LABELS[section.language] : 'idioma'}
          frames={frames}
          masteredKeys={masteredKeys}
          groups={plan.groups}
          userWords={items.filter((i) => i.kind === 'word')}
          totalSeedWords={countSeedWords(plan)}
          sessions={sessions}
          stats={computeNarrationStats(sessions)}
          initialTab={parseTab(tab)}
        />
      ) : (
        <>
          {drillN > 0 && (
            <Link
              href={`/sections/${section.id}/discriminate`}
              className="rcp-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                marginBottom: 16,
                textDecoration: 'none',
              }}
            >
              <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 12, display: 'grid', placeItems: 'center', background: '#F1E9FE' }}>
                <i className="ph-fill ph-target" style={{ color: '#7C3AED', fontSize: 20 }} />
              </span>
              <span style={{ flex: 1 }}>
                <span className="rcp-font-display" style={{ display: 'block', fontWeight: 600, fontSize: 16, color: '#161616' }}>
                  Treinar discriminação
                </span>
                <span style={{ display: 'block', fontSize: 13.5, color: '#6B6862', marginTop: 2 }}>
                  {drillN} {drillN === 1 ? 'cenário' : 'cenários'} onde dois tópicos competem — sem dizer de qual eles vieram
                </span>
              </span>
              <i className="ph-bold ph-arrow-right" style={{ color: '#7C3AED', fontSize: 16 }} />
            </Link>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ font: '600 15px var(--font-body)', color: '#161616' }}>
              Tópicos <span style={{ color: '#A29E96', fontWeight: 500 }}>· {topics.length}</span>
            </span>
            <McpHint
              label="Pedir um tópico pra IA"
              title="Peça o tópico inteiro, não campo por campo"
              body={`A IA cria o tópico direto em "${section.name}" já com todos os campos do ciclo preenchidos, cartões, discursivas e a analogia visual.`}
              example={`Crie um tópico completo sobre enum em Java na seção "${section.name}", preenchendo todos os campos do ciclo, com 4 cartões e 2 discursivas.`}
            />
          </div>
          <TopicsList topics={topics} newTopicHref={`/topics/new?section_id=${section.id}`} />
        </>
      )}

      <div style={{ margin: '40px 0 0', textAlign: 'right' }}>
        <ConfirmSubmitButton
          action={deleteSection.bind(null, section.id)}
          confirmMessage={deleteWarning}
          className={buttonDangerClass}
        >
          <i className="ph ph-trash" /> Excluir seção
        </ConfirmSubmitButton>
      </div>
    </div>
  );
}
