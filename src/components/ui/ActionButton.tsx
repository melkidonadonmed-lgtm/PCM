import React, { useState } from 'react';
import { Icon } from '../Icon';
import type { UIState } from './SurfaceCard';

export type ActionButtonVariant = 'primary' | 'clinical' | 'secondary' | 'ghost' | 'danger' | 'icon';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  state?: UIState;
  isLoading?: boolean;
  iconName?: string;
  iconRight?: string;
  tabular?: boolean;
}

const VARIANT_CLASSES: Record<ActionButtonVariant, string> = {
  primary: 'btn-tactile-primary',
  clinical: 'btn-tactile-clinical',
  secondary: 'btn-tactile-secondary',
  ghost:
    'bg-transparent hover:bg-[var(--surface-hover)] text-[var(--text-main)] border border-subtle dark:border-white/10 rounded-xl px-3.5 py-2 font-semibold transition cursor-pointer',
  danger:
    'bg-slate-100 hover:bg-slate-200 dark:bg-[#27354A] dark:hover:bg-[#334155] text-rose-700 dark:text-rose-300 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 font-bold transition cursor-pointer',
  icon: 'btn-tactile-icon !w-11 !h-11 !min-w-[44px] !min-h-[44px]',
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'secondary',
  state,
  isLoading = false,
  iconName,
  iconRight,
  tabular = false,
  disabled,
  className = '',
  children,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const resolvedState: UIState =
    state ?? (isLoading ? 'loading' : isPressed ? 'pressed' : 'idle');

  return (
    <button
      type="button"
      data-variant={variant}
      data-state={resolvedState}
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      onMouseDown={(e) => {
        setIsPressed(true);
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setIsPressed(false);
        onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        setIsPressed(false);
        onMouseLeave?.(e);
      }}
      className={`min-h-[44px] min-w-[44px] btn-anti-squish inline-flex items-center justify-center gap-1.5 text-xs focus-visible:ring-2 focus-visible:ring-sky-500 outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
        VARIANT_CLASSES[variant]
      } ${tabular ? 'tabular-nums clinical-tabular-nums' : ''} ${className}`.trim()}
      {...rest}
    >
      {isLoading ? (
        <Icon name="sync" className="text-[16px] icon-spin" />
      ) : (
        iconName && <Icon name={iconName} className="text-[16px] shrink-0" />
      )}
      {children && <span>{children}</span>}
      {!isLoading && iconRight && <Icon name={iconRight} className="text-[16px] shrink-0" />}
    </button>
  );
};
