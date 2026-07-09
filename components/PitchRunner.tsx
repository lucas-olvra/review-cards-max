'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RichText } from '@/lib/render';
import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '@/lib/ui';

const DURATION = 30;

export function PitchRunner({
  topicId,
  topicName,
  pitch,
}: {
  topicId: string;
  topicName: string;
  pitch: string;
}) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'revealed'>('idle');
  const [remaining, setRemaining] = useState(DURATION);

  // O efeito só existe enquanto phase === 'running'; ao desmontar ou trocar
  // de fase (inclusive saindo da tela), o cleanup limpa o interval —
  // diferente da versão vanilla, aqui não há risco de timer órfão.
  useEffect(() => {
    if (phase !== 'running') return;
    if (remaining <= 0) {
      setPhase('revealed');
      return;
    }
    const timeout = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timeout);
  }, [phase, remaining]);

  const restart = () => {
    setRemaining(DURATION);
    setPhase('idle');
  };

  return (
    <div className={`${cardClass} text-center`}>
      <h3 className="mb-3 text-lg font-semibold">{topicName}</h3>

      {phase === 'idle' && (
        <>
          <p className="mb-4 text-slate-400">
            Explique esse tópico em voz alta, como se estivesse ensinando alguém. Clique em
            começar quando estiver pronto.
          </p>
          <button onClick={() => setPhase('running')} className={buttonPrimaryClass}>
            ▶ Começar
          </button>
        </>
      )}

      {phase === 'running' && (
        <>
          <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-1000 ease-linear"
              style={{ width: `${(remaining / DURATION) * 100}%` }}
            />
          </div>
          <p className="mb-4 text-2xl font-bold">{remaining}s</p>
          <button onClick={() => setPhase('revealed')} className={buttonSecondaryClass}>
            Terminei / Pular
          </button>
        </>
      )}

      {phase === 'revealed' && (
        <div className="space-y-4 text-left">
          <div className="rounded-lg bg-slate-800/60 p-4 text-sm">
            {pitch ? <RichText text={pitch} /> : <em className="text-slate-400">Sem resumo salvo.</em>}
          </div>
          <div className="flex justify-center gap-2">
            <button onClick={restart} className={buttonSecondaryClass}>
              🔁 Tentar de novo
            </button>
            <Link href={`/topics/${topicId}`} className={buttonPrimaryClass}>
              ← Voltar ao tópico
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
