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

/**
 * Step 01 — Create your account.
 * A miniature of the real Sponsor/Publisher toggle: a cursor taps, the pill
 * slides to Sponsor, and a mini dashboard "unlocks" underneath.
 */
export function AccountIllustration({ playing }: StepIllustrationProps) {
  return (
    <div className={root('how-illu how-illu--account', playing)} aria-hidden>
      <div className="how-illu__toggle">
        <span className="how-illu__toggle-pill" />
        <span className="how-illu__toggle-opt how-illu__toggle-opt--sponsor">Sponsor</span>
        <span className="how-illu__toggle-opt how-illu__toggle-opt--publisher">Publisher</span>
      </div>

      <div className="how-illu__dash">
        <span className="how-illu__dash-avatar" />
        <span className="how-illu__dash-lines">
          <span className="how-illu__dash-line" />
          <span className="how-illu__dash-line how-illu__dash-line--short" />
        </span>
      </div>

      <svg className="how-illu__cursor" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 1.5 13 7l-4.6 1.4L6 13.5 2 1.5Z"
          fill="currentColor"
          stroke="var(--color-background)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Step 02 — List or browse inventory.
 * A mini marketplace: two real ad-slot rows (name + type badge + availability +
 * price) that populate, matching AdSlotCard.
 */
export function InventoryIllustration({ playing }: StepIllustrationProps) {
  return (
    <div className={root('how-illu how-illu--inventory', playing)} aria-hidden>
      <div className="how-illu__card how-illu__card--slot how-illu__card--1">
        <div className="how-illu__card-top">
          <span className="how-illu__card-name">Header Banner</span>
          <span className="how-illu__chip how-illu__chip--info">Display</span>
        </div>
        <div className="how-illu__card-bottom">
          <span className="how-illu__avail how-illu__avail--free">
            <span className="how-illu__dot how-illu__dot--free" />
            Available
          </span>
          <span className="how-illu__price">
            $2,400<small>/mo</small>
          </span>
        </div>
      </div>

      <div className="how-illu__card how-illu__card--slot how-illu__card--2">
        <div className="how-illu__card-top">
          <span className="how-illu__card-name">Newsletter</span>
          <span className="how-illu__chip how-illu__chip--warning">Newsletter</span>
        </div>
        <div className="how-illu__card-bottom">
          <span className="how-illu__avail how-illu__avail--free">
            <span className="how-illu__dot how-illu__dot--free" />
            Available
          </span>
          <span className="how-illu__price">
            $980<small>/mo</small>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 03 — Book and run campaigns.
 * A slot card whose status flips Available → Booked while the budget bar fills,
 * mirroring AdSlotCard's availability line and CampaignCard's progress bar.
 */
export function CampaignIllustration({ playing }: StepIllustrationProps) {
  return (
    <div className={root('how-illu how-illu--campaign', playing)} aria-hidden>
      <div className="how-illu__card how-illu__card--book">
        <div className="how-illu__card-top">
          <span className="how-illu__card-name">Header Banner</span>
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
        </div>

        <div className="how-illu__budget">
          <div className="how-illu__budget-row">
            <span className="how-illu__budget-spent">
              $1,680<small> spent</small>
            </span>
            <span className="how-illu__budget-total">of $2,400</span>
          </div>
          <div className="how-illu__bar">
            <span className="how-illu__bar-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}
