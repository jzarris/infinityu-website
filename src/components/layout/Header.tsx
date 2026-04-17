'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ChevronDown } from 'lucide-react';
import { NAV_LINKS, BUSINESS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { MobileNav } from './MobileNav';
import { AnnouncementBar } from './AnnouncementBar';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          'sticky top-0 z-30 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white'
        )}
      >
        <div className="container-custom flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label={`${BUSINESS.legalName} home`}>
            <Image
              src="/images/logo.png"
              alt={BUSINESS.legalName}
              width={1500}
              height={1061}
              priority
              className="h-14 w-auto"
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
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
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
