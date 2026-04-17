import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        variant === 'default' && 'bg-surface-alt text-primary',
        variant === 'accent' && 'bg-accent/10 text-accent-dark',
        variant === 'outline' && 'border border-border text-text-muted',
        className
      )}
    >
      {children}
    </span>
  );
}
