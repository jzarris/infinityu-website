import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Hair Loss Guide | InfinityU Med Spa Huntington Beach',
  description:
    'Understand your hair loss — causes, types, and the Norwood and Ludwig scales. Learn which treatments match your pattern. InfinityU Med Spa, Huntington Beach.',
};

const TYPES = [
  {
    name: 'Androgenetic Alopecia',
    badge: 'Most Common',
    badgeColor: 'bg-amber-100 text-amber-700',
    who: 'Men & Women',
    body: 'Genetic sensitivity to DHT (dihydrotestosterone) causes follicle miniaturization over time. In men it follows the Norwood pattern (receding hairline, crown thinning). In women it presents as diffuse thinning across the top of the scalp (Ludwig pattern), rarely a receding hairline.',
    treatments: ['PRP Therapy', 'Exosome Therapy', 'Hair Transplant (advanced stages)'],
  },
  {
    name: 'Telogen Effluvium',
    badge: 'Stress-Related',
    badgeColor: 'bg-blue-100 text-blue-700',
    who: 'Primarily Women',
    body: 'A sudden shock or stressor (childbirth, illness, surgery, major weight loss, emotional trauma) forces a large number of follicles into the resting (telogen) phase simultaneously. The result is diffuse shedding 2–4 months after the triggering event. Usually temporary — follicles are still alive.',
    treatments: ['PRP Therapy', 'Exosome Therapy'],
  },
  {
    name: 'Alopecia Areata',
    badge: 'Autoimmune',
    badgeColor: 'bg-violet-100 text-violet-700',
    who: 'Men & Women',
    body: 'The immune system mistakenly attacks hair follicles, causing patchy, often circular bald spots on the scalp or body. Severity ranges from small patches to complete scalp loss (totalis) or whole-body loss (universalis). Follicles remain alive — spontaneous regrowth is possible.',
    treatments: ['Consultation required — treatment depends on severity'],
  },
  {
    name: 'Medication-Induced',
    badge: 'Drug-Related',
    badgeColor: 'bg-red-100 text-red-700',
    who: 'Men & Women',
    body: 'Certain medications trigger hair loss as a side effect — most notably chemotherapy, blood thinners, beta blockers, retinoids, and some antidepressants. Typically diffuse and reversible after discontinuing the medication, though recovery timelines vary.',
    treatments: ['Address underlying cause first', 'PRP to accelerate recovery'],
  },
  {
    name: 'Traction Alopecia',
    badge: 'Mechanical',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    who: 'Primarily Women',
    body: 'Chronic tension on the hair from tight hairstyles (braids, ponytails, weaves, extensions) damages follicles along the hairline and temples over time. Caught early, it\'s reversible. In advanced cases, follicles may scar and the damage becomes permanent.',
    treatments: ['Remove the tension source', 'PRP if follicles are still active', 'Transplant for scarred areas'],
  },
  {
    name: 'Scarring Alopecia',
    badge: 'Permanent',
    badgeColor: 'bg-gray-100 text-gray-700',
    who: 'Men & Women',
    body: 'Inflammatory conditions (lichen planopilaris, folliculitis decalvans, discoid lupus) permanently destroy follicles and replace them with scar tissue. Bald patches are smooth and shiny. Non-surgical treatments cannot help scarred areas — surgery and dermatology management are the paths forward.',
    treatments: ['Dermatology referral', 'Hair transplant where donor hair is available'],
  },
];

const NORWOOD = [
  { stage: 'I', desc: 'No recession. Full hairline and no thinning.' },
  { stage: 'II', desc: 'Slight temple recession. Still considered normal for most adult men.' },
  { stage: 'III', desc: 'Visible temple recession forming an "M" shape. First stage typically requiring treatment.' },
  { stage: 'IIIv', desc: 'Temple recession plus beginning crown thinning.' },
  { stage: 'IV', desc: 'More severe hairline recession and distinct crown thinning. A band of hair separates them.' },
  { stage: 'V', desc: 'Hairline and crown thinning areas converge. Separating band narrows significantly.' },
  { stage: 'VI', desc: 'Hairline and crown connect. Sides and back are the primary remaining hair.' },
  { stage: 'VII', desc: 'Most advanced stage. Only a narrow band of hair remains around the sides and back.' },
];

const LUDWIG = [
  { stage: 'I', desc: 'Mild thinning along the part line. Scalp not visible at rest.' },
  { stage: 'II', desc: 'Increased thinning. Widened part, scalp visible at the top of the head.' },
  { stage: 'III', desc: 'Severe diffuse thinning across the top. Near-transparent coverage in the affected area.' },
];

