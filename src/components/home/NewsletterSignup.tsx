'use client';

import { Section } from '@/components/ui/Section';
import { useState } from 'react';
import { Send } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <Section background="surface-alt">
      <div className="max-w-xl mx-auto text-center">
        <Send className="h-8 w-8 text-accent mx-auto mb-4" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
          Stay Updated
        </h2>
        <p className="text-text-muted mb-8">
          Subscribe to receive special offers, new treatment announcements, and exclusive promotions.
        </p>

        {status === 'success' ? (
          <p className="text-green-600 font-medium">Thank you for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-accent text-primary-dark font-semibold rounded-lg hover:bg-accent-light transition-colors disabled:opacity-60"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-500 text-sm mt-3">Something went wrong. Please try again.</p>
        )}

        <p className="text-text-light text-xs mt-4">
          By subscribing, you consent to receive marketing emails. You can unsubscribe at any time.
        </p>
      </div>
    </Section>
  );
}
