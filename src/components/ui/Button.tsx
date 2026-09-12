import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  loading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] no-select',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] focus:ring-[var(--color-accent)]':
            variant === 'primary',
          'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-dim)] focus:ring-[var(--color-border)]':
            variant === 'secondary',
          'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] focus:ring-[var(--color-border)]':
            variant === 'ghost',
          'bg-[var(--color-danger)] text-white hover:bg-red-600 focus:ring-[var(--color-danger)]':
            variant === 'danger',
          'bg-[var(--color-success)] text-white hover:bg-emerald-600 focus:ring-[var(--color-success)]':
            variant === 'success',
          'px-3 py-2 text-sm gap-1.5 min-h-[36px]': size === 'sm',
          'px-4 py-2.5 text-sm gap-2 min-h-[44px]': size === 'md',
          'px-6 py-3 text-base gap-2 min-h-[48px]': size === 'lg',
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed pointer-events-none': disabled || loading,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
