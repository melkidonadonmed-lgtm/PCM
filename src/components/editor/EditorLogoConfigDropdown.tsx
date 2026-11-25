import React from 'react';
import {
  Icon,
  Image as ImageIcon,
  X,
  Building2,
  Upload,
  Sparkles,
  Trash2,
} from '../Icon';
import {
  DocumentLogoConfig,
  LogoPosition,
} from '../../types';
import { PRESET_LOGOS } from '../../data/presetAssets';

export interface EditorLogoConfigDropdownProps {
  logoConfig: DocumentLogoConfig;
  isLogoMenuOpen: boolean;
  setIsLogoMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeLogoTab: 'left' | 'right';
  setActiveLogoTab: React.Dispatch<React.SetStateAction<'left' | 'right'>>;
  handleChangeLogoPosition: (position: LogoPosition) => void;
  handleChangeLogoSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  logoUploading: boolean;
  setIsLogoGeneratorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleApplyPresetLogo: (dataUrl: string, name: string) => void;
  handleRemoveLogo: () => void;
  handleChangeSecondaryLogoSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
  secondaryFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleSecondaryLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  secondaryLogoUploading: boolean;
  handleApplySecondaryPresetLogo: (dataUrl: string, name: string) => void;
  handleRemoveSecondaryLogo: () => void;
}

export function resolveLogoBadgeLabel(logoConfig: DocumentLogoConfig): 'Duplo' | '1 Logo' | null {
  const hasPrimary = Boolean(logoConfig.dataUrl && logoConfig.visible !== false);
  const hasSecondary = Boolean(logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false);
  if (hasPrimary && hasSecondary) return 'Duplo';
  if (hasPrimary || hasSecondary || logoConfig.dataUrl || logoConfig.secondaryDataUrl) return '1 Logo';
  return null;
}

