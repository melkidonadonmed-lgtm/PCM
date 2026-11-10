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
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.includes(`xmlns="${SVG_XML_NAMESPACES.svg}"`)) {
      source = source.replace(/^<svg/, `<svg xmlns="${SVG_XML_NAMESPACES.svg}"`);
    }
    if (!source.includes(`xmlns:xlink="${SVG_XML_NAMESPACES.xlink}"`)) {
      source = source.replace(/^<svg/, `<svg xmlns:xlink="${SVG_XML_NAMESPACES.xlink}"`);
    }
    return source;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 isolate animate-tab-fade"
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
        className="w-full max-w-4xl tactile-modal modal-content text-[var(--text-main)] rounded-2xl overflow-hidden flex flex-col max-h-[92vh] animate-tab-fade"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="logo-modal-title" className="text-sm font-semibold">
                Logos Institucionais e Timbrados Oficiais
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Selecione os logos oficiais de Rondônia/SUS ou crie um timbre vetorial SVG personalizado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gerador de logotipo"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div role="alert" className="px-4 py-2 bg-rose-500/15 border-b border-rose-500/30 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg(null)} className="underline ml-2 cursor-pointer">Fechar</button>
          </div>
        )}

        {/* Navigation Tabs: Presets vs Generator */}
        <div className="px-4 sm:px-6 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2 bg-[var(--surface-inset)]">
          <button
            type="button"
            onClick={() => setActiveModalTab('presets')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              activeModalTab === 'presets'
                ? 'bg-sky-600 text-white shadow-tactile-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Logos Oficiais Salvos (SEMUSA / SESAU / SUS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('generator')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              activeModalTab === 'generator'
                ? 'bg-sky-600 text-white shadow-tactile-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Criador Procedural SVG</span>
          </button>
        </div>

        {activeModalTab === 'presets' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-info dark:border-info rounded-xl p-3.5 text-xs text-sky-800 dark:text-sky-300">
              <p className="font-bold">Logos Oficiais Salvos da Instituição</p>
              <p className="text-xs mt-0.5 opacity-90">
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
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                      isSelected
                        ? 'border-info bg-sky-50/50 dark:bg-sky-950/30 shadow-tactile-sm ring-1 ring-sky-500'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)]'
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
                          <h3 className="text-sm font-bold text-[var(--text-main)]">
                            {logo.name}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {logo.description}
                          </p>
                        </div>
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 shrink-0">
                          {logo.sphere === 'municipal' ? 'Municipal' : logo.sphere === 'state' ? 'Estadual' : 'Federal'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPreset(logo);
                        }}
                        disabled={isApplying}
                        className="btn-tactile-primary flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aplicar ao Contexto</span>
                      </button>
                      <a
                        href={logo.publicUrl}
                        download={`${logo.id}.png`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-muted)] flex items-center justify-center cursor-pointer"
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
        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-app)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>
              Contexto:{' '}
              <strong className="text-[var(--text-main)]">
                {activeContext?.name || 'Local Ativo'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={activeModalTab === 'presets' ? () => handleApplyPreset(PRESET_LOGOS[selectedPresetId]) : handleApply}
              disabled={isApplying}
              className="btn-tactile-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-tactile-btn disabled:opacity-50 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
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
