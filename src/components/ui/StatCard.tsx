import clsx from 'clsx';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendValue, className }: StatCardProps) {
  return (
    <div
      className={clsx(
        'bg-[var(--color-surface)] rounded-2xl p-3 border border-[var(--color-border-light)]',
        className
      )}
    >
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-6 h-6 rounded-md bg-[var(--color-surface-dim)] flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="text-lg font-bold text-[var(--color-text)]">{value}</div>
      {trend && trendValue && (
        <div
          className={clsx('text-[10px] font-medium mt-0.5', {
            'text-[var(--color-success)]': trend === 'up',
            'text-[var(--color-danger)]': trend === 'down',
            'text-[var(--color-text-muted)]': trend === 'neutral',
          })}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </div>
      )}
    </div>
  );
}
