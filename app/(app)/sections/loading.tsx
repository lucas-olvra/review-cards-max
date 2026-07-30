import { SkeletonBlock, SkeletonCards, SkeletonPage } from '@/components/Skeleton';

export default function SectionsLoading() {
  return (
    <SkeletonPage maxWidth={1020}>
      <SkeletonBlock height={32} width="40%" radius={8} />
      <SkeletonCards count={4} height={160} />
    </SkeletonPage>
  );
}
