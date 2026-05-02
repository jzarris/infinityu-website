import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Instagram } from 'lucide-react';
import { BUSINESS, NAV_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4 bg-white rounded-xl p-3">
              <Image
                src="/images/logo.png"
                alt={BUSINESS.legalName}
                width={1500}
                height={1061}
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              {BUSINESS.description}
            </p>
            {BUSINESS.social.instagram && (
              <a
                href={BUSINESS.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 hover:text-accent transition-colors text-sm"
              >
                <Instagram className="h-5 w-5" />
                Follow us on Instagram
              </a>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 text-white">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/injectables" className="text-white/70 hover:text-accent transition-colors text-sm">
                  Injectables & Regenerative
                </Link>
              </li>
              <li>
                <Link href="/services/hifu" className="text-white/70 hover:text-accent transition-colors text-sm">
                  HiFu
                </Link>
              </li>
              <li>
                <Link href="/services/radio-frequency" className="text-white/70 hover:text-accent transition-colors text-sm">
                  Radio Frequency
                </Link>
              </li>
              <li>
                <Link href="/services/body-contouring" className="text-white/70 hover:text-accent transition-colors text-sm">
                  Body Contouring
                </Link>
              </li>
              <li>
                <Link href="/weight-loss" className="text-white/70 hover:text-accent transition-colors text-sm">
                  Weight Loss Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-white/70">{BUSINESS.address.full}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <a href={`tel:${BUSINESS.phoneRaw}`} className="text-white/70 hover:text-accent transition-colors">
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a href={`mailto:${BUSINESS.email}`} className="text-white/70 hover:text-accent transition-colors">
                  {BUSINESS.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="text-white/70">
                  <p>{BUSINESS.hours.display}</p>
                  <p className="text-white/50">{BUSINESS.hours.note}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.</p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
