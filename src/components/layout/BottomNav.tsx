import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Home, List, CreditCard, Target, BarChart3 } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/plan', label: 'Plan', icon: BarChart3 },
  { path: '/transactions', label: 'Activity', icon: List },
  { path: '/debts', label: 'Debts', icon: CreditCard },
  { path: '/goals', label: 'Goals', icon: Target },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border-light)] tab-bar-safe safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={clsx(
                'flex flex-col items-center gap-0.5 py-2 px-2 min-w-[60px] min-h-[52px] justify-center transition-all duration-200 rounded-xl active:scale-95 no-select',
                isActive
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] active:text-[var(--color-text-secondary)]'
              )}
            >
              <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
