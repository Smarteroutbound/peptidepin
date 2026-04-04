import { ListSkeleton, TextSkeleton } from "@/components/shared/page-skeleton";

export default function MyPeptidesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TextSkeleton width="w-32" />
        <div className="h-9 w-9 bg-muted rounded-full animate-pulse" />
      </div>
      <ListSkeleton count={4} />
    </div>
  );
}
