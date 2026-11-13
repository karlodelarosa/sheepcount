import { Skeleton } from "@/components/ui/skeleton";

/** Shared route fallback; the persistent sidebar and topbar remain interactive. */
export function PageSkeleton({
  message = "Loading page",
}: {
  message?: string;
}) {
  return (
    <div role="status" aria-busy="true" className="min-h-[60vh] space-y-6">
      <span className="sr-only">{message}</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="rounded-xl border p-4 space-y-4">
          <Skeleton className="h-9 w-64 max-w-full" />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
