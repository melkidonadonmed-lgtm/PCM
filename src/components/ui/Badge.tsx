import React from 'react';

export type BadgeTone = 'neutral' | 'info' | 'clinical' | 'warning' | 'danger' | 'navy';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  tabular?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100/85 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-white/[0.08]',
  info: 'bg-sky-50/90 dark:bg-sky-950/45 text-sky-800 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/40',
  clinical: 'bg-emerald-50/90 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40',
  warning: 'bg-amber-50/90 dark:bg-amber-950/45 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40',
  danger: 'bg-rose-50/90 dark:bg-rose-950/45 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40',
  navy: 'bg-navy-800 dark:bg-[#1E293B] text-white border-white/10',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  tabular = true,
  className = '',
  children,
  ...rest
}) => (
  <span
    data-state="idle"
    aria-busy={false}
    role={tone === 'danger' ? 'alert' : undefined}
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight border shrink-0 select-none ${
      TONE_CLASSES[tone]
    } ${tabular ? 'tabular-nums clinical-tabular-nums' : ''} ${className}`.trim()}
    {...rest}
  >
    {children}
  </span>
);
