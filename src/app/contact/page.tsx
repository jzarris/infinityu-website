'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BUSINESS } from '@/lib/constants';
import { CONTACT_IMAGES } from '@/lib/media';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const serviceOptions = [
  'Botox / Injectables',
  'PRP / PRF Treatments',
  'Hair Restoration',
  'Laser Treatments',
  'HiFu Skin Tightening',
  'Radio Frequency',
  'Body Contouring',
  'Hormone Optimization (BHRT)',
  'Weight Loss Program',
  'Sculptra',
  'Other / General Inquiry',
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    smsConsentTransactional: true,
    smsConsentMarketing: false,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const smsTransactionalText = 'I agree to receive SMS messages from InfinityU Med Spa for appointment reminders, account updates, and customer support. Message and data rates may apply. Reply STOP to opt out.';
      const smsMarketingText = 'I agree to receive promotional SMS messages from InfinityU Med Spa about special offers, health tips, and program updates. Message and data rates may apply. Reply STOP to opt out.';

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          smsConsentTransactionalText: smsTransactionalText,
          smsConsentMarketingText: smsMarketingText,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormState({ name: '', email: '', phone: '', service: '', message: '', smsConsentTransactional: true, smsConsentMarketing: false });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-primary">
        <Image
          src={CONTACT_IMAGES.hero.src}
          alt={CONTACT_IMAGES.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(58,27,48,0.45) 0%, rgba(58,27,48,0.65) 100%)',
          }}
        />
        <div className="container-custom relative z-10 py-20 text-center">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Get in Touch</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Have a question or ready to book? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="font-heading text-2xl font-bold mb-6">Send Us a Message</h2>

            {status === 'success' ? (
              <Card className="text-center py-12">
                <Send className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-text-muted">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5">Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1.5">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium mb-1.5">Service of Interest</label>
                  <select
                    id="service"
                    value={formState.service}
                    onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                  >
                    <option value="">Select a service...</option>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5">Message *</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-y"
                    placeholder="How can we help you?"
                  />
                </div>

                {/* SMS Communication Preferences */}
                <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
                  <p className="text-sm font-medium">SMS Communication Preferences</p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.smsConsentTransactional}
                      onChange={(e) => setFormState({ ...formState, smsConsentTransactional: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-xs text-text-muted leading-relaxed">
                      I agree to receive SMS messages from InfinityU Med Spa for appointment reminders, account updates, and customer support. Message and data rates may apply. Reply STOP to opt out.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.smsConsentMarketing}
                      onChange={(e) => setFormState({ ...formState, smsConsentMarketing: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-xs text-text-muted leading-relaxed">
                      I agree to receive promotional SMS messages from InfinityU Med Spa about special offers, health tips, and program updates. Message and data rates may apply. Reply STOP to opt out.
                    </span>
                  </label>
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm">Something went wrong. Please try again or call us directly.</p>
                )}

                <Button type="submit" variant="accent" size="lg" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Visit Us</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-text-muted">{BUSINESS.address.full}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href={`tel:${BUSINESS.phoneRaw}`} className="text-text-muted hover:text-accent transition-colors">
                      {BUSINESS.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${BUSINESS.email}`} className="text-text-muted hover:text-accent transition-colors">
                      {BUSINESS.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-text-muted">{BUSINESS.hours.display}</p>
                    <p className="text-text-light text-sm">{BUSINESS.hours.note}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe
                src="https://www.google.com/maps?q=428+Main+St+%23101,+Huntington+Beach,+CA+92648&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="InfinityU Med Spa Location"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
