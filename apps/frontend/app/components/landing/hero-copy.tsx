import Link from 'next/link';
import type { AudienceCopy } from './content';

export function HeroCopy({
  copy,
  titleId,
  className = '',
}: {
  copy: AudienceCopy;
  titleId?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h1
        id={titleId}
        className="text-3xl font-semibold tracking-tight text-(--color-foreground) text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
      >
        {copy.title}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-(--color-muted) text-pretty sm:text-[17px]">
        {copy.subtext}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href={copy.primaryCta.href}
          className="btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold"
        >
          {copy.primaryCta.label}
        </Link>
        <Link
          href={copy.secondaryCta.href}
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-5 py-2.5 text-sm font-medium text-(--color-foreground) transition-colors hover:bg-(--color-surface-hover)"
        >
          {copy.secondaryCta.label}
        </Link>
      </div>
    </div>
  );
}
