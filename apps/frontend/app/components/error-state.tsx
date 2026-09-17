'use client';

import Link from 'next/link';
import { IconAlertTriangle } from '@tabler/icons-react';

/** Shared route error UI — human message + Try again / Go back (bonus 5). */
export function ErrorState({
  title,
  description,
  onRetry,
  backHref = '/',
  backLabel = 'Go back',
}: {
  title: string;
  description: string;
  onRetry?: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-(--color-error)/20 bg-(--color-error-soft) px-6 py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-(--color-surface) text-(--color-error)">
        <IconAlertTriangle size={20} stroke={1.8} aria-hidden />
      </div>
      <h2 className="mt-4 text-base font-semibold text-(--color-error)">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-pretty text-sm text-(--color-error)/80">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Try again
          </button>
        )}
        <Link
          href={backHref}
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-foreground) transition-colors duration-150 ease-out hover:bg-(--color-surface-hover)"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
