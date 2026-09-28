import React, { useState, useRef, useId } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Download, 
  Eye, 
  Shield, 
  Activity, 
  Heart, 
  Type, 
  Circle, 
  Hexagon, 
  Square, 
  Palette,
  RefreshCw,
  Building2
} from 'lucide-react';
import { WorkContext, DoctorProfile } from '../types';
import { db } from '../services/db';
import { PRESET_LOGOS, PresetLogoItem } from '../data/presetAssets';

export type CentralSymbol = 'asclepius' | 'cross' | 'stethoscope' | 'ecg_heart' | 'monogram';
export type FrameStyle = 'double_circle' | 'shield' | 'hexagon' | 'none';
export type ColorPalette = 'petrol' | 'sus' | 'navy' | 'gold' | 'dark';
export type TextLayout = 'curved' | 'bottom_banner';

interface LogoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext: WorkContext | null;
  doctor?: DoctorProfile;
  onApplyLogo?: (dataUrl: string) => Promise<void> | void;
}

const PALETTES: Record<ColorPalette, { name: string; primary: string; secondary: string; accent: string; bgTint: string }> = {
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

export const LogoGeneratorModal: React.FC<LogoGeneratorModalProps> = ({
  isOpen,
  onClose,
  activeContext,
  doctor,
  onApplyLogo
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const uniqueId = useId().replace(/:/g, '_');

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
  const [institutionName, setInstitutionName] = useState(defaultInstitution);
  const [subtitle, setSubtitle] = useState(defaultSubtitle);
  const [monogramText, setMonogramText] = useState(defaultInitials);
  const [textLayout, setTextLayout] = useState<TextLayout>('curved');
  const [previewDarkBg, setPreviewDarkBg] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'presets' | 'generator'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('semusa');

  const handleApplyPreset = async (preset: PresetLogoItem) => {
    setIsApplying(true);
    try {
      if (activeContext) {
        await db.workContexts.update(activeContext.id, {
          logoDataUrl: preset.dataUrl,
          updatedAt: Date.now()
        });
      }
      if (onApplyLogo) {
        await onApplyLogo(preset.dataUrl);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar logotipo predefinido:', err);
      alert('Falha ao aplicar logotipo.');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  const currentPalette = PALETTES[paletteKey];
  const primaryGradId = `prim_grad_${uniqueId}`;
  const secGradId = `sec_grad_${uniqueId}`;
  const upperArcId = `upper_arc_${uniqueId}`;
  const lowerArcId = `lower_arc_${uniqueId}`;

  // Gera o código SVG como string limpa
  const generateSvgString = (): string => {
    if (!svgRef.current) return '';
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    return source;
  };

  // Ação: Aplicar ao contexto institucional ativo no IndexedDB
  const handleApply = async () => {
    setIsApplying(true);
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
      alert('Falha ao aplicar logotipo. Tente novamente.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs isolate animate-tab-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-modal-title"
    >
      <div 
        className="w-full max-w-4xl bg-[var(--surface-card)] text-[var(--text-main)] rounded-2xl border border-[var(--border-subtle)] shadow-tactile-lg overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
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
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs: Presets vs Generator */}
        <div className="px-4 sm:px-6 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2 bg-[var(--surface-inset)]">
          <button
            type="button"
            onClick={() => setActiveModalTab('presets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeModalTab === 'presets'
                ? 'bg-sky-600 text-white shadow-tactile-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Logos Oficiais Salvos (SEMUSA / SESAU / SUS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('generator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeModalTab === 'generator'
                ? 'bg-sky-600 text-white shadow-tactile-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Criador Procedural SVG</span>
          </button>
        </div>

        {activeModalTab === 'presets' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl p-3.5 text-xs text-sky-800 dark:text-sky-300">
              <p className="font-bold">Logos Oficiais Salvos da Instituição</p>
              <p className="text-[11px] mt-0.5 opacity-90">
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
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 shadow-tactile-sm ring-1 ring-sky-500'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div>
                      <div className="h-28 w-full bg-white rounded-xl border border-slate-200 flex items-center justify-center p-3 shadow-inner overflow-hidden mb-3">
                        <img
                          src={logo.dataUrl}
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
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 shrink-0">
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
                        href={logo.dataUrl}
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
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
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
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
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
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                      : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <Activity className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">Estetoscópio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSymbol('ecg_heart')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    symbol === 'ecg_heart'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
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
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
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
                    value={monogramText}
                    onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                    className="w-24 px-2.5 py-1 text-xs font-bold uppercase rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:border-sky-500 text-center"
                    placeholder="MD"
                  />
                  <span className="text-[11px] text-[var(--text-muted)]">Até 4 caracteres</span>
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
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
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
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
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
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
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
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
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
                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 normal-case">
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
                          ? 'border-sky-500 ring-2 ring-sky-500/40 bg-[var(--surface-hover)]'
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
                      <span className="text-[10px] font-bold text-center leading-tight">
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
                <span className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Nome da Instituição (Texto Superior / Principal)
                </span>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value.toUpperCase())}
                  placeholder="SECRETARIA MUNICIPAL DE SAÚDE"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:border-sky-500 font-semibold"
                />
              </div>

              <div>
                <span className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                  Subtítulo / Esfera (Texto Inferior)
                </span>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
                  placeholder="ATENÇÃO BÁSICA — SUS"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:border-sky-500 font-semibold"
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
          <div className="lg:col-span-5 flex flex-col items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
            <div className="w-full flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-600" />
                <span>Visualização Vetorial em Tempo Real</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewDarkBg(!previewDarkBg)}
                className="text-[11px] hover:text-[var(--text-main)] underline cursor-pointer"
              >
                Fundo {previewDarkBg ? 'Claro' : 'Escuro'}
              </button>
            </div>

            {/* SVG Render Box */}
            <div 
              className={`w-full aspect-square max-w-[280px] sm:max-w-[320px] rounded-2xl p-4 flex items-center justify-center transition-colors shadow-tactile-md border ${
                previewDarkBg ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
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
                  {/* Arco superior: de esq para dir (sentido horário) */}
                  <path
                    id={upperArcId}
                    d="M 46 150 A 104 104 0 0 1 254 150"
                    fill="none"
                  />
                  {/* Arco inferior: de esq para dir na parte de baixo (sentido horário invertido) */}
                  <path
                    id={lowerArcId}
                    d="M 254 150 A 104 104 0 0 1 46 150"
                    fill="none"
                  />
                </defs>

                {/* 1. MOLDURA (FRAME) */}
                {frame === 'double_circle' && (
                  <g>
                    {/* Círculo externo */}
                    <circle
                      cx="150"
                      cy="150"
                      r="140"
                      fill="none"
                      stroke={`url(#${primaryGradId})`}
                      strokeWidth="4"
                    />
                    {/* Círculo interno */}
                    <circle
                      cx="150"
                      cy="150"
                      r="128"
                      fill="none"
                      stroke={`url(#${primaryGradId})`}
                      strokeWidth="1.5"
                    />
                    {/* Pontos decorativos nas laterais */}
                    <circle cx="36" cy="150" r="3.5" fill={currentPalette.primary} />
                    <circle cx="264" cy="150" r="3.5" fill={currentPalette.primary} />
                  </g>
                )}

                {frame === 'shield' && (
                  <g>
                    {/* Escudo externo */}
                    <path
                      d="M 65 48 Q 150 36 235 48 C 235 152 215 220 150 268 C 85 220 65 152 65 48 Z"
                      fill="none"
                      stroke={`url(#${primaryGradId})`}
                      strokeWidth="5"
                      strokeLinejoin="round"
                    />
                    {/* Escudo interno */}
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
                    {/* Bastão de madeira estilizado com nós */}
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

                    {/* Serpente de Asclépio (Ophidian Spiral) */}
                    <path
                      d="M 134 76 C 122 84 126 98 144 102 C 166 106 174 118 164 130 C 146 140 132 148 138 162 C 146 174 172 176 162 192 C 146 204 134 212 140 224 C 144 230 152 233 150 236"
                      fill="none"
                      stroke={`url(#${secGradId})`}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Cabeça da serpente voltada para o topo com olho */}
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
                    {/* Linha de bisel interno */}
                    <path
                      d="M 148 102 L 152 102 L 152 148 L 198 148 L 198 152 L 152 152 L 152 198 L 148 198 L 148 152 L 102 152 L 102 148 L 148 148 Z"
                      fill="#FFFFFF"
                      opacity="0.85"
                    />
                  </g>
                )}

                {symbol === 'stethoscope' && (
                  <g id="symbol_stethoscope">
                    {/* Tubos superiores / Oliva auricular */}
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

                    {/* Conector Y e Tubo Principal */}
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

                    {/* Campânula e Diafragma */}
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
                    {/* Traçado eletrocardiográfico (P-Q-R-S-T) */}
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
                {/* Caso A: Círculo Duplo com Texto em Arco */}
                {frame === 'double_circle' && textLayout === 'curved' ? (
                  <g>
                    {/* Texto Superior em Arco */}
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

                    {/* Texto Inferior em Arco */}
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
                  /* Caso B: Faixa Inferior / Centralizada (Adequada para Escudo, Hexágono e Faixa) */
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
            <div className="w-full text-center text-[11px] text-[var(--text-muted)] space-y-0.5">
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
                onClick={handleDownloadSvg}
                className="flex-1 py-2 px-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                title="Salvar arquivo vetorial .svg no computador"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .SVG</span>
              </button>
            </div>
          </div>
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
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={activeModalTab === 'presets' ? () => handleApplyPreset(PRESET_LOGOS[selectedPresetId]) : handleApply}
              disabled={isApplying}
              className="btn-tactile-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-tactile-btn disabled:opacity-50"
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
