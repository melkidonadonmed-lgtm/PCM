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
    <div className="no-print bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-tactile-sm flex items-center justify-between gap-2">
      {/* Lado Esquerdo: Voltar + Título Compacto Estilo Google Docs + Status */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
        {onNavigateBack && (
          <button
            type="button"
            onClick={() => {
              syncWithActivePrescription();
              onNavigateBack();
            }}
            className="h-9 px-2 sm:px-2.5 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-main)] flex items-center gap-1 cursor-pointer transition active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
            title="Sincronizar e voltar à tela de montagem de receitas"
            aria-label="Voltar à Receita"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="hidden md:inline">Receita</span>
          </button>
        )}

        {/* Título do Documento Compacto + Edição Inline */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-xs min-w-0 max-w-full">
          <LayoutTemplate className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 hidden sm:inline" />
          {isEditingModelTitle ? (
            <div className="flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={tempModelTitle}
                onChange={e => setTempModelTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveCurrentModelTitle();
                  if (e.key === 'Escape') setIsEditingModelTitle(false);
                }}
                placeholder="Ex.: Receituário Clínico..."
                autoFocus
                className="px-2 py-0.5 text-xs font-bold rounded border border-medium dark:border-strong bg-white dark:bg-slate-900 text-[var(--text-main)] outline-none w-36 sm:w-48"
              />
              <button
                type="button"
                onClick={handleSaveCurrentModelTitle}
                className="p-1 rounded bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 cursor-pointer shrink-0"
                title="Salvar título"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingModelTitle(false)}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer text-slate-500 shrink-0"
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
              className="flex items-center gap-1.5 min-w-0 text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-sky-500 outline-none rounded"
              title={`Documento: ${currentModel.title} (clique para renomear)`}
            >
              <span className="font-bold text-[var(--text-main)] truncate max-w-[115px] sm:max-w-[200px] md:max-w-[260px]">
                {currentModel.title}
              </span>
              <Pencil className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--text-main)] shrink-0" />
            </button>
          )}

          {/* Status de Salvamento Compacto Integrado */}
          <span
            className="pl-1.5 border-l border-[var(--border-subtle)] flex items-center gap-1 text-[11px] text-[var(--text-muted)] shrink-0"
            title={
              saveStatus === 'saving'
                ? 'Salvando alterações...'
                : saveStatus === 'saved'
                  ? `Salvo localmente${lastSavedTime ? ` às ${lastSavedTime}` : ''}`
                  : 'Edição em tempo real'
            }
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
            ) : saveStatus === 'saved' ? (
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Clock className="w-3 h-3 text-slate-400" />
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
            className="h-9 px-2.5 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1 cursor-pointer shadow-tactile-sm shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
            title="Carregar dados da consulta, salvar modelo ou criar documento em branco"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Arquivo / Consulta</span>
            <Icon
              name="expand_more"
              size={14}
              className={`text-[var(--text-muted)] transition-transform duration-150 ${isActionsMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isActionsMenuOpen && (
            <div
              role="menu"
              aria-label="Opções de arquivo e sincronização com a consulta"
              className="absolute right-0 top-full mt-1.5 w-60 bg-[var(--surface-card)] border border-[var(--border-subtle)] dark:border-strong rounded-2xl shadow-tactile-lg p-1.5 z-50 animate-tab-fade"
            >
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Importar da consulta ativa
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleLoadActivePrescription(true);
                  setIsActionsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-sky-500/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              >
                <Pill className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Carregar Receita Ativa</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleLoadActiveReferral(true);
                  setIsActionsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-sky-500/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Carregar Encaminhamento</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleLoadActiveCertificate(true);
                  setIsActionsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-sky-500/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              >
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Carregar Atestado Médico</span>
              </button>

              <div className="border-t border-[var(--border-subtle)] my-1" />
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Salvar e modelos
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleSaveModelDirectly();
                  setIsActionsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-sky-500/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              >
                <Save className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
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
                className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-sky-500/10 flex items-center gap-2 text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span>Salvar como Novo Modelo...</span>
              </button>

              <div className="border-t border-[var(--border-subtle)] my-1" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleStartNewDocument();
                  setIsActionsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-rose-500/10 flex items-center gap-2 text-rose-700 dark:text-rose-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
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
          className="h-9 px-2.5 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer shadow-tactile-sm shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          title="Abrir biblioteca de modelos clínicos e laudos salvos"
          aria-label="Abrir biblioteca de modelos"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="hidden md:inline">Modelos</span>
          {savedTemplates.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold leading-none clinical-tabular-nums">
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
          className="btn-tactile-secondary h-9 min-h-[36px] px-2.5 sm:px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
          title="Baixar documento em PDF preservando rigorosamente a tipografia e o layout visual do editor"
        >
          {isExportingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-muted)]" />
          ) : (
            <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          )}
          <span>{isExportingPdf ? '...' : 'PDF'}</span>
        </button>

        {/* Botão Primário Imprimir Folha A4 */}
        <button
          type="button"
          onClick={handlePrint}
          aria-label="Imprimir folha A4"
          className={`btn-tactile-primary h-9 min-h-[36px] px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-btn transition active:scale-95 shrink-0 whitespace-nowrap ${
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
