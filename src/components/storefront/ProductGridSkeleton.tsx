import { Skeleton } from "@/components/ui/Skeleton";

export function ProductGridSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div
      className="mx-auto max-w-7xl px-6 py-16"
      role="status"
      aria-label="Loading products"
    >
      {title && <Skeleton className="h-10 w-64 mb-10" />}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-4 w-3/4 mt-3" />
            <Skeleton className="h-4 w-1/3 mt-2" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}