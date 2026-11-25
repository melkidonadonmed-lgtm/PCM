import React from 'react';
import { Icon } from '../Icon';
import type { UIState } from './SurfaceCard';

export type ActionButtonVariant = 'primary' | 'clinical' | 'secondary' | 'ghost' | 'danger' | 'icon';
export type ActionButtonSize = 'sm' | 'md' | 'icon';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  state?: UIState;
  isLoading?: boolean;
  /** Alias for `isLoading` to preserve API ergonomics across callers. */
  loading?: boolean;
  iconName?: string;
  /** Alias for `iconName` to preserve API ergonomics across callers. */
  icon?: string;
  iconRight?: string;
  iconClassName?: string;
  tabular?: boolean;
}

const VARIANT_CLASSES: Record<ActionButtonVariant, string> = {
  primary: 'btn-tactile-primary',
  clinical: 'btn-tactile-clinical',
  secondary: 'btn-tactile-secondary',
  ghost:
    'bg-transparent hover:bg-[var(--surface-hover)] text-[var(--ink-primary)] border border-transparent hover:border-[var(--hairline)] font-semibold transition-colors duration-150 cursor-pointer',
  danger: 'btn-tactile-danger',
  icon: 'btn-tactile-icon',
};

const SIZE_CLASSES: Record<ActionButtonSize, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-3.5 py-2',
  icon: 'p-0 w-11 h-11',
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'secondary',
  size,
  state,
  isLoading = false,
  loading = false,
  iconName,
  icon,
  iconRight,
  iconClassName = '',
  tabular = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const busy = isLoading || loading;
  const resolvedIcon = iconName ?? icon;
  const resolvedSize: ActionButtonSize = size ?? (variant === 'icon' ? 'icon' : 'md');
  const resolvedState: UIState = state ?? (busy ? 'loading' : 'idle');

  return (
    <button
      type={type}
      data-variant={variant}
      data-state={resolvedState}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      className={`touch-target min-h-[44px] min-w-[44px] rounded-[10px] text-[13px] font-semibold leading-none btn-anti-squish inline-flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-card)] disabled:opacity-55 disabled:shadow-none disabled:cursor-not-allowed ${
        VARIANT_CLASSES[variant]
      } ${SIZE_CLASSES[resolvedSize]} ${tabular ? 'tabular-nums clinical-tabular-nums' : ''} ${className}`.trim()}
      {...rest}
    >
      {busy ? (
        <Icon name="sync" size={16} className="icon-spin shrink-0" />
      ) : (
        resolvedIcon && <Icon name={resolvedIcon} size={16} className={`shrink-0 ${iconClassName}`.trim()} />
      )}
      {children != null && <span>{children}</span>}
      {!busy && iconRight && <Icon name={iconRight} size={16} className="shrink-0" />}
    </button>
  );
};
