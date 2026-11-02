'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BUSINESS } from '@/lib/constants';
import styles from './partner.module.css';

const FAQ_ITEMS = [
  {
    q: 'What is an MSO–PC structure and why is it required in California?',
    a: "California's corporate practice of medicine (CPOM) doctrine — codified in Business & Professions Code § 2400 et seq. — prohibits corporations and non-physicians from owning or controlling a medical practice. The MSO–PC model works within this requirement: a physician-owned Professional Corporation (PC) holds the medical practice and all clinical authority, while a separately owned Management Services Organization (MSO) handles non-clinical operations under a Management Services Agreement. The two entities are legally distinct; only the PC employs or supervises clinical staff and makes clinical decisions. Any arrangement must be reviewed by each party's independent legal counsel.",
  },
  {
    q: 'Who owns what in this arrangement?',
    a: 'Dr. Le owns and controls the Professional Corporation (PC). The PC holds all clinical authority: it employs or supervises clinical staff, approves treatment protocols, and is responsible for all medical decisions. The business partner owns and operates the Management Services Organization (MSO), which provides non-clinical business services — facility operations, marketing, billing, scheduling, and staffing of non-clinical roles — to the PC under a written Management Services Agreement. The two entities are separate legal entities with distinct ownership, roles, and responsibilities.',
  },
  {
    q: 'What are the ongoing responsibilities of each party?',
    a: "The PC (physician-owned) is responsible for all clinical matters: approving and updating treatment protocols, supervising licensed clinical staff, conducting good-faith patient assessments, maintaining medical records, and overseeing patient safety. The MSO (business partner-owned) handles non-clinical operations: the lease and facility, equipment, marketing and client acquisition, front desk and scheduling, billing and practice management software, and non-clinical staff. Neither party operates outside its designated scope, and the Management Services Agreement governs the relationship.",
  },
  {
    q: 'Does my location need to be in California?',
    a: "Yes. Dr. Le's physician partnership arrangements are currently available in California only. This reflects the requirements of California's corporate practice of medicine doctrine, which requires a California-licensed physician to own and control the Professional Corporation. Partnerships in other states are not available at this time.",
  },
  {
    q: 'Do I need a medical license to open a med spa under this model?',
    a: 'No. The business partner who owns the MSO does not need a medical license. However, any staff member who performs treatments that constitute the practice of medicine — such as administering injectables or operating lasers — must hold the appropriate California license (typically RN, NP, or PA) and must operate under the clinical authority and supervision of the PC. Dr. Le, as the physician owner of the PC, establishes the protocols and supervision framework under which licensed clinical staff operate.',
  },
  {
    q: 'What does the process look like from inquiry to opening day?',
    a: "The timeline varies depending on how quickly legal structuring moves, the complexity of the arrangement, and your facility build-out. As a general guide: the inquiry and mutual fit process (steps 1–3) typically takes two to four weeks. Legal structuring — once both parties have engaged independent counsel — generally takes four to eight weeks. Launch preparation, including facility setup, staff hiring, AestheticIQ onboarding, and compliance review, typically takes sixty to ninety days. Most partners should plan for five to seven months from initial inquiry to opening day, though this can move faster or slower depending on the specifics of your situation.",
  },
  {
    q: 'What is AestheticIQ and why is it required?',
    a: 'AestheticIQ is a clinical management platform built specifically for med spas operating under the MSO–PC model. It is how Dr. Le maintains protocols, reviews patient records, and provides oversight across partner practices. All partner practices are required to operate on AestheticIQ because it is the infrastructure that makes consistent, scalable medical oversight possible. Onboarding is part of the launch preparation process.',
  },
];

const PC_DUTIES = [
  'Treatment protocols and clinical standards',
  'Supervision of RNs, NPs, and other licensed staff',
  'Good-faith examinations and patient assessments',
  'Medical records and clinical documentation',
  'Clinical decisions and patient safety oversight',
];

const MSO_DUTIES = [
  'Real estate, facility build-out, and equipment',
  'Marketing, branding, and client acquisition',
  'Front desk, scheduling, and client experience',
  'Billing, software, and business administration',
  'Non-clinical staff hiring and management',
];

