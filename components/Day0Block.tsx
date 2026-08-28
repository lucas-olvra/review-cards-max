'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { accent, cardClass } from '@/lib/ui';

// O bloco do primeiro dia de um tópico.
//
// A página do tópico tem dez painéis com o mesmo peso visual — o que é, por
// quê, código, onde usar, onde não usar, erros, prática, contraste, cartões,
// discursivas. No dia em que o tópico é criado isso cansa, e o cansaço não vem
// do volume de informação: vem de não haver alvo. Nada ali diz o que precisa
// ficar de pé antes de você fechar a aba.
//
// Estes três dizem. Explicar, decidir e implementar são o que prova que você
// sabe; o resto é material que você abre quando um dos três falha. É ranquear,
// não resumir — juntar tudo num texto só produziria a forma mais decorável e
// menos implementável do mesmo conteúdo.
//
// Hoje é com o material aberto, de propósito: dia 0 é codificação, não
// recuperação. Por isso nada aqui alimenta a escada — o tópico entra na fila
// amanhã do mesmo jeito, tenha você marcado três, um ou nenhum.

type Key = 'explicar' | 'decidir' | 'implementar';

const ORDER: Key[] = ['explicar', 'decidir', 'implementar'];

interface Challenge {
  key: Key;
  n: number;
  icon: string;
  color: string;
  tint: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

function storageKey(topicId: string) {
  return `rcp-day0-${topicId}`;
}

// Marcação local de propósito: ela vale por um dia, é autodeclarada e não tem
// consequência nenhuma. Guardar isso no banco criaria um segundo registro de
// progresso concorrendo com `topic_reviews`, que é o que conta de verdade.
//
// O `localStorage` entra como store externo (useSyncExternalStore) em vez de
// estado semeado por efeito: o servidor renderiza a partir do snapshot vazio,
// então não há divergência de hidratação, e a leitura não custa um segundo
// render em cascata.
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Outra aba do mesmo tópico marcando um desafio também atualiza esta.
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

// Devolve a string crua porque `getSnapshot` precisa ser estável entre
// chamadas — devolver um array novo a cada leitura faria o React re-renderizar
// sem parar.
function readRaw(topicId: string): string {
  try {
    return localStorage.getItem(storageKey(topicId)) ?? '';
  } catch {
    // Navegador sem storage (janela privada, site data bloqueado).
    return '';
  }
}

function parseDone(raw: string): Key[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? ORDER.filter((k) => parsed.includes(k)) : [];
  } catch {
    return [];
  }
}

