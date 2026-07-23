'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { accent } from '@/lib/ui';

// Duas variantes dos mesmos links: `.rcp-nav-desktop` (linha horizontal,
// visível por padrão) e `.rcp-nav-mobile` (botão ≡ + dropdown, visível só
// abaixo de 640px — troca controlada por CSS em globals.css). Duplicar os
// `Link`/`form` é seguro aqui porque são elementos sem estado; o mesmo não
// vale pro WhatsNewModal (fica de fora, montado uma única vez no header).
export function HeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rcp-nav-desktop">
        <Link href="/settings/tokens" className="rcp-navlink" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <i className="ph-fill ph-robot" style={{ fontSize: 15 }} /> Tokens &amp; MCP
        </Link>
        <Link href="/import" className="rcp-navlink">
          Importar
        </Link>
        <Link
          href="/sections/new"
          className="rcp-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999 }}
        >
          <i className="ph-bold ph-plus" style={{ fontSize: 14 }} /> Nova seção
        </Link>
        <form action={signOut}>
          <button type="submit" title="Sair" className="rcp-icon-btn">
            <i className="ph ph-sign-out" style={{ fontSize: 18 }} />
          </button>
        </form>
      </div>

      <div className="rcp-nav-mobile">
        <button type="button" onClick={() => setOpen((v) => !v)} className="rcp-icon-btn" title="Menu" aria-label="Abrir menu">
          <i className={open ? 'ph-bold ph-x' : 'ph-bold ph-list'} style={{ fontSize: 20 }} />
        </button>

        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
            <div
              className="rcp-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                zIndex: 30,
                minWidth: 200,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Link
                href="/settings/tokens"
                onClick={() => setOpen(false)}
                className="rcp-navlink"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <i className="ph-fill ph-robot" style={{ fontSize: 15 }} /> Tokens &amp; MCP
              </Link>
              <Link
                href="/import"
                onClick={() => setOpen(false)}
                className="rcp-navlink"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <i className="ph ph-upload-simple" style={{ fontSize: 15 }} /> Importar
              </Link>
              <Link
                href="/sections/new"
                onClick={() => setOpen(false)}
                className="rcp-navlink"
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: accent, fontWeight: 600 }}
              >
                <i className="ph-bold ph-plus" style={{ fontSize: 15 }} /> Nova seção
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rcp-navlink"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left' }}
                >
                  <i className="ph ph-sign-out" style={{ fontSize: 15 }} /> Sair
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
