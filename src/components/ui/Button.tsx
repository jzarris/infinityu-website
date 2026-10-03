import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  isLoading?: boolean;
  leftIcon?: ReactNode;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-light',
  secondary: 'bg-secondary text-white hover:bg-secondary-light',
  outline: 'border border-accent text-accent hover:bg-surface-alt',
  ghost: 'text-primary hover:bg-surface-alt',
  accent: 'bg-accent text-white hover:bg-accent-dark font-semibold',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  isLoading,
  leftIcon,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const content = (
    <>
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : leftIcon}
      {children}
    </>
  );

  if ('href' in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...rest}>{content}</Link>
    );
  }

  const { disabled, ...rest } = props as ButtonAsButton;
  return (
    <button className={classes} disabled={isLoading || disabled} {...rest}>
      {content}
    </button>
  );
}
