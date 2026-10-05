'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ChevronDown, Instagram } from 'lucide-react';
import { NAV_LINKS, BUSINESS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { MobileNav } from './MobileNav';
import { AnnouncementBar } from './AnnouncementBar';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showRsvp, setShowRsvp] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowRsvp(new Date() < new Date('2026-09-27T00:00:00'));
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          'sticky top-0 z-30 transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-md'
            : 'bg-background'
        )}
      >
        <div className="container-custom flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label={`${BUSINESS.legalName} home`}>
            <Image
              src="/images/logo.png"
              alt={BUSINESS.legalName}
              width={600}
              height={400}
              priority
              sizes="200px"
              className="h-[84px] w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() =>
                  'children' in link && link.children
                    ? setActiveDropdown(link.label)
                    : undefined
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {'children' in link && link.children ? (
                  <>
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-colors py-2"
                    >
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Link>
                    {activeDropdown === link.label && (
                      <div className="absolute top-full left-0 pt-2">
                        <div className="bg-white rounded-xl shadow-lg border border-border py-2 min-w-[240px]">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2.5 text-sm text-primary hover:bg-surface hover:text-accent transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-primary hover:text-accent transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            {showRsvp && (
              <>
                <a
                  href="https://rsvp.infinity-u.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white bg-accent hover:bg-accent-dark transition-colors px-3 py-1.5 rounded-full"
                >
                  🎉 RSVP
                </a>
                <a
                  href="https://shop.infinity-u.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-accent border border-accent hover:bg-surface-alt transition-colors px-3 py-1.5 rounded-full"
                >
                  🛍️ Shop Deals
                </a>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {BUSINESS.social.instagram && (
              <a
                href={BUSINESS.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="hidden lg:flex p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <Instagram className="h-5 w-5 text-primary hover:text-accent" />
              </a>
            )}
            {BUSINESS.social.lineDesktop && (
              <a
                href={BUSINESS.social.lineDesktop}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with our 24/7 assistant on Line"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 hover:bg-surface rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <span className="text-sm font-medium text-primary">24/7 Assistant</span>
              </a>
            )}
            {BUSINESS.bookingUrl && (
              <Button
                href={BUSINESS.bookingUrl}
                variant="accent"
                size="sm"
                className="hidden lg:inline-flex"
              >
                Book Now
              </Button>
            )}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 hover:bg-surface rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-primary" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
