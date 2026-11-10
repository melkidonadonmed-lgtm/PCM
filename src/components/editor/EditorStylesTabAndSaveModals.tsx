import React, { useRef } from 'react';
import {
  X,
  FileText,
  Save,
  BookmarkPlus,
  Check,
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
  WorkContext,
} from '../../types';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import {
  DEFAULT_PRESCRIPTION_STYLES,
  PresetQuickTemplateType,
} from './editorConfigAndFormatters';

export const PRESET_STANDARD_MODELS: Array<{
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
    badgeColor: 'bg-amber-600',
  },
  {
    id: 'receita',
    badge: 'Ambulatorial',
    title: 'Receita Ambulatorial Livre Padrão',
    desc: 'Prescrição antibiótica e analgésica sintomática com espaçamento milimétrico.',
    badgeColor: 'bg-sky-600',
  },
  {
    id: 'relatorio_circunstanciado',
    badge: 'SUS / Perícia / INSS',
    title: 'Relatório Médico Circunstanciado',
    desc: 'Para perícia médica, regulação do SUS ou INSS com anamnese dirigida e terapêutica em curso.',
    badgeColor: 'bg-emerald-600',
  },
  {
    id: 'laudo_com_receita',
    badge: 'Consulta Ativa',
    title: 'Laudo com Prescrição Anexa',
    desc: 'Avaliação clínica estruturada acompanhada dos medicamentos prescritos na consulta atual.',
    badgeColor: 'bg-sky-600',
  },
  {
    id: 'declaracao_comparecimento',
    badge: 'Declaração',
    title: 'Declaração de Comparecimento com Receita',
    desc: 'Comprovação de horário de atendimento com prescrição dos fármacos indicados.',
    badgeColor: 'bg-sky-600',
  },
  {
    id: 'laudo',
    badge: 'Clínico',
    title: 'Laudo de Avaliação Clínica',
    desc: 'Sumário de atendimento, hipótese diagnóstica e conduta terapêutica.',
    badgeColor: 'bg-slate-600',
  },
  {
    id: 'risco',
    badge: 'Cardiológico',
    title: 'Risco Cirúrgico Pré-Operatório',
    desc: 'Avaliação pré-anestésica com estratificação ASA e recomendações clínicas.',
    badgeColor: 'bg-rose-600',
  },
  {
    id: 'parecer',
    badge: 'Especialista',
    title: 'Parecer Especializado / Contra-Referência',
    desc: 'Resposta ao médico da Atenção Básica com plano terapêutico e seguimento.',
    badgeColor: 'bg-sky-600',
  },
  {
    id: 'atestado',
    badge: 'Aptidão',
    title: 'Atestado de Aptidão Física',
    desc: 'Declaração de aptidão para esportes e academia conforme diretrizes do CFM.',
    badgeColor: 'bg-teal-600',
  },
];

export interface EditorStylesDrawerTabProps {
  customStyles: PrescriptionStyle[];
  setIsModelsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSaveStyleModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteCustomStyle: (id: string, name: string) => void;
  handleApplyStyle: (style: PrescriptionStyle) => void;
}

