import { SkeletonBlock, SkeletonPage, SkeletonRows } from '@/components/Skeleton';

export default function NewSectionLoading() {
  return (
    <SkeletonPage maxWidth={720}>
      <SkeletonBlock height={16} width={130} radius={6} />
      <SkeletonBlock height={32} width="45%" radius={8} />
      <SkeletonRows count={3} height={92} />
      <SkeletonBlock height={46} width={180} radius={12} />
    </SkeletonPage>
  );
}
