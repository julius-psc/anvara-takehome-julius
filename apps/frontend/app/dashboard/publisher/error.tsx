'use client';

import { ErrorState } from '@/app/components/error-state';

export default function PublisherDashboardError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="Unable to load ad slots"
      description="Something went wrong while loading your inventory. Check your connection and try again."
      onRetry={reset}
      backHref="/"
      backLabel="Go home"
    />
  );
}
