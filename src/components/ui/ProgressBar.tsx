import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'accent',
  size = 'md',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-[var(--color-text-secondary)] truncate mr-2">{label}</span>
          <span className="text-[10px] font-semibold text-[var(--color-text)] tabular-nums">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={clsx('w-full bg-[var(--color-surface-dim)] rounded-full overflow-hidden', {
          'h-1.5': size === 'sm',
          'h-2': size === 'md',
          'h-2.5': size === 'lg',
        })}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', {
            'bg-[var(--color-accent)]': color === 'accent',
            'bg-[var(--color-success)]': color === 'success',
            'bg-[var(--color-warning)]': color === 'warning',
            'bg-[var(--color-danger)]': color === 'danger',
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
