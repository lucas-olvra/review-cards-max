import { SkeletonBlock, SkeletonPage } from '@/components/Skeleton';

// As telas de execução (quiz, discursivas, pitch, treino, narração) têm todas a
// mesma moldura: link de sair, barra de progresso e um cartão grande. Um único
// esqueleto cobre as cinco.
export function RunnerLoading({ maxWidth = 680 }: { maxWidth?: number }) {
  return (
    <SkeletonPage maxWidth={maxWidth}>
      <SkeletonBlock height={16} width={130} radius={6} />
      <SkeletonBlock height={8} radius={999} style={{ marginTop: 6 }} />
      <SkeletonBlock height={320} radius={22} />
    </SkeletonPage>
  );
}
