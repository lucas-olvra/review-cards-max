import { SkeletonBlock, SkeletonPage, SkeletonRows } from '@/components/Skeleton';

export default function TokensLoading() {
  return (
    <SkeletonPage maxWidth={760}>
      <SkeletonBlock height={32} width="45%" radius={8} />
      <SkeletonBlock height={80} radius={16} />
      <SkeletonRows count={3} height={70} />
    </SkeletonPage>
  );
}
