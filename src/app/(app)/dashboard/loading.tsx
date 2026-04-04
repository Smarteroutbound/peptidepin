import { HeroSkeleton, CardSkeleton, StatSkeleton, TextSkeleton } from "@/components/shared/page-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <TextSkeleton width="w-48" />
      <HeroSkeleton />
      <div className="space-y-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    </div>
  );
}
