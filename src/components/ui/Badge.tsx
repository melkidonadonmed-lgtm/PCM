import React from 'react';

export type BadgeTone = 'neutral' | 'info' | 'clinical' | 'warning' | 'danger' | 'navy';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  tabular?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-subtle dark:border-strong',
  info: 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200 border-info',
  clinical: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-clinical',
  warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-warning',
  danger: 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border-rose-500/30',
  navy: 'bg-navy-800 dark:bg-navy-700 text-white border-transparent',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  tabular = true,
  className = '',
  children,
  ...rest
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold border shrink-0 ${
      TONE_CLASSES[tone]
    } ${tabular ? 'tabular-nums clinical-tabular-nums' : ''} ${className}`.trim()}
    {...rest}
  >
    {children}
  </span>
);
