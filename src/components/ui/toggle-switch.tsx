'use client';

import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className,
}: ToggleSwitchProps) {
  const sizes = {
    sm: {
      container: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: 'translate-x-3',
    },
    md: {
      container: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-5',
    },
    lg: {
      container: 'h-7 w-12',
      thumb: 'h-6 w-6',
      translate: 'translate-x-5',
    },
  };

  const currentSize = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex items-center rounded-full border-2 border-transparent',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
        'transition-colors duration-200 ease-in-out',
        'disabled:cursor-not-allowed disabled:opacity-50',
        currentSize.container,
        checked 
          ? 'bg-[var(--gold-accent)]' 
          : 'bg-[var(--grey-500)]',
        className
      )}
    >
      <span className="sr-only">Toggle switch</span>
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0',
          'transform transition-transform duration-200 ease-in-out',
          currentSize.thumb,
          checked ? currentSize.translate : 'translate-x-0'
        )}
      />
    </button>
  );
}