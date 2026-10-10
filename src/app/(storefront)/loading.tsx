import { Skeleton } from "@/components/ui/Skeleton";

export default function StorefrontLoading() {
  return (
    <div
      className="mx-auto max-w-3xl px-6 py-16"
      role="status"
      aria-label="Loading"
    >
      <Skeleton className="h-10 w-56 mb-10" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}