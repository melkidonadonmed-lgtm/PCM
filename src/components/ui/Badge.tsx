import React from 'react';

export type BadgeTone = 'neutral' | 'info' | 'clinical' | 'warning' | 'danger' | 'navy';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  tabular?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-200/90 dark:bg-[#27354A] text-slate-700 dark:text-slate-200 border-slate-300/80 dark:border-white/10',
  info: 'bg-slate-100 dark:bg-[#27354A] text-sky-700 dark:text-sky-300 border-slate-300/80 dark:border-white/10',
  clinical: 'bg-slate-100 dark:bg-[#27354A] text-emerald-700 dark:text-emerald-300 border-slate-300/80 dark:border-white/10',
  warning: 'bg-slate-100 dark:bg-[#27354A] text-amber-700 dark:text-amber-300 border-slate-300/80 dark:border-white/10',
  danger: 'bg-slate-100 dark:bg-[#27354A] text-rose-700 dark:text-rose-300 border-slate-300/80 dark:border-white/10',
  navy: 'bg-navy-800 dark:bg-[#334155] text-white border-transparent',
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
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold border shrink-0 ${
      TONE_CLASSES[tone]
    } ${tabular ? 'tabular-nums clinical-tabular-nums' : ''} ${className}`.trim()}
    {...rest}
  >
    {children}
  </span>
);
