'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronDown } from 'lucide-react';
import { NAV_LINKS, BUSINESS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showRsvp, setShowRsvp] = useState(false);

  useEffect(() => {
    setShowRsvp(new Date() < new Date('2026-09-27T00:00:00'));
  }, []);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <Image
            src="/images/logo.png"
            alt={BUSINESS.legalName}
            width={600}
            height={400}
            className="h-10 w-auto"
          />
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg" aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-6 space-y-1">
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              {'children' in link && link.children ? (
                <>
                  <button
                    onClick={() =>
                      setExpandedItem(expandedItem === link.label ? null : link.label)
                    }
                    className="flex w-full items-center justify-between py-3 text-primary font-medium hover:text-accent transition-colors"
                  >
                    {link.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedItem === link.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedItem === link.label && (
                    <div className="pl-4 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className="block py-2 text-text-muted hover:text-accent transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block py-3 text-primary font-medium hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
          {showRsvp && (
            <>
              <div className="pt-2">
                <a
                  href="https://rsvp.infinity-u.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center gap-2 py-3 text-accent font-semibold hover:text-accent-dark transition-colors"
                >
                  🎉 Grand Opening RSVP
                </a>
              </div>
              <div>
                <a
                  href="https://shop.infinity-u.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center gap-2 py-3 text-accent font-semibold hover:text-accent-dark transition-colors"
                >
                  🛍️ Grand Opening Deals
                </a>
              </div>
            </>
          )}
        </nav>

        {BUSINESS.bookingUrl && (
          <div className="px-6 pt-4">
            <Button href={BUSINESS.bookingUrl} variant="accent" size="lg" className="w-full">
              Book Now
            </Button>
          </div>
        )}

        <div className="px-6 pt-6 flex items-center gap-3">
          {BUSINESS.social.instagram && (
            <a
              href={BUSINESS.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="p-2 hover:bg-surface rounded-lg transition-colors text-text-muted hover:text-accent"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          )}
          {BUSINESS.social.line && (
            <a
              href={BUSINESS.social.line}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with our 24/7 assistant on Line"
              className="flex items-center gap-1.5 px-2 py-2 hover:bg-surface rounded-lg transition-colors text-text-muted hover:text-accent"
            >
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span className="text-sm font-medium">24/7 Assistant</span>
            </a>
          )}
        </div>
        <div className="px-6 pt-3 pb-6 text-sm text-text-muted">
          <p>{BUSINESS.phone}</p>
          <p>{BUSINESS.address.full}</p>
        </div>
      </div>
    </>
  );
}
