import clsx from 'clsx';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-1 min-w-[160px] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg animate-scaleIn',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  icon?: ReactNode;
}

export function DropdownItem({ children, onClick, danger, icon }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors first:rounded-t-xl last:rounded-b-xl min-h-[44px] active:scale-95',
        danger
          ? 'text-[var(--color-danger)] hover:bg-red-50'
          : 'text-[var(--color-text)] hover:bg-[var(--color-surface-dim)]'
      )}
    >
      {icon}
      {children}
    </button>
  );
}

interface SelectDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SelectDropdown({ value, options, onChange, placeholder, className }: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-[15px] transition-all duration-150',
          'bg-[var(--color-surface)] text-[var(--color-text)]',
          'border-[var(--color-border)] active:border-[var(--color-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
          'min-h-[48px]'
        )}
      >
        <span className={selected ? '' : 'text-[var(--color-text-muted)]'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={clsx('text-[var(--color-text-muted)] transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg max-h-60 overflow-y-auto animate-scaleIn">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full text-left px-4 py-3 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl min-h-[44px] active:scale-95',
                value === option.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-surface-dim)]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
