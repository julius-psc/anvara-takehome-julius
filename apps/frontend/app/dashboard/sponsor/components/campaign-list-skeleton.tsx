// Loading placeholder shown by the <Suspense> fallback while campaigns stream in.
// Mirrors the real layout (stats row + card grid) to minimize layout shift.
export function CampaignListSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-[--color-border]" />
            <div className="mt-3 h-6 w-24 animate-pulse rounded bg-[--color-border]" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
            <div className="flex items-start justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-[--color-border]" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-[--color-border]" />
            </div>
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-[--color-border]" />
            <div className="mt-2 h-1 w-full animate-pulse rounded-full bg-[--color-border]" />
            <div className="mt-4 h-3 w-24 animate-pulse rounded bg-[--color-border]" />
          </div>
        ))}
      </div>
    </div>
  );
}
