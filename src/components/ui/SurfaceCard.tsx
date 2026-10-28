import React from 'react';
import type { UIState } from '../../types/index';

export type { UIState };
export type SurfaceVariant = 'surface' | 'elevated' | 'inset' | 'contrast';

export interface SurfaceCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'article' | 'div';
  title?: string;
  eyebrow?: string;
  colSpan?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
  variant?: SurfaceVariant;
  state?: UIState;
  isLoading?: boolean;
  error?: string | null;
  interactive?: boolean;
  headerRight?: React.ReactNode;
}

const COL_SPAN_MAP: Record<NonNullable<SurfaceCardProps['colSpan']>, string> = {
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  12: 'col-span-12',
};

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  as: Component = 'article',
  title,
  eyebrow,
  colSpan,
  variant = 'surface',
  state,
  isLoading = false,
  error = null,
  interactive = false,
  headerRight,
  className = '',
  children,
  ...rest
}) => {
  const resolvedState: UIState =
    state ?? (error ? 'error' : isLoading ? 'loading' : 'idle');

  const spanClass = colSpan ? COL_SPAN_MAP[colSpan] : '';
  const variantClass =
    variant === 'inset'
      ? 'surface-inset border border-subtle dark:border-strong rounded-2xl'
      : variant === 'elevated'
        ? 'tactile-card surface-raised rounded-2xl'
        : variant === 'contrast'
          ? 'panel-navy rounded-2xl border'
          : interactive
            ? 'tactile-card-interactive rounded-2xl'
            : 'tactile-card rounded-2xl';

  return (
    <Component
      data-variant={variant}
      data-state={resolvedState}
      aria-busy={resolvedState === 'loading'}
      aria-label={title || rest['aria-label']}
      className={`cq-card ${variantClass} ${spanClass} ${className}`.trim()}
      {...rest}
    >
      {(title || eyebrow || headerRight) && (
        <header className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-subtle dark:border-strong">
          <div className="min-w-0">
            {eyebrow && (
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                {eyebrow}
              </span>
            )}
            {title && (
              <h3 className="text-sm sm:text-base font-semibold tracking-tight text-[var(--text-main)] truncate">
                {title}
              </h3>
            )}
          </div>
          {headerRight && <div className="flex items-center gap-2 shrink-0">{headerRight}</div>}
        </header>
      )}
      {resolvedState === 'loading' ? (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="p-4 rounded-xl text-xs font-medium text-[var(--text-muted)]"
        >
          Processando dados clínicos...
        </div>
      ) : error ? (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium"
        >
          {error}
        </div>
      ) : (
        children
      )}
    </Component>
  );
};
