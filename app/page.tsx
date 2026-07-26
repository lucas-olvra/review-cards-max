import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CycleExplorer } from '@/components/landing/CycleExplorer';
import { DiscriminationDemo } from '@/components/landing/DiscriminationDemo';
import { FrameSwapper } from '@/components/landing/FrameSwapper';
import { McpDemo } from '@/components/landing/McpDemo';
import { accent } from '@/lib/ui';

// Única rota pública do app (ver lib/supabase/proxy.ts). Quem já tem sessão
// também pode abrir, e aí o CTA aponta pros próprios estudos em vez de pedir
// cadastro — assim dá pra revisar a landing sem precisar deslogar.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const loggedIn = !!user;

  return (
    <div style={{ width: '100%' }}>
      {/* ── Hero ───────────────────────────────────────────── */}
      <header className="rcp-lp-hero">
        <div className="rcp-lp-grid-bg" />
        <div className="rcp-lp-blob" style={{ width: 460, height: 460, background: '#2C4BE0', top: -140, left: -80 }} />
        <div className="rcp-lp-blob" style={{ width: 380, height: 380, background: '#7C3AED', top: 40, right: -100, animationDelay: '-6s' }} />
        <div className="rcp-lp-blob" style={{ width: 300, height: 300, background: '#0891A5', bottom: -120, left: '38%', animationDelay: '-12s' }} />

        <nav className="rcp-lp-nav">
          <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center' }}>
              <i className="ph-fill ph-cards-three" style={{ color: '#0E0E10', fontSize: 19 }} />
            </span>
            <span className="rcp-font-display" style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', color: '#fff' }}>
              Review<span style={{ color: '#8CA0FF' }}>Cards</span>
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {loggedIn ? (
              <Link href="/sections" className="rcp-lp-btn-ghost" style={{ padding: '10px 18px', fontSize: 14.5 }}>
                Meus estudos
              </Link>
            ) : (
              <>
                <Link href="/login" className="rcp-lp-btn-ghost" style={{ padding: '10px 18px', fontSize: 14.5 }}>
                  Entrar
                </Link>
                <Link href="/signup" className="rcp-lp-btn-light" style={{ padding: '10px 20px', fontSize: 14.5 }}>
                  Criar conta
                </Link>
              </>
            )}
          </span>
        </nav>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1140, margin: '0 auto', padding: 'clamp(48px,8vw,96px) 26px clamp(64px,10vw,120px)' }}>
          <span className="rcp-lp-eyebrow">
            <i className="ph-fill ph-lightning" style={{ fontSize: 13 }} /> Ciclo completo de estudo
          </span>

          <h1 className="rcp-lp-h1">
            Estudar até entender
            <br />
            não é o mesmo que
            <br />
            <em>saber na hora.</em>
          </h1>

          <p className="rcp-lp-sub">
            Você lê, entende, fecha a aba — e na hora de usar, trava. Review Cards Pro fecha o ciclo: além de
            guardar o conceito, ele te faz <b style={{ color: '#fff' }}>explicar em voz alta</b>,{' '}
            <b style={{ color: '#fff' }}>escolher sob pressão</b> e descobrir exatamente onde você emperra.
          </p>

          <div className="rcp-lp-cta-row">
            <Link href={loggedIn ? '/sections' : '/signup'} className="rcp-lp-btn-light">
              {loggedIn ? 'Ir para meus estudos' : 'Começar de graça'} <i className="ph-bold ph-arrow-right" style={{ fontSize: 15 }} />
            </Link>
            <a href="#treino" className="rcp-lp-btn-ghost">
              <i className="ph-fill ph-target" style={{ fontSize: 15 }} /> Testar o treino agora
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(20px,4vw,44px)', marginTop: 52 }}>
            {[
              { n: '7', l: 'estágios por tópico' },
              { n: '20', l: 'moldes de frase prontos' },
              { n: '328', l: 'palavras de alta frequência' },
              { n: '14', l: 'ferramentas via MCP' },
            ].map((s) => (
              <div key={s.l}>
                <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 'clamp(26px,4vw,36px)', color: '#fff', letterSpacing: '-.03em' }}>
                  {s.n}
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── O treino de discriminação (a demo jogável) ──────── */}
      <section id="treino" className="rcp-lp-section">
        <div className="rcp-lp-split">
          <div>
            <p className="rcp-lp-kicker" style={{ color: '#7C3AED' }}>
              Por que este e não aquele
            </p>
            <h2 className="rcp-lp-h2">
              Você sabe o que cada um é.
              <br />
              Sabe qual usar?
            </h2>
            <p className="rcp-lp-lead">
              Esse é o buraco que todo app de estudo deixa. Cartão de definição sempre chega etiquetado — você
              abriu o tópico, então já sabe a resposta. Aqui não: a situação chega crua, sem dizer de onde veio,
              e você tem que decidir.
            </p>
            <p className="rcp-lp-lead" style={{ marginTop: 14 }}>
              <b style={{ color: '#161616' }}>Jogue os três casos ao lado.</b> São Java de verdade, e o terceiro
              costuma pegar mesmo quem domina os dois conceitos.
            </p>
          </div>
          <DiscriminationDemo />
        </div>
      </section>

      {/* ── O ciclo ─────────────────────────────────────────── */}
      <section className="rcp-lp-section" style={{ background: '#EFEDE7', maxWidth: 'none' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <p className="rcp-lp-kicker">Um tópico, sete estágios</p>
          <h2 className="rcp-lp-h2">Do conceito até você explicando em 30 segundos.</h2>
          <p className="rcp-lp-lead">
            Cada tópico percorre o mesmo caminho — e o caminho termina em produção, não em leitura. Clique nos
            estágios para ver o que cada um guarda.
          </p>
          <div style={{ marginTop: 30 }}>
            <CycleExplorer />
          </div>

          <div className="rcp-lp-feature-grid">
            {[
              { i: 'ph-fill ph-cards', c: '#0891A5', t: 'Cartões e discursivas', d: 'Múltipla escolha com explicação e analogia, mais perguntas abertas com resposta-modelo.' },
              { i: 'ph-fill ph-graph', c: '#7C3AED', t: 'Analogia visual', d: 'Um diagrama que o app desenha — e um canvas pra você rabiscar por cima.' },
              { i: 'ph-fill ph-microphone-stage', c: '#FB6514', t: 'Explique em 30 segundos', d: 'O teste final: ensinar o tópico em voz alta, no tempo. Se travou, você não sabia.' },
              { i: 'ph-fill ph-speaker-high', c: '#0E9F6E', t: 'Ouvir o tópico', d: 'O ciclo inteiro narrado, pra revisar andando ou no trânsito.' },
            ].map((f) => (
              <div key={f.t} className="rcp-card" style={{ padding: 22 }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: `${f.c}1a` }}>
                  <i className={f.i} style={{ color: f.c, fontSize: 19 }} />
                </span>
                <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 16.5, margin: '14px 0 6px' }}>
                  {f.t}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#6B6862', margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Idiomas ─────────────────────────────────────────── */}
      <section className="rcp-lp-section">
        <div className="rcp-lp-split">
          <FrameSwapper />
          <div>
            <p className="rcp-lp-kicker" style={{ color: '#0BA5EC' }}>
              Idiomas
            </p>
            <h2 className="rcp-lp-h2">Ninguém fica fluente decorando palavra solta.</h2>
            <p className="rcp-lp-lead">
              Esqueça &ldquo;giraffe&rdquo; e &ldquo;umbrella&rdquo;. O plano começa pelos verbos que resolvem 80% das
              conversas e pelos moldes que você reusa infinitamente — troca uma palavra e já são cinquenta frases
              novas.
            </p>
            <p className="rcp-lp-lead" style={{ marginTop: 14 }}>
              E aí vem a parte que quase ninguém faz: <b style={{ color: '#161616' }}>narrar em voz alta</b>. Cinco
              minutos por dia descrevendo o que você está fazendo, errado mesmo, gravando. É produção em tempo real
              — o único jeito de treinar velocidade.
            </p>
          </div>
        </div>
      </section>

      {/* ── MCP ─────────────────────────────────────────────── */}
      <section className="rcp-lp-section" style={{ background: '#EFEDE7', maxWidth: 'none' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }} className="rcp-lp-split">
          <div>
            <p className="rcp-lp-kicker">Conteúdo sem digitação</p>
            <h2 className="rcp-lp-h2">Peça o tópico inteiro. Ele aparece pronto.</h2>
            <p className="rcp-lp-lead">
              Conecte seu assistente de IA ao app pelo MCP e peça em português. Ele preenche os sete estágios,
              escreve os cartões, monta a analogia e liga os tópicos que se confundem — direto na seção que você
              está estudando.
            </p>
            <p className="rcp-lp-lead" style={{ marginTop: 14 }}>
              Você continua dono de tudo: edita, apaga e escreve por cima quando quiser.
            </p>
            {!loggedIn && (
              <Link href="/signup" className="rcp-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                Criar conta <i className="ph-bold ph-arrow-right" style={{ fontSize: 14 }} />
              </Link>
            )}
          </div>
          <McpDemo />
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────── */}
      <section className="rcp-lp-final">
        <div className="rcp-lp-blob" style={{ width: 420, height: 420, background: accent, bottom: -180, left: '50%', marginLeft: -210 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto' }}>
          <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 'clamp(30px,5.2vw,52px)', lineHeight: 1.08, letterSpacing: '-.035em', margin: 0 }}>
            Comece pelo tópico que você
            <br />
            <span style={{ color: '#8CA0FF' }}>não conseguiu explicar</span> essa semana.
          </h2>
          <p style={{ fontSize: 'clamp(15px,2vw,18px)', lineHeight: 1.6, color: 'rgba(255,255,255,.62)', margin: '20px auto 0', maxWidth: '52ch' }}>
            É de graça, e em cinco minutos você tem o primeiro ciclo montado.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <Link href={loggedIn ? '/sections' : '/signup'} className="rcp-lp-btn-light">
              {loggedIn ? 'Ir para meus estudos' : 'Criar minha conta'} <i className="ph-bold ph-arrow-right" style={{ fontSize: 15 }} />
            </Link>
            {!loggedIn && (
              <Link href="/login" className="rcp-lp-btn-ghost">
                Já tenho conta
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer style={{ background: '#0E0E10', borderTop: '1px solid rgba(255,255,255,.08)', padding: '22px 26px', textAlign: 'center' }}>
        <span style={{ font: '500 13px var(--font-body)', color: 'rgba(255,255,255,.35)' }}>
          Review Cards Pro — conceito, código, prática, revisão e analogia visual.
        </span>
      </footer>
    </div>
  );
}
