import clsx from 'clsx';
import { CURRENCY_SYMBOLS, type Currency } from '../../utils/helpers';

interface AmountDisplayProps {
  amount: number;
  currency?: Currency;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
  className?: string;
  colorize?: boolean;
}

export function AmountDisplay({
  amount,
  currency = 'INR',
  size = 'md',
  showSign = false,
  className,
  colorize = false,
}: AmountDisplayProps) {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const isNegative = amount < 0;

  return (
    <span
      className={clsx(
        'font-bold tabular-nums tracking-tight',
        {
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-xl': size === 'lg',
          'text-2xl': size === 'xl',
          'text-[var(--color-danger)]': colorize && isNegative,
          'text-[var(--color-success)]': colorize && !isNegative && amount > 0,
          'text-[var(--color-text-secondary)]': colorize && amount === 0,
        },
        className
      )}
    >
      {isNegative && '−'}
      {!isNegative && showSign && amount > 0 && '+'}
      {symbol}{formatted}
    </span>
  );
}
