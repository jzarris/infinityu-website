import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { Check, Scissors } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hair Transplant (FUE) | InfinityU Med Spa Huntington Beach',
  description:
    'FUE hair transplant at InfinityU — permanent results from a single procedure with no linear scar. Serving Huntington Beach, CA.',
};

const STEPS = [
  { n: 1, title: 'Consultation & planning', body: 'Dr. Mike Le assesses your donor area, maps your hair loss pattern using the Norwood or Ludwig scale, designs your new hairline, and determines the graft count needed to meet your goals.' },
  { n: 2, title: 'Shaving & marking', body: 'The donor area (typically the back and sides of the scalp) is trimmed short. The recipient area is marked according to the surgical plan you agreed on.' },
  { n: 3, title: 'Local anesthesia', body: 'Both donor and recipient areas are numbed with local anesthetic. You remain awake and comfortable throughout the procedure. Most patients watch a film or relax.' },
  { n: 4, title: 'Follicular extraction (FUE)', body: 'Individual follicular units (1–4 hairs each) are extracted from the donor area one by one using a micro-punch device. No linear incision. No linear scar.' },
  { n: 5, title: 'Recipient site creation', body: 'Tiny incisions are made in the recipient area at precise angles and densities to match your natural hair growth direction. This determines the final cosmetic result.' },
  { n: 6, title: 'Graft implantation', body: 'Each extracted follicular unit is placed into the recipient sites by hand. Placement precision determines density and natural appearance.' },
];

const FUE_VS_FUT = [
  { label: 'Scar type', fue: 'Tiny dots (barely visible)', fut: 'Linear strip scar' },
  { label: 'Short hair wearable', fue: 'Yes', fut: 'No (scar visible)' },
  { label: 'Recovery', fue: '7–10 days', fut: '10–14 days' },
  { label: 'Pain', fue: 'Minimal', fut: 'Moderate (strip site)' },
  { label: 'Grafts per session', fue: '1,000–4,000+', fut: '1,500–4,000+' },
  { label: 'Our offering', fue: '✓ Available at InfinityU', fut: 'Not offered' },
];

const TIMELINE = [
  { phase: 'Days 1–10', title: 'Initial recovery', body: 'Some redness, crusting and mild swelling at both donor and recipient sites. Most patients are social by day 7–10.' },
  { phase: 'Weeks 2–8', title: 'Shock loss', body: 'Transplanted hairs shed — this is expected and normal. The follicles remain alive underground and will regrow.' },
  { phase: 'Months 3–6', title: 'New growth begins', body: 'Fine new hairs emerge from the transplanted follicles. They\'ll be thin at first and thicken over the following months.' },
  { phase: 'Months 9–12', title: 'Full results visible', body: 'Final density and hair quality is apparent. The transplanted follicles are yours permanently.' },
];

const FAQS = [
  { q: 'Will the transplanted hair look natural?', a: 'Yes — because we\'re transplanting your own follicles. The hairline design, angle, and density of placement determine whether the result looks natural, which is why surgical skill and artistic planning matter significantly.' },
  { q: 'How many grafts do I need?', a: 'It depends entirely on your degree of loss and coverage goals. A mild hairline recession may need 1,000–1,500 grafts. Significant crown and hairline loss can require 3,000–4,000+. We estimate this precisely at consultation.' },
  { q: 'Is the transplant permanent?', a: 'Yes. The donor follicles are genetically resistant to DHT (the hormone that causes most hair loss). Once transplanted, they retain that resistance and grow for life.' },
  { q: 'What about the rest of my hair — will it keep thinning?', a: 'The transplanted hair is permanent. Non-transplanted native hair may still thin over time. Many patients add PRP or exosome therapy to preserve non-transplanted follicles and extend the life of their native hair.' },
  { q: 'Do I need to shave my head?', a: 'For a full FUE session, we shave the donor area (back and sides). The top can often remain longer if you prefer to hide the work during recovery. We discuss this at consultation.' },
];