export function Day0Block({
  topicId,
  hasPitch,
  hasDecisiveQuestion,
  hasExercise,
}: {
  topicId: string;
  hasPitch: boolean;
  hasDecisiveQuestion: boolean;
  hasExercise: boolean;
}) {
  const raw = useSyncExternalStore(
    subscribe,
    useCallback(() => readRaw(topicId), [topicId]),
    () => ''
  );
  const done = useMemo(() => parseDone(raw), [raw]);

  const toggle = (key: Key) => {
    const next = done.includes(key) ? done.filter((k) => k !== key) : [...done, key];
    try {
      localStorage.setItem(storageKey(topicId), JSON.stringify(next));
    } catch {
      // Sem storage o bloco continua clicável, só não lembra ao recarregar.
    }
    emitChange();
  };

  const back = encodeURIComponent(`/topics/${topicId}`);

  const challenges: Challenge[] = [
    {
      key: 'explicar',
      n: 1,
      icon: 'ph-fill ph-microphone-stage',
      color: '#FB6514',
      tint: '#FFEBDF',
      title: 'Explicar',
      body: hasPitch
        ? 'Diga o que é e por que existe, em voz alta, como se ensinasse alguém.'
        : 'Escreva o resumo de 30 segundos — é o que você vai tentar reproduzir amanhã.',
      href: hasPitch ? `/topics/${topicId}/pitch?day0=1&from=${back}` : `/topics/${topicId}#pitch`,
      cta: hasPitch ? 'Explicar agora' : 'Escrever o resumo',
    },
    {
      key: 'decidir',
      n: 2,
      icon: 'ph-fill ph-key',
      color: accent,
      tint: '#E9ECFF',
      title: 'Decidir',
      body: hasDecisiveQuestion
        ? 'Leia a pergunta que decide e responda sem olhar o nome do tópico.'
        : 'Escreva a pergunta que decide se este tópico é o caso — ou deixe vazia, se ele não é uma escolha.',
      href: `/topics/${topicId}#decisao`,
      cta: hasDecisiveQuestion ? 'Ver a pergunta' : 'Escrever a pergunta',
    },
    {
      key: 'implementar',
      n: 3,
      icon: 'ph-fill ph-barbell',
      color: '#E5387E',
      tint: '#FCE7F1',
      title: 'Implementar',
      body: hasExercise
        ? 'Resolva o exercício escrevendo de verdade — só depois compare com o gabarito.'
        : 'Escreva o exercício de prática: o que você teria que codar pra provar que sabe isto.',
      href: hasExercise ? `/topics/${topicId}/practice?day0=1&from=${back}` : `/topics/${topicId}#pratica`,
      cta: hasExercise ? 'Resolver agora' : 'Escrever o exercício',
    },
  ];

  const complete = done.length === ORDER.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cardClass}
      style={{ marginTop: 16, padding: '20px 22px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <span
          style={{
            font: '600 11.5px var(--font-body)',
            letterSpacing: '.05em',
            textTransform: 'uppercase',
            color: accent,
            background: '#E9ECFF',
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          Dia 0
        </span>
        <span style={{ font: '600 12.5px var(--font-body)', color: complete ? '#0E9F6E' : '#A29E96' }}>
          {done.length} de {ORDER.length}
        </span>
      </div>

      <h2
        className="rcp-font-display"
        style={{ fontWeight: 700, fontSize: 21, letterSpacing: '-.02em', margin: '0 0 6px' }}
      >
        {complete ? 'Pronto por hoje' : 'Três coisas provam que você sabe isto'}
      </h2>
      <p style={{ fontSize: 14, color: '#6B6862', lineHeight: 1.6, margin: '0 0 18px', maxWidth: '58ch' }}>
        {complete
          ? 'Amanhã o tópico volta na fila cobrando o primeiro degrau — aí sem o material na tela.'
          : 'Hoje é com o material aberto: isto não é teste, é o primeiro contato. Nada aqui mexe no agendamento.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {challenges.map((c) => {
          const checked = done.includes(c.key);
          return (
            <div
              key={c.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 13,
                padding: '13px 15px',
                borderRadius: 14,
                background: checked ? '#F7F6F3' : '#fff',
                border: `1.5px solid ${checked ? 'transparent' : 'rgba(0,0,0,.09)'}`,
              }}
            >
              <button
                type="button"
                onClick={() => toggle(c.key)}
                aria-pressed={checked}
                aria-label={`Marcar "${c.title}" como feito`}
                style={{
                  width: 34,
                  height: 34,
                  flex: 'none',
                  borderRadius: 11,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  border: 'none',
                  background: checked ? '#0E9F6E' : c.tint,
                  color: checked ? '#fff' : c.color,
                }}
              >
                <i className={checked ? 'ph-bold ph-check' : c.icon} style={{ fontSize: 16 }} />
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  className="rcp-font-display"
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: 15.5,
                    color: checked ? '#A29E96' : '#161616',
                    textDecoration: checked ? 'line-through' : 'none',
                  }}
                >
                  {c.n}. {c.title}
                </span>
                <span style={{ display: 'block', fontSize: 13.5, color: '#6B6862', lineHeight: 1.5, marginTop: 2 }}>
                  {c.body}
                </span>
              </div>

              <Link
                href={c.href}
                className="rcp-btn-secondary"
                style={{ flex: 'none', alignSelf: 'center', whiteSpace: 'nowrap' }}
              >
                {c.cta}
              </Link>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12.5, color: '#A29E96', lineHeight: 1.55, margin: '14px 2px 0' }}>
        <i className="ph ph-books" /> O resto da página é material de consulta — abra quando travar
        num dos três, não antes.
      </p>
    </motion.div>
  );
}
