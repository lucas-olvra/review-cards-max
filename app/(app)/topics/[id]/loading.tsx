import { SkeletonBlock, SkeletonPage, SkeletonRows } from '@/components/Skeleton';

export default function TopicLoading() {
  return (
    <SkeletonPage>
      <SkeletonBlock height={16} width={120} radius={6} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <SkeletonBlock height={48} width={48} radius={13} />
        <SkeletonBlock height={32} width="55%" radius={8} />
      </div>
      <SkeletonBlock height={42} radius={999} style={{ marginTop: 8 }} />
      <SkeletonRows count={5} height={88} />
    </SkeletonPage>
  );
}
