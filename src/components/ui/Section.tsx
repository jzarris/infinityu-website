import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'surface' | 'surface-alt' | 'primary' | 'accent';
  id?: string;
}

const bgStyles = {
  white: 'bg-surface',
  surface: 'bg-surface',
  'surface-alt': 'bg-surface-alt',
  primary: 'gradient-primary text-white',
  accent: 'gradient-accent',
};

export function Section({ children, className, background = 'white', id }: SectionProps) {
  return (
    <section id={id} className={cn('section-padding', bgStyles[background], className)}>
      <div className="container-custom">
        {children}
      </div>
    </section>
  );
}
