// Loading placeholder shown by the <Suspense> fallback while campaigns stream in.
// Mirrors the CampaignCard layout so the shift when real data arrives is minimal.
export function CampaignListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-[--color-border] p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mb-4 h-3 w-full animate-pulse rounded bg-gray-100" />
          <div className="mb-2 h-1.5 w-full animate-pulse rounded-full bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
