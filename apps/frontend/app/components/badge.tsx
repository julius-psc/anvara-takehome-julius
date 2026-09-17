import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'info' | 'danger';
export type BadgeVariant = 'soft' | 'solid';

// Soft fills stay in sync via design tokens for light/dark.
const softToneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-(--color-surface-hover) text-(--color-muted) ring-(--color-border)',
  success: 'bg-(--color-success-soft) text-(--color-success) ring-(--color-success)/25',
  warning: 'bg-(--color-warning-soft) text-(--color-warning) ring-(--color-warning)/25',
  info: 'bg-(--color-info-soft) text-(--color-info) ring-(--color-info)/25',
  danger: 'bg-(--color-error-soft) text-(--color-error) ring-(--color-error)/25',
};

// Solid fills only in light mode (hero overlays); dark keeps the soft token styles.
const solidToneStyles: Record<BadgeTone, string> = {
  neutral:
    'bg-(--color-surface-hover) text-(--color-muted) ring-(--color-border) [@media(prefers-color-scheme:light)]:bg-(--color-border-strong) [@media(prefers-color-scheme:light)]:text-(--color-foreground)/70 [@media(prefers-color-scheme:light)]:ring-transparent',
  success:
    'bg-(--color-success-soft) text-(--color-success) ring-(--color-success)/25 [@media(prefers-color-scheme:light)]:bg-(--color-success) [@media(prefers-color-scheme:light)]:text-white/90 [@media(prefers-color-scheme:light)]:ring-transparent',
  warning:
    'bg-(--color-warning-soft) text-(--color-warning) ring-(--color-warning)/25 [@media(prefers-color-scheme:light)]:bg-(--color-warning) [@media(prefers-color-scheme:light)]:text-white/90 [@media(prefers-color-scheme:light)]:ring-transparent',
  info:
    'bg-(--color-info-soft) text-(--color-info) ring-(--color-info)/25 [@media(prefers-color-scheme:light)]:bg-(--color-info) [@media(prefers-color-scheme:light)]:text-white/90 [@media(prefers-color-scheme:light)]:ring-transparent',
  danger:
    'bg-(--color-error-soft) text-(--color-error) ring-(--color-error)/25 [@media(prefers-color-scheme:light)]:bg-(--color-error) [@media(prefers-color-scheme:light)]:text-white/90 [@media(prefers-color-scheme:light)]:ring-transparent',
};

export function Badge({
  tone = 'neutral',
  variant = 'soft',
  children,
}: {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  const toneStyles = variant === 'solid' ? solidToneStyles : softToneStyles;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}
