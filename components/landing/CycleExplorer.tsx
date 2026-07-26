'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { STAGE_DEFS } from '@/lib/stages';

// Mostra o ciclo clicando, não descrevendo: cada estágio traz um trecho real
// de um tópico já preenchido. As chaves espelham STAGE_DEFS pra ordem e cor
// virem da mesma fonte que a página do tópico usa.
//
// O exemplo é índice de banco de propósito: é um assunto que quase todo mundo
// que programa reconhece, independente de linguagem ou stack — a página não
// deve dar a impressão de que o app é de uma tecnologia só.
const TOPIC_NAME = 'Índice em banco de dados';

const SAMPLE: Record<string, { text: string; code?: boolean }> = {
  concept_what: {
    text: 'Uma estrutura paralela à tabela que guarda os valores de uma coluna já ordenados, com um ponteiro para a linha. O banco consulta ela em vez de varrer a tabela inteira.',
  },
  concept_why: {
    text: 'Existe porque varrer milhões de linhas para achar dez é desperdício. O índice troca espaço em disco e custo de escrita por velocidade de leitura.',
  },
  code: {
    text: 'CREATE INDEX idx_pedidos_cliente\n  ON pedidos (cliente_id);\n\n-- agora esta busca não varre a tabela inteira\nSELECT * FROM pedidos WHERE cliente_id = 42;',
    code: true,
  },
  use_cases: {
    text: '• Colunas usadas em WHERE, JOIN e ORDER BY\n• Chaves estrangeiras muito consultadas\n• Tabelas grandes com muito mais leitura do que escrita',
  },
  anti_patterns: {
    text: 'Tabela que recebe escrita o tempo todo: cada INSERT precisa atualizar todo índice existente. Em coluna com pouquíssimos valores distintos (um campo "ativo" só com sim/não), o banco costuma ignorar o índice e varrer mesmo assim.',
  },
  common_mistakes: {
    text: 'Criar índice em toda coluna "por garantia" e deixar a escrita lenta. Ou criar um índice composto e esperar que ele sirva para qualquer ordem de colunas — a ordem definida importa.',
  },
  exercise_prompt: {
    text: 'Rode um EXPLAIN numa busca por coluna sem índice e anote o plano. Crie o índice, rode de novo e compare o que mudou.',
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
          <span style={{ marginLeft: 'auto', font: '500 12.5px var(--font-body)', color: '#A29E96', textAlign: 'right' }}>
            {TOPIC_NAME}
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
