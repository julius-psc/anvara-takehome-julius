import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { CampaignList } from './components/campaign-list';
import { CampaignListSkeleton } from './components/campaign-list-skeleton';
import { CampaignFormModal } from './components/campaign-form-modal';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <CampaignFormModal triggerLabel="Create campaign" />
      </div>

      {/* Shell renders immediately; the campaign list streams in when ready. */}
      <Suspense fallback={<CampaignListSkeleton />}>
        <CampaignList />
      </Suspense>
    </div>
  );
}
