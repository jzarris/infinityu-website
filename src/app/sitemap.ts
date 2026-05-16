import { MetadataRoute } from 'next';
import { BUSINESS } from '@/lib/constants';
import { serviceCategories } from '@/data/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BUSINESS.url;

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/weight-loss`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/doctors`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/sms-policy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  const servicePages = serviceCategories.map((category) => ({
    url: `${baseUrl}/services/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages];
}
