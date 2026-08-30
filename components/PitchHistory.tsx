import { PIECES, type PieceKey } from '@/lib/review/pitch';
import type { PitchAttempt } from '@/lib/types';

// O histórico das explicações, agrupado POR PEÇA e não por tentativa.
//
// Agrupar por tentativa mostraria três sessões soltas, e responder "estou
// melhorando?" ficaria a cargo da memória de novo. Agrupado por peça, as suas
// versões do mesmo porquê ficam em sequência — e a peça que nunca fecha
// aparece como uma coluna de vermelho, sem ninguém precisar apontar.
//
// Componente de servidor: é leitura pura, sem nenhum estado.

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (sameDay) return 'hoje';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
}

function AttemptRow({
  attempt,
  pieceKey,
  first,
}: {
  attempt: PitchAttempt;
  pieceKey: PieceKey;
  first: boolean;
}) {
  const text = attempt.said[pieceKey].trim();
  const hit = attempt.hits[pieceKey];
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '9px 0',
        borderTop: first ? 'none' : '1px solid rgba(0,0,0,.06)',
      }}
    >
      <span style={{ flex: 'none', width: 52, font: '600 12px var(--font-body)', color: '#A29E96', paddingTop: 1 }}>
        {formatWhen(attempt.created_at)}
      </span>
      <span style={{ flex: 1, fontSize: 14, lineHeight: 1.55, color: text ? '#35322D' : '#C9C4BB' }}>
        {text || 'Não escreveu nada.'}
      </span>
      <i
        className={hit ? 'ph-bold ph-check' : 'ph-bold ph-x'}
        style={{ flex: 'none', fontSize: 13, marginTop: 3, color: hit ? '#0E9F6E' : '#EF4444' }}
      />
    </div>
  );
}

function pieceScore(attempts: PitchAttempt[], key: PieceKey) {
  const hits = attempts.filter((a) => a.hits[key]).length;
  return { hits, total: attempts.length };
}

export function PitchHistory({ attempts }: { attempts: PitchAttempt[] }) {
  if (!attempts.length) return null;

  // A peça que mais falhou. Só vira manchete quando falhou em tudo e há mais de
  // uma tentativa — com uma só não existe tendência, existe um dado.
  const worst = PIECES.map((p) => ({ piece: p, ...pieceScore(attempts, p.key) })).sort(
    (a, b) => a.hits - b.hits
  )[0];
  const headline =
    attempts.length > 1 && worst.hits === 0 ? worst.piece.label.toLowerCase() : null;

  return (
    <div className="rcp-stage-panel" style={{ marginBottom: 14 }}>
      <div style={{ height: 4, background: '#FB6514' }} />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 6 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', background: '#FFEBDF' }}>
            <i className="ph-fill ph-chart-line-up" style={{ color: '#FB6514', fontSize: 18 }} />
          </span>
          <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.01em', margin: 0, flex: 1 }}>
            Suas explicações
          </h3>
          <span style={{ font: '600 12.5px var(--font-body)', color: '#A29E96', whiteSpace: 'nowrap' }}>
            {attempts.length} {attempts.length === 1 ? 'tentativa' : 'últimas'}
          </span>
        </div>

        <p style={{ fontSize: 13.5, color: '#6B6862', lineHeight: 1.6, margin: '0 0 16px' }}>
          {headline ? (
            <>
              O <b>{headline}</b> não fechou em nenhuma das {attempts.length}. Não é falta de
              memória — é uma parte da explicação que ainda não existe. Vale reescrever o painel
              com as suas palavras.
            </>
          ) : (
            'O que você produziu em cada tentativa, peça por peça — da mais recente para a mais antiga.'
          )}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PIECES.map((p) => {
            const { hits, total } = pieceScore(attempts, p.key);
            const allGood = hits === total;
            return (
              <div key={p.key} style={{ border: '1px solid rgba(0,0,0,.09)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', background: p.tint }}>
                  <i className={p.icon} style={{ color: p.color, fontSize: 15 }} />
                  <span style={{ font: '600 13.5px var(--font-body)', color: p.color, flex: 1 }}>{p.label}</span>
                  {/* Um ponto por tentativa, na mesma ordem da lista abaixo.
                      É o resumo que se lê sem parar pra contar. */}
                  <span style={{ display: 'inline-flex', gap: 4 }}>
                    {attempts.map((a) => (
                      <span
                        key={a.id}
                        title={`${formatWhen(a.created_at)}: ${a.hits[p.key] ? 'disse' : 'faltou'}`}
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: 999,
                          background: a.hits[p.key] ? '#0E9F6E' : '#EF4444',
                        }}
                      />
                    ))}
                  </span>
                  <span style={{ font: '600 12px var(--font-body)', color: allGood ? '#0E9F6E' : '#B54708', whiteSpace: 'nowrap' }}>
                    {hits}/{total}
                  </span>
                </div>

                <div style={{ padding: '4px 13px 10px' }}>
                  {attempts.map((a, i) => (
                    <AttemptRow key={a.id} attempt={a} pieceKey={p.key} first={i === 0} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
