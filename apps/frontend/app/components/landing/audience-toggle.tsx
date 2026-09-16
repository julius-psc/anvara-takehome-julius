'use client';

import type { Audience } from './content';
import { AUDIENCE_OPTIONS } from './content';

type AudienceToggleProps = {
  value: Audience;
  onChange: (audience: Audience) => void;
  className?: string;
};

export function AudienceToggle({ value, onChange, className = '' }: AudienceToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Audience"
      className={`inline-flex items-center gap-1 rounded-xl border border-(--color-border) bg-(--color-surface) p-1 ${className}`}
    >
      {AUDIENCE_OPTIONS.map(({ key, label }) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(key)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? 'bg-(--color-surface-hover) text-(--color-foreground) shadow-(--shadow-sm)'
                : 'text-(--color-muted) hover:text-(--color-foreground)'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
