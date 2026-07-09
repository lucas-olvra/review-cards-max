'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { createToken, deleteToken, type ApiTokenSummary } from '@/lib/actions/tokens';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import {
  buttonDangerClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardClass,
  inputClass,
  labelClass,
} from '@/lib/ui';

function formatDate(iso: string | null) {
  if (!iso) return 'nunca';
  return new Date(iso).toLocaleString('pt-BR');
}

export function TokensManager({ tokens }: { tokens: ApiTokenSummary[] }) {
  const [name, setName] = useState('');
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const { token } = await createToken(name);
        setFreshToken(token);
        setName('');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao criar token.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="mb-1 text-lg font-semibold">+ Novo Token</h2>
        <p className="mb-4 text-sm text-slate-400">
          Dá um nome pra identificar onde esse token vai ser usado (ex: &quot;Claude Desktop —
          Notebook&quot;).
        </p>

        <AnimatePresence mode="wait">
          {freshToken ? (
            <motion.div
              key="fresh-token"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 rounded-lg border border-amber-800 bg-amber-950/40 p-4"
            >
              <p className="text-sm font-semibold text-amber-300">
                Copie este token agora — ele não será mostrado de novo.
              </p>
              <code className="block break-all rounded-md bg-slate-950 p-3 text-sm text-emerald-300">
                {freshToken}
              </code>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(freshToken)}
                  className={buttonSecondaryClass}
                >
                  Copiar
                </button>
                <button onClick={() => setFreshToken(null)} className={buttonPrimaryClass}>
                  Entendi, já copiei
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={labelClass}>Nome do token</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="ex: Claude Desktop — Notebook"
                  />
                </div>
                <button
                  onClick={handleCreate}
                  disabled={isPending || !name.trim()}
                  className={`self-end ${buttonPrimaryClass}`}
                >
                  {isPending ? 'Gerando...' : 'Gerar token'}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Tokens ativos
        </h3>
        {!tokens.length && <p className="text-sm text-slate-500">Nenhum token criado ainda.</p>}
        {tokens.map((token) => (
          <div
            key={token.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4"
          >
            <div>
              <p className="font-medium">{token.name}</p>
              <p className="text-xs text-slate-500">
                {token.token_prefix}… · criado em {formatDate(token.created_at)} · último uso:{' '}
                {formatDate(token.last_used_at)}
              </p>
            </div>
            <ConfirmSubmitButton
              action={deleteToken.bind(null, token.id)}
              confirmMessage={`Revogar o token "${token.name}"? Qualquer integração usando ele para de funcionar imediatamente.`}
              className={buttonDangerClass}
            >
              Revogar
            </ConfirmSubmitButton>
          </div>
        ))}
      </div>
    </div>
  );
}
