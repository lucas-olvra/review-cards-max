import { SkeletonBlock, SkeletonPage } from '@/components/Skeleton';

export default function ImportLoading() {
  return (
    <SkeletonPage maxWidth={720}>
      <SkeletonBlock height={32} width="45%" radius={8} />
      <SkeletonBlock height={60} radius={14} />
      <SkeletonBlock height={220} radius={16} />
      <SkeletonBlock height={46} width={180} radius={12} />
    </SkeletonPage>
  );
}
