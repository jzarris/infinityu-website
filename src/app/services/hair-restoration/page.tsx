import { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { ServiceHero } from '@/components/services/ServiceHero';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { FAQSection } from '@/components/services/FAQSection';
import { TreatmentCard } from '@/components/services/TreatmentCard';
import { getCategoryInfo, getTreatmentsByCategory } from '@/data/services';
import { generatePageMetadata } from '@/lib/seo';
import { SERVICE_HERO_IMAGES } from '@/lib/media';
import { BUSINESS } from '@/lib/constants';
import { Check, Clock, Zap, Leaf, Scissors, ChevronRight, Star, Shield, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const category = getCategoryInfo('hair-restoration')!;

export const metadata: Metadata = generatePageMetadata(
  category.metaTitle,
  category.metaDescription
);

const TREATMENT_HIGHLIGHTS = [
  {
    slug: 'prp-hair-restoration',
    icon: Droplets,
    badge: 'Non-Surgical',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    tagline: 'Best for early-to-moderate thinning',
    headline: 'PRP Hair Restoration',
    hook: 'Your body\'s own growth factors — concentrated and activated to reverse thinning before it becomes hair loss.',
    idealFor: ['Early-stage thinning or shedding', 'Preventing further hair loss', 'Strengthening existing hair', 'Post-transplant maintenance'],
    stats: [{ label: 'Duration', value: '45–60 min' }, { label: 'Downtime', value: 'None' }, { label: 'Sessions', value: '3–4 to start' }],
    cta: 'Ideal starting treatment',
  },
  {
    slug: 'exosome-hair-restoration',
    icon: Zap,
    badge: 'Non-Surgical · Advanced',
    badgeColor: 'bg-violet-100 text-violet-700',
    tagline: 'Best for moderate-to-advanced thinning',
    headline: 'Exosome Hair Restoration',
    hook: 'Up to 100× more growth factors than PRP. The most potent non-surgical option available for meaningful density restoration.',
    idealFor: ['Moderate-to-advanced thinning', 'Plateaued PRP results', 'Maximum non-surgical potency', 'Post-transplant graft support'],
    stats: [{ label: 'Duration', value: '30–45 min' }, { label: 'Downtime', value: 'Minimal' }, { label: 'Sessions', value: '2–3 to start' }],
    cta: 'Most potent non-surgical option',
  },
  {
    slug: 'hair-transplant',
    icon: Scissors,
    badge: 'Surgical · Permanent',
    badgeColor: 'bg-amber-100 text-amber-700',
    tagline: 'Best for significant or patterned loss',
    headline: 'Hair Transplant (FUE)',
    hook: 'Permanent results from a single procedure. Your own follicles, relocated for life — with no linear scar.',
    idealFor: ['Significant or patterned hair loss', 'Bald or near-bald areas', 'Permanent one-procedure solution', 'Men and women with sufficient donor supply'],
    stats: [{ label: 'Duration', value: '4–8 hours' }, { label: 'Downtime', value: '7–10 days' }, { label: 'Sessions', value: '1 procedure' }],
    cta: 'Permanent coverage',
  },
];

const COMPARISON_ROWS = [
  { label: 'Surgical?', prp: 'No', exo: 'No', transplant: 'Yes (minor)' },
  { label: 'Downtime', prp: 'None', exo: '24–48 hrs', transplant: '7–10 days' },
  { label: 'Results appear', prp: '3–4 months', exo: '3–4 months', transplant: '3–4 months' },
  { label: 'Full results', prp: '9–12 months', exo: '9–12 months', transplant: '9–12 months' },
  { label: 'Sessions needed', prp: '3–4 + upkeep', exo: '2–3 + upkeep', transplant: '1 procedure' },
  { label: 'Permanence', prp: 'Maintenance required', exo: 'Maintenance required', transplant: 'Permanent' },
  { label: 'Best for', prp: 'Early–moderate thinning', exo: 'Moderate–advanced thinning', transplant: 'Significant / patterned loss' },
];

export default function HairRestorationPage() {
  const treatments = getTreatmentsByCategory('hair-restoration');

  return (
    <>
      <ServiceHero
        category={category.name}
        headline={category.headline}
        description={category.description}
        image={SERVICE_HERO_IMAGES['hair-restoration']}
      />

      {/* Stats bar */}
      <div className="bg-accent text-white py-4">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: '3', label: 'Proven treatments' },
              { value: 'Non-surgical', label: 'Options available' },
              { value: '3–6 mo', label: 'When results appear' },
              { value: 'Permanent', label: 'FUE transplant results' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-bold leading-tight">{stat.value}</div>
                <div className="text-xs text-white/80 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intro */}
      <Section className="pb-0">
        <div className="max-w-2xl">
          <p className="text-text-muted text-sm uppercase tracking-widest font-semibold mb-3">Why patients come to us</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
            Real treatments. Real results.<br className="hidden md:block" /> Not just products to take home.
          </h2>
          <p className="text-text-muted text-lg leading-relaxed">
            Most hair loss clinics sell shampoos and supplements. At InfinityU, we go deeper — combining the three most clinically validated hair restoration modalities in a personalized treatment plan designed around <em>your</em> pattern of loss and goals. Whether you&apos;re catching it early or need comprehensive coverage, we have a proven path forward.
          </p>
        </div>
      </Section>

      {/* Treatment Highlights */}
      <Section>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TREATMENT_HIGHLIGHTS.map(({ slug, icon: Icon, badge, badgeColor, tagline, headline, hook, idealFor, stats, cta }) => (
            <div
              key={slug}
              className="bg-white border border-border rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icon + badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
                  {badge}
                </span>
              </div>

              {/* Tagline */}
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">{tagline}</p>

              {/* Headline */}
              <h3 className="font-heading text-xl font-bold text-primary mb-3">{headline}</h3>

              {/* Hook */}
              <p className="text-text-muted text-sm leading-relaxed mb-5 flex-1">{hook}</p>

              {/* Ideal for */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Ideal for</p>
                <ul className="space-y-1.5">
                  {idealFor.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                      <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-5 py-3 border-t border-b border-border">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xs font-bold text-primary">{s.value}</div>
                    <div className="text-xs text-text-muted">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA label */}
              <p className="text-xs text-accent font-semibold flex items-center gap-1">
                <Star className="h-3 w-3" />
                {cta}
              </p>
            </div>
          ))}
        </div>

        {/* "Which is right for me?" comparison */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 mb-10">
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-primary mb-2">Not sure which treatment is right for you?</h2>
            <p className="text-text-muted text-sm">Compare the options at a glance — or book a free consultation and we&apos;ll build your personalized plan.</p>
          </div>

          {/* Comparison table — desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 font-semibold text-primary w-1/4"></th>
                  <th className="text-center py-2 px-4 font-semibold text-primary">
                    <Droplets className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    PRP
                  </th>
                  <th className="text-center py-2 px-4 font-semibold text-primary">
                    <Zap className="h-4 w-4 text-violet-600 mx-auto mb-1" />
                    Exosome
                  </th>
                  <th className="text-center py-2 px-4 font-semibold text-primary">
                    <Scissors className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                    Transplant
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-white/60' : ''}>
                    <td className="py-2.5 pr-4 font-medium text-primary rounded-l-lg">{row.label}</td>
                    <td className="py-2.5 px-4 text-center text-text-muted">{row.prp}</td>
                    <td className="py-2.5 px-4 text-center text-text-muted">{row.exo}</td>
                    <td className="py-2.5 px-4 text-center text-text-muted rounded-r-lg">{row.transplant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comparison — mobile stacked */}
          <div className="md:hidden space-y-4">
            {COMPARISON_ROWS.map((row) => (
              <div key={row.label}>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{row.label}</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-text-muted">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-emerald-600 font-medium mb-0.5">PRP</div>
                    {row.prp}
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-violet-600 font-medium mb-0.5">Exosome</div>
                    {row.exo}
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-amber-600 font-medium mb-0.5">Transplant</div>
                    {row.transplant}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {BUSINESS.bookingUrl && (
              <Button href={BUSINESS.bookingUrl} variant="accent">
                Book a Free Consultation
              </Button>
            )}
            <Button href={BUSINESS.phone ? `tel:${BUSINESS.phone.replace(/\D/g, '')}` : '#'} variant="outline">
              Call Us to Discuss
            </Button>
          </div>
        </div>

        {/* "What makes our approach different" */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {[
            {
              icon: Shield,
              title: 'Combination protocols',
              body: 'We frequently pair treatments — PRP with exosomes, or transplant with exosome aftercare — because the science shows combined approaches produce better outcomes than any single treatment alone.',
            },
            {
              icon: Leaf,
              title: 'Personalized to your loss pattern',
              body: 'No two patients lose hair the same way. We stage your loss, assess your donor supply, and design a plan around your specific pattern, timeline, and goals — not a one-size-fits-all package.',
            },
            {
              icon: Star,
              title: 'Medically supervised',
              body: 'Every hair restoration treatment at InfinityU is performed or supervised by our licensed medical team. You\'re not being treated by an unlicensed aesthetician — you\'re under physician-level care.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">{title}</h4>
                <p className="text-text-muted text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Full treatment detail cards */}
      <Section className="pt-0">
        <h2 className="font-heading text-2xl font-bold text-primary mb-6">Treatment Details</h2>
        <div className="space-y-6">
          {treatments.map((treatment) => (
            <TreatmentCard key={treatment.slug} treatment={treatment} />
          ))}
        </div>
      </Section>

      {/* Results gallery link */}
      <Section background="surface-alt">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-2">Before &amp; After</p>
            <h2 className="font-heading text-2xl font-bold text-primary mb-2">See the results</h2>
            <p className="text-text-muted text-sm max-w-lg">
              Browse AI-illustrated before and after examples across hair transplant, PRP, exosome therapy, and eyebrow restoration — filterable by treatment type and gender.
            </p>
          </div>
          <Button href="/services/hair-restoration/results" variant="accent" className="shrink-0">
            View Results Gallery
          </Button>
        </div>
      </Section>

      <FAQSection
        subtitle={`Common questions about ${category.name.toLowerCase()} at InfinityU.`}
        faqs={category.faqs}
      />
      <ServiceCTA serviceName={category.name} />
    </>
  );
}
