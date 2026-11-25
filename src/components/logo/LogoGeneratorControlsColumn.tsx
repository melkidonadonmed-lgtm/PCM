import React from 'react';
import {
  Shield,
  Activity,
  Heart,
  Type,
  Circle,
  Hexagon,
  Square,
} from '../Icon';
import {
  PALETTES,
  type CentralSymbol,
  type FrameStyle,
  type ColorPalette,
  type TextLayout,
} from './LogoSvgCanvas';

export function extractDoctorInitials(doctorName?: string): string {
  if (!doctorName?.trim()) return 'PCM';
  const cleaned = doctorName
    .replace(/^(Dr\.|Dra\.|Dr|Dra)\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
  return cleaned || 'MD';
}

export interface LogoGeneratorControlsColumnProps {
  symbol: CentralSymbol;
  setSymbol: React.Dispatch<React.SetStateAction<CentralSymbol>>;
  monogramText: string;
  setMonogramText: React.Dispatch<React.SetStateAction<string>>;
  frame: FrameStyle;
  setFrame: React.Dispatch<React.SetStateAction<FrameStyle>>;
  paletteKey: ColorPalette;
  setPaletteKey: React.Dispatch<React.SetStateAction<ColorPalette>>;
  institutionName: string;
  setInstitutionName: React.Dispatch<React.SetStateAction<string>>;
  subtitle: string;
  setSubtitle: React.Dispatch<React.SetStateAction<string>>;
  textLayout: TextLayout;
  setTextLayout: React.Dispatch<React.SetStateAction<TextLayout>>;
}

export const LogoGeneratorControlsColumn: React.FC<LogoGeneratorControlsColumnProps> = ({
  symbol,
  setSymbol,
  monogramText,
  setMonogramText,
  frame,
  setFrame,
  paletteKey,
  setPaletteKey,
  institutionName,
  setInstitutionName,
  subtitle,
  setSubtitle,
  textLayout,
  setTextLayout,
}) => {
  const currentPalette = PALETTES[paletteKey];

  return (
    <div className="lg:col-span-7 space-y-5">
      {/* 1. Símbolo Central */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)] mb-2">
          1. Símbolo Clínico Central
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSymbol('asclepius')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              symbol === 'asclepius'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Activity className="w-4 h-4 text-[var(--ink-clinical)] shrink-0" />
            <span className="truncate">Bastão Asclépio</span>
          </button>

          <button
            type="button"
            onClick={() => setSymbol('cross')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              symbol === 'cross'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Shield className="w-4 h-4 text-[var(--ink-clinical)] shrink-0" />
            <span className="truncate">Cruz da Saúde</span>
          </button>

          <button
            type="button"
            onClick={() => setSymbol('stethoscope')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              symbol === 'stethoscope'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Activity className="w-4 h-4 text-[var(--ink-clinical)] shrink-0" />
            <span className="truncate">Estetoscópio</span>
          </button>

          <button
            type="button"
            onClick={() => setSymbol('ecg_heart')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              symbol === 'ecg_heart'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Heart className="w-4 h-4 text-[var(--status-danger)] shrink-0" />
            <span className="truncate">Coração com ECG</span>
          </button>

          <button
            type="button"
            onClick={() => setSymbol('monogram')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer col-span-2 sm:col-span-1 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              symbol === 'monogram'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Type className="w-4 h-4 text-[var(--accent-amber)] shrink-0" />
            <span className="truncate">Monograma</span>
          </button>
        </div>

        {symbol === 'monogram' && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-[var(--ink-muted)] font-medium">Iniciais:</span>
            <input
              id="logo-monogram-initials"
              name="monogramText"
              type="text"
              maxLength={4}
              aria-label="Iniciais do monograma"
              value={monogramText}
              onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
              className="w-24 min-h-[44px] px-2.5 py-1 text-xs font-bold uppercase rounded-lg border border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus:border-[var(--accent-focus)] text-center"
              placeholder="Ex.: MD"
            />
            <span className="text-xs text-[var(--ink-muted)]">Até 4 caracteres</span>
          </div>
        )}
      </div>

      {/* 2. Estilo de Moldura */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)] mb-2">
          2. Moldura &amp; Estrutura
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setFrame('double_circle')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              frame === 'double_circle'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Circle className="w-4 h-4" />
            <span>Círculo Duplo</span>
          </button>

          <button
            type="button"
            onClick={() => setFrame('shield')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              frame === 'shield'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Escudo Oficial</span>
          </button>

          <button
            type="button"
            onClick={() => setFrame('hexagon')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              frame === 'hexagon'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Hexagon className="w-4 h-4" />
            <span>Hexágono</span>
          </button>

          <button
            type="button"
            onClick={() => setFrame('none')}
            className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
              frame === 'none'
                ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Sem Moldura</span>
          </button>
        </div>
      </div>

      {/* 3. Paleta de Cores Institucional */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)] mb-2 flex items-center justify-between">
          <span>3. Paleta de Cores</span>
          <span className="text-xs font-semibold text-[var(--ink-clinical)] normal-case">
            {currentPalette.name}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(PALETTES) as ColorPalette[]).map((key) => {
            const pal = PALETTES[key];
            const isSelected = paletteKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPaletteKey(key)}
                className={`min-h-[44px] p-2 rounded-xl border transition-colors cursor-pointer flex flex-col items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                  isSelected
                    ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-[var(--accent-focus)]/30'
                    : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="w-4 h-4 rounded-full border border-[oklch(0.20_0.02_255/0.15)] shadow-xs"
                    style={{ backgroundColor: pal.primary }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-[oklch(0.20_0.02_255/0.15)] shadow-xs"
                    style={{ backgroundColor: pal.secondary }}
                  />
                </div>
                <span className="text-xs font-bold text-center leading-tight">
                  {pal.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tipografia Integrada */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
          4. Textos do Timbre Institucional
        </label>

        <div>
          <span className="block text-xs font-medium text-[var(--ink-muted)] mb-1">
            Nome da Instituição (Texto Superior / Principal)
          </span>
          <input
            id="logo-institution-name"
            name="institutionName"
            type="text"
            aria-label="Nome da Instituição"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value.toUpperCase())}
            placeholder="Ex.: SECRETARIA MUNICIPAL DE SAÚDE"
            className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus:border-[var(--accent-focus)] font-semibold"
          />
        </div>

        <div>
          <span className="block text-xs font-medium text-[var(--ink-muted)] mb-1">
            Subtítulo / Esfera (Texto Inferior)
          </span>
          <input
            id="logo-institution-subtitle"
            name="subtitle"
            type="text"
            aria-label="Subtítulo ou esfera institucional"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
            placeholder="Ex.: ATENÇÃO BÁSICA — SUS"
            className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus:border-[var(--accent-focus)] font-semibold"
          />
        </div>

        {frame === 'double_circle' && (
          <div className="flex items-center gap-4 text-xs pt-1">
            <span className="text-[var(--ink-muted)] font-medium">Disposição do Texto:</span>
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
              <input
                type="radio"
                name="text_layout"
                checked={textLayout === 'curved'}
                onChange={() => setTextLayout('curved')}
                className="text-[var(--clinical)] focus:ring-[var(--accent-focus)]"
              />
              <span>Arco Circular</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
              <input
                type="radio"
                name="text_layout"
                checked={textLayout === 'bottom_banner'}
                onChange={() => setTextLayout('bottom_banner')}
                className="text-[var(--clinical)] focus:ring-[var(--accent-focus)]"
              />
              <span>Faixa Inferior</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
