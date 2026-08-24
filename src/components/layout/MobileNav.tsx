'use client';

import { useState } from 'react';
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
        </nav>

        {BUSINESS.bookingUrl && (
          <div className="px-6 pt-4">
            <Button href={BUSINESS.bookingUrl} variant="accent" size="lg" className="w-full">
              Book Now
            </Button>
          </div>
        )}

        <div className="px-6 pt-6 text-sm text-text-muted">
          <p>{BUSINESS.phone}</p>
          <p>{BUSINESS.address.full}</p>
        </div>
      </div>
    </>
  );
}
