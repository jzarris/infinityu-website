import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { Check, Droplets } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PRP Hair Restoration | InfinityU Med Spa Huntington Beach',
  description:
    'PRP hair restoration at InfinityU — concentrate your own growth factors to reawaken dormant follicles. Non-surgical, no downtime. Serving Huntington Beach, CA.',
};

const STEPS = [
  { n: 1, title: 'Blood draw', body: 'A small amount of blood (30–60 mL) is drawn from your arm — similar to a routine lab test.' },
  { n: 2, title: 'Centrifuge processing', body: 'Your blood is spun to separate and concentrate the platelet-rich plasma. Takes ~10 minutes and produces 3–5× normal platelet concentration.' },
  { n: 3, title: 'Topical numbing', body: 'A numbing cream is applied to your scalp for 20–30 minutes, making the injection phase comfortable for the vast majority of patients.' },
  { n: 4, title: 'PRP injection', body: 'PRP is micro-injected across treatment zones using a fine needle, spaced ~1 cm apart. Most patients describe mild pressure or brief stinging — manageable and short.' },
  { n: 5, title: 'Walk out — no downtime', body: 'You can return to work and normal activities immediately. Avoid washing hair for 6–8 hours and intense scalp sun exposure for 24–48 hours.' },
];

const TIMELINE = [
  { phase: 'Weeks 2–4', title: 'Reduced shedding', body: 'Most patients notice they\'re losing less hair per day. The follicular cycle is beginning to stabilize.' },
  { phase: 'Months 3–4', title: 'Fine new growth emerges', body: 'New hairs begin emerging from previously dormant follicles. They start thin and thicken over subsequent months.' },
  { phase: 'Months 6–9', title: 'Visible density improvement', body: 'After completing the initial series (3–4 sessions), density and thickness are meaningfully improved. Hair feels fuller and the scalp is less visible.' },
  { phase: 'Month 12+', title: 'Peak results + maintenance planning', body: 'Full benefit from the initial series. We reassess and determine your maintenance schedule — typically every 6–12 months to sustain results.' },
];

const FAQS = [
  { q: 'How many sessions do I need?', a: 'The standard initial protocol is 3–4 sessions spaced 4–6 weeks apart. After the initial series, most patients maintain with one session every 6–12 months.' },
  { q: 'How long until I see results?', a: 'Most patients notice reduced shedding within 2–4 weeks. Visible new growth typically begins at 3–4 months. Full results from the initial series are seen at 9–12 months.' },
  { q: 'Is PRP painful?', a: 'The injection phase is the most uncomfortable part. Topical numbing cream makes this manageable — most patients rate it 2–3 out of 10. The blood draw is like any routine lab test.' },
  { q: 'Who isn\'t a candidate?', a: 'PRP works by reactivating living follicles. Completely bald areas where follicles are gone need surgical restoration. We\'ll advise honestly if transplant is the better path.' },
  { q: 'Can I combine PRP with other treatments?', a: 'Yes — combining PRP with exosome therapy or following a transplant with PRP is a common protocol that produces better outcomes than either treatment alone.' },
];

export default function PRPHairRestorationPage() {
  return (
    <>
      <div className="gradient-primary text-white py-16 md:py-20">
        <div className="container-custom">
          <Link href="/services/hair-restoration" className="text-white/60 text-sm hover:text-white/90 transition-colors inline-block mb-6">
            ← Back to Hair Restoration
          </Link>
          <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Non-Surgical · No Downtime
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            PRP Hair Restoration
          </h1>
          <p className="text-white/80 text-lg max-w-xl mb-8">
            Your body already has the growth factors needed to reawaken dormant follicles. PRP concentrates them and puts them exactly where they need to go.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { value: '45–60 min', label: 'per session' },
              { value: 'Zero', label: 'downtime' },
              { value: '3–4 months', label: 'when results begin' },
              { value: '100%', label: 'your own biology' },
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

      {/* What PRP does */}
      <Section>
        <div className="max-w-3xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">The science</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-4">
            What PRP actually does to your follicles
          </h2>
          <p className="text-text-muted text-lg leading-relaxed mb-4">
            Your blood contains platelets — cells whose primary job is healing. When concentrated and injected into the scalp, the growth factors platelets release (VEGF, PDGF, IGF-1, and others) signal hair follicle stem cells to shift from a resting state back into an active growth phase.
          </p>
          <p className="text-text-muted leading-relaxed mb-4">
            PRP doesn&apos;t create new follicles. What it does is <strong className="text-primary">reactivate follicles that are still alive but dormant</strong>, slow the rate at which existing follicles miniaturize under DHT, and improve the quality and thickness of hair shafts from treated follicles. The result over 9–12 months is reduced shedding, noticeable new growth, and measurably thicker, denser hair.
          </p>
          <p className="text-text-muted leading-relaxed mb-8">
            Because the plasma comes from your own blood, there is no risk of allergic reaction and no foreign substances are introduced. PRP is among the safest treatments in aesthetic medicine.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🩸', title: 'Autologous', body: 'Derived from your own blood — zero foreign substances, zero rejection risk' },
              { icon: '🧬', title: 'Growth factors', body: 'VEGF, PDGF, IGF-1, TGF — the signals that wake follicles up' },
              { icon: '📈', title: 'Clinical evidence', body: 'Published studies confirm improvements in hair density, shaft diameter, and follicle count' },
            ].map((c) => (
              <div key={c.title} className="bg-surface-alt rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">{c.icon}</div>
                <h4 className="font-semibold text-primary text-sm mb-1">{c.title}</h4>
                <p className="text-text-muted text-xs leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Steps */}
      <Section background="surface-alt">
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">What to expect</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">Your PRP session, step by step</h2>
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

      {/* Timeline */}
      <Section>
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">What to expect</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">PRP results timeline</h2>
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
        </div>
      </Section>

      {/* Candidacy */}
      <Section background="surface-alt">
        <div className="max-w-3xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Candidacy</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-6">Who is PRP right for?</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-emerald-600" /> Good candidates
              </h3>
              <ul className="space-y-2">
                {['Early-to-moderate androgenetic hair loss', 'Active shedding you want to slow', 'Strengthening existing hair before considering transplant', 'Post-transplant maintenance', 'Women with diffuse thinning and good remaining follicles', 'Telogen effluvium (post-partum, illness, stress)'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-3">PRP vs. Exosome — when to upgrade</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-3">
                PRP is the right starting point for most patients. Consider upgrading to exosome therapy if:
              </p>
              <ul className="space-y-2">
                {['Moderate-to-advanced thinning', 'PRP alone hasn\'t produced enough improvement after a full series', 'You want maximum non-surgical potency', 'You\'re combining with a hair transplant'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                    <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
              <Link href="/services/hair-restoration/exosome" className="text-accent text-sm font-medium hover:underline mt-3 inline-block">
                Learn about Exosome Therapy →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Common questions</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">PRP FAQ</h2>
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
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Ready to stop the shedding?</h2>
          <p className="text-text-muted mb-6">Book a free consultation and we&apos;ll assess your hair loss pattern, walk through your treatment options, and build a plan around your goals.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {BUSINESS.bookingUrl && <Button href={BUSINESS.bookingUrl} variant="accent">Book Free Consultation</Button>}
            <Button href={`tel:${BUSINESS.phoneRaw}`} variant="outline">Call {BUSINESS.phone}</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
