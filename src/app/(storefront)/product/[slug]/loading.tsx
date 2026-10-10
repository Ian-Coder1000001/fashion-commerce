import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12"
      role="status"
      aria-label="Loading product"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </div>
      <div className="lg:pt-4 flex flex-col gap-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-11 w-64 mt-6" />
        <Skeleton className="h-11 w-full sm:w-80" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}