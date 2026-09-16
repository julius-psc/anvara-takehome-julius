'use client';

import { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const DEFAULT_PAGE_SIZE = 9;

/** Keep page in range and reset to 1 when `resetKey` changes (e.g. filter). */
export function usePagination(total: number, resetKey: string | number, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  // Reset to page 1 when the filter/search key changes. Adjusting state during
  // render is React's recommended alternative to an effect here — no extra
  // commit, no flash of the previous page.
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  // Clamp into range by derivation rather than storing it, so a shrinking total
  // never leaves us on a page that no longer exists.
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  return {
    page: safePage,
    setPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    slice: <T,>(items: T[]) => items.slice(startIndex, startIndex + pageSize),
  };
}

function pageWindow(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const [jumpValue, setJumpValue] = useState(String(page));
  const [prevPage, setPrevPage] = useState(page);

  // Sync the jump input when the page changes elsewhere (prev/next, filter
  // reset) — again during render, not via an effect.
  if (page !== prevPage) {
    setPrevPage(page);
    setJumpValue(String(page));
  }

  if (total === 0) return null;

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    onPageChange(clamped);
  };

  const submitJump = () => {
    const parsed = parseInt(jumpValue, 10);
    if (Number.isFinite(parsed)) goTo(parsed);
    else setJumpValue(String(page));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-numeric text-sm text-(--color-muted)">
        Showing{' '}
        <span className="text-(--color-foreground)">
          {start}–{end}
        </span>{' '}
        of <span className="text-(--color-foreground)">{total}</span> results
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 text-sm font-medium text-(--color-foreground) transition-colors duration-150 ease-out hover:bg-(--color-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconChevronLeft size={16} stroke={1.8} aria-hidden />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
          {pageWindow(page, totalPages).map((item, i) =>
            item === 'ellipsis' ? (
              <span key={`e-${i}`} className="px-1.5 text-sm text-(--color-subtle)" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => goTo(item)}
                className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 font-numeric text-sm font-medium transition-colors duration-150 ease-out ${
                  item === page
                    ? 'bg-(--color-foreground) text-(--color-background)'
                    : 'border border-(--color-border) bg-(--color-surface) text-(--color-foreground) hover:bg-(--color-surface-hover)'
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 text-sm font-medium text-(--color-foreground) transition-colors duration-150 ease-out hover:bg-(--color-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <IconChevronRight size={16} stroke={1.8} aria-hidden />
        </button>

        <form
          className="ml-1 flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            submitJump();
          }}
        >
          <label htmlFor="jump-page" className="sr-only">
            Jump to page
          </label>
          <input
            id="jump-page"
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onBlur={submitJump}
            className="h-9 w-14 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 font-numeric text-sm text-(--color-foreground) transition-[border-color,box-shadow] duration-150 ease-out focus:border-(--color-accent) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
          />
          <span className="text-sm text-(--color-muted)">/ {totalPages}</span>
        </form>
      </div>
    </div>
  );
}

export { DEFAULT_PAGE_SIZE };
