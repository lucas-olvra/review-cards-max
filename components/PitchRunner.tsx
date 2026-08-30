'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { RichText } from '@/lib/render';
import { GradeButtons, ReviewOutcomeBanner, useReviewRecorder } from '@/components/ReviewOutcome';
import { HintContent, ReviewHint, hasHint, type HintData } from '@/components/ReviewHint';
import { savePitchAttempt } from '@/lib/actions/reviews';
import {
  EMPTY_HITS,
  EMPTY_SAID,
  PIECES,
  availablePieces,
  gradeFromPieces,
  repeatedMisses,
  type PieceKey,
  type PitchHits,
  type PitchSaid,
} from '@/lib/review/pitch';
import { accent, buttonPrimaryClass, buttonSecondaryClass, cardClass, textareaClass } from '@/lib/ui';

const DURATION = 30;
const CIRCUMFERENCE = 2 * Math.PI * 88;

// O degrau de produção. Falar em voz alta continua sendo o ato central — é o
// que mais se parece com ser perguntado —, mas agora ele deixa rastro: entre
// falar e revelar, você escreve as três peças do jeito que acabou de dizer.
//
// Sem esse rastro a comparação acontecia na cabeça, contra um resumo que você
// estava lendo naquele instante, o que é o pior lugar possível pra ela. Com o
// rastro, "me embaralhei" para de ser sensação e vira uma peça específica que
// faltou — quase sempre a do meio.
export function PitchRunner({
  topicName,
  pitch,
  backHref,
  topicId,
  decisiveQuestion = '',
  hint,
  reference,
  previousHits = null,
  day0 = false,
}: {
  topicName: string;
  pitch: string;
  backHref: string;
  topicId: string;
  decisiveQuestion?: string;
  hint?: HintData;
  /** Os campos do tópico com que cada peça é comparada. */
  reference: Record<PieceKey, string>;
  /** Como as peças saíram na tentativa anterior, se houve uma. */
  previousHits?: PitchHits | null;
  /** Primeiro dia do tópico: nada é agendado e a dica não cobra nada. */
  day0?: boolean;
}) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'writing' | 'revealed'>('idle');
  const [remaining, setRemaining] = useState(DURATION);
  const [hintUsed, setHintUsed] = useState(false);
  const [said, setSaid] = useState<PitchSaid>(EMPTY_SAID);
  const [hits, setHits] = useState<PitchHits>(EMPTY_HITS);
  const [savedDay0, setSavedDay0] = useState(false);
  // No dia 0 o `topicId` não chega ao gravador: sem ele o hook não registra
  // nada, que é a garantia de que o primeiro contato não mexe na escada.
  const { outcome, pending, record, changeRetry, reset } = useReviewRecorder(
    day0 ? undefined : topicId,
    'pitch'
  );

  // O efeito só existe enquanto phase === 'running'; ao desmontar ou trocar
  // de fase (inclusive saindo da tela), o cleanup limpa o interval —
  // diferente da versão vanilla, aqui não há risco de timer órfão.
  useEffect(() => {
    if (phase !== 'running') return;
    const timeout = setTimeout(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setPhase('writing');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [phase, remaining]);

  const restart = () => {
    setRemaining(DURATION);
    setPhase('idle');
    setHintUsed(false);
    setSaid(EMPTY_SAID);
    setHits(EMPTY_HITS);
    setSavedDay0(false);
    reset();
  };

  const available = availablePieces(reference);
  const suggested = gradeFromPieces(hits, available);
  const repeated = repeatedMisses(hits, previousHits);

  const ringColor = remaining <= 5 ? '#EF4444' : '#FB6514';
  const ringOffset = CIRCUMFERENCE * (1 - remaining / DURATION);

  const hintBlock = hint ? (
    day0 ? (
      // Dia 0 é com o material aberto — não há medição pra proteger.
      <div style={{ marginBottom: 16 }}>
        <HintContent hint={hint} label="Analogia visual" />
      </div>
    ) : (
      <ReviewHint hint={hint} label="Analogia visual" used={hintUsed} onUse={() => setHintUsed(true)} />
    )
  ) : null;

  return (
    <div className={cardClass} style={{ textAlign: 'center', borderRadius: 24, padding: '40px 30px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 13px',
          borderRadius: 999,
          background: '#FFEBDF',
          marginBottom: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <i className="ph-fill ph-microphone-stage" style={{ color: '#FB6514', fontSize: 15 }} />
        <span style={{ font: '600 12.5px var(--font-body)', color: '#C2410C' }}>Explique em 30 segundos</span>
      </div>
      <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 26, letterSpacing: '-.02em', margin: '0 0 22px' }}>
        {topicName}
      </h2>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#6B6862', margin: '0 auto 22px', maxWidth: '42ch' }}>
              Ensine este tópico em voz alta, como se explicasse para alguém. Estruture em três
              peças: <b>o que é</b>, <b>por que existe</b> e <b>um exemplo</b>.
            </p>

            {/* Quando a mesma peça falhou nas duas últimas vezes, ela é dita
                antes de começar. Não é dica: é o que você já sabe sobre si e
                esqueceu — e saber onde vai travar muda como você fala. */}
            {previousHits && PIECES.some((p) => !previousHits[p.key]) && (
              <div
                style={{
                  textAlign: 'left',
                  margin: '0 auto 22px',
                  maxWidth: '46ch',
                  borderRadius: 14,
                  padding: '13px 15px',
                  background: '#FDF0DC',
                  display: 'flex',
                  gap: 10,
                }}
              >
                <i className="ph-fill ph-target" style={{ color: '#B54708', fontSize: 17, flex: 'none', marginTop: 2 }} />
                <div style={{ fontSize: 14, lineHeight: 1.55, color: '#8A5B08' }}>
                  Da última vez faltou{' '}
                  <b>
                    {PIECES.filter((p) => !previousHits[p.key])
                      .map((p) => p.label.toLowerCase())
                      .join(' e ')}
                  </b>
                  . Repare nisso agora.
                </div>
              </div>
            )}

            {/* O teste binário do tópico entra aqui porque este é o primeiro
                degrau da escada: antes de explicar o que a coisa é, saber
                reconhecer quando ela é o caso. */}
            {decisiveQuestion && (
              <div
                style={{
                  textAlign: 'left',
                  margin: '0 auto 26px',
                  maxWidth: '46ch',
                  borderRadius: 14,
                  padding: '13px 15px',
                  background: '#E9ECFF',
                  display: 'flex',
                  gap: 10,
                }}
              >
                <i className="ph-fill ph-key" style={{ color: accent, fontSize: 17, flex: 'none', marginTop: 2 }} />
                <div>
                  <span style={{ display: 'block', font: '600 12px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: accent, marginBottom: 4 }}>
                    Responda antes de começar
                  </span>
                  <div style={{ fontSize: 14.5, lineHeight: 1.55, color: '#35322D' }}>
                    <RichText text={decisiveQuestion} />
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setPhase('running')}
              style={{
                border: 'none',
                cursor: 'pointer',
                font: '700 16px var(--font-body)',
                color: '#fff',
                background: 'linear-gradient(120deg, #FB6514, #F5A524)',
                padding: '15px 32px',
                borderRadius: 999,
                boxShadow: '0 12px 26px -10px rgba(251,101,20,.6)',
              }}
            >
              <i className="ph-fill ph-play" /> Começar
            </button>
          </motion.div>
        )}

        {phase === 'running' && (
          <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 22px' }}>
              <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="100" cy="100" r="88" fill="none" stroke="#F0EDE6" strokeWidth="14" />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div className="rcp-font-display" style={{ fontWeight: 700, fontSize: 58, letterSpacing: '-.03em', color: ringColor }}>
                  {remaining}
                  <span style={{ fontSize: 24, color: '#C9C4BB' }}>s</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 15, color: '#6B6862', margin: '0 0 20px' }}>
              Fale sem parar. Estruture: o que é → por que → exemplo.
            </p>
            {/* O apoio existe pra travamento por detalhe, que era o buraco de
                "explique sem olhar": travar por uma peça derrubava a sessão
                inteira. Ele custa o teto de "Difícil" — ver ReviewHint. */}
            {hintBlock}
            <button onClick={() => setPhase('writing')} className={buttonSecondaryClass} style={{ borderRadius: 999 }}>
              Terminei / Pular
            </button>
          </motion.div>
        )}

        {phase === 'writing' && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ textAlign: 'left' }}
          >
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#6B6862', margin: '0 0 4px' }}>
              Agora escreva as três peças <b>do jeito que você acabou de falar</b>.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: '#A29E96', margin: '0 0 18px' }}>
              Sem melhorar, sem consultar. O valor está em registrar o que saiu, não o que você
              gostaria que tivesse saído — é isso que vai ser comparado.
            </p>

            {PIECES.map((p) => (
              <div key={p.key} style={{ marginBottom: 14 }}>
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
                  htmlFor={`said-${p.key}`}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 8, display: 'grid', placeItems: 'center', background: p.tint }}>
                    <i className={p.icon} style={{ color: p.color, fontSize: 13 }} />
                  </span>
                  <span style={{ font: '600 14px var(--font-body)', color: '#161616' }}>{p.label}</span>
                  <span style={{ fontSize: 12.5, color: '#A29E96' }}>{p.prompt}</span>
                </label>
                <textarea
                  id={`said-${p.key}`}
                  className={textareaClass}
                  rows={2}
                  value={said[p.key]}
                  placeholder={p.placeholder}
                  onChange={(e) => setSaid((s) => ({ ...s, [p.key]: e.target.value }))}
                />
              </div>
            ))}

            {hintBlock}

            <button
              onClick={() => setPhase('revealed')}
              className={buttonPrimaryClass}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              <i className="ph-fill ph-eye" /> Revelar e comparar
            </button>
          </motion.div>
        )}

        {phase === 'revealed' && (
          <motion.div key="revealed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ textAlign: 'left' }}>
            {/* Peça a peça: o que você produziu ao lado do que o tópico guarda.
                A autoavaliação agora acontece com as duas versões na tela, que
                é bem diferente do "consegui?" de memória de antes. */}
            {PIECES.map((p) => {
              const ref = reference[p.key]?.trim();
              const mine = said[p.key].trim();
              const gradable = Boolean(ref);
              return (
                <div
                  key={p.key}
                  style={{
                    borderRadius: 16,
                    border: '1px solid rgba(0,0,0,.09)',
                    overflow: 'hidden',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: p.tint }}>
                    <i className={p.icon} style={{ color: p.color, fontSize: 15 }} />
                    <span style={{ font: '600 13.5px var(--font-body)', color: p.color, flex: 1 }}>{p.label}</span>
                    {gradable && (
                      <button
                        type="button"
                        onClick={() => setHits((h) => ({ ...h, [p.key]: !h[p.key] }))}
                        aria-pressed={hits[p.key]}
                        style={{
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: 999,
                          padding: '4px 12px',
                          font: '600 12.5px var(--font-body)',
                          background: hits[p.key] ? '#0E9F6E' : '#fff',
                          color: hits[p.key] ? '#fff' : '#86827A',
                        }}
                      >
                        {hits[p.key] ? <><i className="ph-bold ph-check" /> Disse isso</> : 'Faltou'}
                      </button>
                    )}
                  </div>

                  <div style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'block', font: '600 11px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: '#A29E96', marginBottom: 4 }}>
                      Você disse
                    </span>
                    <div style={{ fontSize: 14.5, lineHeight: 1.6, color: mine ? '#35322D' : '#C9C4BB' }}>
                      {mine || 'Não escreveu nada aqui.'}
                    </div>

                    <div style={{ height: 1, background: 'rgba(0,0,0,.07)', margin: '12px 0' }} />

                    <span style={{ display: 'block', font: '600 11px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: p.color, marginBottom: 4 }}>
                      {p.referenceLabel}
                    </span>
                    {ref ? (
                      <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#35322D' }}>
                        <RichText text={ref} />
                      </div>
                    ) : (
                      <em style={{ fontSize: 14, color: '#86827A' }}>
                        O tópico não tem esta peça preenchida — ela não conta na avaliação.
                      </em>
                    )}
                  </div>
                </div>
              );
            })}

            {/* A mesma peça faltando duas vezes seguidas é o achado que o degrau
                inteiro existe pra produzir. */}
            {repeated.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  borderRadius: 14,
                  padding: '13px 15px',
                  background: '#FDF0DC',
                  border: '1px solid #F5DCB3',
                  margin: '0 0 18px',
                }}
              >
                <i className="ph-fill ph-warning" style={{ color: '#B54708', fontSize: 17, flex: 'none', marginTop: 2 }} />
                <div style={{ fontSize: 14, lineHeight: 1.55, color: '#8A5B08' }}>
                  <b>Segunda vez seguida sem {repeated.map((k) => PIECES.find((p) => p.key === k)!.label.toLowerCase()).join(' e ')}.</b>{' '}
                  Não é deslize. Vale voltar ao painel do tópico e reescrever essa parte com as suas
                  palavras antes da próxima revisão.
                </div>
              </div>
            )}

            {pitch && (
              <div style={{ borderRadius: 16, padding: 16, background: '#FFF7F0', border: '1px solid #FBE2CE', margin: '0 0 18px' }}>
                <p style={{ font: '600 11px var(--font-body)', letterSpacing: '.04em', textTransform: 'uppercase', color: '#C2410C', margin: '0 0 8px' }}>
                  Seu resumo de 30 segundos
                </p>
                <div style={{ fontSize: '15px', lineHeight: 1.6, color: '#35322D' }}>
                  <RichText text={pitch} />
                </div>
              </div>
            )}

            {/* Aqui já não há medição em jogo, então a analogia aparece sem
                cobrar nada: reencontrar a estrutura logo depois de tentar
                recuperá-la é exatamente o que fixa. */}
            {hint && hasHint(hint) && !hintUsed && (
              <div style={{ margin: '0 0 18px' }}>
                <HintContent hint={hint} label="Analogia visual" />
              </div>
            )}

            {day0 ? (
              <div style={{ margin: '0 0 22px' }}>
                <p
                  style={{
                    fontSize: 13.5,
                    color: '#6B6862',
                    lineHeight: 1.6,
                    margin: '0 0 12px',
                    padding: '12px 15px',
                    borderRadius: 14,
                    background: '#F7F6F3',
                  }}
                >
                  <i className="ph ph-calendar-plus" /> Primeiro contato — nada foi agendado. Este
                  tópico entra na fila amanhã, cobrando isto sem o resumo na tela.
                </p>
                <button
                  type="button"
                  disabled={savedDay0}
                  onClick={async () => {
                    setSavedDay0(true);
                    await savePitchAttempt(topicId, { said, hits });
                  }}
                  className={buttonSecondaryClass}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {savedDay0 ? (
                    <>
                      <i className="ph-fill ph-check-circle" /> Guardado como sua linha de base
                    </>
                  ) : (
                    <>
                      <i className="ph ph-floppy-disk" /> Guardar esta tentativa
                    </>
                  )}
                </button>
              </div>
            ) : !outcome && !pending ? (
              <GradeButtons
                suggested={suggested}
                capped={hintUsed}
                onGrade={(grade) =>
                  record(available.filter((k) => hits[k]).length, available.length || 1, grade, hintUsed, {
                    said,
                    hits,
                  })
                }
              />
            ) : (
              <ReviewOutcomeBanner outcome={outcome} pending={pending} onChangeRetry={changeRetry} />
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={restart} className={buttonSecondaryClass}>
                <i className="ph ph-arrow-clockwise" /> Tentar de novo
              </button>
              <Link href={backHref} className={buttonPrimaryClass} style={{ background: accent }}>
                Voltar ao tópico
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
