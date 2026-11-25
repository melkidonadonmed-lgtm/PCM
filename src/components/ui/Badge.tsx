import React from 'react';

export type BadgeTone = 'neutral' | 'info' | 'clinical' | 'warning' | 'danger' | 'navy';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  tabular?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--surface-chip-muted)] text-[var(--ink-secondary)] border-[var(--hairline)]',
  info: 'bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border-[var(--hairline)]',
  clinical: 'bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border-[var(--hairline)]',
  warning: 'bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border-[var(--hairline)]',
  danger: 'bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border-[var(--hairline)]',
  navy: 'bg-navy-800 dark:bg-[#1E293B] text-white border-white/10',
};

const TONE_DOT_CLASSES: Partial<Record<BadgeTone, string>> = {
  clinical: 'bg-[var(--ink-clinical)]',
  warning: 'bg-[var(--accent-amber)]',
  danger: 'bg-[var(--status-danger)]',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  tabular = true,
  className = '',
  children,
  ...rest
}) => {
  const hasResponsiveDisplay = /\bhidden\b/.test(className);
  const dotClass = TONE_DOT_CLASSES[tone];
  return (
    <span
      data-state="idle"
      aria-busy={false}
      role={tone === 'danger' ? 'alert' : undefined}
      className={`${hasResponsiveDisplay ? '' : 'inline-flex '}items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[11px] font-semibold tracking-tight border shrink-0 select-none ${
        TONE_CLASSES[tone]
      } ${tabular ? 'tabular-nums clinical-tabular-nums' : ''} ${className}`.trim()}
      {...rest}
    >
      {dotClass && <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />}
      {children}
    </span>
  );
};
