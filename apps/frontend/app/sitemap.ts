import type { MetadataRoute } from 'next';

const siteUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3847';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

type PublicAdSlot = { id: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  try {
    const res = await fetch(`${API_URL}/api/ad-slots`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return staticRoutes;

    const slots = (await res.json()) as PublicAdSlot[];
    const slotRoutes: MetadataRoute.Sitemap = slots.map((slot) => ({
      url: `${siteUrl}/marketplace/${slot.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    return [...staticRoutes, ...slotRoutes];
  } catch {
    return staticRoutes;
  }
}
