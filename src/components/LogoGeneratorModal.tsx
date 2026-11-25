import React, { useState, useRef, useId } from 'react';
import {
  X,
  Check,
  Sparkles,
  Shield,
  RefreshCw,
  Building2,
  Download,
} from './Icon';
import { WorkContext, DoctorProfile } from '../types';
import { db } from '../services/db';
import { PRESET_LOGOS, PresetLogoItem } from '../data/presetAssets';
import { SVG_XML_NAMESPACES } from '../data/externalUrlsConfig';
import {
  LogoSvgCanvas,
  PALETTES,
  type CentralSymbol,
  type FrameStyle,
  type ColorPalette,
  type TextLayout,
} from './logo/LogoSvgCanvas';
import {
  LogoGeneratorControlsColumn,
  extractDoctorInitials,
} from './logo/LogoGeneratorControlsColumn';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

/**
 * Modal de Personalização de Timbre e Monograma.
 * Estados de UI cobertos: empty (vazio sem subtítulo), loading (carregando gravação no IndexedDB),
 * success (logotipo aplicado com sucesso) e error (falha ao gravar logotipo).
 */
export type { CentralSymbol, FrameStyle, ColorPalette, TextLayout };

interface LogoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext: WorkContext | null;
  doctor?: DoctorProfile;
  onApplyLogo?: (dataUrl: string) => Promise<void> | void;
}

