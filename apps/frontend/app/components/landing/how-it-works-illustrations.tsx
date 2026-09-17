import type { Audience } from './content';

type StepIllustrationProps = {
  /**
   * Only the in-view, active step animates. When false the miniature rests on
   * its finished frame so it still reads as a real screenshot, not a blank.
   */
  playing: boolean;
};

function root(base: string, playing: boolean) {
  return playing ? `${base} how-illu--playing` : base;
}

function MiniCursor() {
  return (
    <svg className="how-illu__cursor" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 1.5 13 7l-4.6 1.4L6 13.5 2 1.5Z"
        fill="currentColor"
        stroke="var(--color-background)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RoleToggle() {
  return (
    <div className="how-illu__toggle">
      <span className="how-illu__toggle-pill" />
      <span className="how-illu__toggle-opt how-illu__toggle-opt--sponsor">
        <svg className="how-illu__icon how-illu__icon--sponsor" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="5.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6 5.5V4.25a2 2 0 0 1 4 0V5.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Sponsor
      </span>
      <span className="how-illu__toggle-opt how-illu__toggle-opt--publisher">
        <svg className="how-illu__icon how-illu__icon--publisher" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 13.5V6.5L8 3.5l5 3V13.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M6.5 13.5v-3.5h3v3.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Publisher
      </span>
      <MiniCursor />
    </div>
  );
}

/**
 * Step 01 — Sign in as this audience.
 * Login role toggle (matches /login) → the matching dashboard unlocks.
 */
function AccountIllustration({ playing, audience }: StepIllustrationProps & { audience: Audience }) {
  const isSponsor = audience === 'sponsor';

  return (
    <div
      className={root(
        `how-illu how-illu--account how-illu--role-${audience}`,
        playing,
      )}
    >
      <p className="how-illu__kicker">Continue as</p>
      <RoleToggle />
      <div className="how-illu__dash">
        <p className="how-illu__dash-title">{isSponsor ? 'My campaigns' : 'My ad slots'}</p>
        <div className="how-illu__dash-row">
          <span className="how-illu__card-name">
            {isSponsor ? 'Q1 Product Launch' : 'Header Banner'}
          </span>
          {isSponsor ? (
            <span className="how-illu__chip how-illu__chip--success">Active</span>
          ) : (
            <span className="how-illu__avail how-illu__avail--free">
              <span className="how-illu__dot how-illu__dot--free" />
              Available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Sponsor step 02 — Browse inventory.
 * Two marketplace rows: pick the available Header Banner, leave the booked one dimmed.
 */
function BrowseIllustration({ playing }: StepIllustrationProps) {
  return (
    <div className={root('how-illu how-illu--browse', playing)}>
      <div className="how-illu__card how-illu__card--pick">
        <div className="how-illu__card-top">
          <span className="how-illu__card-name">Header Banner</span>
          <span className="how-illu__chip how-illu__chip--info">Display</span>
        </div>
        <p className="how-illu__by">by Dev Blog Daily</p>
        <div className="how-illu__card-bottom">
          <span className="how-illu__avail how-illu__avail--free">
            <span className="how-illu__dot how-illu__dot--free" />
            Available
          </span>
          <span className="how-illu__price">
            $500<small>/mo</small>
          </span>
        </div>
        <MiniCursor />
      </div>
      <div className="how-illu__card how-illu__card--dim">
        <div className="how-illu__card-top">
          <span className="how-illu__card-name">Featured Sponsor</span>
          <span className="how-illu__chip how-illu__chip--warning">Newsletter</span>
        </div>
        <div className="how-illu__card-bottom">
          <span className="how-illu__avail how-illu__avail--booked">
            <span className="how-illu__dot how-illu__dot--booked" />
            Booked
          </span>
          <span className="how-illu__price">
            $800<small>/mo</small>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Sponsor step 03 — Book the placement.
 * Detail card + primary CTA, then the real success state and Booked status.
 */
function BookIllustration({ playing }: StepIllustrationProps) {
  return (
    <div className={root('how-illu how-illu--book', playing)}>
      <div className="how-illu__card">
        <div className="how-illu__card-top">
          <span className="how-illu__card-name">Header Banner</span>
          <span className="how-illu__chip how-illu__chip--info">Display</span>
        </div>
        <div className="how-illu__card-bottom">
          <span className="how-illu__status">
            <span className="how-illu__avail how-illu__avail--free">
              <span className="how-illu__dot how-illu__dot--free" />
              Available
            </span>
            <span className="how-illu__avail how-illu__avail--booked">
              <span className="how-illu__dot how-illu__dot--booked" />
              Booked
            </span>
          </span>
          <span className="how-illu__price">
            $500<small>/mo</small>
          </span>
        </div>
        <div className="how-illu__action">
          <span className="how-illu__btn">Book this placement</span>
          <span className="how-illu__success">
            <span className="how-illu__success-title">Placement booked</span>
            <span className="how-illu__success-copy">Request sent to publisher</span>
          </span>
          <MiniCursor />
        </div>
      </div>
    </div>
  );
}

/**
 * Publisher step 02 — List a slot.
 * Mini create-ad-slot form fills in, then becomes the live listing card.
 */
function ListIllustration({ playing }: StepIllustrationProps) {
  return (
    <div className={root('how-illu how-illu--list', playing)}>
      <div className="how-illu__form">
        <div className="how-illu__field">
          <span className="how-illu__label">Name</span>
          <span className="how-illu__input">
            <span className="how-illu__typed">Header Banner</span>
            <span className="how-illu__caret" />
          </span>
        </div>
        <div className="how-illu__field-row">
          <span className="how-illu__type how-illu__type--selected">Display</span>
          <span className="how-illu__type">Video</span>
          <span className="how-illu__type">Native</span>
        </div>
        <div className="how-illu__field-row how-illu__field-row--submit">
          <span className="how-illu__input how-illu__input--price">$500</span>
          <span className="how-illu__btn">Create ad slot</span>
        </div>
      </div>
      <div className="how-illu__card how-illu__card--listed">
        <div className="how-illu__card-top">
          <span className="how-illu__card-name">Header Banner</span>
          <span className="how-illu__chip how-illu__chip--info">Display</span>
        </div>
        <p className="how-illu__by">Listed in the marketplace</p>
        <div className="how-illu__card-bottom">
          <span className="how-illu__avail how-illu__avail--free">
            <span className="how-illu__dot how-illu__dot--free" />
            Available
          </span>
          <span className="how-illu__price">
            $500<small>/mo</small>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Publisher step 03 — Get booked.
 * Own slot sits Available; an inbound request arrives; status flips to Booked.
 */
function InboundIllustration({ playing }: StepIllustrationProps) {
  return (
    <div className={root('how-illu how-illu--inbound', playing)}>
      <div className="how-illu__card">
        <div className="how-illu__card-top">
          <span className="how-illu__card-name">Header Banner</span>
          <span className="how-illu__chip how-illu__chip--info">Display</span>
        </div>
        <div className="how-illu__card-bottom">
          <span className="how-illu__status">
            <span className="how-illu__avail how-illu__avail--free">
              <span className="how-illu__dot how-illu__dot--free" />
              Available
            </span>
            <span className="how-illu__avail how-illu__avail--booked">
              <span className="how-illu__dot how-illu__dot--booked" />
              Booked
            </span>
          </span>
          <span className="how-illu__price">
            $500<small>/mo</small>
          </span>
        </div>
      </div>
      <div className="how-illu__request">
        <span className="how-illu__chip how-illu__chip--info">Request</span>
        <span className="how-illu__request-copy">
          <span className="how-illu__card-name">Q1 Product Launch</span>
          <span className="how-illu__by">wants this slot</span>
        </span>
      </div>
    </div>
  );
}

export function HowStepIllustration({
  audience,
  step,
  playing,
}: {
  audience: Audience;
  step: number;
  playing: boolean;
}) {
  if (step === 0) return <AccountIllustration playing={playing} audience={audience} />;
  if (audience === 'sponsor') {
    if (step === 1) return <BrowseIllustration playing={playing} />;
    return <BookIllustration playing={playing} />;
  }
  if (step === 1) return <ListIllustration playing={playing} />;
  return <InboundIllustration playing={playing} />;
}
