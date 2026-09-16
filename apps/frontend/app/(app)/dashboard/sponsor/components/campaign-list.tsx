import { getSponsorCampaigns } from '@/lib/data';
import { CampaignBrowser } from './campaign-browser';
import { CampaignFormModal } from './campaign-form-modal';

// Async Server Component: fetches the sponsor's campaigns on the server.
// Rendered inside a <Suspense> boundary, so the `await` below is what streams
// in once the data resolves (the page shell renders immediately).
export async function CampaignList() {
  const campaigns = await getSponsorCampaigns();

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-16 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-(--color-surface-hover) text-(--color-muted)">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-medium">No campaigns yet</h3>
        <p className="mx-auto mt-1 max-w-sm text-pretty text-sm text-(--color-muted)">
          Create your first campaign to start reaching publishers across the marketplace.
        </p>
        <div className="mt-5 flex justify-center">
          <CampaignFormModal triggerLabel="Create campaign" />
        </div>
      </div>
    );
  }

  return <CampaignBrowser campaigns={campaigns} />;
}
