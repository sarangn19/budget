import clsx from 'clsx';
import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex gap-1 p-1 bg-[var(--color-surface-dim)] rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[40px] active:scale-95 no-select',
            activeTab === tab.id
              ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
              : 'text-[var(--color-text-secondary)] active:text-[var(--color-text)]'
          )}
        >
          {tab.icon}
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
