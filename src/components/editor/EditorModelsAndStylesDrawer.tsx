import React, { useRef } from 'react';
import {
  FolderOpen,
  X,
  FileText,
  Save,
  LayoutTemplate,
  Search,
  BookmarkPlus,
  Check,
  Pencil,
  Trash2,
} from '../Icon';
import {
  DocumentHeaderConfig,
  DocumentOrientation,
  DocumentViaLayout,
  PrescriptionStyle,
  SavedDocument,
  WorkContext,
} from '../../types';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import {
  DEFAULT_PRESCRIPTION_STYLES,
  PresetQuickTemplateType,
} from './editorConfigAndFormatters';
import {
  PRESET_STANDARD_MODELS,
  EditorStylesDrawerTab,
  EditorSaveModelAndStyleModals,
} from './EditorStylesTabAndSaveModals';

export interface EditorModelsAndStylesDrawerProps {
  isModelsDrawerOpen: boolean;
  setIsModelsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  drawerTab: 'padrao' | 'salvos' | 'estilos';
  setDrawerTab: React.Dispatch<React.SetStateAction<'padrao' | 'salvos' | 'estilos'>>;
  savedTemplates: SavedDocument[];
  filteredSavedTemplates: SavedDocument[];
  customStyles: PrescriptionStyle[];
  templateSearch: string;
  setTemplateSearch: React.Dispatch<React.SetStateAction<string>>;
  applyPresetTemplate: (type: PresetQuickTemplateType) => void;
  currentModel: {
    id: string | null;
    title: string;
    isPreset: boolean;
  };
  setNewModelTitle: React.Dispatch<React.SetStateAction<string>>;
  setIsSaveModelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingTemplateId: string | null;
  setEditingTemplateId: React.Dispatch<React.SetStateAction<string | null>>;
  editingTemplateTitle: string;
  setEditingTemplateTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSaveRename: (id: string) => void;
  handleStartRename: (tpl: SavedDocument) => void;
  handleDeleteTemplate: (id: string, title: string) => void;
  handleApplyTemplate: (tpl: SavedDocument) => void;
  setIsSaveStyleModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteCustomStyle: (id: string, name: string) => void;
  handleApplyStyle: (style: PrescriptionStyle) => void;
  isSaveModelModalOpen: boolean;
  handleSaveAsTemplate: (e: React.FormEvent) => void;
  newModelTitle: string;
  activeContext: WorkContext | null;
  saveAsGlobal: boolean;
  setSaveAsGlobal: React.Dispatch<React.SetStateAction<boolean>>;
  isSaveStyleModalOpen: boolean;
  handleSaveCustomStyle: (e: React.FormEvent) => void;
  newStyleTitle: string;
  setNewStyleTitle: React.Dispatch<React.SetStateAction<string>>;
  fontFamilyId: string;
  baseFontSize: number;
  pageOrientation: DocumentOrientation;
  viaLayout: DocumentViaLayout;
  headerConfig: DocumentHeaderConfig;
}

