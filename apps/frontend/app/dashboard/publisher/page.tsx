import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { AdSlotList } from './components/ad-slot-list';
import { AdSlotListSkeleton } from './components/ad-slot-list-skeleton';
import { AdSlotFormModal } from './components/ad-slot-form-modal';

export default async function PublisherDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'publisher' role. Data scoping is handled server-side by the
  // backend (it derives the publisher from the session).
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'publisher') {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Ad Slots</h1>
        <AdSlotFormModal triggerLabel="Create ad slot" />
      </div>

      {/* Shell renders immediately; the ad slot list streams in when ready. */}
      <Suspense fallback={<AdSlotListSkeleton />}>
        <AdSlotList />
      </Suspense>
    </div>
  );
}
