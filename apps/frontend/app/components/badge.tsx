import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'info' | 'danger';

// Badge tones map to design-token soft fills so light/dark both stay in sync.
const toneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-(--color-surface-hover) text-(--color-muted) ring-(--color-border)',
  success: 'bg-(--color-success-soft) text-(--color-success) ring-(--color-success)/25',
  warning: 'bg-(--color-warning-soft) text-(--color-warning) ring-(--color-warning)/25',
  info: 'bg-(--color-info-soft) text-(--color-info) ring-(--color-info)/25',
  danger: 'bg-(--color-error-soft) text-(--color-error) ring-(--color-error)/25',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}
