// Blocos de esqueleto compartilhados pelos `loading.tsx`. Ter um só lugar
// evita que cada rota invente um cinza e um raio de borda diferentes — o que
// faz a espera parecer "outra tela" em vez da mesma tela carregando.

export function SkeletonBlock({
  height,
  width = '100%',
  radius = 14,
  style,
}: {
  height: number | string;
  width?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rcp-skeleton"
      style={{ height, width, borderRadius: radius, ...style }}
    />
  );
}

// Espelha a moldura das telas do app (mesma largura máxima e mesmo padding),
// pra que o conteúdo real não "pule" quando substitui o esqueleto.
export function SkeletonPage({
  maxWidth = 840,
  children,
}: {
  maxWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      style={{ maxWidth, margin: '0 auto', padding: '26px 26px 90px', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {children}
    </div>
  );
}

export function SkeletonCards({ count, height = 150 }: { count: number; height?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBlock key={i} height={height} radius={20} />
      ))}
    </div>
  );
}

// Painéis empilhados (tópico, formulários): o esqueleto de lista vertical.
export function SkeletonRows({ count, height = 64 }: { count: number; height?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBlock key={i} height={height} />
      ))}
    </div>
  );
}
