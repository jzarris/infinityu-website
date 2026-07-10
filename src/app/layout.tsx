import type { Metadata } from 'next';
import {
  Playfair_Display,
  Inter,
  Cormorant_Garamond,
  Manrope,
  DM_Serif_Display,
  DM_Sans,
} from 'next/font/google';
import { generateSiteMetadata, generateLocalBusinessSchema } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { DEFAULT_THEME } from '@/lib/themes';
import { DEFAULT_HEADLINE } from '@/lib/headlines';
import { FaviconProvider } from '@/components/providers/FaviconProvider';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = generateSiteMetadata();

// Inline script: apply saved theme + headline before first paint to prevent FOUC
const themeInitScript = `
(function() {
  var root = document.documentElement;
  try {
    var t = localStorage.getItem('infinityu-theme') || '${DEFAULT_THEME}';
    root.classList.add('theme-' + t);
    var h = localStorage.getItem('infinityu-headline') || '${DEFAULT_HEADLINE}';
    root.setAttribute('data-headline', h);
  } catch (e) {
    root.classList.add('theme-${DEFAULT_THEME}');
    root.setAttribute('data-headline', '${DEFAULT_HEADLINE}');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const businessSchema = generateLocalBusinessSchema();

  const fontClasses = [
    playfair.variable,
    inter.variable,
    cormorant.variable,
    manrope.variable,
    dmSerif.variable,
    dmSans.variable,
  ].join(' ');

  return (
    <html lang="en" className={fontClasses}>
      <head>
        {/* Preload puzzle image early — it's a CSS background-image so browsers discover it late */}
        <link rel="preload" as="image" href="/images/tilepuzzle.jpg" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: businessSchema }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider />
        <FaviconProvider />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ThemeSwitcher />
      </body>
    </html>
  );
}
