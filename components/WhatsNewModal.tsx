'use client';

import { useState, useSyncExternalStore, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { markChangelogSeen } from '@/lib/actions/changelog';
import { accent, buttonPrimaryClass } from '@/lib/ui';
import type { ChangelogEntry } from '@/lib/types';

const noopSubscribe = () => () => {};

// `false` no server/hidratação, `true` depois — o jeito idiomático de saber
// se já passou da hidratação sem usar useEffect+setState (que dispara um
// aviso de lint por causar uma renderização em cascata).
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

function EntryList({ entries }: { entries: ChangelogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p style={{ fontSize: 14.5, color: '#86827A', margin: '18px 0 24px' }}>
        Nenhuma novidade por aqui ainda.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '18px 0 24px' }}>
      {entries.map((entry) => (
        <div key={entry.id}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
            <h3 className="rcp-font-display" style={{ fontWeight: 600, fontSize: 16, margin: 0 }}>
              {entry.title}
            </h3>
            <span style={{ fontSize: 12, color: '#86827A' }}>{formatDate(entry.created_at)}</span>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#55524B', margin: 0 }}>{entry.description}</p>
        </div>
      ))}
    </div>
  );
}

// Recebe as novidades ainda não vistas (buscadas no layout, server-side). Se
// houver alguma, o modal abre sozinho; "Entendi" marca como visto no Supabase
// e fecha. O sino no header reabre a mesma leva sob demanda, sem remarcar —
// útil pra reler sem esperar a próxima novidade.
export function WhatsNewModal({ initialEntries }: { initialEntries: ChangelogEntry[] }) {
  const hasUnseen = initialEntries.length > 0;
  const [open, setOpen] = useState(hasUnseen);
  const [isPending, startTransition] = useTransition();
  // O header usa `backdrop-filter`, o que cria um novo "containing block" para
  // descendentes `position: fixed` — sem o portal, o overlay centralizaria
  // dentro do header (uns 60px de altura) em vez da viewport inteira. Só
  // montamos o portal depois do mount (client-only) pra não quebrar a
  // hidratação, já que `document` não existe no server.
  const mounted = useMounted();

  function close() {
    if (hasUnseen) {
      startTransition(async () => {
        await markChangelogSeen();
      });
    }
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        title="Novidades"
        onClick={() => setOpen(true)}
        className="rcp-icon-btn"
        style={{ position: 'relative' }}
      >
        <i className="ph-fill ph-bell" style={{ fontSize: 18 }} />
        {hasUnseen && (
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: 999,
              background: accent,
            }}
          />
        )}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 50,
                  background: 'rgba(22,22,22,.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                }}
                onClick={close}
              >
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="rcp-card"
                  style={{ maxWidth: 440, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 4 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        display: 'grid',
                        placeItems: 'center',
                        background: '#E9ECFF',
                        flex: 'none',
                      }}
                    >
                      <i className="ph-fill ph-sparkle" style={{ color: accent, fontSize: 18 }} />
                    </span>
                    <h2 className="rcp-font-display" style={{ fontWeight: 700, fontSize: 19, margin: 0 }}>
                      Novidades
                    </h2>
                  </div>

                  <EntryList entries={initialEntries} />

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={close}
                    className={buttonPrimaryClass}
                    style={{ width: '100%' }}
                  >
                    Entendi
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
