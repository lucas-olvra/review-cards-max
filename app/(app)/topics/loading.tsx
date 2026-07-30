import { SkeletonCards, SkeletonPage } from '@/components/Skeleton';

export default function TopicsLoading() {
  return (
    <SkeletonPage maxWidth={1020}>
      <SkeletonCards count={4} height={172} />
    </SkeletonPage>
  );
}