const IQ_FEATURES = [
  {
    title: 'Protocol management',
    body: 'Dr. Le maintains, updates, and distributes treatment protocols directly through the platform. Clinical staff always operate from the current approved version.',
  },
  {
    title: 'Records access and review',
    body: 'Patient intake, treatment records, and clinical documentation are accessible to Dr. Le for review and oversight — securely, without requiring an in-person visit for routine supervision.',
  },
  {
    title: 'Clinical staff coordination',
    body: "Staff roles, permissions, and supervision structure are managed within the platform, reflecting the PC's authority over all clinical personnel.",
  },
  {
    title: 'Built for the MSO model',
    body: 'Business operations and clinical operations are handled in separate layers — the platform reflects the legal structure, not the other way around.',
  },
];

const WHO_FOR = [
  'Entrepreneurs planning to open a med spa in California',
  'RNs, NPs, and PAs who want to operate a practice but need a physician owner',
  'Existing aesthetics businesses seeking a medical director to add physician-supervised services',
  'Investors or business owners entering the medical aesthetics space',
];

const WHAT_BRING = [
  'A clear location and market for the practice',
  'Business operations capability (or a team to run non-clinical functions)',
  'Commitment to clinical compliance and patient safety standards',
  'Your own legal counsel for structuring the PC/MSO agreement',
  'Capital to cover facility, equipment, and build-out',
];

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Submit an inquiry',
    body: 'Fill out the form below with your background, location, and goals. We review every inquiry personally.',
    ph: null,
  },
  {
    n: '02',
    title: 'Introductory call',
    body: "A brief call with Dr. Le's team to learn more about your vision, experience, and the market you're targeting.",
    ph: null,
  },
  {
    n: '03',
    title: 'Mutual fit assessment',
    body: 'Both parties assess alignment on location, services, clinical standards, and working style before any commitments are made.',
    ph: null,
  },
  {
    n: '04',
    title: 'Legal structuring',
    body: 'Each party engages independent legal counsel to draft and negotiate the PC operating agreement and Management Services Agreement. Legal structuring typically takes four to eight weeks, depending on the complexity of the arrangement and counsel availability.',
    ph: null,
  },
  {
    n: '05',
    title: 'Launch preparation',
    body: 'Facility setup, staff hiring, protocol onboarding through AestheticIQ, and compliance review ahead of opening. Most practices complete launch preparation within sixty to ninety days of executing the legal agreements.',
    ph: null,
  },
];

const LICENSE_OPTIONS = [
  { value: '', label: 'Select license type' },
  { value: 'none_business_owner', label: 'None — business owner / entrepreneur' },
  { value: 'rn', label: 'RN — Registered Nurse' },
  { value: 'np', label: 'NP — Nurse Practitioner' },
  { value: 'pa', label: 'PA — Physician Assistant' },
  { value: 'other', label: 'Other' },
];

const STAGE_OPTIONS = [
  { value: '', label: 'Select stage' },
  { value: 'planning', label: 'Planning / pre-launch' },
  { value: 'existing', label: 'Existing spa looking to add a medical director' },
  { value: 'other', label: 'Other' },
];

