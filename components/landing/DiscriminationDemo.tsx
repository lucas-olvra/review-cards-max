'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const DRILL = '#7C3AED';

// O treino de discriminação de verdade, jogável na home. É a demo mais
// importante da página: ler "treina escolha sob pressão" não convence
// ninguém — errar uma pergunta que você achava que sabia, convence.
//
// Os três casos são de áreas propositalmente distantes (banco, versionamento,
// layout) pra deixar claro que o app não é de uma linguagem só. Cada par tem
// a própria pergunta decisiva, porque é ela — e não a definição — que é o
// ativo que o app guarda.
const QUESTIONS = [
  {
    situation: 'Seu relatório precisa descartar os pedidos cancelados antes de somar o total por cliente.',
    options: ['WHERE', 'HAVING'],
    correct: 0,
    why: 'O corte acontece linha a linha, antes de os grupos existirem. HAVING só consegue agir depois do agrupamento.',
    decisive: 'O filtro precisa acontecer antes ou depois do agrupamento?',
  },
  {
    situation: 'Sua branch já foi enviada e outras duas pessoas puxaram ela pra trabalhar em cima.',
    options: ['merge', 'rebase'],
    correct: 0,
    why: 'Rebase reescreve o histórico. Com a branch já compartilhada, você quebra os commits que os outros já baixaram.',
    decisive: 'Alguém além de você já depende desses commits?',
  },
  {
    situation: 'Você precisa alinhar três botões numa linha, com espaçamento igual entre eles.',
    options: ['flex', 'grid'],
    correct: 0,
    why: 'Uma direção só, e o conteúdo mandando no tamanho. Grid começa a valer quando você define linhas e colunas ao mesmo tempo.',
    decisive: 'Você está posicionando em uma direção ou nas duas ao mesmo tempo?',
  },
];

export function DiscriminationDemo() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hits, setHits] = useState(0);

  const done = idx >= QUESTIONS.length;
  const q = done ? QUESTIONS[0] : QUESTIONS[idx];
  const answered = selected !== null;
  const ok = selected === q.correct;

  function next() {
    if (ok) setHits((h) => h + 1);
    setSelected(null);
    setIdx((i) => i + 1);
  }

  function restart() {
    setIdx(0);
    setSelected(null);
    setHits(0);
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rcp-card" style={{ padding: 30, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px', display: 'grid', placeItems: 'center', background: '#F1E9FE' }}>
          <i className="ph-fill ph-target" style={{ color: DRILL, fontSize: 32 }} />
        </div>
        <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 40, color: DRILL, letterSpacing: '-.03em' }}>
          {hits}
          <span style={{ color: '#C9C4BB', fontSize: 26 }}>/{QUESTIONS.length}</span>
        </div>
        <p style={{ fontSize: 15.5, color: '#35322D', lineHeight: 1.6, margin: '14px auto 0', maxWidth: '42ch' }}>
          {hits === QUESTIONS.length
            ? 'Todas certas — e repare que você teve que aplicar a pergunta em cada uma, não lembrar a definição.'
            : 'É esse o ponto. Você sabe o que cada um é; o que falha é escolher. Nenhum cartão de definição treina isso.'}
        </p>
        <button type="button" onClick={restart} className="rcp-btn-secondary" style={{ marginTop: 20 }}>
          <i className="ph ph-arrow-clockwise" /> Jogar de novo
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rcp-card" style={{ padding: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ font: '600 11.5px var(--font-body)', letterSpacing: '.06em', textTransform: 'uppercase', color: DRILL }}>
          Qual você usaria aqui?
        </span>
        <span style={{ font: '600 12.5px var(--font-body)', color: '#A29E96' }}>
          {idx + 1} / {QUESTIONS.length}
        </span>
      </div>

      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rcp-font-display"
        style={{ fontWeight: 600, fontSize: 19, lineHeight: 1.4, letterSpacing: '-.01em', margin: '0 0 18px' }}
      >
        {q.situation}
      </motion.p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {q.options.map((option, i) => {
          let border = 'rgba(0,0,0,.12)';
          let bg = '#fff';
          let color = '#161616';
          if (answered) {
            if (i === q.correct) {
              border = '#0E9F6E';
              bg = '#E7F9F0';
              color = '#066B46';
            } else if (i === selected) {
              border = '#EF4444';
              bg = '#FDECEA';
              color = '#A81E12';
            } else {
              color = '#9A968E';
            }
          }
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => setSelected(i)}
              className="rcp-font-code"
              style={{
                cursor: answered ? 'default' : 'pointer',
                border: `1.5px solid ${border}`,
                background: bg,
                color,
                borderRadius: 14,
                padding: '15px 12px',
                fontSize: 15,
                fontWeight: 500,
                transition: 'all .15s ease',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ marginTop: 16, borderRadius: 13, padding: 15, background: ok ? '#E7F9F0' : '#FDECEA' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 7, font: '700 14.5px var(--font-display)', color: ok ? '#0E9F6E' : '#EF4444', margin: 0 }}>
                <i className={ok ? 'ph-fill ph-check-circle' : 'ph-fill ph-x-circle'} style={{ fontSize: 17 }} />
                {ok ? `Isso — ${q.options[q.correct]}` : `Era ${q.options[q.correct]}`}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: '#35322D', margin: '7px 0 0' }}>{q.why}</p>
            </div>

            <div style={{ marginTop: 10, borderRadius: 13, padding: '12px 14px', background: '#F1E9FE', display: 'flex', gap: 9 }}>
              <i className="ph-fill ph-key" style={{ color: DRILL, fontSize: 16, flex: 'none', marginTop: 2 }} />
              <div>
                <span style={{ display: 'block', font: '600 11px var(--font-body)', letterSpacing: '.05em', textTransform: 'uppercase', color: DRILL, marginBottom: 3 }}>
                  A pergunta que decide
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: '#35322D' }}>{q.decisive}</span>
              </div>
            </div>

            <button type="button" onClick={next} className="rcp-btn-dark" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>
              {idx + 1 >= QUESTIONS.length ? 'Ver resultado' : 'Próxima'} <i className="ph-bold ph-arrow-right" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
