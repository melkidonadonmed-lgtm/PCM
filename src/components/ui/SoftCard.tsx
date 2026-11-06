import React from 'react';
import type { UIState } from '../../types/index';

export interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'raised' | 'inset';
  state?: UIState;
}

export const SoftCard: React.FC<SoftCardProps> = ({
  variant = 'flat',
  state = 'idle',
  className = '',
  children,
  ...rest
}) => {
  const variantClass =
    variant === 'inset'
      ? 'surface-inset border border-subtle dark:border-strong rounded-2xl'
      : variant === 'raised'
        ? 'cq-card card-surface surface-raised ui-card-soft rounded-2xl border border-subtle dark:border-strong'
        : 'cq-card card-surface ui-card-soft rounded-2xl border border-subtle dark:border-strong';

  return (
    <div
      data-state={state}
      aria-busy={state === 'loading' ? true : undefined}
      className={`${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
};
