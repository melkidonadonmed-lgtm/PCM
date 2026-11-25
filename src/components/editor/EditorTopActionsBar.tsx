import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  LayoutTemplate,
  Check,
  X,
  Pencil,
  Loader2,
  Clock,
  Printer,
  Download,
  FileText,
  Pill,
  Stethoscope,
  Award,
  Plus,
  Save,
  BookmarkPlus,
  FolderOpen,
  Icon,
} from '../Icon';
import { DoctorProfile, SavedDocument } from '../../types';
import { medicoConfigurado } from '../../utils/medicoConfigurado';

export interface EditorTopActionsBarProps {
  doctor: DoctorProfile;
  currentModel: {
    id: string | null;
    title: string;
    isPreset: boolean;
  };
  isEditingModelTitle: boolean;
  setIsEditingModelTitle: React.Dispatch<React.SetStateAction<boolean>>;
  tempModelTitle: string;
  setTempModelTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSaveCurrentModelTitle: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  lastSavedTime: string | null;
  isExportingPdf: boolean;
  savedTemplates: SavedDocument[];
  onNavigateBack?: () => void;
  syncWithActivePrescription: () => void;
  handlePrint: () => void;
  handleDownloadPdf: () => void;
  handleLoadActivePrescription: (showToastMsg?: boolean) => void;
  handleLoadActiveReferral: (showToastMsg?: boolean) => void;
  handleLoadActiveCertificate: (showToastMsg?: boolean) => void;
  handleStartNewDocument: () => void;
  handleSaveModelDirectly: () => void;
  setNewModelTitle: React.Dispatch<React.SetStateAction<string>>;
  setIsSaveModelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsModelsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditorTopActionsBar: React.FC<EditorTopActionsBarProps> = ({
  doctor,
  currentModel,
  isEditingModelTitle,
  setIsEditingModelTitle,
  tempModelTitle,
  setTempModelTitle,
  handleSaveCurrentModelTitle,
  saveStatus,
  lastSavedTime,
  isExportingPdf,
  savedTemplates,
  onNavigateBack,
  syncWithActivePrescription,
  handlePrint,
  handleDownloadPdf,
  handleLoadActivePrescription,
  handleLoadActiveReferral,
  handleLoadActiveCertificate,
  handleStartNewDocument,
  handleSaveModelDirectly,
  setNewModelTitle,
  setIsSaveModelModalOpen,
  setIsModelsDrawerOpen,
}) => {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActionsMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActionsMenuOpen]);

  return (
    <div className="no-print bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-[var(--elevation-low)] flex items-center justify-between gap-2">
      {/* Lado Esquerdo: Voltar + Título Compacto Estilo Google Docs + Status */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
        {onNavigateBack && (
          <button
            type="button"
            onClick={() => {
              syncWithActivePrescription();
              onNavigateBack();
            }}
            className="touch-target btn-tactile-secondary min-h-[44px] px-2 sm:px-2.5 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
            title="Sincronizar e voltar à tela de montagem de receitas"
            aria-label="Voltar à Receita"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--ink-muted)]" />
            <span className="hidden md:inline">Receita</span>
          </button>
        )}

        {/* Título do Documento Compacto + Edição Inline */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface-card-lit)] border border-[var(--hairline)] text-xs min-w-0 max-w-full">
          <LayoutTemplate className="w-3.5 h-3.5 text-[var(--ink-clinical)] shrink-0 hidden sm:inline" />
          {isEditingModelTitle ? (
            <div className="flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
              <input
                id="editor-model-title-input"
                name="editorModelTitle"
                type="text"
                value={tempModelTitle}
                onChange={e => setTempModelTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveCurrentModelTitle();
                  if (e.key === 'Escape') setIsEditingModelTitle(false);
                }}
                placeholder="Ex.: Receituário Clínico..."
                autoFocus
                className="px-2 min-h-[44px] text-xs font-bold rounded border border-[var(--border-control)] bg-[var(--surface-card)] text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] w-36 sm:w-48"
              />
              <button
                type="button"
                onClick={handleSaveCurrentModelTitle}
                className="touch-target min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] cursor-pointer shrink-0"
                title="Salvar título"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingModelTitle(false)}
                className="touch-target min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-[var(--surface-hover)] cursor-pointer text-[var(--ink-muted)] shrink-0"
                title="Cancelar"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTempModelTitle(currentModel.title);
                setIsEditingModelTitle(true);
              }}
              className="touch-target min-h-[44px] flex items-center gap-1.5 min-w-0 text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none rounded"
              title={`Documento: ${currentModel.title} (clique para renomear)`}
            >
              <span className="font-bold text-[var(--ink-primary)] truncate max-w-28 sm:max-w-48 md:max-w-64">
                {currentModel.title}
              </span>
              <Pencil className="w-3 h-3 text-[var(--ink-muted)] group-hover:text-[var(--ink-primary)] shrink-0" />
            </button>
          )}

          {/* Status de Salvamento Compacto Integrado */}
          <span
            className="pl-1.5 border-l border-[var(--hairline)] flex items-center gap-1 text-[11px] text-[var(--ink-muted)] shrink-0"
            title={
              saveStatus === 'saving'
                ? 'Salvando alterações...'
                : saveStatus === 'saved'
                  ? `Salvo localmente${lastSavedTime ? ` às ${lastSavedTime}` : ''}`
                  : 'Edição em tempo real'
            }
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-3 h-3 animate-spin text-[var(--ink-muted)]" />
            ) : saveStatus === 'saved' ? (
              <Check className="w-3 h-3 text-[var(--ink-clinical)]" />
            ) : (
              <Clock className="w-3 h-3 text-[var(--ink-muted)]" />
            )}
            <span className="hidden xl:inline">
              {saveStatus === 'saving'
                ? 'Salvando...'
                : saveStatus === 'saved'
                  ? `Salvo ${lastSavedTime ? `(${lastSavedTime})` : ''}`
                  : 'Salvo'}
            </span>
          </span>
        </div>
      </div>

      {/* Lado Direito: Ações Compactas em 1 Linha (Menu Arquivo/Consulta, Modelos, PDF, Imprimir) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Menu Unificado de Arquivo & Consulta (Funciona por toque no celular e clique no desktop) */}
        <div ref={actionsMenuRef} className="relative">
          <button
            id="btn-editor-actions-menu"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isActionsMenuOpen}
            onClick={() => setIsActionsMenuOpen((prev) => !prev)}
            className="touch-target btn-tactile-secondary min-h-[44px] px-2.5 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
            title="Carregar dados da consulta, salvar modelo ou criar documento em branco"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--ink-clinical)]" />
            <span className="hidden sm:inline">Arquivo / Consulta</span>
            <Icon
              name="expand_more"
              size={14}
              className={`text-[var(--ink-muted)] transition-transform duration-150 ${isActionsMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isActionsMenuOpen && (
            <div
              role="menu"
              aria-label="Opções de arquivo e sincronização com a consulta"
              className="absolute right-0 top-full mt-1.5 w-60 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl shadow-[var(--elevation-high)] p-1.5 z-50 animate-tab-fade"
            >
              <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Importar da consulta ativa
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleLoadActivePrescription(true);
                  setIsActionsMenuOpen(false);
                }}
                className="w-full min-h-[44px] text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--ink-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              >
                <Pill className="w-3.5 h-3.5 text-[var(--ink-clinical)] shrink-0" />
                <span>Carregar Receita Ativa</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleLoadActiveReferral(true);
                  setIsActionsMenuOpen(false);
                }}
                className="w-full min-h-[44px] text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--ink-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              >
                <Stethoscope className="w-3.5 h-3.5 text-[var(--ink-clinical)] shrink-0" />
                <span>Carregar Encaminhamento</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleLoadActiveCertificate(true);
                  setIsActionsMenuOpen(false);
                }}
                className="w-full min-h-[44px] text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--ink-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              >
                <Award className="w-3.5 h-3.5 text-[var(--accent-amber)] shrink-0" />
                <span>Carregar Atestado Médico</span>
              </button>

              <div className="border-t border-[var(--hairline)] my-1" />
              <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Salvar e modelos
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleSaveModelDirectly();
                  setIsActionsMenuOpen(false);
                }}
                className="w-full min-h-[44px] text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--ink-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              >
                <Save className="w-3.5 h-3.5 text-[var(--ink-clinical)] shrink-0" />
                <span>Salvar na Receita Ativa</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? `${currentModel.title} (Cópia)` : '');
                  setIsSaveModelModalOpen(true);
                  setIsActionsMenuOpen(false);
                }}
                className="w-full min-h-[44px] text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--ink-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />
                <span>Salvar como Novo Modelo...</span>
              </button>

              <div className="border-t border-[var(--hairline)] my-1" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleStartNewDocument();
                  setIsActionsMenuOpen(false);
                }}
                className="w-full min-h-[44px] text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--ink-secondary)] hover:text-[var(--status-danger)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] outline-none"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Novo Documento em Branco</span>
              </button>
            </div>
          )}
        </div>

        {/* Botão Biblioteca de Modelos */}
        <button
          type="button"
          onClick={() => setIsModelsDrawerOpen(true)}
          className="touch-target btn-tactile-secondary min-h-[44px] px-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
          title="Abrir biblioteca de modelos clínicos e laudos salvos"
          aria-label="Abrir biblioteca de modelos"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
          <span className="hidden md:inline">Modelos</span>
          {savedTemplates.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--primary)] text-white text-[11px] font-bold leading-none clinical-tabular-nums">
              {savedTemplates.length}
            </span>
          )}
        </button>

        {/* Botão Baixar PDF */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExportingPdf}
          aria-label="Baixar PDF"
          className="touch-target btn-tactile-secondary min-h-[44px] px-2.5 sm:px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
          title="Baixar documento em PDF preservando rigorosamente a tipografia e o layout visual do editor"
        >
          {isExportingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--ink-muted)]" />
          ) : (
            <Download className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
          )}
          <span>{isExportingPdf ? '...' : 'PDF'}</span>
        </button>

        {/* Botão Primário Imprimir Folha A4 */}
        <button
          type="button"
          onClick={handlePrint}
          aria-label="Imprimir folha A4"
          className={`touch-target btn-tactile-primary min-h-[44px] px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[var(--shadow-control)] transition active:scale-95 shrink-0 whitespace-nowrap ${
            !medicoConfigurado(doctor) ? 'ring-1 ring-amber-400/50' : ''
          }`}
          title={medicoConfigurado(doctor) ? 'Imprimir folha A4 milimétrica (Ctrl+P)' : 'Clique para configurar o médico emitente e imprimir'}
        >
          <Printer className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Imprimir</span>
        </button>
      </div>
    </div>
  );
};
