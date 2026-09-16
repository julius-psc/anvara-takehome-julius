// Loading placeholder for the <Suspense> fallback while ad slots stream in.
// Mirrors the real layout (filter toolbar + card grid) to minimize layout shift.
export function AdSlotListSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-(--color-border) bg-(--color-surface) p-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 w-24 animate-pulse rounded-sm bg-(--color-border)" />
            ))}
          </div>
          <div className="h-9 w-16 animate-pulse rounded-lg bg-(--color-border)" />
        </div>
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-(--color-border) bg-(--color-surface) p-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-sm bg-(--color-border)" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex h-full flex-col gap-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-5"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="h-7 w-32 animate-pulse rounded bg-(--color-border)" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-(--color-border)" />
                </div>
                <div className="h-7 w-7 shrink-0 animate-pulse rounded-md bg-(--color-border)" />
              </div>
            </div>
            <div className="mt-auto flex items-baseline justify-between gap-3">
              <div className="h-3 w-16 animate-pulse rounded bg-(--color-border)" />
              <div className="h-4 w-20 animate-pulse rounded bg-(--color-border)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
