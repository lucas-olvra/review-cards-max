import Link from 'next/link';
import { getTodayQueue } from '@/lib/actions/reviews';
import { DAILY_CAP } from '@/lib/review/ladder';
import { accent, buttonPrimaryClass, cardClass } from '@/lib/ui';

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(new Date(iso));
}

function overdueLabel(days: number): string {
  if (days <= 0) return 'vence hoje';
  if (days === 1) return 'atrasado 1 dia';
  return `atrasado ${days} dias`;
}

// A tela que responde "o que eu reviso hoje". Tudo aqui existe para que ninguém
// precise escolher nada: a fila já vem ordenada pelo mais atrasado, cada item já
// vem na modalidade do degrau em que o tópico está, e o teto diário já cortou o
// excesso. Começar é a única decisão que sobra.
export default async function TodayPage() {
  const { items, waiting, nextDueAt, totalTopics } = await getTodayQueue();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '38px 26px 90px' }}>
      <p
        style={{
          font: '600 13px var(--font-body)',
          letterSpacing: '.05em',
          textTransform: 'uppercase',
          color: accent,
          margin: '0 0 12px',
        }}
      >
        Sua fila
      </p>
      <h1
        className="rcp-font-display"
        style={{ fontWeight: 700, fontSize: 40, lineHeight: 1.06, letterSpacing: '-.035em', margin: '0 0 12px' }}
      >
        O que revisar <span style={{ color: accent }}>hoje</span>
      </h1>

      {items.length > 0 ? (
        <>
          <p style={{ fontSize: 15.5, color: '#6B6862', margin: '0 0 28px', lineHeight: 1.6, maxWidth: '52ch' }}>
            {items.length} {items.length === 1 ? 'tópico' : 'tópicos'} na ordem certa, cada um na
            modalidade do degrau em que está. Não precisa escolher — comece pelo primeiro.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item, i) => (
              <Link
                key={item.topicId}
                href={item.href}
                className={cardClass}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 15,
                  padding: '17px 19px',
                  textDecoration: 'none',
                }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    flex: 'none',
                    borderRadius: 13,
                    display: 'grid',
                    placeItems: 'center',
                    background: item.rung.tint,
                  }}
                >
                  <i className={item.rung.icon} style={{ color: item.rung.color, fontSize: 21 }} />
                </span>

                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span
                      className="rcp-font-display"
                      style={{ fontWeight: 600, fontSize: 17, color: '#161616', letterSpacing: '-.01em' }}
                    >
                      {item.topicName}
                    </span>
                    <span
                      style={{
                        font: '600 11.5px var(--font-body)',
                        color: item.overdue > 0 ? '#B54708' : '#86827A',
                        background: item.overdue > 0 ? '#FDF0DC' : '#F2F0EB',
                        padding: '3px 9px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {overdueLabel(item.overdue)}
                    </span>
                  </span>
                  <span style={{ display: 'block', fontSize: 13.5, color: '#6B6862', lineHeight: 1.5 }}>
                    <b style={{ color: item.rung.color, fontWeight: 600 }}>{item.rung.title}</b>
                    {' · '}
                    {item.rung.hint}
                  </span>
                  {item.sectionName && (
                    <span style={{ display: 'block', fontSize: 12.5, color: '#A29E96', marginTop: 3 }}>
                      {item.sectionName} · degrau {item.rungIndex + 1} de 5
                    </span>
                  )}
                </span>

                <span
                  style={{
                    flex: 'none',
                    display: 'grid',
                    placeItems: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: i === 0 ? item.rung.color : 'transparent',
                  }}
                >
                  <i
                    className="ph-bold ph-arrow-right"
                    style={{ color: i === 0 ? '#fff' : '#A29E96', fontSize: 15 }}
                  />
                </span>
              </Link>
            ))}
          </div>

          {waiting > 0 && (
            <p
              style={{
                fontSize: 13.5,
                color: '#86827A',
                lineHeight: 1.6,
                margin: '16px 2px 0',
              }}
            >
              <i className="ph ph-clock-countdown" /> Mais {waiting}{' '}
              {waiting === 1 ? 'tópico vencido espera' : 'tópicos vencidos esperam'} a vez. O teto de{' '}
              {DAILY_CAP} por dia é o que mantém a fila possível — dívida de revisão sempre ganha de
              conteúdo novo.
            </p>
          )}

          <div
            className={cardClass}
            style={{ marginTop: 26, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
          >
            <span style={{ flex: 1, minWidth: 200 }}>
              <span className="rcp-font-display" style={{ display: 'block', fontWeight: 600, fontSize: 15.5, color: '#161616', marginBottom: 3 }}>
                Terminou a fila?
              </span>
              <span style={{ display: 'block', fontSize: 13.5, color: '#6B6862', lineHeight: 1.55 }}>
                {waiting > 0
                  ? 'Enquanto houver vencidos esperando, revisar vale mais que criar tópico novo.'
                  : 'Aí sim: um tópico novo por dia, e ele entra na fila amanhã.'}
              </span>
            </span>
            <Link href="/sections" className="rcp-btn-secondary" style={{ flex: 'none' }}>
              <i className="ph-bold ph-plus" style={{ fontSize: 13 }} /> Novo tópico
            </Link>
          </div>
        </>
      ) : (
        <div className={cardClass} style={{ marginTop: 20, padding: '40px 30px', textAlign: 'center' }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              margin: '0 auto 18px',
              display: 'grid',
              placeItems: 'center',
              background: '#E1FAEF',
            }}
          >
            <i className="ph-fill ph-check-circle" style={{ color: '#0E9F6E', fontSize: 36 }} />
          </div>
          <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 8px' }}>
            {totalTopics === 0 ? 'Nada para revisar ainda' : 'Fila do dia limpa'}
          </h2>
          <p style={{ fontSize: 15, color: '#6B6862', lineHeight: 1.6, margin: '0 auto 22px', maxWidth: '44ch' }}>
            {totalTopics === 0
              ? 'Crie o primeiro tópico. Ele entra na fila amanhã — revisar no mesmo dia em que você escreveu não testa memória nenhuma.'
              : nextDueAt
                ? `O próximo tópico vence em ${formatDay(nextDueAt)}. Hoje é dia de criar conteúdo novo, não de revisar.`
                : 'Nada vencido hoje.'}
          </p>
          <Link href="/sections" className={buttonPrimaryClass}>
            {totalTopics === 0 ? 'Criar meu primeiro tópico' : 'Ir para as seções'}
          </Link>
        </div>
      )}
    </div>
  );
}
