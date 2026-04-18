import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const SEO_FILE = path.join(process.cwd(), 'data', 'config', 'seo.json');

export interface PageSeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
}

export interface SeoConfig {
  global: {
    siteTitle?: string;
    siteDescription?: string;
    keywords?: string[];
  };
  pages: Record<string, PageSeoSettings>;
  updated_at: string;
}

export async function getSeoConfig(): Promise<SeoConfig> {
  try {
    const data = await readFile(SEO_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { global: {}, pages: {}, updated_at: new Date().toISOString() };
  }
}

export async function saveSeoConfig(config: SeoConfig): Promise<void> {
  const dir = path.dirname(SEO_FILE);
  await mkdir(dir, { recursive: true });
  config.updated_at = new Date().toISOString();
  await writeFile(SEO_FILE, JSON.stringify(config, null, 2));
}

// Pages available for SEO configuration
export const SEO_PAGES = [
  { slug: 'home', label: 'Home', path: '/' },
  { slug: 'services', label: 'Services', path: '/services' },
  { slug: 'injectables', label: 'Injectables & Regenerative', path: '/services/injectables' },
  { slug: 'hifu', label: 'HiFu', path: '/services/hifu' },
  { slug: 'radio-frequency', label: 'Radio Frequency', path: '/services/radio-frequency' },
  { slug: 'body-contouring', label: 'Body Contouring', path: '/services/body-contouring' },
  { slug: 'weight-loss', label: 'Weight Loss', path: '/weight-loss' },
  { slug: 'doctors', label: 'Our Doctors', path: '/doctors' },
  { slug: 'contact', label: 'Contact', path: '/contact' },
] as const;
