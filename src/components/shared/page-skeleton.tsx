export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 animate-pulse ${className}`}>
      <div className="h-4 w-2/3 bg-muted rounded mb-3" />
      <div className="h-3 w-full bg-muted rounded mb-2" />
      <div className="h-3 w-4/5 bg-muted rounded" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-3 animate-pulse">
      <div className="h-3 w-12 bg-muted rounded mb-2" />
      <div className="h-6 w-16 bg-muted rounded" />
    </div>
  );
}

export function TextSkeleton({ width = "w-1/2" }: { width?: string }) {
  return <div className={`h-4 ${width} bg-muted rounded animate-pulse`} />;
}

export function HeroSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
      <div className="h-3 w-24 bg-muted rounded mb-3" />
      <div className="h-8 w-40 bg-muted rounded mb-4" />
      <div className="h-12 w-full bg-muted rounded-xl" />
    </div>
  );
}
