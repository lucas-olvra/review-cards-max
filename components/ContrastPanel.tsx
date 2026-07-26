'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { RichText } from '@/lib/render';
import { McpHint } from '@/components/McpHint';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import {
  addScenario,
  deleteContrast,
  removeScenario,
  saveContrast,
} from '@/lib/actions/contrasts';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass, textareaClass } from '@/lib/ui';
import type { ContrastFromHere } from '@/lib/types';

const CONTRAST_COLOR = '#7C3AED';
const CONTRAST_TINT = '#F1E9FE';

type Candidates = { sectionName: string; topics: { id: string; name: string }[] }[];

function ContrastForm({
  topicId,
  candidates,
  existing,
  onDone,
}: {
  topicId: string;
  candidates: Candidates;
  existing?: ContrastFromHere;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="rcp-card"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      action={(formData) => {
        startTransition(async () => {
          await saveContrast(topicId, {
            otherTopicId: (formData.get('otherTopicId') as string) ?? '',
            confusion: (formData.get('confusion') as string) ?? '',
            decisive_question: (formData.get('decisive_question') as string) ?? '',
            chooseThisWhen: (formData.get('chooseThisWhen') as string) ?? '',
            chooseOtherWhen: (formData.get('chooseOtherWhen') as string) ?? '',
          });
          onDone();
        });
      }}
    >
      <div>
        <label className={labelClass}>Se confunde com</label>
        {existing ? (
          <input type="hidden" name="otherTopicId" value={existing.otherTopicId} />
        ) : null}
        <select
          name={existing ? '_ignored' : 'otherTopicId'}
          defaultValue={existing?.otherTopicId ?? ''}
          disabled={!!existing}
          required={!existing}
          className={inputClass}
        >
          <option value="" disabled>
            Escolha o outro tópico…
          </option>
          {candidates.map((group) => (
            <optgroup key={group.sectionName} label={group.sectionName}>
              {group.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Por que se confundem</label>
        <textarea
          name="confusion"
          defaultValue={existing?.confusion}
          placeholder="ex: os dois impedem que algo mude, então caíram na mesma gaveta mental"
          className={textareaClass}
        />
      </div>

      <div>
        <label className={labelClass}>A pergunta que decide</label>
        <textarea
          name="decisive_question"
          defaultValue={existing?.decisive_question}
          placeholder="ex: esse valor tem irmãos? consigo listar todos e seria bug receber um fora da lista?"
          className={textareaClass}
        />
        <p style={{ fontSize: 12.5, color: '#86827A', margin: '6px 0 0', lineHeight: 1.5 }}>
          Não é a definição de cada um — é o teste que você aplica na hora de escolher.
        </p>
      </div>

      <div className="rcp-two-col" style={{ gap: 10 }}>
        <div>
          <label className={labelClass}>Escolha este quando</label>
          <textarea name="chooseThisWhen" defaultValue={existing?.chooseThisWhen} className={textareaClass} />
        </div>
        <div>
          <label className={labelClass}>Escolha o outro quando</label>
          <textarea name="chooseOtherWhen" defaultValue={existing?.chooseOtherWhen} className={textareaClass} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" onClick={onDone} className={buttonSecondaryClass}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ScenarioForm({
  contrast,
  topicId,
  onDone,
}: {
  contrast: ContrastFromHere;
  topicId: string;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}
      action={(formData) => {
        startTransition(async () => {
          await addScenario(contrast.id, topicId, {
            situation: (formData.get('situation') as string) ?? '',
            answerTopicId: (formData.get('answerTopicId') as string) ?? '',
            why: (formData.get('why') as string) ?? '',
          });
          onDone();
        });
      }}
    >
      <div>
        <label className={labelClass}>A situação</label>
        <textarea
          name="situation"
          required
          placeholder="ex: você tem 4 formas de pagamento e um switch que precisa cobrir todas"
          className={textareaClass}
        />
      </div>
      <div>
        <label className={labelClass}>Resposta certa</label>
        <select name="answerTopicId" defaultValue={contrast.thisTopicId} className={inputClass}>
          <option value={contrast.thisTopicId}>{contrast.thisTopicName}</option>
          <option value={contrast.otherTopicId}>{contrast.otherTopicName}</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Por quê</label>
        <textarea name="why" placeholder="o que nessa situação decidiu a escolha" className={textareaClass} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
          {isPending ? 'Salvando...' : 'Adicionar cenário'}
        </button>
        <button type="button" onClick={onDone} className={buttonSecondaryClass}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ContrastCard({
  contrast,
  topicId,
  candidates,
}: {
  contrast: ContrastFromHere;
  topicId: string;
  candidates: Candidates;
}) {
  const [editing, setEditing] = useState(false);
  const [addingScenario, setAddingScenario] = useState(false);

  if (editing) {
    return (
      <ContrastForm
        topicId={topicId}
        candidates={candidates}
        existing={contrast}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <motion.div layout className="rcp-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <i className="ph-bold ph-arrows-left-right" style={{ color: CONTRAST_COLOR, fontSize: 16 }} />
          <span className="rcp-font-display" style={{ fontWeight: 600, fontSize: 17 }}>
            {contrast.thisTopicName} <span style={{ color: '#A29E96' }}>×</span>{' '}
            <Link href={`/topics/${contrast.otherTopicId}`} style={{ color: CONTRAST_COLOR }}>
              {contrast.otherTopicName}
            </Link>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => setEditing(true)} className="rcp-icon-btn">
            <i className="ph ph-pencil-simple" style={{ fontSize: 16 }} />
          </button>
          <ConfirmSubmitButton
            action={deleteContrast.bind(null, contrast.id, topicId)}
            confirmMessage={`Excluir o contraste com "${contrast.otherTopicName}"? Os cenários de treino vão junto.`}
            className="rcp-icon-btn"
          >
            <i className="ph ph-trash" style={{ fontSize: 16 }} />
          </ConfirmSubmitButton>
        </div>
      </div>

      {contrast.confusion && (
        <p style={{ fontSize: 14.5, color: '#6B6862', lineHeight: 1.6, margin: '12px 0 0' }}>
          <RichText text={contrast.confusion} />
        </p>
      )}

      {contrast.decisive_question && (
        <div
          style={{
            margin: '14px 0 0',
            borderRadius: 13,
            padding: '13px 15px',
            background: CONTRAST_TINT,
            display: 'flex',
            gap: 10,
          }}
        >
          <i className="ph-fill ph-key" style={{ color: CONTRAST_COLOR, fontSize: 17, flex: 'none', marginTop: 2 }} />
          <div>
            <span style={{ display: 'block', font: '600 12px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: CONTRAST_COLOR, marginBottom: 4 }}>
              A pergunta que decide
            </span>
            <div style={{ fontSize: 15, lineHeight: 1.55, color: '#35322D' }}>
              <RichText text={contrast.decisive_question} />
            </div>
          </div>
        </div>
      )}

      {(contrast.chooseThisWhen || contrast.chooseOtherWhen) && (
        <div className="rcp-two-col" style={{ gap: 10, marginTop: 12 }}>
          {[
            { name: contrast.thisTopicName, text: contrast.chooseThisWhen },
            { name: contrast.otherTopicName, text: contrast.chooseOtherWhen },
          ].map((side) => (
            <div key={side.name} style={{ border: '1px solid rgba(0,0,0,.08)', borderRadius: 13, padding: '12px 14px' }}>
              <span style={{ display: 'block', font: '600 13px var(--font-body)', color: '#161616', marginBottom: 5 }}>
                {side.name}
              </span>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: '#6B6862' }}>
                <RichText text={side.text} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed rgba(0,0,0,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ font: '600 13.5px var(--font-body)', color: '#161616' }}>
            <i className="ph-fill ph-target" style={{ color: CONTRAST_COLOR, marginRight: 6 }} />
            Cenários de treino
            <span style={{ color: '#A29E96', fontWeight: 500 }}> · {contrast.scenarios.length}</span>
          </span>
          {!addingScenario && (
            <button type="button" onClick={() => setAddingScenario(true)} className="rcp-pill-btn">
              <i className="ph-bold ph-plus" style={{ fontSize: 12 }} /> Cenário
            </button>
          )}
        </div>

        {contrast.scenarios.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {contrast.scenarios.map((s, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#F7F6F2', borderRadius: 11, padding: '11px 13px' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.5, color: '#35322D' }}>
                    <RichText text={s.situation} />
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      font: '600 12px var(--font-body)',
                      color: CONTRAST_COLOR,
                      background: CONTRAST_TINT,
                      borderRadius: 999,
                      padding: '3px 9px',
                    }}
                  >
                    → {s.answerName}
                  </span>
                </div>
                <ConfirmSubmitButton
                  action={removeScenario.bind(null, contrast.id, topicId, i)}
                  confirmMessage="Excluir este cenário?"
                  className="rcp-icon-btn"
                >
                  <i className="ph ph-x" style={{ fontSize: 14 }} />
                </ConfirmSubmitButton>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {addingScenario && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <ScenarioForm contrast={contrast} topicId={topicId} onDone={() => setAddingScenario(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function ContrastPanel({
  topicId,
  topicName,
  sectionId,
  contrasts,
  candidates,
}: {
  topicId: string;
  topicName: string;
  sectionId: string;
  contrasts: ContrastFromHere[];
  candidates: Candidates;
}) {
  const [creating, setCreating] = useState(false);
  const drillN = contrasts.reduce((n, c) => n + c.scenarios.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center', background: CONTRAST_TINT }}>
            <i className="ph-fill ph-arrows-left-right" style={{ color: CONTRAST_COLOR, fontSize: 16 }} />
          </span>
          <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 17, margin: 0 }}>
            Confundo com <span style={{ color: '#A29E96', fontWeight: 500 }}>· {contrasts.length}</span>
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <McpHint
            example={`Crie o contraste entre "${topicName}" e o tópico que eu costumo confundir com ele, com 5 cenários de treino.`}
          />
          {!creating && (
            <button type="button" onClick={() => setCreating(true)} className={buttonSecondaryClass}>
              <i className="ph-bold ph-plus" style={{ fontSize: 12 }} /> Contraste
            </button>
          )}
          {drillN > 0 && (
            <Link
              href={`/sections/${sectionId}/discriminate`}
              className="rcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: CONTRAST_COLOR, boxShadow: `0 6px 16px -7px ${CONTRAST_COLOR}b3` }}
            >
              <i className="ph-fill ph-play" style={{ fontSize: 12 }} /> Treinar
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
            <ContrastForm topicId={topicId} candidates={candidates} onDone={() => setCreating(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {contrasts.length === 0 && !creating ? (
        <div className="rcp-card" style={{ padding: '22px 20px' }}>
          {/* Sem interpolar o nome do tópico no meio da frase: nomes longos
              ("Modificador `final` em Variáveis de Referência") quebram a
              leitura em qualquer construção do tipo "você sabe o que X é". */}
          <p style={{ fontSize: 14.5, color: '#6B6862', lineHeight: 1.6, margin: 0 }}>
            Você já sabe o que este tópico é. O que trava na hora de escrever código é outra pergunta:{' '}
            <b>por que este e não aquele?</b> Ligue-o ao tópico que você troca com ele e guarde a pergunta que decide.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contrasts.map((c) => (
            <ContrastCard key={c.id} contrast={c} topicId={topicId} candidates={candidates} />
          ))}
        </div>
      )}
    </div>
  );
}
