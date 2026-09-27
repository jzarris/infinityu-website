import type { LanguageCode } from './index';

// Minimal, recognizable SVG flags for the intake language selector. Inline so
// no icon library is needed. Each uses the canonical 3:2 ratio for visual
// consistency across the row.

function FlagUS({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true" focusable="false">
      <rect width="24" height="16" fill="#B22234" />
      <rect y="1.23" width="24" height="1.23" fill="#fff" />
      <rect y="3.69" width="24" height="1.23" fill="#fff" />
      <rect y="6.15" width="24" height="1.23" fill="#fff" />
      <rect y="8.62" width="24" height="1.23" fill="#fff" />
      <rect y="11.08" width="24" height="1.23" fill="#fff" />
      <rect y="13.54" width="24" height="1.23" fill="#fff" />
      <rect width="9.6" height="8.62" fill="#3C3B6E" />
    </svg>
  );
}

function FlagTH({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true" focusable="false">
      <rect width="24" height="16" fill="#A51931" />
      <rect y="2.67" width="24" height="2.67" fill="#F4F5F8" />
      <rect y="5.33" width="24" height="5.33" fill="#2D2A4A" />
      <rect y="10.67" width="24" height="2.67" fill="#F4F5F8" />
    </svg>
  );
}

function FlagES({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true" focusable="false">
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </svg>
  );
}

const FLAGS: Record<LanguageCode, (props: { className?: string }) => React.JSX.Element> = {
  en: FlagUS,
  th: FlagTH,
  es: FlagES,
};

export function FlagIcon({ code, className }: { code: LanguageCode; className?: string }) {
  const Component = FLAGS[code];
  return <Component className={className} />;
}
