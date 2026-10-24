import React, { useState, useRef, useId } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Shield, 
  Activity, 
  Heart, 
  Type, 
  Circle, 
  Hexagon, 
  Square, 
  Palette,
  RefreshCw,
  Building2,
  Download
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

  const defaultInitials = doctor?.name
    ? doctor.name
        .replace(/^(Dr\.|Dra\.|Dr|Dra)\s*/i, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0]?.toUpperCase())
        .join('') || 'MD'
    : 'PCM';

  // Configurações do Timbre
  const [symbol, setSymbol] = useState<CentralSymbol>('asclepius');
  const [frame, setFrame] = useState<FrameStyle>('double_circle');
  const [paletteKey, setPaletteKey] = useState<ColorPalette>(
    activeContext?.sphere === 'municipal' ? 'sus' : 'petrol'
  );
  const currentPalette = PALETTES[paletteKey];
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
        className="w-full max-w-4xl bg-[var(--surface-card)] text-[var(--text-main)] rounded-2xl border border-[var(--border-subtle)] shadow-tactile-lg overflow-hidden flex flex-col max-h-[92vh] animate-tab-fade"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-app)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="logo-modal-title" className="text-base sm:text-lg font-bold">
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
          
          {/* Controls Column (7 cols) */}
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
                2. Moldura & Estrutura
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
