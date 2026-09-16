'use client';

// Route-segment error boundary for the publisher dashboard.
export default function PublisherDashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="mb-1 font-semibold text-red-700">Something went wrong</h2>
      <p className="mb-4 text-sm text-red-600">
        We couldn&apos;t load your ad slots. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
