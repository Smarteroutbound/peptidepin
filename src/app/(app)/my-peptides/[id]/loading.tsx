import { CardSkeleton, StatSkeleton, TextSkeleton } from "@/components/shared/page-skeleton";

export default function VialDetailLoading() {
  return (
    <div className="space-y-6">
      <TextSkeleton width="w-48" />
      <div className="grid grid-cols-3 gap-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <div className="h-3 w-full bg-muted rounded-full animate-pulse" />
      <CardSkeleton className="h-32" />
      <CardSkeleton className="h-48" />
    </div>
  );
}
