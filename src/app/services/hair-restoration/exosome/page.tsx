import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { Check, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Exosome Hair Restoration | InfinityU Med Spa Huntington Beach',
  description:
    'Exosome hair restoration at InfinityU — up to 100× more growth factors than PRP. The most potent non-surgical option for density restoration. Serving Huntington Beach, CA.',
};

const STEPS = [
  { n: 1, title: 'Consultation & assessment', body: 'We map your hair loss pattern, assess follicle density with a dermatoscope, and confirm exosome therapy is appropriate for your degree of loss.' },
  { n: 2, title: 'Topical numbing', body: 'Numbing cream is applied 20–30 minutes before the procedure. Most patients find the treatment comfortable throughout.' },
  { n: 3, title: 'Exosome injection', body: 'Concentrated exosome solution is micro-injected across the scalp. The nano-sized vesicles penetrate deeply to reach follicle stem cells directly.' },
  { n: 4, title: 'Immediate resume', body: 'No downtime. You can return to activities immediately. Avoid washing the scalp for 12 hours and vigorous exercise for 24 hours.' },
];

const COMPARISON = [
  { label: 'Growth factors', prp: 'Concentrated from your blood', exo: '100× more than PRP' },
  { label: 'Source', prp: 'Your own platelets', exo: 'Stem cell-derived (allogeneic)' },
  { label: 'Session time', prp: '45–60 min', exo: '30–45 min' },
  { label: 'Sessions', prp: '3–4 to start', exo: '2–3 to start' },
  { label: 'Best for', prp: 'Early–moderate thinning', exo: 'Moderate–advanced thinning' },
  { label: 'Allergy risk', prp: 'None (autologous)', exo: 'Minimal (screened donors)' },
];

const PROTOCOLS = [
  {
    title: 'Exosome Standalone',
    badge: 'Most Common',
    badgeColor: 'bg-violet-100 text-violet-700',
    body: 'For patients with moderate-to-advanced thinning who want maximum non-surgical potency without surgical recovery. 2–3 sessions spaced 4–6 weeks apart.',
  },
  {
    title: 'Exosome + PRP',
    badge: 'High Potency',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    body: 'Combining exosomes with PRP amplifies the signal to dormant follicles. Ideal for patients who have plateaued on PRP alone or want maximum density restoration non-surgically.',
  },
  {
    title: 'Post-Transplant Exosome',
    badge: 'Surgical + Non-Surgical',
    badgeColor: 'bg-amber-100 text-amber-700',
    body: 'Applied 2–4 weeks after a hair transplant to accelerate graft survival, reduce shock loss, and improve final density. Consistently improves outcomes compared to transplant alone.',
  },
];

const FAQS = [
  { q: 'What are exosomes?', a: 'Exosomes are nano-sized vesicles (small particles) secreted by stem cells. They carry growth factors, signaling proteins, and genetic material that instruct recipient cells — in this case, hair follicle stem cells — to shift into an active growth state.' },
  { q: 'How does exosome therapy differ from PRP?', a: 'PRP concentrates growth factors from your own blood platelets — typically 3–5× normal concentration. Exosomes are derived from stem cells and deliver up to 100× more growth factors, along with additional signaling proteins PRP doesn\'t contain. They also don\'t require a blood draw.' },
  { q: 'Is it safe?', a: 'Yes. Exosomes used in clinical treatment come from rigorously screened donors and undergo extensive processing. They contain no living cells, which dramatically reduces any immune risk. Adverse effects are rare and typically mild (temporary redness or tenderness).' },
  { q: 'How many sessions do I need?', a: 'Most patients start with 2–3 sessions spaced 4–6 weeks apart. Maintenance is typically once every 9–12 months, though some patients with more advanced thinning benefit from more frequent upkeep.' },
  { q: 'Can exosomes regrow hair in completely bald areas?', a: 'No — like PRP, exosome therapy works by reactivating dormant follicles. Areas where follicles are completely gone cannot respond. For significant bald patches, a hair transplant is the appropriate path, and exosomes can enhance those transplant results.' },
];

