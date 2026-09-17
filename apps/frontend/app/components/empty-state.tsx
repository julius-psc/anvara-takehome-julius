import type { ReactNode } from 'react';

/** Shared empty-state panel for filtered or empty lists (bonus: helpful CTA). */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-14 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-(--color-surface-hover) text-(--color-muted)">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h10M4 17h7" />
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-medium text-(--color-foreground)">{title}</h3>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-pretty text-sm text-(--color-muted)">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
