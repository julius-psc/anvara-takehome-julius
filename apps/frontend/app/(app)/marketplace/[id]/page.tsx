import type { Metadata } from 'next';
import { getMarketplaceAdSlot } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { AdSlotDetail } from './components/ad-slot-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const adSlot = await getMarketplaceAdSlot(id);

  if (!adSlot) {
    return {
      title: 'Ad slot not found',
      robots: { index: false, follow: false },
    };
  }

  const publisher = adSlot.publisher?.name;
  const description =
    adSlot.description?.trim() ||
    `${adSlot.type.toLowerCase()} placement${publisher ? ` from ${publisher}` : ''} — ${formatPrice(adSlot.basePrice)}.`;

  const title = adSlot.name;
  const url = `/marketplace/${adSlot.id}`;

  return {
    title,
    description,
    openGraph: {
      title: `${adSlot.name} · Anvara`,
      description,
      type: 'website',
      url,
    },
    twitter: {
      card: 'summary',
      title: `${adSlot.name} · Anvara`,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function AdSlotPage({ params }: Props) {
  const { id } = await params;

  return <AdSlotDetail id={id} />;
}
