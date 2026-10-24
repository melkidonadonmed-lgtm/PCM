import React from 'react';
import {
  BookmarkPlus,
  Type,
  RectangleVertical,
  RectangleHorizontal,
  File,
  Files,
  Eye,
  EyeOff,
  RotateCcw,
  Image as ImageIcon,
  X,
  Building2,
  Upload,
  Sparkles,
  Trash2,
} from '../Icon';
import {
  DocumentHeaderConfig,
  DocumentLogoConfig,
  DocumentOrientation,
  DocumentViaLayout,
  LogoPosition,
  PrescriptionItem,
  PrescriptionStyle,
  WatermarkType,
} from '../../types';
import { PRESET_LOGOS } from '../../data/presetAssets';
import WatermarkSelector from '../WatermarkSelector';
import { DEFAULT_PRESCRIPTION_STYLES, FONT_OPTIONS } from './editorConfigAndFormatters';

export interface EditorSheetConfigBarProps {
  customStyles: PrescriptionStyle[];
  handleApplyStyle: (style: PrescriptionStyle) => void;
  setIsSaveStyleModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fontFamilyId: string;
  onChangeFontFamily: (fontFamilyId: string) => void;
  pageOrientation: DocumentOrientation;
  setPageOrientation: React.Dispatch<React.SetStateAction<DocumentOrientation>>;
  viaLayout: DocumentViaLayout;
  setViaLayout: React.Dispatch<React.SetStateAction<DocumentViaLayout>>;
  showToast: (msg: string) => void;
  headerConfig: DocumentHeaderConfig;
  handleHeaderFieldChange: <K extends keyof DocumentHeaderConfig>(field: K, value: DocumentHeaderConfig[K]) => void;
  handleLoadActivePrescription: (showToastMsg?: boolean) => void;
  prescriptionItems: PrescriptionItem[];
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
  docWatermark: WatermarkType;
  handleWatermarkChange: (newType: WatermarkType) => void;
  onClose?: () => void;
}

