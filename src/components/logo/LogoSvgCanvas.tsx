import React from 'react';
import { Download, Eye } from 'lucide-react';

export type CentralSymbol = 'asclepius' | 'cross' | 'stethoscope' | 'ecg_heart' | 'monogram';
export type FrameStyle = 'double_circle' | 'shield' | 'hexagon' | 'none';
export type ColorPalette = 'petrol' | 'sus' | 'navy' | 'gold' | 'dark';
export type TextLayout = 'curved' | 'bottom_banner';

export interface PaletteConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgTint: string;
}

export const PALETTES: Record<ColorPalette, PaletteConfig> = {
  petrol: {
    name: 'Azul Petróleo',
    primary: '#0284C7',
    secondary: '#0369A1',
    accent: '#38BDF8',
    bgTint: '#F0F9FF'
  },
  sus: {
    name: 'Verde SUS',
    primary: '#059669',
    secondary: '#047857',
    accent: '#34D399',
    bgTint: '#ECFDF5'
  },
  navy: {
    name: 'Deep Navy',
    primary: '#142032',
    secondary: '#1E293B',
    accent: '#0284C7',
    bgTint: '#F8FAFC'
  },
  gold: {
    name: 'Dourado Acetinado',
    primary: '#D97706',
    secondary: '#B45309',
    accent: '#FBBF24',
    bgTint: '#FFFBEB'
  },
  dark: {
    name: 'Monocromático Escuro',
    primary: '#1E293B',
    secondary: '#0F172A',
    accent: '#64748B',
    bgTint: '#F8FAFC'
  }
};

interface LogoSvgCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  uniqueId: string;
  symbol: CentralSymbol;
  frame: FrameStyle;
  currentPalette: PaletteConfig;
  institutionName: string;
  subtitle: string;
  monogramText: string;
  textLayout: TextLayout;
  previewDarkBg: boolean;
  onTogglePreviewDarkBg: () => void;
  onDownloadSvg: () => void;
}

