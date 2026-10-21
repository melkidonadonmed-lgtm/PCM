import React from 'react';
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
} from 'lucide-react';
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
  return (
    <div className="no-print bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl p-3 shadow-tactile-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[260px]">
        {onNavigateBack && (
          <button
            type="button"
            onClick={() => {
              syncWithActivePrescription();
              onNavigateBack();
            }}
            className="h-10 px-3 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition active:scale-95 shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
            title="Sincronizar e voltar à tela de montagem de receitas"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Voltar à Receita</span>
          </button>
        )}

        {/* Chip do Modelo Ativo */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-xs shrink-0 whitespace-nowrap">
          <LayoutTemplate className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
          <span className="text-[var(--text-muted)] font-medium">Modelo:</span>
          {isEditingModelTitle ? (
            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={tempModelTitle}
                onChange={e => setTempModelTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveCurrentModelTitle();
                  if (e.key === 'Escape') setIsEditingModelTitle(false);
                }}
                autoFocus
                className="px-2 py-0.5 text-xs font-bold rounded border border-medium dark:border-strong bg-white dark:bg-slate-900 text-[var(--text-main)] outline-none"
              />
              <button
                type="button"
                onClick={handleSaveCurrentModelTitle}
                className="p-1 rounded bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer"
                title="Salvar título"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingModelTitle(false)}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer text-slate-500"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[var(--text-main)] truncate max-w-[240px]">
                {currentModel.title}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTempModelTitle(currentModel.title);
                  setIsEditingModelTitle(true);
                }}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors"
                title="Renomear este modelo"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Indicador de Status Local-First */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0 whitespace-nowrap">
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
              <span className="hidden sm:inline">Salvando...</span>
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Salvo localmente {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Edição em Tempo Real</span>
            </>
          )}
        </div>
      </div>

      {/* Botões de Ação de Impressão e Modelo */}
      <div className="flex items-center gap-2 flex-wrap min-w-0 max-w-full">
        {/* Botão de Impressão Direta A4 Superior (Com rótulo explícito Imprimir) */}
        <button
          type="button"
          onClick={handlePrint}
          aria-label="Imprimir folha A4"
          className={`btn-tactile-primary h-10 min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-tactile-btn transition active:scale-95 shrink-0 whitespace-nowrap ${
            !medicoConfigurado(doctor) ? 'ring-1 ring-amber-400/50' : ''
          }`}
          title={medicoConfigurado(doctor) ? 'Imprimir folha A4 milimétrica (Ctrl+P)' : 'Clique para configurar o médico emitente e imprimir'}
        >
          <Printer className="w-4 h-4 shrink-0" />
          <span>Imprimir</span>
        </button>

        {/* Botão Baixar PDF Nativo de Alta Fidelidade (Preserva tipografia e layout) */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExportingPdf}
          className="btn-tactile-secondary h-10 min-h-10 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
          title="Baixar documento em PDF preservando rigorosamente a tipografia e o layout visual do editor"
        >
          {isExportingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
          ) : (
            <Download className="w-4 h-4 text-[var(--text-muted)]" />
          )}
          <span>{isExportingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
        </button>

        {/* Menu Carregar da Consulta */}
        <div className="relative group">
          <button
            type="button"
            className="h-10 px-3 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer shadow-tactile-sm shrink-0 whitespace-nowrap"
            title="Carregar documentos e dados da consulta ativa para edição"
          >
            <FileText className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Carregar da Consulta</span>
          </button>
          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-subtle dark:border-strong rounded-xl shadow-tactile-lg p-1.5 hidden group-hover:block z-50 animate-tab-fade">
            <button
              type="button"
              onClick={() => handleLoadActivePrescription(true)}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-sky-600" />
              <span>Receita Médica Ativa</span>
            </button>
            <button
              type="button"
              onClick={() => handleLoadActiveReferral(true)}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encaminhamento Ativo</span>
            </button>
            <button
              type="button"
              onClick={() => handleLoadActiveCertificate(true)}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Atestado Médico Ativo</span>
            </button>
            <div className="border-t border-slate-100 dark:border-strong my-1"></div>
            <button
              type="button"
              onClick={handleStartNewDocument}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Documento em Branco</span>
            </button>
          </div>
        </div>

        {/* Botão SALVAR NA RECEITA (Salva documento e sincroniza diretamente com a consulta ativa) */}
        <button
          type="button"
          onClick={handleSaveModelDirectly}
          className="h-10 px-3 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-main)] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none shrink-0 whitespace-nowrap"
          title="Salvar alterações no documento e sincronizar diretamente com a receita ativa da consulta"
        >
          <Save className="w-4 h-4 text-[var(--text-muted)]" />
          <span>Salvar na Receita</span>
        </button>

        {/* Botão Salvar como Novo Modelo */}
        <button
          type="button"
          onClick={() => {
            setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? `${currentModel.title} (Cópia)` : '');
            setIsSaveModelModalOpen(true);
          }}
          className="h-10 px-3 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer shadow-tactile-sm shrink-0 whitespace-nowrap"
          title="Criar um novo modelo salvo a partir deste documento"
        >
          <BookmarkPlus className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="hidden sm:inline">Salvar como Novo</span>
        </button>

        {/* Botão Biblioteca de Modelos */}
        <button
          type="button"
          onClick={() => setIsModelsDrawerOpen(true)}
          className="h-10 px-3 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer shadow-tactile-sm shrink-0 whitespace-nowrap"
          title="Abrir biblioteca de modelos clínicos e laudos salvos"
        >
          <FolderOpen className="w-4 h-4 text-[var(--text-muted)]" />
          <span>Modelos</span>
          {savedTemplates.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
              {savedTemplates.length}
            </span>
          )}
        </button>

        {/* Botão Novo em Branco */}
        <button
          type="button"
          onClick={handleStartNewDocument}
          className="h-10 w-10 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center cursor-pointer shadow-tactile-sm shrink-0"
          title="Iniciar novo documento em branco"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
