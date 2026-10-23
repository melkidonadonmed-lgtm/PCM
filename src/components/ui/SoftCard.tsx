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
      ? 'surface-inset'
      : variant === 'raised'
        ? 'surface-raised ui-card-soft'
        : 'ui-card-soft';

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