export default function ExosomeHairRestorationPage() {
  return (
    <>
      <div className="gradient-primary text-white py-16 md:py-20">
        <div className="container-custom">
          <Link href="/services/hair-restoration" className="text-white/60 text-sm hover:text-white/90 transition-colors inline-block mb-6">
            ← Back to Hair Restoration
          </Link>
          <span className="inline-block bg-violet-500/20 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Most Advanced Non-Surgical
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Exosome Hair Restoration
          </h1>
          <p className="text-white/80 text-lg max-w-xl mb-8">
            The most potent non-surgical hair restoration available. Stem cell-derived exosomes deliver up to 100× more growth factors than PRP — reawakening follicles that PRP alone cannot reach.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { value: '100×', label: 'more growth factors than PRP' },
              { value: '30–45 min', label: 'per session' },
              { value: 'Non-surgical', label: 'no downtime' },
              { value: 'Stem cell', label: 'derived' },
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

      {/* Science */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">The science</p>
            <h2 className="font-heading text-3xl font-bold text-primary mb-4">
              Why exosomes outperform PRP
            </h2>
            <p className="text-text-muted text-lg leading-relaxed mb-4">
              Exosomes are nano-sized signaling vesicles secreted by stem cells. They contain an exceptionally dense cargo of growth factors, cytokines, microRNA, and cell-signaling proteins that instruct hair follicle stem cells to shift from a dormant (telogen) to an active growth (anagen) state.
            </p>
            <p className="text-text-muted leading-relaxed mb-4">
              At approximately 100–150 nanometers, exosomes are small enough to penetrate the scalp and reach follicle stem cells at a cellular level — delivering their cargo directly where it&apos;s needed. The result: a stronger, more coordinated biological response than PRP can achieve.
            </p>
            <p className="text-text-muted leading-relaxed mb-8">
              Unlike PRP, exosome therapy doesn&apos;t require a blood draw. The exosomes used in treatment are derived from carefully screened mesenchymal stem cell donors, manufactured and quality-controlled for clinical use.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: '🔬', title: 'Nano-scale delivery', body: 'At 100–150nm, exosomes penetrate follicle stem cells directly — PRP particles are too large for this' },
                { icon: '⚡', title: '100× growth factors', body: 'Concentration of VEGF, PDGF, IGF-1 and others far exceeds what PRP can achieve' },
                { icon: '🧬', title: 'Genetic signaling', body: 'microRNA in exosomes can influence gene expression — turning on follicle growth pathways' },
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
              src="/images/hair-results/7b3535e2-6386-4d1e-9252-0453c01644c7.jpg"
              alt="Exosome hair restoration before and after"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
              <p className="text-white text-xs font-medium">Before &amp; After · Exosome Hair Restoration</p>
              <p className="text-white/60 text-xs">AI-generated illustration — not an actual patient result</p>
            </div>
          </div>
        </div>
      </Section>

      {/* PRP vs Exosome comparison */}
      <Section background="surface-alt">
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Comparison</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-6">PRP vs. Exosome Therapy</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 font-semibold text-primary w-1/3"></th>
                  <th className="text-center py-2 px-4 font-semibold text-emerald-700">PRP</th>
                  <th className="text-center py-2 px-4 font-semibold text-violet-700">Exosome</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-white/60' : ''}>
                    <td className="py-2.5 pr-4 font-medium text-primary rounded-l-lg">{row.label}</td>
                    <td className="py-2.5 px-4 text-center text-text-muted">{row.prp}</td>
                    <td className="py-2.5 px-4 text-center text-text-muted font-medium">{row.exo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-text-muted text-sm mt-4">
            Both are excellent non-surgical options. Exosome therapy is the upgrade path for patients who need more potency or have had partial results with PRP.
          </p>
        </div>
      </Section>

      {/* Steps */}
      <Section>
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">What to expect</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">Your session, step by step</h2>
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

      {/* Protocols */}
      <Section background="surface-alt">
        <div className="max-w-3xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Treatment protocols</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-6">How exosome therapy is used</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {PROTOCOLS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-5 shadow-sm border border-border">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.badgeColor} inline-block mb-3`}>{p.badge}</span>
                <h4 className="font-semibold text-primary mb-2">{p.title}</h4>
                <p className="text-text-muted text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Candidacy */}
      <Section>
        <div className="max-w-3xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Candidacy</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-6">Who is exosome therapy right for?</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-600" /> Good candidates
              </h3>
              <ul className="space-y-2">
                {['Moderate-to-advanced androgenetic hair loss', 'Plateaued or insufficient results from PRP', 'Diffuse thinning across the crown and top', 'Pre- or post-hair transplant enhancement', 'Patients wanting maximum non-surgical potency', 'Women with widespread diffuse thinning'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                    <Check className="h-3.5 w-3.5 text-violet-600 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-3">When a transplant is the better path</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-3">
                Exosomes can&apos;t restore hair where follicles are completely gone. If your loss is:
              </p>
              <ul className="space-y-2 mb-4">
                {['Completely bald patches with no remaining follicles', 'Norwood scale 5–7 in men', 'You want permanent, guaranteed coverage'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                    <Check className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
              <p className="text-text-muted text-sm leading-relaxed">
                A transplant may be the right foundation — with exosomes applied afterward for optimal graft survival.
              </p>
              <Link href="/services/hair-restoration/transplant" className="text-accent text-sm font-medium hover:underline mt-3 inline-block">
                Learn about Hair Transplant (FUE) →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section background="surface-alt">
        <div className="max-w-2xl">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Common questions</p>
          <h2 className="font-heading text-3xl font-bold text-primary mb-8">Exosome FAQ</h2>
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
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Ready for the most advanced non-surgical option?</h2>
          <p className="text-text-muted mb-6">Book a free consultation and we&apos;ll assess whether exosome therapy — or a combination protocol — is right for your pattern of loss.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {BUSINESS.bookingUrl && <Button href={BUSINESS.bookingUrl} variant="accent">Book Free Consultation</Button>}
            <Button href={`tel:${BUSINESS.phoneRaw}`} variant="outline">Call {BUSINESS.phone}</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
