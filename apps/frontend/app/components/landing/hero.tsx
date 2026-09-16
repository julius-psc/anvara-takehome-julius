'use client';

import Image from 'next/image';
import { useState } from 'react';
import heroImg from '@/app/assets/hero-img.jpg';
import heroImgPublisher from '@/app/assets/hero-img-2.jpg';
import type { Audience } from './content';
import { AUDIENCE_COPY, AUDIENCE_OPTIONS } from './content';
import { AudienceToggle } from './audience-toggle';
import { HeroCardStack } from './hero-card-stack';
import { HeroCopy } from './hero-copy';

const HERO_BG: Record<Audience, typeof heroImg> = {
  sponsor: heroImg,
  publisher: heroImgPublisher,
};

/** Full-viewport split hero — copy left, image + dashboard card stack right. */
export function LandingHero() {
  const [audience, setAudience] = useState<Audience>('sponsor');

  return (
    <section
      aria-labelledby="landing-hero-title"
      className="grid min-h-dvh grid-cols-1 lg:grid-cols-2"
    >
      <div className="flex min-h-0 flex-col justify-center px-4 py-10 pt-24 sm:px-6 lg:px-12 lg:pt-10 xl:px-16">
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
                    asHeading={active}
                    className="mt-2"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative min-h-[52svh] lg:min-h-0">
        <Image
          key={audience}
          src={HERO_BG[audience]}
          alt="Abstract brand photography for the Anvara sponsorship marketplace"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/55 via-black/25 to-black/10"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center px-4 py-10 sm:px-8">
          <HeroCardStack key={audience} audience={audience} />
        </div>
      </div>
    </section>
  );
}
