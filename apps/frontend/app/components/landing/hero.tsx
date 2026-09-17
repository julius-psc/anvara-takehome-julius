'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import heroImg from '@/app/assets/hero-img.jpg';
import heroImgPublisher from '@/app/assets/hero-img-2.jpg';
import { Reveal } from '@/app/components/reveal';
import type { Audience } from './content';
import { AUDIENCE_COPY, AUDIENCE_OPTIONS } from './content';
import { AudienceToggle } from './audience-toggle';
import { HeroCardStack } from './hero-card-stack';
import { HeroCopy } from './hero-copy';
import { LogoMarquee } from './logo-marquee';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const HERO_BG: Record<Audience, typeof heroImg> = {
  sponsor: heroImg,
  publisher: heroImgPublisher,
};

type LandingHeroProps = {
  audience: Audience;
  onAudienceChange: (audience: Audience) => void;
};

/** Full-viewport split hero — copy left, image + dashboard card stack right. */
export function LandingHero({ audience, onAudienceChange }: LandingHeroProps) {
  const reduceMotion = useReducedMotion();
  const copyTransition = reduceMotion
    ? { duration: 0.01, ease: EASE_OUT }
    : { duration: 0.2, ease: EASE_OUT };
  const mediaTransition = reduceMotion
    ? { duration: 0.01, ease: EASE_OUT }
    : { duration: 0.25, ease: EASE_OUT };

  return (
    <section
      aria-labelledby="landing-hero-title"
      className="grid min-h-dvh grid-cols-1 lg:grid-cols-2"
    >
      <div className="flex min-h-0 flex-col justify-center px-4 py-10 pt-24 sm:px-6 lg:px-12 lg:pt-10 xl:px-16">
        <div className="w-full max-w-lg">
          <Reveal>
            <AudienceToggle value={audience} onChange={onAudienceChange} />
          </Reveal>
          {/* Stack both audiences in one cell so height stays fixed when toggling. */}
          <div className="mt-5 grid">
            {AUDIENCE_OPTIONS.map(({ key }) => {
              const copy = AUDIENCE_COPY[key];
              const active = key === audience;
              return (
                <motion.div
                  key={key}
                  className="col-start-1 row-start-1"
                  initial={false}
                  animate={
                    reduceMotion
                      ? { opacity: active ? 1 : 0 }
                      : {
                          opacity: active ? 1 : 0,
                          transform: active ? 'translateY(0px)' : 'translateY(6px)',
                        }
                  }
                  transition={copyTransition}
                  style={{ pointerEvents: active ? 'auto' : 'none' }}
                  aria-hidden={!active}
                  inert={!active ? true : undefined}
                >
                  <Reveal delay={0.05}>
                    <p className="text-sm font-medium text-(--color-accent)">{copy.eyebrow}</p>
                  </Reveal>
                  <HeroCopy
                    copy={copy}
                    titleId={active ? 'landing-hero-title' : undefined}
                    asHeading={active}
                    className="mt-2"
                  />
                </motion.div>
              );
            })}
          </div>
          <Reveal delay={0.32}>
            <LogoMarquee />
          </Reveal>
        </div>
      </div>

      <div className="relative min-h-[52svh] lg:min-h-0">
        {/* Photo fades in once; audience swaps keep using opacity on the image layers only. */}
        <Reveal delay={0.1} className="absolute inset-0">
          {AUDIENCE_OPTIONS.map(({ key }) => {
            const active = key === audience;
            return (
              <motion.div
                key={key}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: active ? 1 : 0 }}
                transition={mediaTransition}
                style={{ pointerEvents: active ? 'auto' : 'none' }}
                aria-hidden={!active}
              >
                <Image
                  src={HERO_BG[key]}
                  alt="Abstract brand photography for the Anvara sponsorship marketplace"
                  fill
                  priority={key === 'sponsor'}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            );
          })}
          <div
            className="absolute inset-0 bg-linear-to-t from-black/55 via-black/25 to-black/10"
            aria-hidden
          />
        </Reveal>
        {/*
          Transform-only load-in — never opacity/filter on an ancestor of
          backdrop-blur cards (those isolate the frost and empty the backdrop).
          Audience swaps stay visibility-only for the same reason.
        */}
        <Reveal delay={0.35} transformOnly className="absolute inset-0">
          {AUDIENCE_OPTIONS.map(({ key }) => {
            const active = key === audience;
            return (
              <div
                key={key}
                className="absolute inset-0 flex items-center justify-center px-4 py-10 sm:px-8"
                style={{
                  visibility: active ? 'visible' : 'hidden',
                  pointerEvents: active ? 'auto' : 'none',
                }}
                aria-hidden={!active}
                inert={!active ? true : undefined}
              >
                <HeroCardStack audience={key} autoPlay={active} />
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
