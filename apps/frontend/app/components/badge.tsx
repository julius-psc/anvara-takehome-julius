import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'info' | 'danger';

// Semantic status colors use Tailwind's fixed palette (reliable across the
// design system without needing per-tone CSS variables).
const toneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
  success: 'bg-green-50 text-green-700 ring-green-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  danger: 'bg-red-50 text-red-600 ring-red-200',
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
