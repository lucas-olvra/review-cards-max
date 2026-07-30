'use client';

import { usePathname } from 'next/navigation';

// Transição de entrada em CSS, não em JS.
//
// A versão anterior usava Motion com `initial={{ opacity: 0 }}`, o que faz o
// HTML do servidor sair com `style="opacity:0"` — o conteúdo só aparecia depois
// que o Motion montava e animava. Em carregamento de página completo (F5, URL
// colada, primeiro acesso) essa revelação não acontecia e a página inteira
// ficava invisível: o conteúdo estava no DOM, com opacity 0 permanente. Pior
// ainda com um `loading.tsx` dentro: o esqueleto também era invisível, então a
// espera virava tela branca.
//
// Em CSS o estado final não depende de hidratação: a animação roda no parse e,
// se animações estiverem desligadas, o elemento simplesmente já nasce visível
// (não existe regra de opacity fora do keyframe). Trocar a `key` a cada
// pathname remonta o nó, o que reinicia a animação nas trocas de rota — mesmo
// efeito que a `key` tinha antes.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="rcp-page-in">
      {children}
    </div>
  );
}
