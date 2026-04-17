import { MetadataRoute } from 'next';
import { BUSINESS } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${BUSINESS.url}/sitemap.xml`,
  };
}
