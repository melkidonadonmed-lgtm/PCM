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
  Files,
  Stethoscope,
  File,
  Building2,
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

const PRESET_STANDARD_MODELS: Array<{
  id: PresetQuickTemplateType;
  badge: string;
  title: string;
  desc: string;
  badgeColor: string;
}> = [
  {
    id: 'receita_especial',
    badge: 'Portaria 344/98 • 2 Vias',
    title: 'Receituário de Controle Especial (2 Vias)',
    desc: 'Receita C1/B1 para retenção da farmácia e orientação do paciente em paisagem lado a lado.',
    badgeColor: 'bg-amber-600'
  },
  {
    id: 'receita',
    badge: 'Ambulatorial',
    title: 'Receita Ambulatorial Livre Padrão',
    desc: 'Prescrição antibiótica e analgésica sintomática com espaçamento milimétrico.',
    badgeColor: 'bg-sky-600'
  },
  {
    id: 'relatorio_circunstanciado',
    badge: 'SUS / Perícia / INSS',
    title: 'Relatório Médico Circunstanciado',
    desc: 'Para perícia médica, regulação do SUS ou INSS com anamnese dirigida e terapêutica em curso.',
    badgeColor: 'bg-emerald-600'
  },
  {
    id: 'laudo_com_receita',
    badge: 'Consulta Ativa',
    title: 'Laudo com Prescrição Anexa',
    desc: 'Avaliação clínica estruturada acompanhada dos medicamentos prescritos na consulta atual.',
    badgeColor: 'bg-sky-600'
  },
  {
    id: 'declaracao_comparecimento',
    badge: 'Declaração',
    title: 'Declaração de Comparecimento com Receita',
    desc: 'Comprovação de horário de atendimento com prescrição dos fármacos indicados.',
    badgeColor: 'bg-sky-600'
  },
  {
    id: 'laudo',
    badge: 'Clínico',
    title: 'Laudo de Avaliação Clínica',
    desc: 'Sumário de atendimento, hipótese diagnóstica e conduta terapêutica.',
    badgeColor: 'bg-slate-600'
  },
  {
    id: 'risco',
    badge: 'Cardiológico',
    title: 'Risco Cirúrgico Pré-Operatório',
    desc: 'Avaliação pré-anestésica com estratificação ASA e recomendações clínicas.',
    badgeColor: 'bg-rose-600'
  },
  {
    id: 'parecer',
    badge: 'Especialista',
    title: 'Parecer Especializado / Contra-Referência',
    desc: 'Resposta ao médico da Atenção Básica com plano terapêutico e seguimento.',
    badgeColor: 'bg-sky-600'
  },
  {
    id: 'atestado',
    badge: 'Aptidão',
    title: 'Atestado de Aptidão Física',
    desc: 'Declaração de aptidão para esportes e academia conforme diretrizes do CFM.',
    badgeColor: 'bg-teal-600'
  }
];

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
  const saveModelModalRef = useRef<HTMLDivElement>(null);
  const saveStyleModalRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: isModelsDrawerOpen,
    onClose: () => setIsModelsDrawerOpen(false),
    containerRef: drawerRef,
  });

  useModalAccessibility({
    isOpen: isSaveModelModalOpen,
    onClose: () => setIsSaveModelModalOpen(false),
    containerRef: saveModelModalRef,
  });

  useModalAccessibility({
    isOpen: isSaveStyleModalOpen,
    onClose: () => setIsSaveStyleModalOpen(false),
    containerRef: saveStyleModalRef,
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
            className="fixed inset-0 bg-black/50 transition-opacity cursor-pointer"
            onClick={() => setIsModelsDrawerOpen(false)}
          />

          <div
            ref={drawerRef}
            className="relative w-full max-w-md bg-[var(--surface-card)] text-[var(--text-main)] shadow-tactile-lg border-l border-[var(--border-subtle)] flex flex-col h-full z-10 animate-tab-fade"
          >
            {/* Header do Drawer */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <h2 id="editor-models-drawer-title" className="text-base font-bold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-500" />
                  <span>Modelos & Estilos</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Modelos de referência, rascunhos salvos e formatos de prescrição
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModelsDrawerOpen(false)}
                aria-label="Fechar modelos e estilos"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ABAS DO DRAWER */}
            <div className="grid grid-cols-3 p-1.5 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] gap-1">
              <button
                type="button"
                onClick={() => setDrawerTab('padrao')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                  drawerTab === 'padrao'
                    ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Modelos Padrão</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('salvos')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                  drawerTab === 'salvos'
                    ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Meus Modelos ({savedTemplates.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('estilos')}
                className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none ${
                  drawerTab === 'estilos'
                    ? 'bg-navy-900 text-white dark:bg-sky-600 shadow-tactile-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
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
                    <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Ex.: Relatório médico, atestado, encaminhamento..."
                      aria-label="Buscar modelo padrão"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] focus:outline-none focus:border-info focus-visible:ring-2 focus-visible:ring-sky-500 transition"
                    />
                  </div>

                  {PRESET_STANDARD_MODELS
                    .filter(m => !templateSearch || m.title.toLowerCase().includes(templateSearch.toLowerCase()) || m.desc.toLowerCase().includes(templateSearch.toLowerCase()))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-info transition flex flex-col gap-1.5 shadow-tactile-sm"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-white text-xs font-extrabold uppercase ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          <h4 className="text-xs font-bold text-[var(--text-main)]">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                          {item.desc}
                        </p>
                        <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => applyPresetTemplate(item.id)}
                            className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none rounded-md px-1 py-0.5"
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
                      <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Ex.: Laudo cardiológico, receita padrão..."
                        aria-label="Buscar em meus modelos salvos"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] focus:outline-none focus:border-info focus-visible:ring-2 focus-visible:ring-sky-500 transition"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsModelsDrawerOpen(false);
                        setNewModelTitle(currentModel.title !== 'Documento Livre (Rascunho)' ? currentModel.title : '');
                        setIsSaveModelModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-tactile-btn cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Salvar Documento Atual como Modelo</span>
                    </button>
                  </div>

                  {filteredSavedTemplates.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                      {templateSearch ? (
                        'Nenhum modelo encontrado para esta busca.'
                      ) : (
                        <>
                          <BookmarkPlus className="w-6 h-6 mx-auto mb-1.5 text-slate-400 opacity-60" />
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
                          className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-info dark:hover:border-info transition flex flex-col gap-2 group shadow-tactile-sm"
                        >
                          {editingTemplateId === tpl.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingTemplateTitle}
                                onChange={(e) => setEditingTemplateTitle(e.target.value)}
                                aria-label="Editar título do modelo"
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-info bg-[var(--bg-app)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(tpl.id)}
                                aria-label="Salvar novo título"
                                className="p-1.5 rounded-lg bg-emerald-700 text-white text-xs hover:bg-emerald-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                                title="Salvar novo título"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTemplateId(null)}
                                aria-label="Cancelar edição do título"
                                className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-xs hover:bg-[var(--surface-hover)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                                  {tpl.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                                  <span>
                                    {new Date(tpl.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                                    {new Date(tpl.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {tpl.contextId && tpl.contextId !== 'global' ? (
                                    <span className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold">
                                      Local
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
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
                                  className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-sky-600 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                                  title="Renomear modelo"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                                  aria-label="Excluir modelo"
                                  className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--text-muted)] hover:text-red-500 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none transition"
                                  title="Excluir modelo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleApplyTemplate(tpl)}
                              className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none rounded-md px-1 py-0.5"
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
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-info dark:border-info flex items-center justify-between gap-2">
                    <div className="text-xs text-[var(--text-secondary)]">
                      <p className="font-bold text-sky-900 dark:text-sky-200">Personalize e Salve seu Estilo</p>
                      <p className="text-xs text-[var(--text-muted)]">Guarde fonte, orientação e formato de vias atual</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModelsDrawerOpen(false);
                        setIsSaveStyleModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1 shadow-tactile-sm cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Salvar Atual</span>
                    </button>
                  </div>

                  {/* Meus Estilos Salvos */}
                  {customStyles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Meus Estilos Personalizados</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 font-bold clinical-tabular-nums">
                          {customStyles.length}
                        </span>
                      </h4>
                      {customStyles.map(st => (
                        <div
                          key={st.id}
                          className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-info transition flex flex-col gap-2 shadow-tactile-sm"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-[var(--text-main)] truncate">{st.name}</h5>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomStyle(st.id, st.name)}
                              aria-label="Excluir estilo"
                              className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none transition"
                              title="Excluir estilo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">{st.fontFamilyId} • {st.baseFontSize}pt</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">{st.pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'} • {st.viaLayout}</span>
                            {!st.showHeader && <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold">Sem Cabeçalho</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleApplyStyle(st);
                              setIsModelsDrawerOpen(false);
                            }}
                            className="w-full py-1.5 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold cursor-pointer shadow-tactile-btn transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                          >
                            Aplicar Este Estilo
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Estilos Padrão do Sistema */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Estilos Padrão de Fábrica</span>
                    </h4>
                    {DEFAULT_PRESCRIPTION_STYLES.map(st => (
                      <div
                        key={st.id}
                        className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-info transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                            {st.viaLayout === '2-vias' ? <Files className="w-3.5 h-3.5 text-sky-600" /> : st.watermarkType !== 'none' ? <Stethoscope className="w-3.5 h-3.5 text-sky-600" /> : <File className="w-3.5 h-3.5 text-sky-600" />}
                            <span>{st.name}</span>
                          </h5>
                          <span className="text-xs px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold">
                            {st.baseFontSize}pt • {st.pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                          {st.id === 'especial_2vias'
                            ? 'Orientação Paisagem (297×210mm) com 2 vias na mesma folha e linha de corte central para retenção na farmácia (Portaria 344/98).'
                            : st.id === 'sus'
                            ? 'Configuração oficial para UBS/UPA com tipografia Inter e marca d’água do SUS.'
                            : st.id === 'classico'
                            ? 'Tipografia serifada Cormorant Garamond nobre para consultórios e clínicas privadas.'
                            : st.id === 'pre_timbrado'
                            ? 'Oculta o cabeçalho e rodapé digitais para imprimir perfeitamente em papel pré-impresso de gráfica.'
                            : 'Formato padrão para prescrições ambulatoriais com tipografia limpa e moderna.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            handleApplyStyle(st);
                            setIsModelsDrawerOpen(false);
                          }}
                          className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold cursor-pointer shadow-tactile-btn transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                        >
                          Aplicar Estilo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Salvar como Modelo Personalizado */}
      {isSaveModelModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-save-model-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 no-print animate-tab-fade"
          onClick={() => setIsSaveModelModalOpen(false)}
        >
          <div
            ref={saveModelModalRef}
            className="tactile-modal modal-content text-[var(--text-main)] rounded-2xl max-w-md w-full p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-sky-600" />
                <h3 id="editor-save-model-modal-title" className="text-base font-bold">Salvar como Modelo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModelModalOpen(false)}
                aria-label="Fechar modal de salvar modelo"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsTemplate} className="mt-4 space-y-4">
              <div>
                <label htmlFor="save-model-title" className="block text-xs font-bold mb-1.5 text-[var(--text-secondary)]">
                  Nome do Modelo Clínico
                </label>
                <input
                  id="save-model-title"
                  type="text"
                  required
                  value={newModelTitle}
                  onChange={(e) => setNewModelTitle(e.target.value)}
                  placeholder="Ex.: Laudo Cardiológico - Policlínica"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:border-info focus-visible:ring-2 focus-visible:ring-sky-500 font-medium transition"
                  autoFocus
                />
              </div>

              {/* Vínculo de Contexto */}
              <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Local de Atuação:</span>
                  <span className="text-[var(--text-main)] font-bold">
                    {activeContext?.name || 'Geral'}
                  </span>
                </div>

                <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={saveAsGlobal}
                    onChange={(e) => setSaveAsGlobal(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Tornar este modelo disponível em todos os meus locais de trabalho</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModelModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newModelTitle.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white shadow-tactile-btn cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Modelo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Salvar como Estilo de Receita Personalizado */}
      {isSaveStyleModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-save-style-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 no-print animate-tab-fade"
          onClick={() => setIsSaveStyleModalOpen(false)}
        >
          <div
            ref={saveStyleModalRef}
            className="tactile-modal modal-content text-[var(--text-main)] rounded-2xl max-w-md w-full p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-sky-600" />
                <h3 id="editor-save-style-modal-title" className="text-base font-bold">Salvar Estilo da Receita</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveStyleModalOpen(false)}
                aria-label="Fechar modal de salvar estilo"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomStyle} className="mt-4 space-y-4">
              <div>
                <label htmlFor="save-style-title" className="block text-xs font-bold mb-1.5 text-[var(--text-secondary)]">
                  Nome do Estilo Visual
                </label>
                <input
                  id="save-style-title"
                  type="text"
                  required
                  value={newStyleTitle}
                  onChange={(e) => setNewStyleTitle(e.target.value)}
                  placeholder="Ex.: Minha Clínica • 2 Vias Azul"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:border-info focus-visible:ring-2 focus-visible:ring-sky-500 font-medium transition"
                  autoFocus
                />
              </div>

              {/* Resumo da Configuração Atual do Estilo */}
              <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                <span className="font-bold text-[var(--text-secondary)] block text-xs uppercase tracking-wider">
                  Configurações que serão salvas:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                  <div>• Tipografia: <strong className="text-[var(--text-main)] capitalize">{fontFamilyId}</strong></div>
                  <div>• Tamanho: <strong className="text-[var(--text-main)]">{baseFontSize} pt</strong></div>
                  <div>• Orientação: <strong className="text-[var(--text-main)]">{pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}</strong></div>
                  <div>• Formato: <strong className="text-[var(--text-main)]">{viaLayout === '2-vias' ? '2 Vias (Mesma Folha)' : '1 Via'}</strong></div>
                  <div>• Cabeçalho: <strong className="text-[var(--text-main)]">{headerConfig.showHeader ? 'Visível' : 'Oculto'}</strong></div>
                  <div>• Rodapé: <strong className="text-[var(--text-main)]">{headerConfig.showFooter ? 'Visível' : 'Oculto'}</strong></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveStyleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newStyleTitle.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white shadow-tactile-btn cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Estilo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