export default function HairTransplantPage() {
  return (
    <>
      <div className="gradient-primary text-white py-16 md:py-20">
        <div className="container-custom">
          <Link href="/services/hair-restoration" className="text-white/60 text-sm hover:text-white/90 transition-colors inline-block mb-6">
            ← Back to Hair Restoration
          </Link>
          <span className="inline-block bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Surgical · Permanent Results
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Hair Transplant (FUE)
          </h1>
          <p className="text-white/80 text-lg max-w-xl mb-8">
            One procedure. Permanent results. FUE (Follicular Unit Extraction) relocates your own follicles to areas of loss — where they grow for life with no linear scar.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { value: '4–8 hrs', label: 'procedure time' },
              { value: 'Local', label: 'anesthesia only' },
              { value: '2–4 weeks', label: 'shedding phase' },
              { value: '9–12 months', label: 'full results' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-xs text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
          {BUSINESS.bookingUrl && (
            <Button href={BUSINESS.bookingUrl} variant="accent">Book a Free Consultation</Button>
          )}
        </div>
      </div>

      {/* What FUE is */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">The procedure</p>
            <h2 className="font-heading text-3xl font-bold text-primary mb-4">
              What makes FUE different from older transplant methods
            </h2>
            <p className="text-text-muted text-lg leading-relaxed mb-4">
              Follicular Unit Extraction (FUE) is the modern standard in hair transplant surgery. Instead of cutting a strip of scalp (the older FUT method), FUE extracts individual follicular units one by one using a micro-punch device — leaving only tiny circular dots in the donor area that are nearly invisible even with short hair.
            </p>
            <p className="text-text-muted leading-relaxed mb-8">
              The extracted follicles are then implanted into the recipient area at precise angles, directions, and densities determined during surgical planning. The result is permanent, natural-looking hair density — not a hairpiece, not a treatment that requires ongoing sessions to maintain.
            </p>

            {/* Dr. Le quote */}
            <blockquote className="border-l-4 border-accent pl-6 py-2 mb-8">
              <p className="text-primary text-lg leading-relaxed mb-3 italic">
                &ldquo;The hairline we design together before the procedure is as important as the surgery itself. Getting the density, the angle, and the aesthetics right — that&apos;s what separates a result that looks natural from one that looks like a transplant.&rdquo;
              </p>
              <cite className="text-text-muted text-sm not-italic">— Dr. Mike Le, Medical Director, InfinityU</cite>
            </blockquote>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: '💉', title: 'No linear scar', body: 'Individual follicle extraction means no strip incision — wear your hair short without visible scarring' },
                { icon: '🎯', title: 'Permanent', body: 'Donor follicles are DHT-resistant — once transplanted, they grow for life' },
                { icon: '🔬', title: 'Your own tissue', body: 'No foreign material — your own follicles, relocated to where you need them' },
              ].map((c) => (
                <div key={c.title} className="bg-surface-alt rounded-xl p-5 text-center">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <h4 className="font-semibold text-primary text-sm mb-1">{c.title}</h4>
                  <p className="text-text-muted text-xs leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/hair-results/81db1074-4ae5-44d5-80ba-2c85a4931f2c.jpg"
              alt="FUE hair transplant before and after — hairline and crown restoration"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
              <p className="text-white text-xs font-medium">Before &amp; After · Hair Transplant (FUE)</p>
              <p className="text-white/60 text-xs">AI-generated illustration — not an actual patient result</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Steps */}
      <Section background="surface-alt">
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">The procedure</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">What happens during an FUE transplant</h2>
          <div className="space-y-6">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">{s.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FUE vs FUT */}
      <Section>
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">FUE vs. FUT</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-6">Why we offer FUE, not FUT</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 font-semibold text-primary w-1/3"></th>
                  <th className="text-center py-2 px-4 font-semibold text-amber-700">FUE</th>
                  <th className="text-center py-2 px-4 font-semibold text-text-muted">FUT (Strip)</th>
                </tr>
              </thead>
              <tbody>
                {FUE_VS_FUT.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-surface-alt/50' : ''}>
                    <td className="py-2.5 pr-4 font-medium text-primary rounded-l-lg">{row.label}</td>
                    <td className="py-2.5 px-4 text-center text-primary font-medium">{row.fue}</td>
                    <td className="py-2.5 px-4 text-center text-text-muted">{row.fut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Timeline */}
      <Section background="surface-alt">
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Recovery</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">Post-transplant timeline</h2>
          <div className="space-y-0">
            {TIMELINE.map((t, i) => (
              <div key={t.phase} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-accent shrink-0 mt-1.5" />
                  {i < TIMELINE.length - 1 && <div className="w-0.5 bg-border flex-1 mt-1" />}
                </div>
                <div className="pb-6">
                  <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">{t.phase}</div>
                  <h4 className="font-semibold text-primary mb-1">{t.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-5 border border-border mt-2">
            <div className="flex items-start gap-3">
              <Scissors className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary text-sm mb-1">Pair with exosome therapy for better outcomes</h4>
                <p className="text-text-muted text-xs leading-relaxed">
                  Adding exosome therapy 2–4 weeks post-transplant improves graft survival, reduces shock loss, and produces denser final results. Ask about our combined transplant + exosome protocol at consultation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Candidacy */}
      <Section>
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Candidacy</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-6">Who is a good candidate?</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-primary mb-3">Good candidates</h3>
              <ul className="space-y-2">
                {['Significant or patterned hair loss (Norwood 3–6 men; Ludwig 2–3 women)', 'Healthy donor area with sufficient follicle density', 'Hair loss that has stabilized (not rapidly progressing)', 'Realistic expectations for graft count and result timeline', 'Eyebrow or beard restoration (also performed at InfinityU)'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                    <Check className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-3">When non-surgical is better first</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-3">
                If your hair loss is early-to-moderate and you still have good follicle density, starting with PRP or exosome therapy may delay or reduce the eventual need for a transplant. We&apos;ll advise honestly on the best path.
              </p>
              <Link href="/services/hair-restoration/prp" className="text-accent text-sm font-medium hover:underline">Learn about PRP →</Link>
              <span className="text-text-muted text-sm mx-2">·</span>
              <Link href="/services/hair-restoration/exosome" className="text-accent text-sm font-medium hover:underline">Exosome Therapy →</Link>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section background="surface-alt">
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Common questions</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">Hair Transplant FAQ</h2>
          <div className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <h4 className="font-semibold text-primary mb-2">{f.q}</h4>
                <p className="text-text-muted text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section background="surface">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Ready for permanent coverage?</h2>
          <p className="text-text-muted mb-6">Book a free consultation with Dr. Mike Le. We&apos;ll assess your donor area, design your hairline, and give you an honest graft count and outcome estimate.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {BUSINESS.bookingUrl && <Button href={BUSINESS.bookingUrl} variant="accent">Book Free Consultation</Button>}
            <Button href={`tel:${BUSINESS.phoneRaw}`} variant="outline">Call {BUSINESS.phone}</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
