// Loading placeholder for the <Suspense> fallback while marketplace listings
// stream in. Mirrors the card grid layout to minimize layout shift.
export function AdSlotGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
          <div className="flex items-start justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-(--color-border)" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-(--color-border)" />
          </div>
          <div className="mt-3 h-3 w-24 animate-pulse rounded bg-(--color-border)" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-3 w-16 animate-pulse rounded bg-(--color-border)" />
            <div className="h-4 w-20 animate-pulse rounded bg-(--color-border)" />
          </div>
        </div>
      ))}
    </div>
  );
}
