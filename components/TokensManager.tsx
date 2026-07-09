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

export function TokensManager({ tokens, mcpUrl }: { tokens: ApiTokenSummary[]; mcpUrl: string }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className={cardClass} style={{ borderRadius: 22, padding: 28 }}>
        <h2 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 18, margin: '0 0 6px' }}>
          + Novo token
        </h2>
        <p style={{ fontSize: 14, color: '#6B6862', margin: '0 0 16px' }}>
          Dá um nome pra identificar onde esse token vai ser usado (ex: &quot;Claude Desktop —
          Notebook&quot;).
        </p>

        <AnimatePresence mode="wait">
          {freshToken ? (
            <motion.div
              key="fresh-token"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 14, border: '1.5px solid #F5D9A8', background: '#FDF3E3', padding: 16 }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, color: '#92620C' }}>
                Copie este token agora — ele não será mostrado de novo.
              </p>
              <code
                className="rcp-font-code"
                style={{ display: 'block', wordBreak: 'break-all', borderRadius: 10, background: '#161616', padding: 12, fontSize: 13, color: '#7FE3B4' }}
              >
                {freshToken}
              </code>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigator.clipboard.writeText(freshToken)} className={buttonSecondaryClass}>
                  Copiar token
                </button>
                <button onClick={() => setFreshToken(null)} className={buttonPrimaryClass}>
                  Entendi, já copiei
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(0,0,0,.08)', margin: '4px 0 0', paddingTop: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#92620C', margin: '0 0 8px' }}>
                  Já com o token — comando pronto pro Claude Code:
                </p>
                <code
                  className="rcp-font-code"
                  style={{ display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderRadius: 10, background: '#161616', padding: 12, fontSize: 12, color: '#7FE3B4' }}
                >
                  {`claude mcp add --transport http review-cards ${mcpUrl} --header "Authorization: Bearer ${freshToken}"`}
                </code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `claude mcp add --transport http review-cards ${mcpUrl} --header "Authorization: Bearer ${freshToken}"`
                    )
                  }
                  className={buttonSecondaryClass}
                  style={{ marginTop: 8 }}
                >
                  Copiar comando
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className={labelClass}>Nome do token</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="ex: Claude Desktop — Notebook"
                  />
                </div>
                <button onClick={handleCreate} disabled={isPending || !name.trim()} className={buttonPrimaryClass}>
                  {isPending ? 'Gerando...' : 'Gerar token'}
                </button>
              </div>
              {error && <p style={{ marginTop: 8, fontSize: 14, color: '#B42318' }}>{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ font: '600 13px var(--font-body)', textTransform: 'uppercase', letterSpacing: '.03em', color: '#86827A', margin: 0 }}>
          Tokens ativos
        </h3>
        {!tokens.length && <p style={{ fontSize: 14, color: '#9A968E' }}>Nenhum token criado ainda.</p>}
        {tokens.map((token) => (
          <div key={token.id} className="rcp-list-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>{token.name}</p>
              <p style={{ fontSize: 12.5, color: '#9A968E', margin: '2px 0 0' }}>
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