export const LogoSvgCanvas: React.FC<LogoSvgCanvasProps> = ({
  svgRef,
  uniqueId,
  symbol,
  frame,
  currentPalette,
  institutionName,
  subtitle,
  monogramText,
  textLayout,
  previewDarkBg,
  onTogglePreviewDarkBg,
  onDownloadSvg
}) => {
  const primaryGradId = `prim_grad_${uniqueId}`;
  const secGradId = `sec_grad_${uniqueId}`;
  const upperArcId = `upper_arc_${uniqueId}`;
  const lowerArcId = `lower_arc_${uniqueId}`;

  return (
    <div className="lg:col-span-5 flex flex-col items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
      <div className="w-full flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-sky-600" />
          <span>Visualização Vetorial em Tempo Real</span>
        </span>
        <button
          type="button"
          onClick={onTogglePreviewDarkBg}
          className="text-xs hover:text-[var(--text-main)] underline cursor-pointer"
        >
          Fundo {previewDarkBg ? 'Claro' : 'Escuro'}
        </button>
      </div>

      {/* SVG Render Box */}
      <div
        className={`w-full aspect-square max-w-[280px] sm:max-w-[320px] rounded-2xl p-4 flex items-center justify-center transition-colors shadow-tactile-md border ${
          previewDarkBg ? 'bg-slate-900 border-strong' : 'bg-white border-subtle'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 300 300"
          width="100%"
          height="100%"
          className="w-full h-full select-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gradientes da Paleta */}
            <linearGradient id={primaryGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentPalette.primary} />
              <stop offset="100%" stopColor={currentPalette.secondary} />
            </linearGradient>

            <linearGradient id={secGradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={currentPalette.secondary} />
              <stop offset="100%" stopColor={currentPalette.accent} />
            </linearGradient>

            {/* Caminhos circulares para texto curvo */}
            <path
              id={upperArcId}
              d="M 46 150 A 104 104 0 0 1 254 150"
              fill="none"
            />
            <path
              id={lowerArcId}
              d="M 254 150 A 104 104 0 0 1 46 150"
              fill="none"
            />
          </defs>

          {/* 1. MOLDURA (FRAME) */}
          {frame === 'double_circle' && (
            <g>
              <circle
                cx="150"
                cy="150"
                r="140"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="4"
              />
              <circle
                cx="150"
                cy="150"
                r="128"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="1.5"
              />
              <circle cx="36" cy="150" r="3.5" fill={currentPalette.primary} />
              <circle cx="264" cy="150" r="3.5" fill={currentPalette.primary} />
            </g>
          )}

          {frame === 'shield' && (
            <g>
              <path
                d="M 65 48 Q 150 36 235 48 C 235 152 215 220 150 268 C 85 220 65 152 65 48 Z"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <path
                d="M 76 60 Q 150 50 224 60 C 224 150 206 210 150 254 C 94 210 76 150 76 60 Z"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
          )}

          {frame === 'hexagon' && (
            <g>
              <polygon
                points="150,18 266,85 266,215 150,282 34,215 34,85"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <polygon
                points="150,30 254,91 254,209 150,270 46,209 46,91"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* 2. SÍMBOLO CENTRAL */}
          {symbol === 'asclepius' && (
            <g id="symbol_asclepius" transform="translate(0, 0)">
              <rect
                x="146.5"
                y="65"
                width="7"
                height="170"
                rx="3.5"
                fill={`url(#${primaryGradId})`}
              />
              <circle cx="150" cy="63" r="6" fill={`url(#${primaryGradId})`} />
              <circle cx="150" cy="237" r="4.5" fill={`url(#${primaryGradId})`} />

              <path
                d="M 134 76 C 122 84 126 98 144 102 C 166 106 174 118 164 130 C 146 140 132 148 138 162 C 146 174 172 176 162 192 C 146 204 134 212 140 224 C 144 230 152 233 150 236"
                fill="none"
                stroke={`url(#${secGradId})`}
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M 134 76 C 126 72 124 62 130 58 C 137 54 144 60 142 68 Z"
                fill={`url(#${secGradId})`}
              />
              <circle cx="132" cy="63" r="1.5" fill="#FFFFFF" />
            </g>
          )}

          {symbol === 'cross' && (
            <g id="symbol_cross">
              <path
                d="M 135 95 C 135 91 138 88 142 88 L 158 88 C 162 88 165 91 165 95 L 165 135 L 205 135 C 209 135 212 138 212 142 L 212 158 C 212 162 209 165 205 165 L 165 165 L 165 205 C 165 209 162 212 158 212 L 142 212 C 138 212 135 209 135 205 L 135 165 L 95 165 C 91 165 88 162 88 158 L 88 142 C 88 138 91 135 95 135 L 135 135 Z"
                fill={`url(#${primaryGradId})`}
              />
              <path
                d="M 148 102 L 152 102 L 152 148 L 198 148 L 198 152 L 152 152 L 152 198 L 148 198 L 148 152 L 102 152 L 102 148 L 148 148 Z"
                fill="#FFFFFF"
                opacity="0.85"
              />
            </g>
          )}

          {symbol === 'stethoscope' && (
            <g id="symbol_stethoscope">
              <path
                d="M 124 88 C 124 72 136 66 146 66 L 148 84"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 176 88 C 176 72 164 66 154 66 L 152 84"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="124" cy="90" r="4.5" fill={`url(#${secGradId})`} />
              <circle cx="176" cy="90" r="4.5" fill={`url(#${secGradId})`} />

              <path
                d="M 148 84 L 150 96 L 152 84"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="5"
              />
              <path
                d="M 150 96 C 150 142 110 152 110 182 C 110 216 182 216 182 178 L 182 166"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="6"
                strokeLinecap="round"
              />

              <circle cx="182" cy="154" r="16" fill={`url(#${secGradId})`} />
              <circle cx="182" cy="154" r="11" fill={`url(#${primaryGradId})`} />
              <circle cx="182" cy="154" r="5" fill="#FFFFFF" opacity="0.9" />
            </g>
          )}

          {symbol === 'ecg_heart' && (
            <g id="symbol_ecg_heart">
              <path
                d="M 150 226 C 105 186 80 152 80 118 C 80 88 104 68 132 68 C 142 68 147 73 150 78 C 153 73 158 68 168 68 C 196 68 220 88 220 118 C 220 152 195 186 150 226 Z"
                fill="none"
                stroke={`url(#${primaryGradId})`}
                strokeWidth="6.5"
                strokeLinejoin="round"
              />
              <path
                d="M 72 142 L 112 142 L 120 128 L 130 162 L 142 96 L 156 180 L 168 130 L 178 148 L 188 142 L 228 142"
                fill="none"
                stroke={`url(#${secGradId})`}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {symbol === 'monogram' && (
            <g id="symbol_monogram">
              <text
                x="150"
                y="164"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="56"
                fontWeight="bold"
                letterSpacing="3"
                fill={`url(#${primaryGradId})`}
              >
                {monogramText || 'PCM'}
              </text>
              <path
                d="M 105 188 L 195 188 M 120 193 L 180 193"
                stroke={`url(#${secGradId})`}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="150" cy="193" r="2.5" fill={currentPalette.primary} />
            </g>
          )}

          {/* 3. TIPOGRAFIA INTEGRADA */}
          {frame === 'double_circle' && textLayout === 'curved' ? (
            <g>
              {institutionName && (
                <text
                  fill={currentPalette.primary}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="10"
                  fontWeight="800"
                  letterSpacing="1.8"
                >
                  <textPath
                    href={`#${upperArcId}`}
                    xlinkHref={`#${upperArcId}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {institutionName}
                  </textPath>
                </text>
              )}

              {subtitle && (
                <text
                  fill={currentPalette.secondary}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="9"
                  fontWeight="700"
                  letterSpacing="1.2"
                >
                  <textPath
                    href={`#${lowerArcId}`}
                    xlinkHref={`#${lowerArcId}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {subtitle}
                  </textPath>
                </text>
              )}
            </g>
          ) : (
            <g>
              {institutionName && (
                <g>
                  <rect
                    x="35"
                    y="242"
                    width="230"
                    height="20"
                    rx="4"
                    fill={currentPalette.primary}
                  />
                  <text
                    x="150"
                    y="256"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize="9"
                    fontWeight="800"
                    letterSpacing="1"
                  >
                    {institutionName.length > 32
                      ? institutionName.substring(0, 30) + '...'
                      : institutionName}
                  </text>
                </g>
              )}

              {subtitle && (
                <text
                  x="150"
                  y="276"
                  textAnchor="middle"
                  fill={currentPalette.secondary}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="1.2"
                >
                  {subtitle}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Informações de Renderização Vetorial */}
      <div className="w-full text-center text-xs text-[var(--text-muted)] space-y-0.5">
        <p className="font-bold text-[var(--text-main)]">
          Vetor SVG Puro • Escalabilidade Infinita
        </p>
        <p>
          Compatível com timbrados A4, carimbos e impressão direta.
        </p>
      </div>

      {/* Ações do Preview */}
      <div className="w-full flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={onDownloadSvg}
          className="flex-1 py-2 px-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          title="Salvar arquivo vetorial .svg no computador"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar .SVG</span>
        </button>
      </div>
    </div>
  );
};
