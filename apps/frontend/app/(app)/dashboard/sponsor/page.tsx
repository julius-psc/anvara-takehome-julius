import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { CampaignList } from './components/campaign-list';
import { CampaignListSkeleton } from './components/campaign-list-skeleton';
import { CampaignFormModal } from './components/campaign-form-modal';

export const metadata: Metadata = {
  title: 'Campaigns',
  description: 'Manage your sponsorship campaigns on Anvara.',
  robots: { index: false, follow: false },
};

export default async function SponsorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'sponsor' role. Data scoping is handled server-side by the
  // backend (it derives the sponsor from the session), so we don't pass an id.
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'sponsor') {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-0.5 text-sm text-(--color-muted)">Manage your sponsorship campaigns.</p>
        </div>
        <CampaignFormModal triggerLabel="Create campaign" />
      </div>

      {/* Shell renders immediately; the campaign list streams in when ready. */}
      <Suspense fallback={<CampaignListSkeleton />}>
        <CampaignList />
      </Suspense>
    </div>
  );
}
