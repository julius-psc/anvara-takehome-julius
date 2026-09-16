'use client';

import Image from 'next/image';
import { useState } from 'react';
import heroImg from '@/app/assets/hero-img.jpg';
import type { Audience } from './content';
import { AUDIENCE_COPY, AUDIENCE_OPTIONS } from './content';
import { AudienceToggle } from './audience-toggle';
import { HeroCopy } from './hero-copy';

/** Full-viewport split hero — copy left, image right. */
export function LandingHero() {
  const [audience, setAudience] = useState<Audience>('sponsor');

  return (
    <section
      aria-labelledby="landing-hero-title"
      className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2"
    >
      <div className="flex min-h-0 flex-col justify-center px-4 py-10 sm:px-6 lg:px-12 xl:px-16">
        <div className="w-full max-w-lg">
          <AudienceToggle value={audience} onChange={setAudience} />
          {/* Stack both audiences in one cell so height stays fixed when toggling. */}
          <div className="mt-5 grid">
            {AUDIENCE_OPTIONS.map(({ key }) => {
              const copy = AUDIENCE_COPY[key];
              const active = key === audience;
              return (
                <div
                  key={key}
                  className={`col-start-1 row-start-1 ${active ? 'visible' : 'invisible pointer-events-none'}`}
                  aria-hidden={!active}
                  inert={!active ? true : undefined}
                >
                  <p className="text-sm font-medium text-(--color-accent)">{copy.eyebrow}</p>
                  <HeroCopy
                    copy={copy}
                    titleId={active ? 'landing-hero-title' : undefined}
                    className="mt-2"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative min-h-[45svh] lg:min-h-0">
        <Image
          src={heroImg}
          alt="Sponsorship marketplace preview"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
