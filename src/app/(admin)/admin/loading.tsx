import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="border-t border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-6 py-4 border-b border-border">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/12" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}