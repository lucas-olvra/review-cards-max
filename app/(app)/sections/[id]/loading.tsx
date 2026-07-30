import { SkeletonBlock, SkeletonCards, SkeletonPage } from '@/components/Skeleton';

export default function SectionLoading() {
  return (
    <SkeletonPage maxWidth={1020}>
      <SkeletonBlock height={16} width={130} radius={6} />
      <SkeletonBlock height={32} width="45%" radius={8} />
      <SkeletonBlock height={72} radius={20} />
      <SkeletonCards count={4} height={172} />
    </SkeletonPage>
  );
}
