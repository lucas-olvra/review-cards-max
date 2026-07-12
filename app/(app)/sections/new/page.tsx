import Link from 'next/link';
import { createSection } from '@/lib/actions/sections';
import { accent, buttonPrimaryClass, buttonSecondaryClass, inputClass } from '@/lib/ui';

export default async function NewSectionPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '30px 26px 80px' }}>
      <Link
        href="/sections"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#86827A', marginBottom: 22 }}
      >
        <i className="ph ph-arrow-left" /> Voltar
      </Link>
      <h1 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.025em', margin: '0 0 6px' }}>
        Nova seção
      </h1>
      <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 30px' }}>
        Cada seção agrupa tópicos relacionados (ex: um assunto ou linguagem), pra não misturar tudo numa lista só.
      </p>

      <div className="rcp-card" style={{ borderRadius: 22, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <form action={createSection} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <input type="hidden" name="kind" value="programming" />

          <label style={{ display: 'block' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 13.5px var(--font-body)', color: '#161616', marginBottom: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: '#E9ECFF', display: 'grid', placeItems: 'center' }}>
                <i className="ph-bold ph-text-aa" style={{ color: accent, fontSize: 12 }} />
              </span>
              Nome da seção
            </span>
            <input
              name="name"
              required
              defaultValue={params.name ?? ''}
              placeholder="ex: Java, Python, Estrutura de dados…"
              className={inputClass}
            />
          </label>

          <div>
            <span style={{ display: 'block', font: '600 13.5px var(--font-body)', color: '#161616', marginBottom: 8 }}>
              Tipo de conteúdo
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div
                style={{
                  border: `1.5px solid ${accent}`,
                  background: '#F3F4FF',
                  borderRadius: 14,
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: accent }}>
                  <i className="ph-fill ph-brain" /> Programação
                </div>
                <p style={{ fontSize: 12.5, color: '#6B6862', margin: '6px 0 0' }}>
                  Conceito, código, prática, revisão e analogia visual.
                </p>
              </div>
              <div
                style={{
                  border: '1.5px solid rgba(0,0,0,.08)',
                  background: '#F7F6F2',
                  borderRadius: 14,
                  padding: '14px 16px',
                  opacity: 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: '#6B6862' }}>
                  <i className="ph-fill ph-translate" /> Idiomas
                </div>
                <p style={{ fontSize: 12.5, color: '#6B6862', margin: '6px 0 0' }}>Em breve.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" className={buttonPrimaryClass}>
              Criar seção
            </button>
            <Link href="/sections" className={buttonSecondaryClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