export const EditorStylesDrawerTab: React.FC<EditorStylesDrawerTabProps> = ({
  customStyles,
  setIsModelsDrawerOpen,
  setIsSaveStyleModalOpen,
  handleDeleteCustomStyle,
  handleApplyStyle,
}) => {
  return (
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
            <span className="flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Meus Estilos Personalizados
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 font-bold clinical-tabular-nums">
              {customStyles.length}
            </span>
          </h4>
          {customStyles.map((st) => (
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
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                  {st.fontFamilyId} • {st.baseFontSize}pt
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                  {st.pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'} • {st.viaLayout}
                </span>
                {!st.showHeader && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold">
                    Sem Cabeçalho
                  </span>
                )}
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
        {DEFAULT_PRESCRIPTION_STYLES.map((st) => (
          <div
            key={st.id}
            className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-info transition"
          >
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                {st.viaLayout === '2-vias' ? (
                  <Files className="w-3.5 h-3.5 text-sky-600" />
                ) : st.watermarkType !== 'none' ? (
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                ) : (
                  <File className="w-3.5 h-3.5 text-sky-600" />
                )}
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
  );
};

export interface EditorSaveModelAndStyleModalsProps {
  isSaveModelModalOpen: boolean;
  setIsSaveModelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveAsTemplate: (e: React.FormEvent) => void;
  newModelTitle: string;
  setNewModelTitle: React.Dispatch<React.SetStateAction<string>>;
  activeContext: WorkContext | null;
  saveAsGlobal: boolean;
  setSaveAsGlobal: React.Dispatch<React.SetStateAction<boolean>>;
  isSaveStyleModalOpen: boolean;
  setIsSaveStyleModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveCustomStyle: (e: React.FormEvent) => void;
  newStyleTitle: string;
  setNewStyleTitle: React.Dispatch<React.SetStateAction<string>>;
  fontFamilyId: string;
  baseFontSize: number;
  pageOrientation: DocumentOrientation;
  viaLayout: DocumentViaLayout;
  headerConfig: DocumentHeaderConfig;
}

export const EditorSaveModelAndStyleModals: React.FC<EditorSaveModelAndStyleModalsProps> = ({
  isSaveModelModalOpen,
  setIsSaveModelModalOpen,
  handleSaveAsTemplate,
  newModelTitle,
  setNewModelTitle,
  activeContext,
  saveAsGlobal,
  setSaveAsGlobal,
  isSaveStyleModalOpen,
  setIsSaveStyleModalOpen,
  handleSaveCustomStyle,
  newStyleTitle,
  setNewStyleTitle,
  fontFamilyId,
  baseFontSize,
  pageOrientation,
  viaLayout,
  headerConfig,
}) => {
  const saveModelModalRef = useRef<HTMLDivElement>(null);
  const saveStyleModalRef = useRef<HTMLDivElement>(null);

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
            className="tactile-modal modal-content text-[var(--text-main)] rounded-2xl max-w-md w-full p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <BookmarkPlus size={18} className="text-sky-600" />
                <h3 id="editor-save-model-modal-title" className="text-sm font-semibold">
                  Salvar como Modelo
                </h3>
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

            <form onSubmit={handleSaveAsTemplate} className="mt-3.5 space-y-3">
              <div>
                <label htmlFor="save-model-title" className="block text-xs font-bold mb-1 text-[var(--text-secondary)]">
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

              <div className="flex items-center justify-end gap-2 pt-1.5">
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
            className="tactile-modal modal-content text-[var(--text-main)] rounded-2xl max-w-md w-full p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <BookmarkPlus size={18} className="text-sky-600" />
                <h3 id="editor-save-style-modal-title" className="text-sm font-semibold">
                  Salvar Estilo da Receita
                </h3>
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

            <form onSubmit={handleSaveCustomStyle} className="mt-3.5 space-y-3">
              <div>
                <label htmlFor="save-style-title" className="block text-xs font-bold mb-1 text-[var(--text-secondary)]">
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
                  <div>
                    • Tipografia: <strong className="text-[var(--text-main)] capitalize">{fontFamilyId}</strong>
                  </div>
                  <div>
                    • Tamanho: <strong className="text-[var(--text-main)]">{baseFontSize} pt</strong>
                  </div>
                  <div>
                    • Orientação:{' '}
                    <strong className="text-[var(--text-main)]">
                      {pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}
                    </strong>
                  </div>
                  <div>
                    • Formato:{' '}
                    <strong className="text-[var(--text-main)]">
                      {viaLayout === '2-vias' ? '2 Vias (Mesma Folha)' : '1 Via'}
                    </strong>
                  </div>
                  <div>
                    • Cabeçalho:{' '}
                    <strong className="text-[var(--text-main)]">
                      {headerConfig.showHeader ? 'Visível' : 'Oculto'}
                    </strong>
                  </div>
                  <div>
                    • Rodapé:{' '}
                    <strong className="text-[var(--text-main)]">
                      {headerConfig.showFooter ? 'Visível' : 'Oculto'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1.5">
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