export const EditorLogoConfigDropdown: React.FC<EditorLogoConfigDropdownProps> = ({
  logoConfig,
  isLogoMenuOpen,
  setIsLogoMenuOpen,
  activeLogoTab,
  setActiveLogoTab,
  handleChangeLogoPosition,
  handleChangeLogoSize,
  fileInputRef,
  handleLogoUpload,
  logoUploading,
  setIsLogoGeneratorOpen,
  handleApplyPresetLogo,
  handleRemoveLogo,
  handleChangeSecondaryLogoSize,
  secondaryFileInputRef,
  handleSecondaryLogoUpload,
  secondaryLogoUploading,
  handleApplySecondaryPresetLogo,
  handleRemoveSecondaryLogo,
}) => {
  const badgeLabel = resolveLogoBadgeLabel(logoConfig);

  return (
    <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsLogoMenuOpen(prev => !prev)}
        className={`touch-target btn-tactile-secondary min-h-[44px] px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
          (logoConfig.dataUrl && logoConfig.visible) || (logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false)
            ? 'font-bold ring-1 ring-[var(--accent-focus)]/30'
            : ''
        }`}
        title="Configurar logotipos (esquerdo e direito) no timbrado A4"
      >
        <ImageIcon className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
        <span>Logotipo</span>
        {badgeLabel && (
          <span className="text-xs px-1.5 py-0.5 bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] rounded font-bold uppercase">
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Dropdown de Gestão do Logotipo com Abas: Esquerdo e Direito */}
      {isLogoMenuOpen && (
        <div className="fixed inset-x-3 top-24 sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-88 max-w-[calc(100vw-1.5rem)] bg-[var(--surface-card)] text-[var(--ink-primary)] border border-[var(--hairline)] rounded-2xl shadow-[var(--elevation-high)] p-4 z-50 flex flex-col gap-3 animate-tab-fade">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[var(--ink-secondary)]" />
              <h4 className="text-xs font-bold">Timbrado / Logotipos</h4>
            </div>
            <button
              type="button"
              onClick={() => setIsLogoMenuOpen(false)}
              aria-label="Fechar configuração de logotipos"
              className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--surface-hover)] text-[var(--ink-muted)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Seletor de Abas: Esquerda vs Direita */}
          <div className="flex items-center p-1 bg-[var(--bg-app)] rounded-xl border border-[var(--hairline)] gap-1">
            <button
              type="button"
              onClick={() => setActiveLogoTab('left')}
              className={`touch-target min-h-[44px] flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                activeLogoTab === 'left'
                  ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              <Icon name="format_align_left" size={14} />
              <span>Logo Esquerdo</span>
              {logoConfig.dataUrl && logoConfig.visible && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Logo esquerdo ativo" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveLogoTab('right')}
              className={`touch-target min-h-[44px] flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                activeLogoTab === 'right'
                  ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              <span>Logo Direito</span>
              <Icon name="format_align_right" size={14} />
              {logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Logo direito ativo" />
              )}
            </button>
          </div>

          {/* CONTEÚDO DA ABA ESQUERDA */}
          {activeLogoTab === 'left' && (
            <div className="space-y-3">
              {/* Posição do Logo Esquerdo */}
              <div>
                <label className="text-xs font-bold text-[var(--ink-secondary)] block mb-1">
                  Posição do Logo Esquerdo:
                </label>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleChangeLogoPosition('header-left')}
                    className={`touch-target min-h-[44px] p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                      logoConfig.position === 'header-left' ? 'bg-[var(--surface-card-lit)] border-[var(--border-control)] ring-1 ring-[var(--accent-focus)]/30 text-[var(--ink-primary)] font-bold' : 'border-[var(--border-control)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="text-xs">Header Esq.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeLogoPosition('top-left')}
                    className={`touch-target min-h-[44px] p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                      logoConfig.position === 'top-left' ? 'bg-[var(--surface-card-lit)] border-[var(--border-control)] ring-1 ring-[var(--accent-focus)]/30 text-[var(--ink-primary)] font-bold' : 'border-[var(--border-control)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Icon name="format_align_left" size={14} />
                    <span className="text-xs">Topo Esq.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeLogoPosition('top-center')}
                    className={`touch-target min-h-[44px] p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                      logoConfig.position === 'top-center' ? 'bg-[var(--surface-card-lit)] border-[var(--border-control)] ring-1 ring-[var(--accent-focus)]/30 text-[var(--ink-primary)] font-bold' : 'border-[var(--border-control)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <Icon name="format_align_center" size={14} />
                    <span className="text-xs">Topo Centro</span>
                  </button>
                </div>
              </div>

              {/* Tamanho do Logo Esquerdo */}
              <div>
                <label className="text-xs font-bold text-[var(--ink-secondary)] block mb-1">
                  Tamanho do Logo Esquerdo:
                </label>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleChangeLogoSize(sz)}
                      className={`touch-target min-h-[44px] py-1.5 rounded-lg border flex items-center justify-center text-center cursor-pointer transition focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                        logoConfig.size === sz
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-bold shadow-[var(--shadow-control)]'
                          : 'border-[var(--border-control)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ações: Upload, SVG, Presets */}
              <div className="pt-2 border-t border-[var(--hairline)] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id="editor-logo-left-upload"
                    name="logoLeftUpload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoUploading}
                    className="touch-target btn-tactile-primary min-h-[44px] flex-1 py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{logoUploading ? 'Carregando...' : 'Upload Logo Esq.'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLogoMenuOpen(false);
                      setIsLogoGeneratorOpen(true);
                    }}
                    className="touch-target btn-tactile-secondary min-h-[44px] py-2 px-2.5 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    title="Criar brasão vetorial SVG"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--ink-clinical)]" />
                    <span>Criar SVG</span>
                  </button>
                </div>

                {/* Presets Rápidos */}
                <div>
                  <span className="text-xs text-[var(--ink-muted)] block mb-1">Brasões Rápidos:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetLogo(PRESET_LOGOS.semusa.publicUrl, 'SEMUSA')}
                      className="touch-target min-h-[44px] flex-1 text-xs py-1.5 px-2 rounded-lg border border-[var(--border-control)] hover:border-[var(--border-control-hover)] flex items-center justify-center text-center truncate cursor-pointer"
                    >
                      SEMUSA
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetLogo(PRESET_LOGOS.sesau_ro.publicUrl, 'SESAU')}
                      className="touch-target min-h-[44px] flex-1 text-xs py-1.5 px-2 rounded-lg border border-[var(--border-control)] hover:border-[var(--border-control-hover)] flex items-center justify-center text-center truncate cursor-pointer"
                    >
                      SESAU
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetLogo(PRESET_LOGOS.sus.publicUrl, 'SUS')}
                      className="touch-target min-h-[44px] flex-1 text-xs py-1.5 px-2 rounded-lg border border-[var(--border-control)] hover:border-[var(--border-control-hover)] flex items-center justify-center text-center truncate cursor-pointer"
                    >
                      SUS
                    </button>
                  </div>
                </div>

                {logoConfig.dataUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="touch-target btn-tactile-danger min-h-[44px] py-2 text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Logo Esquerdo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CONTEÚDO DA ABA DIREITA */}
          {activeLogoTab === 'right' && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--ink-muted)] leading-tight">
                O logotipo secundário é exibido no canto superior direito do timbrado A4 (ao lado da data e selo do documento).
              </p>

              {/* Tamanho do Logo Direito */}
              <div>
                <label className="text-xs font-bold text-[var(--ink-secondary)] block mb-1">
                  Tamanho do Logo Direito:
                </label>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleChangeSecondaryLogoSize(sz)}
                      className={`touch-target min-h-[44px] py-1.5 rounded-lg border flex items-center justify-center text-center cursor-pointer transition focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                        (logoConfig.secondarySize || 'md') === sz
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-bold shadow-[var(--shadow-control)]'
                          : 'border-[var(--border-control)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ações: Upload, Presets */}
              <div className="pt-2 border-t border-[var(--hairline)] flex flex-col gap-2">
                <input
                  id="editor-logo-right-upload"
                  name="logoRightUpload"
                  type="file"
                  ref={secondaryFileInputRef}
                  onChange={handleSecondaryLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => secondaryFileInputRef.current?.click()}
                  disabled={secondaryLogoUploading}
                  className="touch-target btn-tactile-primary min-h-[44px] w-full py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{secondaryLogoUploading ? 'Carregando...' : 'Upload Logo Direito (SUS / Clínica)'}</span>
                </button>

                {/* Presets Rápidos para o lado direito */}
                <div>
                  <span className="text-xs text-[var(--ink-muted)] block mb-1">Logos Rápidos para a Direita:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.sus.publicUrl, 'SUS')}
                      className="touch-target min-h-[44px] flex-1 text-xs py-1.5 px-2 rounded-lg border border-[var(--border-control)] hover:border-[var(--border-control-hover)] flex items-center justify-center text-center truncate cursor-pointer font-bold text-[var(--ink-clinical)]"
                    >
                      SUS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.sesau_ro.publicUrl, 'SESAU')}
                      className="touch-target min-h-[44px] flex-1 text-xs py-1.5 px-2 rounded-lg border border-[var(--border-control)] hover:border-[var(--border-control-hover)] flex items-center justify-center text-center truncate cursor-pointer"
                    >
                      SESAU
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.semusa.publicUrl, 'SEMUSA')}
                      className="touch-target min-h-[44px] flex-1 text-xs py-1.5 px-2 rounded-lg border border-[var(--border-control)] hover:border-[var(--border-control-hover)] flex items-center justify-center text-center truncate cursor-pointer"
                    >
                      SEMUSA
                    </button>
                  </div>
                </div>

                {logoConfig.secondaryDataUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveSecondaryLogo}
                    className="touch-target btn-tactile-danger min-h-[44px] py-2 text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Logo Direito</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
