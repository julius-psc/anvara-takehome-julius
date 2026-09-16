'use client';

import { ErrorState } from '@/app/components/error-state';

export default function MarketplaceError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="Unable to load marketplace"
      description="We could not load available ad slots. Check your connection and try again."
      onRetry={reset}
      backHref="/"
      backLabel="Go home"
    />
  );
}
