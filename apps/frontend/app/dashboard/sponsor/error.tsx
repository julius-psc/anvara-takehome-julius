'use client';

// Route-segment error boundary for the sponsor dashboard.
import { ErrorState } from '@/app/components/error-state';

export default function SponsorDashboardError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="Unable to load campaigns"
      description="Something went wrong while loading your campaigns. Check your connection and try again."
      onRetry={reset}
      backHref="/"
      backLabel="Go home"
    />
  );
}
