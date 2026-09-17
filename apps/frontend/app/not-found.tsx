import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-numeric text-sm font-medium text-(--color-accent)">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-foreground) text-balance sm:text-4xl">
        This page doesn&rsquo;t exist
      </h1>
      <p className="mt-3 max-w-md text-pretty text-base leading-relaxed text-(--color-muted)">
        The page you&rsquo;re looking for may have moved, or the link might be broken. Let&rsquo;s
        get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold">
          Back to home
        </Link>
        <Link
          href="/marketplace"
          className="rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-2.5 text-sm font-medium text-(--color-foreground) transition-colors duration-150 ease-out hover:bg-(--color-surface-hover)"
        >
          Browse marketplace
        </Link>
      </div>
    </div>
  );
}
