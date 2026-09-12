import clsx from 'clsx';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-10 px-4', className)}>
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-dim)] flex items-center justify-center text-[var(--color-text-muted)] mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-[260px] mb-4 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}
