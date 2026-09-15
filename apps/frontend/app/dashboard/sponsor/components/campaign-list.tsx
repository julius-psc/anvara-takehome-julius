import { getSponsorCampaigns } from '@/lib/data';
import { CampaignCard } from './campaign-card';

// Async Server Component: fetches the sponsor's campaigns on the server.
// Rendered inside a <Suspense> boundary, so the `await` below is what streams
// in once the data resolves (the page shell renders immediately).
export async function CampaignList({ sponsorId }: { sponsorId: string }) {
  const campaigns = await getSponsorCampaigns(sponsorId);

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
        No campaigns yet. Create your first campaign to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
