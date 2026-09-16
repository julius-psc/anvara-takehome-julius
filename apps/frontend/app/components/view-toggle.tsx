'use client';

import { IconLayoutGrid, IconLayoutList } from '@tabler/icons-react';
import type { ViewMode } from '@/lib/use-view-preference';

// Segmented card/list switch. Concentric radius (Tailwind v4):
// rounded-lg (8px) track − p-1 (4px) padding → rounded-sm (4px) buttons.
// Selected state is a static cue (surface + shadow); scale(0.96) on press;
// only the changed properties transition.
export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const options: { key: ViewMode; label: string; Icon: typeof IconLayoutGrid }[] = [
    { key: 'card', label: 'Card view', Icon: IconLayoutGrid },
    { key: 'list', label: 'List view', Icon: IconLayoutList },
  ];

  return (
    <div
      role="group"
      aria-label="View"
      className="flex items-center gap-0.5 rounded-lg border border-(--color-border) bg-(--color-surface) p-1"
    >
      {options.map(({ key, label, Icon }) => {
        const active = view === key;
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => onChange(key)}
            className={`grid h-7 w-7 place-items-center rounded-sm transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.96] ${
              active
                ? 'bg-(--color-surface-hover) text-(--color-foreground) shadow-(--shadow-sm)'
                : 'text-(--color-muted) hover:text-(--color-foreground)'
            }`}
          >
            <Icon size={16} stroke={1.5} />
          </button>
        );
      })}
    </div>
  );
}
