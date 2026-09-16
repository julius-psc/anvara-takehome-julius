import type { MetadataRoute } from 'next';

const siteUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3847';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
