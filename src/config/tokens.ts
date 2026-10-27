/**
 * Contrato Tipado de Tokens Semânticos por Propósito (PresCMed · medtech_clinico)
 * Sincronizado com DESIGN.md (Google Labs) e src/index.css.
 */
export const PRESCMED_TOKENS = {
  purpose: 'medtech_clinico' as const,
  colors: {
    primary: '#1E3A8A',
    onPrimary: '#FFFFFF',
    secondary: '#334155',
    onSecondary: '#FFFFFF',
    neutral: '#F8FAFC',
    onNeutral: '#0F172A',
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    clinical: '#0F766E',
    onClinical: '#FFFFFF',
    obsidian: '#0F172A',
    onObsidian: '#F8FAFC',
    rose: '#BE123C',
    onRose: '#FFFFFF',
  },
  cssVars: {
    canvas: 'var(--bg-canvas)',
    surface: 'var(--bg-surface)',
    surfaceCard: 'var(--surface-card)',
    surfaceInset: 'var(--surface-inset)',
    surfaceRaised: 'var(--surface-raised)',
    surfaceHover: 'var(--surface-hover)',
    surfaceModal: 'var(--surface-modal)',
    inkPrimary: 'var(--ink-primary)',
    textMain: 'var(--text-main)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    borderSubtle: 'var(--border-subtle)',
    oklchPrimary: 'var(--oklch-primary)',
    oklchPrimaryHover: 'var(--oklch-primary-hover)',
    shadowSculpted: 'var(--shadow-sculpted)',
    easeSpring: 'var(--ease-spring)',
  },
  radii: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '64px',
  },
} as const;

export type PrescMedTokens = typeof PRESCMED_TOKENS;
