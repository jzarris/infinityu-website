import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Financing | InfinityU Med Spa — Flexible Payment Plans',
  description:
    'Apply for patient financing through Cherry. Check your eligibility in seconds with no hard credit pull — then book your treatment at InfinityU Med Spa in Huntington Beach.',
};

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Check your eligibility',
    body: 'Visit the Cherry portal and apply in under a minute. Checking your options uses a soft credit pull and will not affect your credit score.',
  },
  {
    step: '02',
    title: 'Choose your plan',
    body: 'Select from multiple payment plans — including 0% APR options — with terms ranging from 3 to 24 months.',
  },
  {
    step: '03',
    title: 'Book your treatment',
    body: 'Once approved, contact us or book online. Let us know you\'re using Cherry financing and we\'ll take it from there.',
  },
];

const ELIGIBLE_TREATMENTS = [
  { name: 'Hair Restoration', href: '/services/hair-restoration' },
  { name: 'PRP Therapy', href: '/services/hair-restoration/prp' },
  { name: 'Exosome Therapy', href: '/services/hair-restoration/exosome' },
  { name: 'Hair Transplant (FUE)', href: '/services/hair-restoration/transplant' },
  { name: 'Body Contouring', href: '/services/body-contouring' },
  { name: 'HIFU', href: '/services/hifu' },
  { name: 'Hormone & Wellness', href: '/services/hormone-wellness' },
  { name: 'Medical Weight Loss', href: '/weight-loss' },
];

const FAQ = [
  {
    q: 'What is Cherry?',
    a: 'Cherry is a patient financing platform built for medical and aesthetic practices. It lets you split the cost of your treatment into manageable monthly payments, with options including 0% APR plans. Cherry is not a credit card — it\'s a simple installment plan.',
  },
  {
    q: 'Will applying affect my credit score?',
    a: 'Checking your eligibility uses a soft credit pull, which does not affect your credit score. A hard pull only occurs if you proceed with a loan and accept an offer.',
  },
  {
    q: 'What if I\'m not approved?',
    a: 'Not everyone qualifies for every plan, but Cherry offers multiple options at different credit tiers. If financing is not available to you, you are still welcome to pay at the time of service. Contact us and we will work with you.',
  },
  {
    q: 'Which treatments qualify for financing?',
    a: 'Cherry financing can be applied to any service at InfinityU — including combinations of treatments. We highlight it on our higher-investment services because that\'s where it\'s most useful, but there\'s no restriction on using it for any appointment.',
  },
];

export default function FinancingPage() {
  return (
    <>
      {/* Hero */}
      <Section background="white" className="pt-16 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-4">Patient Financing</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Flexible financing for every treatment.
          </h1>
          <p className="text-text-muted text-lg mb-8 max-w-xl mx-auto">
            InfinityU partners with Cherry to offer simple, transparent payment plans for our higher-investment services. Apply in seconds — no hard credit pull to check your eligibility.
          </p>
          <a
            href={BUSINESS.cherryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity text-base"
          >
            Check Your Options →
          </a>
        </div>
      </Section>

      {/* How it works */}
      <Section background="surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <span className="inline-block text-xs font-semibold text-accent tracking-widest mb-3">{step}</span>
                <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Eligible treatments */}
      <Section background="white">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-3">Eligible treatments</h2>
          <p className="text-text-muted text-center mb-8">Financing is available for the following services at InfinityU:</p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {ELIGIBLE_TREATMENTS.map(({ name, href }) => (
              <li key={name}>
                <Link
                  href={href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent hover:bg-surface transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="font-medium text-sm group-hover:text-accent transition-colors">{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* FAQ */}
      <Section background="surface">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-8">Common questions</h2>
          <div className="space-y-1">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group border-b border-border py-5 first:border-t">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-medium text-sm md:text-base select-none">
                  {q}
                  <span className="text-accent text-xl leading-none shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-text-muted text-sm leading-relaxed mt-3 max-w-prose">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* Bottom CTA */}
      <Section background="white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-text-muted mb-8">
            Check your eligibility now, then book your consultation. Cherry financing takes minutes to apply and won&apos;t impact your credit score to check.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={BUSINESS.cherryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-7 py-3 rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Check Your Options →
            </a>
            {BUSINESS.bookingUrl && (
              <Button href={BUSINESS.bookingUrl} variant="outline">
                Book a Consultation
              </Button>
            )}
          </div>
          <p className="text-xs text-text-muted mt-6">
            Financing is provided by Cherry Technologies, Inc. and is subject to credit approval. InfinityU Med Spa does not make credit decisions.
          </p>
        </div>
      </Section>
    </>
  );
}
