import { Metadata } from 'next';
import { BUSINESS } from './constants';

export function generateSiteMetadata(): Metadata {
  return {
    title: {
      default: `${BUSINESS.legalName} | ${BUSINESS.address.city}, ${BUSINESS.address.state}`,
      template: `%s | ${BUSINESS.legalName}`,
    },
    description: BUSINESS.description,
    keywords: [
      'med spa',
      'medical spa',
      'Huntington Beach',
      'Botox',
      'HiFu',
      'body contouring',
      'weight loss',
      'PRP',
      'radio frequency',
      'aesthetic treatments',
      'injectables',
      'Sculptra',
      'microneedling',
    ],
    authors: [{ name: BUSINESS.legalName }],
    metadataBase: new URL(BUSINESS.url),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: BUSINESS.url,
      siteName: BUSINESS.legalName,
      title: `${BUSINESS.legalName} | ${BUSINESS.address.city}, ${BUSINESS.address.state}`,
      description: BUSINESS.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${BUSINESS.legalName} | ${BUSINESS.address.city}, ${BUSINESS.address.state}`,
      description: BUSINESS.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateLocalBusinessSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: BUSINESS.legalName,
    description: BUSINESS.description,
    url: BUSINESS.url,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      postalCode: BUSINESS.address.zip,
      addressCountry: BUSINESS.address.country,
    },
    openingHours: BUSINESS.hours.structured,
    medicalSpecialty: [
      'Dermatology',
      'PlasticSurgery',
    ],
  };

  return JSON.stringify(schema);
}

export function generatePageMetadata(
  title: string,
  description?: string,
  options?: {
    image?: string;
    noIndex?: boolean;
    canonical?: string;
  }
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: options?.image ? [{ url: options.image }] : undefined,
    },
    twitter: {
      title,
      description,
      images: options?.image ? [options.image] : undefined,
    },
    robots: options?.noIndex ? { index: false, follow: false } : undefined,
    alternates: options?.canonical ? { canonical: options.canonical } : undefined,
  };
}
