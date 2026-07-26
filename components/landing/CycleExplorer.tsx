'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { STAGE_DEFS } from '@/lib/stages';

// Mostra o ciclo clicando, não descrevendo: cada estágio traz um trecho real
// de um tópico já preenchido. As chaves espelham STAGE_DEFS pra ordem e cor
// virem da mesma fonte que a página do tópico usa.
const SAMPLE: Record<string, { text: string; code?: boolean }> = {
  concept_what: {
    text: 'Uma variável `final` de referência trava o endereço guardado nela: ela sempre vai apontar para o mesmo objeto.',
  },
  concept_why: {
    text: 'Existe para garantir que uma variável nunca "troque de objeto" depois de criada — útil para dependências que não podem ser substituídas no meio da execução.',
  },
  code: {
    text: 'final List<String> lista = new ArrayList<>();\nlista.add("ok");      // permitido\nlista = new ArrayList<>(); // erro de compilação',
    code: true,
  },
  use_cases: {
    text: '• Constantes que guardam objetos\n• Variáveis capturadas por lambdas\n• Dependências injetadas no construtor',
  },
  anti_patterns: {
    text: '`final` não torna o objeto imutável. Se você precisa de imutabilidade real, o objeto inteiro precisa ser imutável — não basta travar a referência.',
  },
  common_mistakes: {
    text: 'Achar que `final List<String> lista` impede `lista.add()`. Não impede: a referência é fixa, o conteúdo não.',
  },
  exercise_prompt: {
    text: 'Crie uma ContaBancaria com `final String titular` e `double saldo`. Tente reatribuir o titular e veja o erro.',
  },
};

export function CycleExplorer() {
  const [active, setActive] = useState(STAGE_DEFS[0].key);
  const stage = STAGE_DEFS.find((s) => s.key === active)!;
  const sample = SAMPLE[active];

  return (
    <div>
      <div className="rcp-lp-stages rcp-scroll">
        {STAGE_DEFS.map((s) => {
          const on = s.key === active;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              className="rcp-lp-stage-btn"
              style={
                on
                  ? { background: s.color, color: '#fff', borderColor: s.color }
                  : { background: '#fff', color: '#55524B' }
              }
            >
              <i className={s.icon} style={{ fontSize: 14, color: on ? '#fff' : s.color }} />
              {s.short}
            </button>
          );
        })}
      </div>

      <div className="rcp-card" style={{ marginTop: 14, padding: 24, minHeight: 210 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', background: stage.tint }}>
            <i className={stage.icon} style={{ color: stage.color, fontSize: 16 }} />
          </span>
          <span className="rcp-font-display" style={{ fontWeight: 600, fontSize: 18 }}>
            {stage.title}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.pre
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className={sample.code ? 'rcp-font-code' : undefined}
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: sample.code ? 'var(--font-code)' : 'var(--font-body)',
              fontSize: sample.code ? 13.5 : 15.5,
              lineHeight: 1.65,
              color: '#35322D',
              background: sample.code ? '#F7F6F2' : 'none',
              borderRadius: sample.code ? 12 : 0,
              padding: sample.code ? '14px 16px' : 0,
            }}
          >
            {sample.text}
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}