export default function HairLossGuidePage() {
  return (
    <>
      <div className="gradient-primary text-white py-16 md:py-20">
        <div className="container-custom">
          <Link href="/services/hair-restoration" className="text-white/60 text-sm hover:text-white/90 transition-colors inline-block mb-6">
            ← Back to Hair Restoration
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Hair Loss Guide
          </h1>
          <p className="text-white/80 text-lg max-w-xl mb-6">
            Understanding the type and stage of your hair loss is the first step toward choosing the right treatment. This guide covers the six most common causes and the clinical scales used to classify them.
          </p>
          <nav className="flex flex-wrap gap-3">
            {['Types of hair loss', 'Norwood scale (men)', 'Ludwig scale (women)', 'Which treatment is right for me'].map((label) => (
              <a key={label} href={`#${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="text-white/70 text-sm hover:text-white transition-colors underline underline-offset-2">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Types */}
      <Section id="types-of-hair-loss">
        <div className="max-w-3xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Causes</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">Types of hair loss</h2>
          <div className="space-y-8">
            {TYPES.map((t) => (
              <div key={t.name} className="border border-border rounded-2xl p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h3 className="font-heading text-xl font-bold text-primary">{t.name}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
                  <span className="text-xs text-text-muted">· {t.who}</span>
                </div>
                <p className="text-text-muted leading-relaxed mb-4">{t.body}</p>
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Treatment options</p>
                  <div className="flex flex-wrap gap-2">
                    {t.treatments.map((tr) => (
                      <span key={tr} className="text-xs bg-surface-alt text-text-muted px-3 py-1 rounded-full">{tr}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Norwood */}
      <Section background="surface-alt" id="norwood-scale-men-">
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Men</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-2">The Norwood Scale</h2>
          <p className="text-text-muted mb-8">The Norwood (Hamilton–Norwood) scale is the standard classification for male-pattern baldness, with seven stages. It&apos;s used to plan treatment and set realistic expectations for outcome.</p>
          <div className="space-y-3">
            {NORWOOD.map((n) => (
              <div key={n.stage} className="flex gap-4 bg-white rounded-xl p-4 border border-border">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold text-sm flex items-center justify-center shrink-0">
                  {n.stage}
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm mb-0.5">Stage {n.stage}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Treatment timing:</strong> Stages I–III are ideal candidates for non-surgical treatment (PRP/exosomes). Stages IV–VI typically benefit most from transplant, often combined with ongoing non-surgical maintenance. Stage VII requires careful donor assessment — coverage may be limited.
            </p>
          </div>
        </div>
      </Section>

      {/* Ludwig */}
      <Section id="ludwig-scale-women-">
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Women</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-2">The Ludwig Scale</h2>
          <p className="text-text-muted mb-8">The Ludwig scale classifies female-pattern hair loss in three stages based on diffuse thinning across the crown. Women rarely develop the receding hairline pattern seen in men.</p>
          <div className="space-y-3">
            {LUDWIG.map((l) => (
              <div key={l.stage} className="flex gap-4 bg-surface-alt rounded-xl p-4 border border-border">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold text-sm flex items-center justify-center shrink-0">
                  {l.stage}
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm mb-0.5">Stage {l.stage}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-violet-50 border border-violet-200 rounded-xl p-4">
            <p className="text-violet-800 text-sm leading-relaxed">
              <strong>Treatment timing:</strong> Ludwig I–II are excellent candidates for PRP and exosome therapy — follicles are still active and respond well. Ludwig III may require combination approaches; transplant is an option when the donor area has sufficient density.
            </p>
          </div>
        </div>
      </Section>

      {/* Treatment matcher */}
      <Section background="surface-alt" id="which-treatment-is-right-for-me">
        <div className="max-w-3xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Choosing a treatment</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-6">Which treatment is right for me?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                href: '/services/hair-restoration/prp',
                label: 'PRP Therapy',
                badge: 'Non-Surgical',
                badgeColor: 'bg-emerald-100 text-emerald-700',
                forLabel: 'Best for',
                forItems: ['Early–moderate thinning', 'Active shedding', 'Post-partum loss', 'Maintenance after transplant'],
              },
              {
                href: '/services/hair-restoration/exosome',
                label: 'Exosome Therapy',
                badge: 'Non-Surgical · Advanced',
                badgeColor: 'bg-violet-100 text-violet-700',
                forLabel: 'Best for',
                forItems: ['Moderate–advanced thinning', 'Plateaued PRP results', 'Maximum non-surgical potency', 'Post-transplant support'],
              },
              {
                href: '/services/hair-restoration/transplant',
                label: 'Hair Transplant',
                badge: 'Surgical · Permanent',
                badgeColor: 'bg-amber-100 text-amber-700',
                forLabel: 'Best for',
                forItems: ['Significant / patterned loss', 'Bald or near-bald areas', 'Permanent one-time solution', 'Norwood 4–7 / Ludwig 2–3'],
              },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="bg-white rounded-2xl p-5 border border-border hover:shadow-md transition-shadow block">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badgeColor} inline-block mb-3`}>{c.badge}</span>
                <h4 className="font-semibold text-primary mb-3">{c.label}</h4>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{c.forLabel}</p>
                <ul className="space-y-1">
                  {c.forItems.map((item) => (
                    <li key={item} className="text-xs text-text-muted leading-relaxed">· {item}</li>
                  ))}
                </ul>
                <p className="text-accent text-xs font-medium mt-3">Learn more →</p>
              </Link>
            ))}
          </div>
          <p className="text-text-muted text-sm mt-6">
            Not sure which fits your situation? A free consultation with Dr. Mike Le will give you a clear picture. We&apos;ll examine your loss pattern, assess your follicle health, and build a treatment plan around your goals — not a one-size-fits-all package.
          </p>
        </div>
      </Section>

      {/* CTA */}
      <Section background="surface">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Ready to take the next step?</h2>
          <p className="text-text-muted mb-6">Book a free consultation and get a clear, honest assessment of your hair loss type, stage, and the best treatment options for your situation.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {BUSINESS.bookingUrl && <Button href={BUSINESS.bookingUrl} variant="accent">Book Free Consultation</Button>}
            <Button href={`tel:${BUSINESS.phoneRaw}`} variant="outline">Call {BUSINESS.phone}</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
