import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createTopic } from '@/lib/actions/topics';
import { accent, buttonPrimaryClass, buttonSecondaryClass, inputClass, textareaClass } from '@/lib/ui';
import { NEW_TOPIC_FIELDS } from '@/lib/stages';

export default async function NewTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; section_id?: string }>;
}) {
  const params = await searchParams;
  if (!params.section_id) redirect('/sections');

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '30px 26px 80px' }}>
      <Link
        href={`/sections/${params.section_id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-arrow-left" /> Voltar
      </Link>
      <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.025em', margin: '0 0 6px' }}>
        Novo tópico
      </h1>
      <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 30px' }}>
        Comece pelo essencial. Você pode adicionar cartões, código e prática depois.
      </p>

      <div className="rcp-card" style={{ borderRadius: 22, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <form action={createTopic} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <input type="hidden" name="section_id" value={params.section_id} />
          <label style={{ display: 'block' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 13.5px var(--font-body)', color: '#161616', marginBottom: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: '#E9ECFF', display: 'grid', placeItems: 'center' }}>
                <i className="ph-bold ph-text-aa" style={{ color: accent, fontSize: 12 }} />
              </span>
              Nome do tópico
            </span>
            <input
              name="name"
              required
              defaultValue={params.name ?? ''}
              placeholder="ex: Closures em JavaScript"
              className={inputClass}
            />
          </label>

          {NEW_TOPIC_FIELDS.map((f) => (
            <label key={f.key} style={{ display: 'block' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 13.5px var(--font-body)', color: '#161616', marginBottom: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, display: 'grid', placeItems: 'center', background: f.tint }}>
                  <i className={f.icon} style={{ color: f.color, fontSize: 12 }} />
                </span>
                {f.label}
              </span>
              <textarea name={f.key} placeholder={f.ph} className={textareaClass} />
            </label>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" className={buttonPrimaryClass}>
              Criar tópico
            </button>
            <Link href={`/sections/${params.section_id}`} className={buttonSecondaryClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