export const EditorSheetConfigBar: React.FC<EditorSheetConfigBarProps> = ({
  customStyles,
  handleApplyStyle,
  setIsSaveStyleModalOpen,
  fontFamilyId,
  onChangeFontFamily,
  pageOrientation,
  setPageOrientation,
  viaLayout,
  setViaLayout,
  showToast,
  headerConfig,
  handleHeaderFieldChange,
  handleLoadActivePrescription,
  prescriptionItems,
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
  docWatermark,
  handleWatermarkChange,
  onClose,
}) => {
  return (
    <div className="editor-toolbar no-print relative z-20 rounded-2xl p-2 sm:p-2.5 border shadow-tactile-sm bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-main)] flex flex-wrap items-center gap-1.5 animate-tab-fade">
      {/* Seletor Rápido de Estilo de Receita Atual */}
      <div className="flex items-center gap-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-2 py-1 text-xs">
        <span className="text-xs font-bold text-sky-700 dark:text-sky-300">Estilo:</span>
        <select
          value=""
          onChange={(e) => {
            const val = e.target.value;
            if (!val) return;
            const found = [...DEFAULT_PRESCRIPTION_STYLES, ...customStyles].find(s => s.id === val);
            if (found) handleApplyStyle(found);
          }}
          className="bg-transparent text-[var(--text-main)] font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded text-xs max-w-40 truncate"
          title="Selecionar estilo visual da receita médica atual (1 via, 2 vias, SUS, clássico...)"
          aria-label="Selecionar estilo visual da receita"
        >
          <option className="bg-[var(--surface-card)] text-[var(--text-main)]" value="" disabled>Selecionar estilo...</option>
          <optgroup label="Estilos Padrão" className="bg-[var(--surface-card)] text-[var(--text-main)]">
            {DEFAULT_PRESCRIPTION_STYLES.map(s => (
              <option className="bg-[var(--surface-card)] text-[var(--text-main)]" key={s.id} value={s.id}>{s.name}</option>
            ))}
          </optgroup>
          {customStyles.length > 0 && (
            <optgroup label="Meus Estilos Salvos" className="bg-[var(--surface-card)] text-[var(--text-main)]">
              {customStyles.map(s => (
                <option className="bg-[var(--surface-card)] text-[var(--text-main)]" key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
          )}
        </select>
        <button
          type="button"
          onClick={() => setIsSaveStyleModalOpen(true)}
          className="p-1 rounded hover:bg-[var(--surface-hover)] text-sky-600 dark:text-sky-400 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          title="Salvar configuração visual atual como novo estilo personalizado"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Seletor Tipográfico Docs Style (12 fontes) */}
      <div className="flex items-center gap-1.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1 text-xs">
        <Type className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
        <select
          value={fontFamilyId}
          onChange={(e) => onChangeFontFamily(e.target.value)}
          className="bg-transparent text-[var(--text-main)] font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded text-xs max-w-44 truncate"
          aria-label="Família Tipográfica da Folha A4"
          title="Trocar fonte da receita médica estilo Google Docs"
        >
          {FONT_OPTIONS.map(f => (
            <option className="bg-[var(--surface-card)] text-[var(--text-main)]" key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Alternador de Orientação: Retrato / Paisagem */}
      <div className="flex items-center rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] p-0.5 text-xs shrink-0 whitespace-nowrap">
        <button
          type="button"
          onClick={() => setPageOrientation('portrait')}
          className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            pageOrientation === 'portrait' ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-xs font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title="Orientação Retrato (Vertical 210×297mm)"
        >
          <RectangleVertical className="w-3.5 h-3.5" />
          <span>Retrato</span>
        </button>
        <button
          type="button"
          onClick={() => setPageOrientation('landscape')}
          className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            pageOrientation === 'landscape' ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-xs font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title="Orientação Paisagem (Horizontal 297×210mm — Ideal para 2 Vias)"
        >
          <RectangleHorizontal className="w-3.5 h-3.5" />
          <span>Paisagem</span>
        </button>
      </div>

      {/* Alternador de Vias: 1 Via / 2 Vias na Mesma Folha */}
      <div className="flex items-center rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] p-0.5 text-xs shrink-0 whitespace-nowrap">
        <button
          type="button"
          onClick={() => setViaLayout('1-via')}
          className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            viaLayout === '1-via' ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-xs font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title="Folha Única (1 Via Padrão)"
        >
          <File className="w-3.5 h-3.5" />
          <span>1 Via</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setViaLayout('2-vias');
            if (pageOrientation === 'portrait') {
              setPageOrientation('landscape');
              showToast('Modo 2 Vias ativado! Paisagem recomendada para imprimir as duas vias lado a lado.');
            }
          }}
          className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            viaLayout === '2-vias' ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-xs font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title="2 Vias na Mesma Folha (1ª Via Farmácia + 2ª Via Paciente — Portaria 344/98)"
        >
          <Files className="w-3.5 h-3.5" />
          <span>2 Vias</span>
        </button>
      </div>

      {/* Alternador de Visibilidade do Cabeçalho */}
      <button
        type="button"
        onClick={() => handleHeaderFieldChange('showHeader', !headerConfig.showHeader)}
        className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
          headerConfig.showHeader
            ? 'border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)]'
            : 'border-warning bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
        }`}
        title={headerConfig.showHeader ? 'Cabeçalho visível. Clique para ocultar (ideal para papel já timbrado)' : 'Cabeçalho ocultado. Clique para restaurar'}
      >
        {headerConfig.showHeader ? <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
        <span>Cabeçalho</span>
        <span className="text-xs opacity-75">({headerConfig.showHeader ? 'Sim' : 'Não'})</span>
      </button>

      {/* Alternador de Visibilidade do Rodapé */}
      <button
        type="button"
        onClick={() => handleHeaderFieldChange('showFooter', !headerConfig.showFooter)}
        className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
          headerConfig.showFooter
            ? 'border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)]'
            : 'border-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'
        }`}
        title={headerConfig.showFooter ? 'Rodapé de carimbo visível. Clique para ocultar' : 'Rodapé ocultado. Clique para restaurar'}
      >
        {headerConfig.showFooter ? <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        <span>Rodapé</span>
        <span className="text-xs opacity-75">({headerConfig.showFooter ? 'Sim' : 'Não'})</span>
      </button>

      {/* Botão CARREGAR RECEITA ATUAL */}
      <button
        type="button"
        onClick={() => handleLoadActivePrescription(true)}
        className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
        title="Preencher a folha A4 com os dados do paciente e medicamentos prescritos nesta consulta"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        <span className="hidden sm:inline">Carregar Receita Atual</span>
        <span className="sm:hidden">Receita</span>
        {prescriptionItems && prescriptionItems.length > 0 && (
          <span className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
            {prescriptionItems.length}
          </span>
        )}
      </button>

      {/* MENU / CONTROLE DE LOGOTIPO (Mudar de lugar, carregar, redimensionar) */}
      <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setIsLogoMenuOpen(prev => !prev)}
          className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
            (logoConfig.dataUrl && logoConfig.visible) || (logoConfig.secondaryDataUrl && logoConfig.secondaryVisible !== false)
              ? 'border-medium bg-slate-100 dark:bg-slate-800 text-[var(--text-main)] font-bold'
              : 'border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-[var(--text-main)]'
          }`}
          title="Configurar logotipos (esquerdo e direito) no timbrado A4"
        >
          <ImageIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          <span>Logotipo</span>
          {(logoConfig.dataUrl || logoConfig.secondaryDataUrl) && (
            <span className="text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-bold uppercase">
              {logoConfig.dataUrl && logoConfig.secondaryDataUrl ? 'Duplo' : '1 Logo'}
            </span>
          )}
        </button>

        {/* Dropdown de Gestão do Logotipo com Abas: Esquerdo e Direito */}
        {isLogoMenuOpen && (
          <div className="fixed inset-x-3 top-24 sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-88 max-w-[calc(100vw-1.5rem)] bg-[var(--surface-card)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-2xl shadow-tactile-lg p-4 z-50 flex flex-col gap-3 animate-tab-fade">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <h4 className="text-xs font-bold">Timbrado / Logotipos</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Seletor de Abas: Esquerda vs Direita */}
            <div className="flex items-center p-1 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] gap-1">
              <button
                type="button"
                onClick={() => setActiveLogoTab('left')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                  activeLogoTab === 'left'
                    ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <span>⇱ Logo Esquerdo</span>
                {logoConfig.dataUrl && logoConfig.visible && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Logo esquerdo ativo" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveLogoTab('right')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                  activeLogoTab === 'right'
                    ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <span>Logo Direito ⇲</span>
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
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    Posição do Logo Esquerdo:
                  </label>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('header-left')}
                      className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                        logoConfig.position === 'header-left' ? 'border-info bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="text-xs">Header Esq.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('top-left')}
                      className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                        logoConfig.position === 'top-left' ? 'border-info bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className="text-xs">⇱</span>
                      <span className="text-xs">Topo Esq.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLogoPosition('top-center')}
                      className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                        logoConfig.position === 'top-center' ? 'border-info bg-sky-50 dark:bg-sky-950 font-bold' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className="text-xs">⬌</span>
                      <span className="text-xs">Topo Centro</span>
                    </button>
                  </div>
                </div>

                {/* Tamanho do Logo Esquerdo */}
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    Tamanho do Logo Esquerdo:
                  </label>
                  <div className="grid grid-cols-4 gap-1 text-xs">
                    {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleChangeLogoSize(sz)}
                        className={`py-1 rounded-lg border text-center cursor-pointer transition focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                          logoConfig.size === sz
                            ? 'bg-navy-900 text-white dark:bg-sky-600 dark:text-white border-navy-800 dark:border-info font-bold shadow-tactile-sm'
                            : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ações: Upload, SVG, Presets */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
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
                      className="flex-1 py-1.5 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-sm transition"
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
                      className="py-1.5 px-2.5 rounded-xl border border-warning dark:border-warning bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      title="Criar brasão vetorial SVG"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Criar SVG</span>
                    </button>
                  </div>

                  {/* Presets Rápidos */}
                  <div>
                    <span className="text-xs text-[var(--text-muted)] block mb-1">Brasões Rápidos:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetLogo(PRESET_LOGOS.semusa.publicUrl, 'SEMUSA')}
                        className="flex-1 text-xs py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-medium text-center truncate cursor-pointer"
                      >
                        SEMUSA
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetLogo(PRESET_LOGOS.sesau_ro.publicUrl, 'SESAU')}
                        className="flex-1 text-xs py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-medium text-center truncate cursor-pointer"
                      >
                        SESAU
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetLogo(PRESET_LOGOS.sus.publicUrl, 'SUS')}
                        className="flex-1 text-xs py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-medium text-center truncate cursor-pointer"
                      >
                        SUS
                      </button>
                    </div>
                  </div>

                  {logoConfig.dataUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
                <p className="text-xs text-[var(--text-muted)] leading-tight">
                  O logotipo secundário é exibido no canto superior direito do timbrado A4 (ao lado da data e selo do documento).
                </p>

                {/* Tamanho do Logo Direito */}
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    Tamanho do Logo Direito:
                  </label>
                  <div className="grid grid-cols-4 gap-1 text-xs">
                    {(['sm', 'md', 'lg', 'xl'] as const).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleChangeSecondaryLogoSize(sz)}
                        className={`py-1 rounded-lg border text-center cursor-pointer transition focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                          (logoConfig.secondarySize || 'md') === sz
                            ? 'bg-navy-900 text-white dark:bg-sky-600 dark:text-white border-navy-800 dark:border-info font-bold shadow-tactile-sm'
                            : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ações: Upload, Presets */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                  <input
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
                    className="w-full py-1.5 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-sm transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{secondaryLogoUploading ? 'Carregando...' : 'Upload Logo Direito (SUS / Clínica)'}</span>
                  </button>

                  {/* Presets Rápidos para o lado direito */}
                  <div>
                    <span className="text-xs text-[var(--text-muted)] block mb-1">Logos Rápidos para a Direita:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.sus.publicUrl, 'SUS')}
                        className="flex-1 text-xs py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-medium text-center truncate cursor-pointer font-bold text-sky-600 dark:text-sky-400"
                      >
                        SUS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.sesau_ro.publicUrl, 'SESAU')}
                        className="flex-1 text-xs py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-medium text-center truncate cursor-pointer"
                      >
                        SESAU
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplySecondaryPresetLogo(PRESET_LOGOS.semusa.publicUrl, 'SEMUSA')}
                        className="flex-1 text-xs py-1 px-2 rounded-lg border border-[var(--border-subtle)] hover:border-medium text-center truncate cursor-pointer"
                      >
                        SEMUSA
                      </button>
                    </div>
                  </div>

                  {logoConfig.secondaryDataUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveSecondaryLogo}
                      className="py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
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

      {/* Seletor de Marca d'Água Oficial */}
      <WatermarkSelector
        currentType={docWatermark}
        onChange={handleWatermarkChange}
      />

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Recolher ajustes da folha"
          title="Recolher barra de ajustes da folha"
          className="ml-auto h-8 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 cursor-pointer transition shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fechar</span>
        </button>
      )}
    </div>
  );
};
