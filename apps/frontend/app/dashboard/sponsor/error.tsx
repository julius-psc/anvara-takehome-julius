'use client';

// Route-segment error boundary for the sponsor dashboard.
// Error boundaries must be Client Components: they run in the browser to catch
// render/data errors thrown anywhere in this segment (e.g. a failed campaigns
// fetch) and give the user a way to retry.
export default function SponsorDashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="mb-1 font-semibold text-red-700">Something went wrong</h2>
      <p className="mb-4 text-sm text-red-600">
        We couldn&apos;t load your campaigns. Please try again.
      </p>
      <button
        onClick={reset}
        className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
      >
        Try again
      </button>
    </div>
  );
}