export function PartnerContent() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', licenseType: '', stage: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setFormError('Please fill in your name, email, and goals before submitting.');
      return;
    }
    setFormError('');
    setStatus('loading');

    const serviceLabel = LICENSE_OPTIONS.find((o) => o.value === form.licenseType)?.label ?? form.licenseType;
    const stageLabel   = STAGE_OPTIONS.find((o) => o.value === form.stage)?.label ?? form.stage;
    const composedMessage =
      `[Partnership Inquiry]\n` +
      `City / Region: ${form.city || 'Not provided'}\n` +
      `License type: ${serviceLabel || 'Not specified'}\n` +
      `Stage: ${stageLabel || 'Not specified'}\n\n` +
      form.message;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: 'Partnership Inquiry',
          message: composedMessage,
          smsConsentTransactional: false,
          smsConsentMarketing: false,
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroTag}>California MSO–PC Partnership</span>
          <h1>Open a med spa with an <em>experienced</em> physician partner.</h1>
          <p className={styles.heroIntro}>
            Dr. Michael Le is selectively partnering with qualified business owners and licensed clinicians who want to open a medically compliant aesthetic practice under a physician-owned Professional Corporation structure.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.btn} href="#inquiry-form">Submit an Inquiry ↗</a>
            <a className={`${styles.btn} ${styles.btnOutline}`} href="#about">Meet Dr. Le</a>
          </div>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.heroRing} />
          <div className={styles.heroPhotoWrap}>
            <Image
              src="/images/doctors/dr_le.png"
              alt="Dr. Michael Le, Medical Director — InfinityU Med Spa"
              fill
              className="object-cover"
              sizes="268px"
              priority
            />
          </div>
          <div className={styles.heroCaption}>
            <span>Dr. Michael Le</span>
            <span>Medical Director · Physician Owner</span>
          </div>
        </div>
      </div>

      {/* ── Info strip ───────────────────────────────── */}
      <div className={styles.strip}>
        <span className={styles.stripItem}>Internal Medicine</span>
        <span className={styles.stripSep}>·</span>
        <span className={styles.stripItem}>California MSO–PC Structure</span>
        <span className={styles.stripSep}>·</span>
        <span className={styles.stripItem}>Powered by AestheticIQ</span>
        <span className={styles.stripSep}>·</span>
        <span className={styles.stripItem}>Huntington Beach, California</span>
      </div>

      {/* ── About Dr. Le ─────────────────────────────── */}
      <section className={styles.band} id="about">
        <div className={styles.inner}>
          <div className={styles.aboutGrid}>
            <div>
              <span className={styles.eyebrow}>Your physician partner</span>
              <h2>A personal approach.<br />A medical perspective.</h2>
              <div className={styles.nameplate}>
                <strong>Dr. Michael Le</strong>
                <span>Medical Director · Physician Owner</span>
                <span>Internal Medicine</span>
              </div>
            </div>
            <div>
              <p>Dr. Michael Le is a board-certified physician in internal medicine practicing in Huntington Beach, California. As Medical Director of InfinityU Med Spa, Dr. Le oversees the clinical operations, treatment protocols, and patient safety standards that guide the practice. His approach brings a physician's perspective to aesthetic care — grounded in evidence-based medicine and attentive to the whole patient. Dr. Le's background in internal medicine supports a broad clinical foundation that informs the range of services offered under physician direction at InfinityU and partner practices.</p>
              <p>As Medical Director of InfinityU Med Spa in Huntington Beach, Dr. Le oversees all clinical operations, treatment protocols, and compliance. He brings this same level of medical oversight and accountability to partnerships structured under the MSO–PC model.</p>
              <a
                href="#inquiry-form"
                style={{ color: 'var(--p-rose)', fontSize: 14, fontWeight: 500, display: 'inline-block', marginTop: 12 }}
              >
                Submit a partnership inquiry ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MSO–PC model ─────────────────────────────── */}
      <section className={`${styles.band} ${styles.bandSurface}`} id="model">
        <div className={styles.inner}>
          <div style={{ maxWidth: 680 }}>
            <span className={styles.eyebrow}>The structure</span>
            <h2>How the MSO–PC model works</h2>
            <p>California law requires that a licensed physician own and control any medical practice. The MSO–PC model makes it possible for a business partner to own and operate the non-clinical side of a med spa while a physician-owned PC holds full clinical authority.</p>
          </div>
          <div className={styles.splitCards}>
            <div className={`${styles.splitCard} ${styles.splitCardPc}`}>
              <p className={styles.cardLabel}>Physician-owned</p>
              <h3>Professional Corporation (PC)</h3>
              <p style={{ fontSize: 14 }}>Dr. Le owns and controls the PC. The PC holds all clinical authority — nothing clinical happens outside it.</p>
              <ul className={styles.dutyList}>
                {PC_DUTIES.map((item) => (
                  <li key={item}><span className={styles.dotRose}>·</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.splitCard} ${styles.splitCardMso}`}>
              <p className={styles.cardLabel}>Business partner–owned</p>
              <h3>Management Services Organization (MSO)</h3>
              <p style={{ fontSize: 14 }}>The business partner owns the MSO, which provides non-clinical management services to the PC under a Management Services Agreement.</p>
              <ul className={styles.dutyList}>
                {MSO_DUTIES.map((item) => (
                  <li key={item}><span className={styles.dotInk}>·</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className={styles.legalNote}>The PC and MSO operate as separate legal entities. The physician retains full clinical independence. Any arrangement is subject to applicable California law and review by each party&apos;s own legal counsel.</p>
        </div>
      </section>

      {/* ── What Dr. Le provides ─────────────────────── */}
      <section className={styles.band}>
        <div className={styles.inner}>
          <span className={styles.eyebrow}>Medical direction</span>
          <h2>What Dr. Le provides</h2>
          <div className={styles.services}>
            <div className={styles.service}>
              <p className={styles.serviceNum}>01 / Medical Direction</p>
              <h3>Medical direction</h3>
              <p style={{ fontSize: 14 }}>Dr. Le serves as the physician of record for the Professional Corporation, providing the medical direction required under California law. This includes overseeing clinical operations, approving the scope of services offered, and ensuring all physician-directed treatments are performed under appropriate medical authority.</p>
            </div>
            <div className={styles.service}>
              <p className={styles.serviceNum}>02 / Protocols</p>
              <h3>Protocol and consent review</h3>
              <p style={{ fontSize: 14 }}>Dr. Le reviews, approves, and updates all treatment protocols and patient consent forms through AestheticIQ. Clinical staff always work from the current approved version, maintained and distributed directly through the platform.</p>
            </div>
            <div className={styles.service}>
              <p className={styles.serviceNum}>03 / Clinical Staff</p>
              <h3>Standardized procedures</h3>
              <p style={{ fontSize: 14 }}>Dr. Le establishes standing orders and standardized procedure guidelines for all licensed clinical staff — including RNs and NPs — performing injectable treatments, laser procedures, and other physician-directed services under the PC. These are maintained and updated through AestheticIQ.</p>
            </div>
            <div className={styles.service}>
              <p className={styles.serviceNum}>04 / Supervision</p>
              <h3>Supervision and availability</h3>
              <p style={{ fontSize: 14 }}>Dr. Le maintains the supervisory relationship with clinical staff required under California law. This includes being accessible for clinical questions, reviewing patient concerns escalated by staff, and providing ongoing oversight appropriate to the services offered. Supervision arrangements are formalized during onboarding and documented in the Management Services Agreement.</p>
            </div>
          </div>
          <div className={styles.servicesNote}>
            <span style={{ opacity: 0.45, flexShrink: 0 }}>○</span>
            <span>All of the above is delivered through <strong>AestheticIQ</strong> — a clinical management platform purpose-built for the MSO–PC model.</span>
          </div>
        </div>
      </section>

      {/* ── AestheticIQ ──────────────────────────────── */}
      <section className={`${styles.band} ${styles.bandSurface}`}>
        <div className={styles.inner}>
          <div style={{ maxWidth: 720 }}>
            <span className={styles.eyebrow}>Practice infrastructure</span>
            <h2>Powered by AestheticIQ</h2>
            <p>Every partner practice operates on AestheticIQ — a clinical management platform built from the ground up for the med spa MSO–PC model. Unlike generic EMRs designed for hospitals or solo practices, AestheticIQ is structured around the separation of clinical and business operations that this model requires.</p>
            <p>For Dr. Le, it provides the tools to maintain medical oversight across practices without being physically on-site. For you, it means your practice launches on infrastructure designed to support compliance — not adapted from something else.</p>
          </div>
          <div className={styles.iqFeatures}>
            {IQ_FEATURES.map(({ title, body }) => (
              <div key={title} className={styles.iqFeature}>
                <h4>{title}</h4>
                <p style={{ fontSize: 14 }}>{body}</p>
              </div>
            ))}
          </div>
          <div className={styles.iqRequired}>
            <strong>AestheticIQ is required for all partner practices.</strong> This isn&apos;t a restriction — it&apos;s what makes consistent medical oversight across locations possible. All partners are onboarded to the platform as part of the launch preparation process.
          </div>
        </div>
      </section>

      {/* ── Who this is for ──────────────────────────── */}
      <section className={styles.band}>
        <div className={styles.inner}>
          <div className={styles.whoGrid}>
            <div>
              <span className={styles.eyebrow}>Ideal partners</span>
              <h2>Who this is for</h2>
              <ul className={styles.checklist}>
                {WHO_FOR.map((item) => (
                  <li key={item}><span className={styles.chk}>—</span>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className={styles.eyebrow}>What you bring</span>
              <h2>What partners bring</h2>
              <ul className={styles.checklist}>
                {WHAT_BRING.map((item) => (
                  <li key={item}><span className={styles.chk}>—</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────── */}
      <section className={`${styles.band} ${styles.bandSurface}`}>
        <div className={styles.inner}>
          <div className={styles.processGrid}>
            <div>
              <span className={styles.eyebrow}>Getting started</span>
              <h2>From introduction to opening day.</h2>
              <p>A clear process from first contact to launch — with each party&apos;s own legal counsel involved at every structural step.</p>
            </div>
            <div>
              {PROCESS_STEPS.map(({ n, title, body, ph }) => (
                <div key={n} className={styles.step}>
                  <span className={styles.stepN}>{n}</span>
                  <div>
                    <h4>{title}</h4>
                    {body
                      ? <p>{body}</p>
                      : <p style={{ fontStyle: 'italic', opacity: 0.52, fontSize: 13 }}>[{ph}]</p>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className={styles.band}>
        <div className={styles.inner} style={{ maxWidth: 860 }}>
          <span className={styles.eyebrow}>Common questions</span>
          <h2>A few helpful details.</h2>
          <div className={styles.faqWrap}>
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q}>
                <summary>
                  {q} <span className={styles.faqPlus} aria-hidden="true">+</span>
                </summary>
                {a
                  ? <p>{a}</p>
                  : <p style={{ fontStyle: 'italic', opacity: 0.55, fontSize: 14 }}>[Answer pending — Dr. Le to provide a summary with realistic timeline estimates for legal structuring, build-out, and launch preparation.]</p>
                }
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inquiry form ─────────────────────────────── */}
      <section className={`${styles.band} ${styles.bandNight}`} id="inquiry-form">
        <div className={styles.inner}>
          <div className={styles.formGrid}>
            <div>
              <span className={styles.eyebrow}>Get in touch</span>
              <h2>Submit a partnership inquiry.</h2>
              <p>Tell us about yourself and your goals. We review every inquiry and will be in touch if there&apos;s a potential fit.</p>
              <div className={styles.avail}>
                Huntington Beach, CA<br />
                California partnerships only<br />
                Zoom consultations · Subject to availability
              </div>
            </div>
            <div>
              {status === 'success' ? (
                <div className={styles.formSuccess}>
                  <div className={styles.formSuccessCheck}>✓</div>
                  <h3>Inquiry received.</h3>
                  <p>Thank you. We&apos;ll review your submission and be in touch if there&apos;s a potential fit.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className={styles.formGroup}>
                    <label htmlFor="partner-name">Full name *</label>
                    <input
                      id="partner-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className={styles.formInput}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="partner-email">Email *</label>
                      <input
                        id="partner-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        className={styles.formInput}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="partner-phone">Phone</label>
                      <input
                        id="partner-phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => set('phone', e.target.value)}
                        className={styles.formInput}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="partner-city">City / Region</label>
                    <input
                      id="partner-city"
                      type="text"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. Orange County, Los Angeles"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="partner-license">Your license type</label>
                      <select
                        id="partner-license"
                        value={form.licenseType}
                        onChange={(e) => set('licenseType', e.target.value)}
                        className={styles.formSelect}
                      >
                        {LICENSE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="partner-stage">Where you are now</label>
                      <select
                        id="partner-stage"
                        value={form.stage}
                        onChange={(e) => set('stage', e.target.value)}
                        className={styles.formSelect}
                      >
                        {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="partner-message">Tell us about your goals *</label>
                    <textarea
                      id="partner-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      className={styles.formTextarea}
                      placeholder="Share your background, the market you're targeting, and what you're hoping to build."
                    />
                  </div>
                  <p className={styles.formNote}>Please do not include any patient health information in this form.</p>
                  {formError && <span className={styles.formError}>{formError}</span>}
                  {status === 'error' && (
                    <span className={styles.formError}>
                      Something went wrong. Please try again or email us at {BUSINESS.email}.
                    </span>
                  )}
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnNight}`}
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Sending…' : 'Submit Inquiry ↗'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ───────────────────────────────── */}
      <section className={styles.band}>
        <div className={styles.inner}>
          <div className={styles.disclaimerWrap}>
            <p className={styles.disclaimerLabel}>Disclaimer — pending attorney review</p>
            <p>The information on this page is provided for general informational purposes only and does not constitute legal, medical, or business advice. Nothing here creates or implies any contractual relationship or commitment. Any arrangement between Dr. Michael Le, a Professional Corporation, and a Management Services Organization is subject to applicable California law — including but not limited to the corporate practice of medicine doctrine and Business &amp; Professions Code § 2400 et seq. — and must be reviewed and structured by each party&apos;s own independent legal counsel before execution. InfinityU Med Spa and Dr. Michael Le make no representations regarding the suitability of this structure for your specific circumstances.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
