'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { IconCalendar } from '@tabler/icons-react';
import type { AdSlot, Campaign } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { CAMPAIGN_STATUS_TONE, formatStatusLabel } from '@/lib/campaign-meta';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';
import type { Audience } from './content';
import { HERO_AD_SLOTS, HERO_CAMPAIGNS } from './hero-preview-data';

const GAP_PX = 8;
const COLLAPSED_H = 44;
const RADIUS_COLLAPSED = 12;
const RADIUS_EXPANDED = 16;
const CLOSE_MS = 500;
const CLOSE_BUFFER_MS = 50;
/** Dwell on an open row before auto-advancing — marketing explanation, not UI chrome. */
const AUTO_ADVANCE_MS = 4500;

/** Soft “breathe open” — not the same curve as close. */
const OPEN_TRANSITION = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;
/** Snappy close — bounce 0 so the next open isn’t fighting it. */
const CLOSE_TRANSITION = { type: 'spring', duration: 0.5, bounce: 0 } as const;
/** Siblings only translate. */
const SIBLING_TRANSITION = { type: 'spring', duration: 0.5, bounce: 0 } as const;

const SHELL =
  'relative w-full overflow-hidden border border-(--color-border)/60 bg-(--color-background)/65 shadow-(--shadow-sm) backdrop-blur-xl backdrop-saturate-150';

type HeroCardStackProps = {
  audience: Audience;
  className?: string;
  /** When false (hidden audience layer), skip auto-advance timers. */
  autoPlay?: boolean;
};

type AccordionItem = {
  id: string;
  collapsedLabel: string;
  collapsedValue: string;
  collapsedBadge: ReactNode;
  expanded: ReactNode;
};