export const LogoGeneratorModal: React.FC<LogoGeneratorModalProps> = ({
  isOpen,
  onClose,
  activeContext,
  doctor,
  onApplyLogo
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, '_');

  useModalAccessibility({
    isOpen,
    onClose,
    containerRef: modalContainerRef,
  });

  // Inicializa valores com base no contexto ativo ou médico
  const defaultInstitution = activeContext?.name?.toUpperCase() || 
    doctor?.clinicName?.toUpperCase() || 
    (activeContext?.sphere === 'state' ? 'SECRETARIA DE ESTADO DA SAÚDE' : 'SECRETARIA MUNICIPAL DE SAÚDE');

  const defaultSubtitle = activeContext?.sphere === 'municipal' 
    ? 'ATENÇÃO BÁSICA — SUS' 
    : activeContext?.sphere === 'state' 
    ? 'POLICLÍNICA DE ESPECIALIDADES' 
    : 'CLÍNICA MÉDICA INTEGRADA';

  const defaultInitials = extractDoctorInitials(doctor?.name);

  // Configurações do Timbre
  const [symbol, setSymbol] = useState<CentralSymbol>('asclepius');
  const [frame, setFrame] = useState<FrameStyle>('double_circle');
  const [paletteKey, setPaletteKey] = useState<ColorPalette>(
    activeContext?.sphere === 'municipal' ? 'sus' : 'petrol'
  );
  const [institutionName, setInstitutionName] = useState(defaultInstitution);
  const [subtitle, setSubtitle] = useState(defaultSubtitle);
  const [monogramText, setMonogramText] = useState(defaultInitials);
  const [textLayout, setTextLayout] = useState<TextLayout>('curved');
  const [previewDarkBg, setPreviewDarkBg] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'presets' | 'generator'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('semusa');

  const handleApplyPreset = async (preset: PresetLogoItem) => {
    setIsApplying(true);
    setErrorMsg(null);
    try {
      if (activeContext) {
        await db.workContexts.update(activeContext.id, {
          logoDataUrl: preset.publicUrl,
          updatedAt: Date.now()
        });
      }
      if (onApplyLogo) {
        await onApplyLogo(preset.publicUrl);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar logotipo predefinido:', err);
      setErrorMsg('Falha ao aplicar logotipo.');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  // Gera o código SVG como string limpa
  const generateSvgString = (): string => {
    if (!svgRef.current) return '';
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', SVG_XML_NAMESPACES.svg);
    }
    if (!clone.getAttribute('xmlns:xlink')) {
      clone.setAttribute('xmlns:xlink', SVG_XML_NAMESPACES.xlink);
    }
    return new XMLSerializer().serializeToString(clone);
  };

  // Ação: Aplicar ao contexto institucional ativo no IndexedDB
  const handleApply = async () => {
    setIsApplying(true);
    setErrorMsg(null);
    try {
      const svgString = generateSvgString();
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

      if (activeContext) {
        await db.workContexts.update(activeContext.id, {
          logoDataUrl: dataUrl,
          updatedAt: Date.now()
        });
      }

      if (onApplyLogo) {
        await onApplyLogo(dataUrl);
      }

      onClose();
    } catch (err) {
      console.error('Erro ao salvar logotipo no IndexedDB:', err);
      setErrorMsg('Falha ao aplicar logotipo. Tente novamente.');
    } finally {
      setIsApplying(false);
    }
  };

  // Ação: Download do arquivo .svg
  const handleDownloadSvg = () => {
    const svgString = generateSvgString();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timbre_${(institutionName || 'pcm').toLowerCase().replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-state="idle"
      aria-busy={false}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[oklch(0.14_0.02_252/0.56)] isolate animate-tab-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-modal-title"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        ref={modalContainerRef}
        className="w-full max-w-4xl tactile-modal modal-content text-[var(--ink-primary)] rounded-2xl overflow-hidden flex flex-col max-h-[92vh] animate-tab-fade shadow-[var(--elevation-high)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--hairline)] flex items-center justify-between bg-[var(--surface-card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--surface-chip-muted)] border border-[var(--hairline)] text-[var(--ink-clinical)] flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="logo-modal-title" className="text-sm font-semibold">
                Logos Institucionais e Timbrados Oficiais
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Selecione os logos oficiais de Rondônia/SUS ou crie um timbre vetorial SVG personalizado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gerador de logotipo"
            className="btn-tactile-icon touch-target text-[var(--ink-muted)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div role="alert" className="px-4 py-2 bg-[var(--surface-card-lit)] border-b border-[var(--hairline)] border-l-[3px] border-l-[var(--status-danger)] text-xs font-semibold text-[var(--ink-primary)] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-danger)] shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </span>
            <button type="button" onClick={() => setErrorMsg(null)} className="touch-target min-h-[44px] px-2 inline-flex items-center text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] underline ml-2 cursor-pointer">Fechar</button>
          </div>
        )}

        {/* Navigation Tabs: Presets vs Generator */}
        <div className="px-4 sm:px-6 py-2 border-b border-[var(--hairline)] flex items-center gap-2 bg-[var(--surface-card-lit)]">
          <button
            type="button"
            onClick={() => setActiveModalTab('presets')}
            className={`touch-target min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none ${
              activeModalTab === 'presets'
                ? 'btn-tactile-primary'
                : 'btn-tactile-secondary'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Logos Oficiais Salvos (SEMUSA / SESAU / SUS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('generator')}
            className={`touch-target min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none ${
              activeModalTab === 'generator'
                ? 'btn-tactile-primary'
                : 'btn-tactile-secondary'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Criador Procedural SVG</span>
          </button>
        </div>

        {activeModalTab === 'presets' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
            <div className="bg-[var(--surface-card-lit)] border border-[var(--hairline)] border-l-[3px] border-l-[var(--ink-clinical)] rounded-xl p-3.5 text-xs text-[var(--ink-secondary)]">
              <p className="font-bold text-[var(--ink-primary)]">Logos Oficiais Salvos da Instituição</p>
              <p className="text-xs mt-0.5 text-[var(--ink-secondary)]">
                Selecione o logotipo oficial correspondente ao local de atuação. A imagem é gravada localmente no IndexedDB e exibida automaticamente nos receituários e documentos A4.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(PRESET_LOGOS).map((logo) => {
                const isSelected = selectedPresetId === logo.id;
                return (
                  <div
                    key={logo.id}
                    onClick={() => setSelectedPresetId(logo.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPresetId(logo.id); } }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    className={`p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none ${
                      isSelected
                        ? 'border-[var(--border-control)] bg-[var(--surface-card-lit)] shadow-[var(--elevation-low)] ring-1 ring-[var(--accent-focus)]/30'
                        : 'border-[var(--hairline)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div>
                      <div className="h-28 w-full bg-white rounded-xl border border-subtle flex items-center justify-center p-3 shadow-inner overflow-hidden mb-3">
                        <img
                          src={logo.publicUrl}
                          alt={logo.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-[var(--ink-primary)]">
                            {logo.name}
                          </h3>
                          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                            {logo.description}
                          </p>
                        </div>
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--surface-chip-muted)] border border-[var(--hairline)] text-[var(--ink-secondary)] shrink-0">
                          {logo.sphere === 'municipal' ? 'Municipal' : logo.sphere === 'state' ? 'Estadual' : 'Federal'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--hairline)]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPreset(logo);
                        }}
                        disabled={isApplying}
                        className="btn-tactile-primary min-h-[44px] flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aplicar ao Contexto</span>
                      </button>
                      <a
                        href={logo.publicUrl}
                        download={`${logo.id}.png`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-tactile-icon text-xs text-[var(--ink-secondary)]"
                        title="Baixar arquivo de imagem"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
        /* Modal Body: Left Controls / Right Real-Time Preview */
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 custom-scrollbar">
          {/* Controls Column (7 cols) */}
          <LogoGeneratorControlsColumn
            symbol={symbol}
            setSymbol={setSymbol}
            monogramText={monogramText}
            setMonogramText={setMonogramText}
            frame={frame}
            setFrame={setFrame}
            paletteKey={paletteKey}
            setPaletteKey={setPaletteKey}
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            textLayout={textLayout}
            setTextLayout={setTextLayout}
          />

          {/* Real-Time Preview Column (5 cols) */}
          <LogoSvgCanvas
            svgRef={svgRef}
            uniqueId={uniqueId}
            symbol={symbol}
            frame={frame}
            currentPalette={PALETTES[paletteKey]}
            institutionName={institutionName}
            subtitle={subtitle}
            monogramText={monogramText}
            textLayout={textLayout}
            previewDarkBg={previewDarkBg}
            onTogglePreviewDarkBg={() => setPreviewDarkBg(!previewDarkBg)}
            onDownloadSvg={handleDownloadSvg}
          />
        </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--hairline)] flex items-center justify-between bg-[var(--surface-canvas)]">
          <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
            <Building2 className="w-4 h-4 text-[var(--ink-clinical)]" />
            <span>
              Contexto:{' '}
              <strong className="text-[var(--ink-primary)]">
                {activeContext?.name || 'Local Ativo'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile-secondary min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={activeModalTab === 'presets' ? () => handleApplyPreset(PRESET_LOGOS[selectedPresetId]) : handleApply}
              disabled={isApplying}
              className="btn-tactile-primary min-h-[44px] px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[var(--shadow-control)] disabled:opacity-50 transition focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
            >
              {isApplying ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>
                {activeModalTab === 'presets' ? 'Aplicar Logo Selecionado' : 'Aplicar Timbre SVG'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoGeneratorModal;
