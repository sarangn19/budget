import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ children, className, padding = 'md', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-light)]',
        'transition-all duration-150',
        onClick && 'cursor-pointer active:scale-[0.98] active:shadow-sm',
        {
          'p-0': padding === 'none',
          'p-3': padding === 'sm',
          'p-4': padding === 'md',
          'p-5': padding === 'lg',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-center justify-between mb-3', className)}>
      <div>
        <h3 className="font-semibold text-sm text-[var(--color-text)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
