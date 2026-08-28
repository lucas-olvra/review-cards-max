import { SkeletonBlock, SkeletonPage, SkeletonRows } from '@/components/Skeleton';

export default function TodayLoading() {
  return (
    <SkeletonPage maxWidth={720}>
      <SkeletonBlock height={40} width="55%" radius={8} />
      <SkeletonRows count={5} height={80} />
    </SkeletonPage>
  );
}