export const EditorModelsAndStylesDrawer: React.FC<EditorModelsAndStylesDrawerProps> = ({
  isModelsDrawerOpen,
  setIsModelsDrawerOpen,
  drawerTab,
  setDrawerTab,
  savedTemplates,
  filteredSavedTemplates,
  customStyles,
  templateSearch,
  setTemplateSearch,
  applyPresetTemplate,
  currentModel,
  setNewModelTitle,
  setIsSaveModelModalOpen,
  editingTemplateId,
  setEditingTemplateId,
  editingTemplateTitle,
  setEditingTemplateTitle,
  handleSaveRename,
  handleStartRename,
  handleDeleteTemplate,
  handleApplyTemplate,
  setIsSaveStyleModalOpen,
  handleDeleteCustomStyle,
  handleApplyStyle,
  isSaveModelModalOpen,
  handleSaveAsTemplate,
  newModelTitle,
  activeContext,
  saveAsGlobal,
  setSaveAsGlobal,
  isSaveStyleModalOpen,
  handleSaveCustomStyle,
  newStyleTitle,
  setNewStyleTitle,
  fontFamilyId,
  baseFontSize,
  pageOrientation,
  viaLayout,
  headerConfig,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: isModelsDrawerOpen,
    onClose: () => setIsModelsDrawerOpen(false),
    containerRef: drawerRef,
  });

  return (
    <>
      {/* DRAWER LATERAL: Modelos & Histórico Clínico */}
      {isModelsDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-models-drawer-title"
          className="fixed inset-0 z-50 overflow-hidden flex justify-end no-print"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[oklch(0.14_0.02_252/0.56)] transition-opacity cursor-pointer"
            onClick={() => setIsModelsDrawerOpen(false)}
          />

          <div
            ref={drawerRef}
            className="relative w-full max-w-md bg-[var(--surface-card)] text-[var(--ink-primary)] shadow-[var(--elevation-high)] border-l border-[var(--hairline)] flex flex-col h-full z-10 animate-tab-fade"
          >
            {/* Header do Drawer */}
            <div className="p-3.5 sm:p-4 border-b border-[var(--hairline)] flex items-center justify-between">
              <div>
                <h2 id="editor-models-drawer-title" className="text-sm font-semibold flex items-center gap-2">
                  <FolderOpen size={18} className="text-[var(--accent-amber)]" />
                  <span>Modelos & Estilos</span>
                </h2>
                <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                  Modelos de referência, rascunhos salvos e formatos de prescrição
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModelsDrawerOpen(false)}
                aria-label="Fechar modelos e estilos"
                className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ABAS DO DRAWER */}
            <div className="grid grid-cols-3 p-1.5 bg-[var(--surface-canvas)] border-b border-[var(--hairline)] gap-1">
              <button
                type="button"
                onClick={() => setDrawerTab('padrao')}
                className={`min-h-[44px] py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                  drawerTab === 'padrao'
                    ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Modelos Padrão</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('salvos')}
                className={`min-h-[44px] py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                  drawerTab === 'salvos'
                    ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Meus Modelos ({savedTemplates.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('estilos')}
                className={`min-h-[44px] py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none ${
                  drawerTab === 'estilos'
                    ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-control)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Estilos ({DEFAULT_PRESCRIPTION_STYLES.length + customStyles.length})</span>
              </button>
            </div>

            {/* CONTEÚDO DAS ABAS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* ABA 1: MODELOS PADRÃO DO SISTEMA */}
              {drawerTab === 'padrao' && (
                <div className="space-y-3">
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      name="presetTemplateSearch"
                      type="text"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Ex.: Relatório médico, atestado, encaminhamento..."
                      aria-label="Buscar modelo padrão"
                      className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-focus)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] transition"
                    />
                  </div>

                  {PRESET_STANDARD_MODELS
                    .filter(m => !templateSearch || m.title.toLowerCase().includes(templateSearch.toLowerCase()) || m.desc.toLowerCase().includes(templateSearch.toLowerCase()))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-card)] hover:border-[var(--border-control)] transition flex flex-col gap-1.5 shadow-[var(--elevation-low)]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-white text-xs font-extrabold uppercase ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          <h4 className="text-xs font-bold text-[var(--ink-primary)]">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                          {item.desc}
                        </p>
                        <div className="pt-1.5 border-t border-[var(--hairline)] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => applyPresetTemplate(item.id)}
                            className="min-h-[44px] text-xs font-bold text-[var(--ink-clinical)] hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none rounded-md px-1 py-0.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Carregar e Personalizar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* ABA 2: MEUS MODELOS SALVOS */}
              {drawerTab === 'salvos' && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        name="savedTemplateSearch"
                        type="text"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Ex.: Laudo cardiológico, receita padrão..."
                        aria-label="Buscar em meus modelos salvos"
                        className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-focus)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] transition"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsModelsDrawerOpen(false);
                        setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? currentModel.title : '');
                        setIsSaveModelModalOpen(true);
                      }}
                      className="btn-tactile-primary w-full min-h-[44px] py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Salvar Documento Atual como Modelo</span>
                    </button>
                  </div>

                  {filteredSavedTemplates.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[var(--surface-card-lit)] border border-[var(--hairline)] text-center text-xs text-[var(--ink-muted)]">
                      {templateSearch ? (
                        'Nenhum modelo encontrado para esta busca.'
                      ) : (
                        <>
                          <BookmarkPlus className="w-6 h-6 mx-auto mb-1.5 text-[var(--ink-muted)] opacity-60" />
                          <p className="font-medium">Nenhum modelo personalizado salvo ainda.</p>
                          <p className="text-xs mt-1 opacity-80">
                            Clique no botão acima para salvar a folha atual como um modelo reutilizável.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredSavedTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="p-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-card)] hover:border-[var(--border-control)] transition flex flex-col gap-2 group shadow-[var(--elevation-low)]"
                        >
                          {editingTemplateId === tpl.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                name="renameTemplateTitle"
                                type="text"
                                value={editingTemplateTitle}
                                onChange={(e) => setEditingTemplateTitle(e.target.value)}
                                aria-label="Editar título do modelo"
                                className="flex-1 min-h-[44px] px-2.5 py-1 text-xs rounded-lg border border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(tpl.id)}
                                aria-label="Salvar novo título"
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[var(--clinical)] text-white text-xs hover:bg-[var(--clinical-hover)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none transition"
                                title="Salvar novo título"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTemplateId(null)}
                                aria-label="Cancelar edição do título"
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[var(--border-control)] text-xs hover:bg-[var(--surface-hover)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none transition"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--ink-primary)] group-hover:text-[var(--ink-clinical)] transition-colors">
                                  {tpl.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)] mt-0.5">
                                  <span>
                                    {new Date(tpl.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                                    {new Date(tpl.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {tpl.contextId && tpl.contextId !== 'global' ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border border-[var(--hairline)] font-semibold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" aria-hidden="true" />
                                      <span>Local</span>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded-[6px] bg-[var(--surface-chip-muted)] text-[var(--ink-secondary)] border border-[var(--hairline)] font-medium">
                                      Global
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartRename(tpl)}
                                  aria-label="Renomear modelo"
                                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--surface-hover)] text-[var(--ink-muted)] hover:text-[var(--ink-clinical)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none transition"
                                  title="Renomear modelo"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                                  aria-label="Excluir modelo"
                                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--surface-hover)] text-[var(--ink-muted)] hover:text-[var(--status-danger)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] outline-none transition"
                                  title="Excluir modelo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleApplyTemplate(tpl)}
                              className="min-h-[44px] text-xs font-bold text-[var(--ink-clinical)] hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none rounded-md px-1 py-0.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Carregar e Editar na Folha</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 3: ESTILOS DE RECEITA (FORMATAÇÃO RÁPIDA & PERSONALIZADA) */}
              {drawerTab === 'estilos' && (
                <EditorStylesDrawerTab
                  customStyles={customStyles}
                  setIsModelsDrawerOpen={setIsModelsDrawerOpen}
                  setIsSaveStyleModalOpen={setIsSaveStyleModalOpen}
                  handleDeleteCustomStyle={handleDeleteCustomStyle}
                  handleApplyStyle={handleApplyStyle}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAIS: Salvar como Modelo Personalizado e Salvar Estilo */}
      <EditorSaveModelAndStyleModals
        isSaveModelModalOpen={isSaveModelModalOpen}
        setIsSaveModelModalOpen={setIsSaveModelModalOpen}
        handleSaveAsTemplate={handleSaveAsTemplate}
        newModelTitle={newModelTitle}
        setNewModelTitle={setNewModelTitle}
        activeContext={activeContext}
        saveAsGlobal={saveAsGlobal}
        setSaveAsGlobal={setSaveAsGlobal}
        isSaveStyleModalOpen={isSaveStyleModalOpen}
        setIsSaveStyleModalOpen={setIsSaveStyleModalOpen}
        handleSaveCustomStyle={handleSaveCustomStyle}
        newStyleTitle={newStyleTitle}
        setNewStyleTitle={setNewStyleTitle}
        fontFamilyId={fontFamilyId}
        baseFontSize={baseFontSize}
        pageOrientation={pageOrientation}
        viaLayout={viaLayout}
        headerConfig={headerConfig}
      />
    </>
  );
};