/** Accordion stack — in-place height morph, serialized open/close, sibling layout slide. */
export function HeroCardStack({
  audience,
  className = '',
  autoPlay = true,
}: HeroCardStackProps) {
  const reduceMotion = useReducedMotion();
  const items = buildItems(audience);
  const itemIdsKey = items.map((item) => item.id).join('|');
  const [activeId, setActiveId] = useState<string | null>(() => items[0]?.id ?? null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [collapsingId, setCollapsingId] = useState<string | null>(null);
  const [expandingId, setExpandingId] = useState<string | null>(() => items[0]?.id ?? null);
  const [paused, setPaused] = useState(false);

  // Collapse-complete → then expand pending (never simultaneous).
  useEffect(() => {
    if (!collapsingId) return;
    const wait = reduceMotion ? 80 : CLOSE_MS + CLOSE_BUFFER_MS;
    const id = window.setTimeout(() => {
      setCollapsingId(null);
      if (pendingId) {
        setActiveId(pendingId);
        setExpandingId(pendingId);
        setPendingId(null);
      }
    }, wait);
    return () => window.clearTimeout(id);
  }, [collapsingId, pendingId, reduceMotion]);

  // Clear isExpanding after open settles.
  useEffect(() => {
    if (!expandingId || expandingId !== activeId) return;
    const wait = reduceMotion ? 80 : 700;
    const id = window.setTimeout(() => setExpandingId(null), wait);
    return () => window.clearTimeout(id);
  }, [expandingId, activeId, reduceMotion]);

  const inFlight = collapsingId !== null || pendingId !== null;

  const select = (id: string) => {
    if (inFlight) return;
    if (id === activeId) return;
    if (!activeId) {
      setActiveId(id);
      setExpandingId(id);
      return;
    }
    setPendingId(id);
    setCollapsingId(activeId);
    setActiveId(null);
  };

  // Keep the latest `select` in a ref so the auto-cycle timer always calls the
  // current closure without listing `select` as a dependency (which would reset
  // the timer every render). Writing the ref in an effect, not during render.
  const selectRef = useRef(select);
  useEffect(() => {
    selectRef.current = select;
  });

  // Auto-cycle rows after dwell — pause on hover / mid-morph; restart after manual select.
  useEffect(() => {
    if (!autoPlay || paused || inFlight || expandingId || !activeId || items.length < 2) return;
    const ids = itemIdsKey.split('|');
    const id = window.setTimeout(() => {
      const idx = ids.indexOf(activeId);
      if (idx < 0) return;
      selectRef.current(ids[(idx + 1) % ids.length]!);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [autoPlay, paused, inFlight, expandingId, activeId, itemIdsKey, items.length]);

  const label = audience === 'sponsor' ? 'Campaign preview' : 'Ad slot preview';

  return (
    <div
      className={`flex w-full max-w-[26rem] flex-col justify-center ${className}`}
      style={{ gap: GAP_PX }}
      aria-label={label}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setPaused(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setPaused(false);
      }}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        const isCollapsing = collapsingId === item.id;
        const isExpanding = expandingId === item.id && isActive;
        const idleCollapsed = !isActive && !isCollapsing;

        return (
          <motion.div
            key={item.id}
            layout="position"
            transition={reduceMotion ? { duration: 0.01 } : SIBLING_TRANSITION}
          >
            <AccordionSquare
              item={item}
              isActive={isActive}
              isExpanding={isExpanding}
              isCollapsing={isCollapsing}
              idleCollapsed={idleCollapsed}
              reduceMotion={!!reduceMotion}
              onSelect={() => select(item.id)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function AccordionSquare({
  item,
  isActive,
  isExpanding,
  isCollapsing,
  idleCollapsed,
  reduceMotion,
  onSelect,
}: {
  item: AccordionItem;
  isActive: boolean;
  isExpanding: boolean;
  isCollapsing: boolean;
  idleCollapsed: boolean;
  reduceMotion: boolean;
  onSelect: () => void;
}) {
  const useCollapsedHeight = isCollapsing || idleCollapsed;
  const heightTarget = useCollapsedHeight ? COLLAPSED_H : 'auto';
  const radiusTarget = useCollapsedHeight ? RADIUS_COLLAPSED : RADIUS_EXPANDED;
  const heightTransition = reduceMotion
    ? { duration: 0.01 }
    : useCollapsedHeight
      ? CLOSE_TRANSITION
      : OPEN_TRANSITION;

  // Summary layer: on while idle-collapsed or mid-collapse; off while expanded.
  const showCollapsedOverlay = idleCollapsed || isCollapsing;
  // Detail layer: on while active; kill immediately when collapsing / idle (no squash).
  const showExpandedBody = isActive && !isCollapsing;

  const collapsedOpacityTransition = reduceMotion
    ? { duration: 0.01 }
    : showCollapsedOverlay
      ? { duration: 0.25, delay: 0.15, ease: [0.23, 1, 0.32, 1] as const }
      : { duration: 0.1, ease: 'easeIn' as const };

  const expandedOpacityTransition = reduceMotion
    ? { duration: 0.01 }
    : showExpandedBody
      ? { duration: 0.2, delay: isExpanding ? 0.05 : 0, ease: [0.23, 1, 0.32, 1] as const }
      : { duration: 0.08, ease: 'easeIn' as const };

  return (
    <motion.button
      type="button"
      className={`${SHELL} block cursor-pointer text-left`}
      initial={false}
      animate={{
        height: heightTarget,
        borderRadius: radiusTarget,
      }}
      transition={heightTransition}
      onClick={onSelect}
      aria-expanded={isActive}
    >
      {/* Expanded body — normal flow, drives height: auto */}
      <motion.div
        initial={false}
        animate={{ opacity: showExpandedBody ? 1 : 0 }}
        transition={expandedOpacityTransition}
        className="px-5 py-6"
        style={{ pointerEvents: showExpandedBody && !isExpanding ? 'auto' : 'none' }}
        aria-hidden={!showExpandedBody}
      >
        {item.expanded}
      </motion.div>

      {/* Collapsed overlay — same box, absolute */}
      <motion.div
        initial={false}
        animate={{ opacity: showCollapsedOverlay ? 1 : 0 }}
        transition={collapsedOpacityTransition}
        className="pointer-events-none absolute inset-0 flex items-center justify-between gap-3 px-4"
        aria-hidden={!showCollapsedOverlay}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-sm font-medium text-(--color-foreground)">
            {item.collapsedLabel}
          </span>
          {item.collapsedBadge}
        </span>
        <span className="shrink-0 font-numeric text-sm text-(--color-muted)">
          {item.collapsedValue}
        </span>
      </motion.div>
    </motion.button>
  );
}

function buildItems(audience: Audience): AccordionItem[] {
  if (audience === 'sponsor') {
    return HERO_CAMPAIGNS.map((c) => ({
      id: c.id,
      collapsedLabel: c.name,
      collapsedValue: `$${Number(c.spent).toLocaleString('en-US')}`,
      collapsedBadge: (
        <Badge variant="solid" tone={CAMPAIGN_STATUS_TONE[c.status] ?? 'neutral'}>
          {formatStatusLabel(c.status)}
        </Badge>
      ),
      expanded: <CampaignExpanded campaign={c} />,
    }));
  }
  return HERO_AD_SLOTS.map((s) => {
    const meta = AD_SLOT_TYPE_META[s.type];
    const TypeIcon = meta?.icon;
    return {
      id: s.id,
      collapsedLabel: s.name,
      collapsedValue: `$${Number(s.basePrice).toLocaleString('en-US')}`,
      collapsedBadge: (
        <Badge variant="solid" tone={meta?.tone ?? 'neutral'}>
          {TypeIcon ? <TypeIcon size={13} stroke={1.8} /> : null}
          {meta?.label ?? s.type}
        </Badge>
      ),
      expanded: <SlotExpanded adSlot={s} />,
    };
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CampaignExpanded({ campaign }: { campaign: Campaign }) {
  const budget = Number(campaign.budget);
  const spent = Number(campaign.spent);
  const spendPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-base font-medium text-(--color-foreground)">{campaign.name}</p>
        <Badge variant="solid" tone={CAMPAIGN_STATUS_TONE[campaign.status] ?? 'neutral'}>
          {formatStatusLabel(campaign.status)}
        </Badge>
      </div>
      {campaign.description ? (
        <p className="text-pretty text-sm text-(--color-muted)">{campaign.description}</p>
      ) : null}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-numeric text-lg font-semibold text-(--color-foreground)">
            ${spent.toLocaleString('en-US')}
            <span className="ml-1.5 text-sm font-normal text-(--color-muted)">spent</span>
          </span>
          <span className="font-numeric text-xs text-(--color-muted)">
            of ${budget.toLocaleString('en-US')}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-(--color-border)">
          <div
            className="progress-fill h-full w-full rounded-full bg-(--color-accent)"
            style={{ transform: `scaleX(${Math.max(0, Math.min(spendPct / 100, 1))})` }}
          />
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 font-numeric text-sm text-(--color-muted)">
        <IconCalendar size={14} stroke={1.5} aria-hidden />
        {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
      </span>
    </div>
  );
}

function SlotExpanded({ adSlot }: { adSlot: AdSlot }) {
  const meta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = meta?.icon;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-base font-medium text-(--color-foreground)">{adSlot.name}</p>
        <Badge variant="solid" tone={meta?.tone ?? 'neutral'}>
          {TypeIcon ? <TypeIcon size={13} stroke={1.8} /> : null}
          {meta?.label ?? adSlot.type}
        </Badge>
      </div>
      {adSlot.description ? (
        <p className="text-pretty text-sm text-(--color-muted)">{adSlot.description}</p>
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${adSlot.isAvailable ? 'bg-(--color-success)' : 'bg-(--color-subtle)'}`}
          />
          <span className={adSlot.isAvailable ? 'text-(--color-success)' : 'text-(--color-muted)'}>
            {adSlot.isAvailable ? 'Available' : 'Booked'}
          </span>
        </span>
        <span className="font-numeric text-lg font-semibold text-(--color-foreground)">
          ${Number(adSlot.basePrice).toLocaleString('en-US')}
          <span className="text-sm font-normal text-(--color-muted)">/mo</span>
        </span>
      </div>
    </div>
  );
}
