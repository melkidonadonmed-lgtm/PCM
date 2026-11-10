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
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
          1. Símbolo Clínico Central
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSymbol('asclepius')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              symbol === 'asclepius'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">Bastão Asclépio</span>
          </button>

          <button
            type="button"
            onClick={() => setSymbol('cross')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              symbol === 'cross'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Cruz da Saúde</span>
          </button>

          <button
            type="button"
            onClick={() => setSymbol('stethoscope')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              symbol === 'stethoscope'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">Estetoscópio</span>
          </button>

          <button
            type="button"
            onClick={() => setSymbol('ecg_heart')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              symbol === 'ecg_heart'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">Coração com ECG</span>
          </button>

          <button
            type="button"
            onClick={() => setSymbol('monogram')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer col-span-2 sm:col-span-1 ${
              symbol === 'monogram'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Type className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">Monograma</span>
          </button>
        </div>

        {symbol === 'monogram' && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Iniciais:</span>
            <input
              type="text"
              maxLength={4}
              aria-label="Iniciais do monograma"
              value={monogramText}
              onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
              className="w-24 px-2.5 py-1 text-xs font-bold uppercase rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus:border-info text-center"
              placeholder="Ex.: MD"
            />
            <span className="text-xs text-[var(--text-muted)]">Até 4 caracteres</span>
          </div>
        )}
      </div>

      {/* 2. Estilo de Moldura */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
          2. Moldura &amp; Estrutura
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setFrame('double_circle')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer text-center ${
              frame === 'double_circle'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Circle className="w-4 h-4" />
            <span>Círculo Duplo</span>
          </button>

          <button
            type="button"
            onClick={() => setFrame('shield')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer text-center ${
              frame === 'shield'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Escudo Oficial</span>
          </button>

          <button
            type="button"
            onClick={() => setFrame('hexagon')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer text-center ${
              frame === 'hexagon'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Hexagon className="w-4 h-4" />
            <span>Hexágono</span>
          </button>

          <button
            type="button"
            onClick={() => setFrame('none')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer text-center ${
              frame === 'none'
                ? 'border-info bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Sem Moldura</span>
          </button>
        </div>
      </div>

      {/* 3. Paleta de Cores Institucional */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center justify-between">
          <span>3. Paleta de Cores</span>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 normal-case">
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
                className={`p-2 rounded-xl border transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'border-info ring-2 ring-sky-500/40 bg-[var(--surface-hover)]'
                    : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: pal.primary }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
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
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          4. Textos do Timbre Institucional
        </label>

        <div>
          <span className="block text-xs font-medium text-[var(--text-muted)] mb-1">
            Nome da Instituição (Texto Superior / Principal)
          </span>
          <input
            type="text"
            aria-label="Nome da Instituição"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value.toUpperCase())}
            placeholder="Ex.: SECRETARIA MUNICIPAL DE SAÚDE"
            className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus:border-info font-semibold"
          />
        </div>

        <div>
          <span className="block text-xs font-medium text-[var(--text-muted)] mb-1">
            Subtítulo / Esfera (Texto Inferior)
          </span>
          <input
            type="text"
            aria-label="Subtítulo ou esfera institucional"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
            placeholder="Ex.: ATENÇÃO BÁSICA — SUS"
            className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus:border-info font-semibold"
          />
        </div>

        {frame === 'double_circle' && (
          <div className="flex items-center gap-4 text-xs pt-1">
            <span className="text-[var(--text-muted)] font-medium">Disposição do Texto:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="text_layout"
                checked={textLayout === 'curved'}
                onChange={() => setTextLayout('curved')}
                className="text-sky-600 focus:ring-sky-500"
              />
              <span>Arco Circular</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="text_layout"
                checked={textLayout === 'bottom_banner'}
                onChange={() => setTextLayout('bottom_banner')}
                className="text-sky-600 focus:ring-sky-500"
              />
              <span>Faixa Inferior</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
