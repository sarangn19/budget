import { useEffect, useRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50 modal-backdrop" />
      <div
        className={clsx(
          'relative bg-[var(--color-surface)] w-full max-h-[92vh] overflow-y-auto animate-slideUp',
          'rounded-t-3xl sm:rounded-2xl shadow-2xl',
          'safe-bottom',
          {
            'max-w-sm': size === 'sm',
            'max-w-md': size === 'md',
            'max-w-lg': size === 'lg',
            'max-w-full sm:max-w-2xl': size === 'full',
          },
          className
        )}
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>
        {title && (
          <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border-light)] px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-xl hover:bg-[var(--color-surface-dim)] active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-4 pt-2 sm:pt-4">{children}</div>
      </div>
    </div>
  );
}
