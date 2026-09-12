import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export function AppLayout({ children, header }: AppLayoutProps) {
  return (
    <div className="min-h-screen min-h-dvh bg-[var(--color-surface-dim)] safe-top">
      {header && (
        <header className="sticky top-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur-xl border-b border-[var(--color-border-light)] safe-top">
          {header}
        </header>
      )}
      <main className="max-w-lg mx-auto pb-28 px-1">{children}</main>
      <BottomNav />
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="px-4 py-3 flex items-center justify-between safe-top">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-text)]">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
