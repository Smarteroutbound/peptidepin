import { CardSkeleton, TextSkeleton } from "@/components/shared/page-skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
      <div className="space-y-6">
        <div className="space-y-2">
          <TextSkeleton width="w-24" />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-2">
          <TextSkeleton width="w-28" />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
