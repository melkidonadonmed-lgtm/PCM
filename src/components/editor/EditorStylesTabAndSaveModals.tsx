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
    badgeColor: 'bg-[var(--primary)]',
  },
  {
    id: 'relatorio_circunstanciado',
    badge: 'SUS / Perícia / INSS',
    title: 'Relatório Médico Circunstanciado',
    desc: 'Para perícia médica, regulação do SUS ou INSS com anamnese dirigida e terapêutica em curso.',
    badgeColor: 'bg-[var(--clinical)]',
  },
  {
    id: 'laudo_com_receita',
    badge: 'Consulta Ativa',
    title: 'Laudo com Prescrição Anexa',
    desc: 'Avaliação clínica estruturada acompanhada dos medicamentos prescritos na consulta atual.',
    badgeColor: 'bg-[var(--primary)]',
  },
  {
    id: 'declaracao_comparecimento',
    badge: 'Declaração',
    title: 'Declaração de Comparecimento com Receita',
    desc: 'Comprovação de horário de atendimento com prescrição dos fármacos indicados.',
    badgeColor: 'bg-[var(--primary)]',
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
    badgeColor: 'bg-rose-700',
  },
  {
    id: 'parecer',
    badge: 'Especialista',
    title: 'Parecer Especializado / Contra-Referência',
    desc: 'Resposta ao médico da Atenção Básica com plano terapêutico e seguimento.',
    badgeColor: 'bg-[var(--primary)]',
  },
  {
    id: 'atestado',
    badge: 'Aptidão',
    title: 'Atestado de Aptidão Física',
    desc: 'Declaração de aptidão para esportes e academia conforme diretrizes do CFM.',
    badgeColor: 'bg-[var(--clinical)]',
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
      <div className="p-3 rounded-xl bg-[var(--surface-card-lit)] border border-[var(--hairline)] border-l-[3px] border-l-[var(--ink-clinical)] flex items-center justify-between gap-2">
        <div className="text-xs text-[var(--ink-secondary)]">
          <p className="font-bold text-[var(--ink-primary)]">Personalize e Salve seu Estilo</p>
          <p className="text-xs text-[var(--ink-muted)]">Guarde fonte, orientação e formato de vias atual</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsModelsDrawerOpen(false);
            setIsSaveStyleModalOpen(true);
          }}
          className="btn-tactile-primary min-h-[44px] px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>Salvar Atual</span>
        </button>
      </div>

      {/* Meus Estilos Salvos */}
      {customStyles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Meus Estilos Personalizados
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-[6px] bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border border-[var(--hairline)] font-bold clinical-tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" aria-hidden="true" />
              <span>{customStyles.length}</span>
            </span>
          </h4>
          {customStyles.map((st) => (
            <div
              key={st.id}
              className="p-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-card)] hover:border-[var(--border-control)] transition flex flex-col gap-2 shadow-[var(--elevation-low)]"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-[var(--ink-primary)] truncate">{st.name}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomStyle(st.id, st.name)}
                  aria-label="Excluir estilo"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[var(--ink-muted)] hover:text-[var(--status-danger)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] outline-none transition"
                  title="Excluir estilo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)] flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-[var(--surface-chip-muted)] font-semibold">
                  {st.fontFamilyId} • {st.baseFontSize}pt
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[var(--surface-chip-muted)] font-semibold">
                  {st.pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'} • {st.viaLayout}
                </span>
                {!st.showHeader && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border border-[var(--hairline)] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] shrink-0" aria-hidden="true" />
                    <span>Sem Cabeçalho</span>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  handleApplyStyle(st);
                  setIsModelsDrawerOpen(false);
                }}
                className="btn-tactile-primary w-full min-h-[44px] py-1.5 px-3 text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              >
                Aplicar Este Estilo
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Estilos Padrão do Sistema */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>Estilos Padrão de Fábrica</span>
        </h4>
        {DEFAULT_PRESCRIPTION_STYLES.map((st) => (
          <div
            key={st.id}
            className="p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-card)] hover:border-[var(--border-control)] transition"
          >
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-xs font-bold text-[var(--ink-primary)] flex items-center gap-1.5">
                {st.viaLayout === '2-vias' ? (
                  <Files className="w-3.5 h-3.5 text-[var(--ink-clinical)]" />
                ) : st.watermarkType !== 'none' ? (
                  <Stethoscope className="w-3.5 h-3.5 text-[var(--ink-clinical)]" />
                ) : (
                  <File className="w-3.5 h-3.5 text-[var(--ink-clinical)]" />
                )}
                <span>{st.name}</span>
              </h5>
              <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-[6px] bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border border-[var(--hairline)] font-semibold clinical-tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" aria-hidden="true" />
                <span>{st.baseFontSize}pt • {st.pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}</span>
              </span>
            </div>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
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
              className="mt-2.5 btn-tactile-primary w-full min-h-[44px] py-1.5 px-3 text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[oklch(0.14_0.02_252/0.56)] no-print animate-tab-fade"
          onClick={() => setIsSaveModelModalOpen(false)}
        >
          <div
            ref={saveModelModalRef}
            className="tactile-modal modal-content text-[var(--ink-primary)] rounded-2xl max-w-md w-full p-4 relative shadow-[var(--elevation-high)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--hairline)]">
              <div className="flex items-center gap-2">
                <BookmarkPlus size={18} className="text-[var(--ink-clinical)]" />
                <h3 id="editor-save-model-modal-title" className="text-sm font-semibold">
                  Salvar como Modelo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModelModalOpen(false)}
                aria-label="Fechar modal de salvar modelo"
                className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsTemplate} className="mt-3.5 space-y-3">
              <div>
                <label htmlFor="save-model-title" className="block text-xs font-bold mb-1 text-[var(--ink-secondary)]">
                  Nome do Modelo Clínico
                </label>
                <input
                  id="save-model-title"
                  type="text"
                  required
                  value={newModelTitle}
                  onChange={(e) => setNewModelTitle(e.target.value)}
                  placeholder="Ex.: Laudo Cardiológico - Policlínica"
                  className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-focus)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] font-medium transition"
                  autoFocus
                />
              </div>

              {/* Vínculo de Contexto */}
              <div className="p-3 rounded-xl bg-[var(--surface-card-lit)] border border-[var(--hairline)] text-xs space-y-2">
                <div className="flex items-center gap-2 text-[var(--ink-secondary)] font-semibold">
                  <Building2 className="w-4 h-4 text-[var(--ink-clinical)]" />
                  <span>Local de Atuação:</span>
                  <span className="text-[var(--ink-primary)] font-bold">
                    {activeContext?.name || 'Geral'}
                  </span>
                </div>

                <label className="flex items-center gap-2 text-xs text-[var(--ink-muted)] cursor-pointer mt-1">
                  <input
                    id="editor-save-model-global"
                    name="saveAsGlobal"
                    type="checkbox"
                    checked={saveAsGlobal}
                    onChange={(e) => setSaveAsGlobal(e.target.checked)}
                    className="rounded text-[var(--clinical)] focus:ring-[var(--accent-focus)]"
                  />
                  <span>Tornar este modelo disponível em todos os meus locais de trabalho</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setIsSaveModelModalOpen(false)}
                  className="btn-tactile-secondary min-h-[44px] px-4 py-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newModelTitle.trim()}
                  className="btn-tactile-primary min-h-[44px] px-4 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[oklch(0.14_0.02_252/0.56)] no-print animate-tab-fade"
          onClick={() => setIsSaveStyleModalOpen(false)}
        >
          <div
            ref={saveStyleModalRef}
            className="tactile-modal modal-content text-[var(--ink-primary)] rounded-2xl max-w-md w-full p-4 relative shadow-[var(--elevation-high)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--hairline)]">
              <div className="flex items-center gap-2">
                <BookmarkPlus size={18} className="text-[var(--ink-clinical)]" />
                <h3 id="editor-save-style-modal-title" className="text-sm font-semibold">
                  Salvar Estilo da Receita
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveStyleModalOpen(false)}
                aria-label="Fechar modal de salvar estilo"
                className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomStyle} className="mt-3.5 space-y-3">
              <div>
                <label htmlFor="save-style-title" className="block text-xs font-bold mb-1 text-[var(--ink-secondary)]">
                  Nome do Estilo Visual
                </label>
                <input
                  id="save-style-title"
                  type="text"
                  required
                  value={newStyleTitle}
                  onChange={(e) => setNewStyleTitle(e.target.value)}
                  placeholder="Ex.: Minha Clínica • 2 Vias Azul"
                  className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-[var(--border-control)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-focus)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] font-medium transition"
                  autoFocus
                />
              </div>

              {/* Resumo da Configuração Atual do Estilo */}
              <div className="p-3 rounded-xl bg-[var(--surface-card-lit)] border border-[var(--hairline)] text-xs space-y-1.5">
                <span className="font-bold text-[var(--ink-secondary)] block text-xs uppercase tracking-wider">
                  Configurações que serão salvas:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--ink-muted)]">
                  <div>
                    • Tipografia: <strong className="text-[var(--ink-primary)] capitalize">{fontFamilyId}</strong>
                  </div>
                  <div>
                    • Tamanho: <strong className="text-[var(--ink-primary)] clinical-tabular-nums">{baseFontSize} pt</strong>
                  </div>
                  <div>
                    • Orientação:{' '}
                    <strong className="text-[var(--ink-primary)]">
                      {pageOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}
                    </strong>
                  </div>
                  <div>
                    • Formato:{' '}
                    <strong className="text-[var(--ink-primary)]">
                      {viaLayout === '2-vias' ? '2 Vias (Mesma Folha)' : '1 Via'}
                    </strong>
                  </div>
                  <div>
                    • Cabeçalho:{' '}
                    <strong className="text-[var(--ink-primary)]">
                      {headerConfig.showHeader ? 'Visível' : 'Oculto'}
                    </strong>
                  </div>
                  <div>
                    • Rodapé:{' '}
                    <strong className="text-[var(--ink-primary)]">
                      {headerConfig.showFooter ? 'Visível' : 'Oculto'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setIsSaveStyleModalOpen(false)}
                  className="btn-tactile-secondary min-h-[44px] px-4 py-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newStyleTitle.trim()}
                  className="btn-tactile-primary min-h-[44px] px-4 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
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
