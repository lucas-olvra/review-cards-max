'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Barra de progresso global das navegações.
//
// Os `loading.tsx` já cobrem a espera *depois* que a rota troca, mas entre o
// clique e a troca existe uma janela em que a tela antiga fica parada e o app
// parece travado — é justamente essa janela que aparece quando o servidor
// demora (rota dinâmica, dado do Supabase). O App Router não expõe um evento de
// "navegação começou", então o gatilho é o clique em qualquer link interno.
//
// O fim não precisa de efeito nem de setState: o estado guarda *de onde* a
// navegação partiu, e a barra só aparece enquanto a URL atual ainda for aquela.
// Quando a rota troca, a comparação já dá falso no próprio render.
const SAFETY_TIMEOUT_MS = 20_000;

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [origin, setOrigin] = useState<string | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentKey = `${pathname}?${searchParams.toString()}`;
  const active = origin !== null && origin === currentKey;

  useEffect(() => {
    function start() {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      // Rede caindo ou navegação abortada deixariam a barra girando pra sempre.
      safetyTimer.current = setTimeout(() => setOrigin(null), SAFETY_TIMEOUT_MS);
      // Normaliza pela mesma via que o useSearchParams usa, senão diferenças de
      // codificação fariam a chave nunca bater.
      const here = new URL(window.location.href);
      setOrigin(`${here.pathname}?${here.searchParams.toString()}`);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      // Ctrl/Cmd/Shift abrem em outra aba — a tela atual não vai a lugar nenhum.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (!anchor || !anchor.getAttribute('href')) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Link só de âncora na mesma página: não há rota pra carregar.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      start();
    }

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', start);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', start);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="rcp-route-progress" role="progressbar" aria-label="Carregando página">
      <span />
    </div>
  );
}
