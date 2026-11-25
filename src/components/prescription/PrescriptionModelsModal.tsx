import React, { useRef } from 'react';
import { PrescriptionItem } from '../../types';
import { SavedDocument } from '../../services/db';
import { UnifiedMedication } from '../../data/medicationDatabase';
import { Icon } from '../Icon';
import { ActionButton } from '../ui/ActionButton';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export interface PrescriptionModelsModalProps {
  isSaveModelModalOpen: boolean;
  isLoadModelModalOpen: boolean;
  isCreatingCustomModel: boolean;
  items: PrescriptionItem[];
  newModelName: string;
  savedPrescriptionModels: SavedDocument[];
  customModelDraftTitle: string;
  customModelDraftItems: PrescriptionItem[];
  customModelSearchTerm: string;
  customModelSuggestions: UnifiedMedication[];
  onChangeNewModelName: (name: string) => void;
  onSavePrescriptionModel: () => void;
  onCloseSaveModelModal: () => void;
  onCloseLoadModelModal: () => void;
  onStartCreateCustomModel: () => void;
  onExitCreateCustomModel: () => void;
  onChangeCustomModelDraftTitle: (title: string) => void;
  onCustomModelSearchChange: (term: string) => void;
  onAddCustomModelItem: (med: UnifiedMedication) => void;
  onRemoveCustomModelItem: (id: string) => void;
  onUpdateCustomModelItem: (id: string, updates: Partial<PrescriptionItem>) => void;
  onSaveCustomCreatedModel: () => void;
  onApplyPrescriptionModel: (model: SavedDocument, mode: 'replace' | 'append') => void;
  onDeletePrescriptionModel: (modelId: string, modelTitle: string) => void;
}

/**
 * Modais Desacoplados de Biblioteca e Criação de Modelos de Receita (Camada prescription/).
 */
export const PrescriptionModelsModal: React.FC<PrescriptionModelsModalProps> = ({
  isSaveModelModalOpen,
  isLoadModelModalOpen,
  isCreatingCustomModel,
  items,
  newModelName,
  savedPrescriptionModels,
  customModelDraftTitle,
  customModelDraftItems,
  customModelSearchTerm,
  customModelSuggestions,
  onChangeNewModelName,
  onSavePrescriptionModel,
  onCloseSaveModelModal,
  onCloseLoadModelModal,
  onStartCreateCustomModel,
  onExitCreateCustomModel,
  onChangeCustomModelDraftTitle,
  onCustomModelSearchChange,
  onAddCustomModelItem,
  onRemoveCustomModelItem,
  onUpdateCustomModelItem,
  onSaveCustomCreatedModel,
  onApplyPrescriptionModel,
  onDeletePrescriptionModel,
}) => {
  const saveModalRef = useRef<HTMLDivElement>(null);
  const loadModalRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: isSaveModelModalOpen,
    onClose: onCloseSaveModelModal,
    containerRef: saveModalRef,
  });

  useModalAccessibility({
    isOpen: isLoadModelModalOpen,
    onClose: onCloseLoadModelModal,
    containerRef: loadModalRef,
  });

  if (!isSaveModelModalOpen && !isLoadModelModalOpen) {
    return null;
  }

  return (
    <>
      {isSaveModelModalOpen && (
        <div
          ref={saveModalRef}
          role="dialog"
          aria-modal="true"
          aria-busy={false}
          data-state="idle"
          aria-label="Salvar como modelo de receita"
          onClick={onCloseSaveModelModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 animate-backdrop-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="tactile-modal modal-content rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 modal-surface-spring"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--hairline)]">
              <div className="flex items-center gap-2">
                <Icon name="bookmark_add" className="text-[20px] text-[var(--ink-clinical)]" />
                <h3 className="font-semibold text-sm sm:text-base text-[var(--ink-primary)]">
                  Salvar como modelo de receita
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseSaveModelModal}
                aria-label="Fechar modal"
                className="btn-tactile-icon touch-target text-[var(--ink-muted)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <p className="text-xs text-[var(--ink-secondary)]">
              Este modelo salvará os <strong className="clinical-tabular-nums text-[var(--ink-primary)]">{items.length} medicamentos</strong> prescritos para reutilização em 1 clique.
            </p>

            <div>
              <label htmlFor="model-name-input" className="block text-xs font-bold uppercase text-[var(--ink-muted)] mb-1">
                Nome do modelo
              </label>
              <input
                id="model-name-input"
                type="text"
                autoFocus
                value={newModelName}
                onChange={(e) => onChangeNewModelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSavePrescriptionModel();
                }}
                placeholder="Ex.: Hipertensão inicial, GECA pediátrica, Amigdalite..."
                className="tactile-input w-full min-h-[44px] p-3 rounded-xl text-xs sm:text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
              />
            </div>

            <div className="max-h-36 overflow-y-auto rounded-xl border border-[var(--hairline)] p-2.5 bg-[var(--surface-card-lit)] space-y-1.5 text-xs">
              <span className="text-xs font-bold text-[var(--ink-muted)] uppercase block">Itens inclusos:</span>
              {items.map((it, idx) => (
                <div key={it.id} className="text-[var(--ink-secondary)] flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[var(--ink-muted)] clinical-tabular-nums">{idx + 1}.</span>
                  <span className="font-semibold text-[var(--ink-primary)] truncate">{it.name}</span>
                  <span className="text-xs text-[var(--ink-muted)]">({it.quantity})</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <ActionButton variant="ghost" onClick={onCloseSaveModelModal}>
                Cancelar
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={onSavePrescriptionModel}
                disabled={!newModelName.trim()}
              >
                Salvar modelo
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {isLoadModelModalOpen && (
        <div
          ref={loadModalRef}
          role="dialog"
          aria-modal="true"
          aria-busy={false}
          data-state="idle"
          aria-label="Modelos de receitas salvos"
          onClick={onCloseLoadModelModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 animate-tab-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="tactile-modal modal-content rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col modal-surface-spring"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--hairline)]">
              {isCreatingCustomModel ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onExitCreateCustomModel}
                    aria-label="Voltar para a lista de modelos"
                    className="btn-tactile-icon touch-target text-[var(--ink-muted)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
                    title="Voltar para a lista de modelos"
                  >
                    <Icon name="arrow_back" className="text-[18px]" />
                  </button>
                  <h3 className="font-semibold text-base text-[var(--ink-primary)]">
                    Novo modelo de receita
                  </h3>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon name="folder_open" className="text-[20px] text-[var(--accent-amber)]" />
                  <h3 className="font-semibold text-base text-[var(--ink-primary)]">
                    Modelos de receitas salvos
                  </h3>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isCreatingCustomModel && (
                  <button
                    type="button"
                    onClick={onStartCreateCustomModel}
                    className="btn-tactile-secondary min-h-[44px] px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
                  >
                    <Icon name="add" className="text-[14px] text-[var(--ink-clinical)]" />
                    <span>+ Criar modelo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onCloseLoadModelModal}
                  aria-label="Fechar biblioteca de modelos"
                  className="btn-tactile-icon touch-target text-[var(--ink-muted)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
            </div>

            {isCreatingCustomModel ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
                <div>
                  <label className="text-xs font-bold text-[var(--ink-secondary)] block mb-1">
                    Nome do modelo
                  </label>
                  <input
                    id="custom-model-title-input"
                    name="customModelDraftTitle"
                    type="text"
                    value={customModelDraftTitle}
                    onChange={(e) => onChangeCustomModelDraftTitle(e.target.value)}
                    placeholder="Ex.: Hipertensão leve, ITU ambulatorial, Pós-operatório..."
                    className="tactile-input w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold outline-none focus:border-[var(--accent-focus)]"
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <label className="text-xs font-bold text-[var(--ink-secondary)] block mb-1">
                    Adicionar medicamento ao modelo
                  </label>
                  <div className="relative">
                    <Icon name="search" className="text-[16px] text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="custom-model-med-search"
                      name="customModelSearchTerm"
                      type="text"
                      value={customModelSearchTerm}
                      onChange={(e) => onCustomModelSearchChange(e.target.value)}
                      placeholder="Ex.: Amoxicilina 500 mg, Dipirona 500 mg, Losartana..."
                      className="tactile-input w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl text-xs outline-none focus:border-[var(--accent-focus)]"
                    />
                  </div>

                  {customModelSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 tactile-dropdown rounded-xl max-h-48 overflow-y-auto p-1 space-y-1">
                      {customModelSuggestions.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => onAddCustomModelItem(sug)}
                          className="w-full min-h-[44px] text-left p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[var(--ink-primary)] block">
                              {sug.name}
                            </span>
                            <span className="text-xs text-[var(--ink-muted)]">
                              {sug.route} • {sug.defaultQuantity}
                            </span>
                          </div>
                          <Icon name="add" className="text-[16px] text-[var(--ink-clinical)] shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-bold text-[var(--ink-secondary)] block clinical-tabular-nums">
                    Medicamentos deste modelo ({customModelDraftItems.length}):
                  </span>

                  {customModelDraftItems.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-[var(--surface-inset)] border border-[var(--hairline)] text-xs text-[var(--ink-secondary)]">
                      Nenhum medicamento incluído ainda. Digite o nome acima para adicionar.
                    </div>
                  ) : (
                    customModelDraftItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[var(--ink-primary)]">
                            {idx + 1}. {item.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveCustomModelItem(item.id)}
                            aria-label={`Remover ${item.name} do modelo`}
                            className="btn-tactile-danger min-h-[44px] min-w-[44px] p-0 inline-flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] focus-visible:outline-none"
                            title="Remover do modelo"
                          >
                            <Icon name="delete" className="text-[14px]" />
                          </button>
                        </div>

                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <label className="text-xs font-semibold text-[var(--ink-muted)] block mb-0.5 truncate">
                              Quantidade
                            </label>
                            <input
                              name={`customModelItemQty_${idx}`}
                              type="text"
                              value={item.quantity}
                              onChange={(e) => onUpdateCustomModelItem(item.id, { quantity: e.target.value })}
                              placeholder="Ex.: 30 comp"
                              className="tactile-input w-full min-h-[44px] px-2.5 py-1 text-xs rounded-lg outline-none focus:border-[var(--accent-focus)] clinical-tabular-nums"
                            />
                          </div>
                          <div className="col-span-8">
                            <label className="text-xs font-semibold text-[var(--ink-muted)] block mb-0.5 truncate">
                              Posologia / Instruções
                            </label>
                            <input
                              name={`customModelItemInstructions_${idx}`}
                              type="text"
                              value={item.instructions}
                              onChange={(e) => onUpdateCustomModelItem(item.id, { instructions: e.target.value })}
                              placeholder="Ex.: Tomar 1 comprimido de 8 em 8 horas"
                              className="tactile-input w-full min-h-[44px] px-2.5 py-1 text-xs rounded-lg outline-none focus:border-[var(--accent-focus)]"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
                {savedPrescriptionModels.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-[var(--surface-inset)] border border-[var(--hairline)] space-y-3">
                    <Icon name="bookmark_add" className="text-[32px] text-[var(--ink-muted)] mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--ink-primary)]">
                        Nenhum modelo de receita salvo ainda.
                      </p>
                      <p className="text-xs text-[var(--ink-muted)] max-w-xs mx-auto mt-0.5">
                        Você pode criar um modelo agora mesmo ou salvar uma receita ativa na consulta.
                      </p>
                    </div>
                    <ActionButton variant="primary" iconName="add" onClick={onStartCreateCustomModel}>
                      Criar meu primeiro modelo
                    </ActionButton>
                  </div>
                ) : (
                  savedPrescriptionModels.map((model) => (
                    <div
                      key={model.id}
                      className="p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] hover:border-[var(--border-control)] transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                            {model.title}
                          </h4>
                          <span className="text-xs font-semibold text-[var(--ink-muted)] clinical-tabular-nums">
                            {model.prescriptionItems?.length || 0} medicamentos cadastrados
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeletePrescriptionModel(model.id, model.title)}
                          aria-label={`Excluir modelo ${model.title}`}
                          className="btn-tactile-danger min-h-[44px] min-w-[44px] p-0 inline-flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] focus-visible:outline-none"
                          title="Excluir este modelo"
                        >
                          <Icon name="delete" className="text-[14px]" />
                        </button>
                      </div>

                      <p className="text-xs text-[var(--ink-secondary)] truncate">
                        {model.prescriptionItems?.map((i) => i.name).join(' • ')}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--hairline)]">
                        <button
                          type="button"
                          onClick={() => onApplyPrescriptionModel(model, 'append')}
                          className="btn-tactile-secondary touch-target min-h-[44px] px-3 py-1 rounded-lg text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
                          title="Adicionar estes medicamentos mantendo os que já estão na receita"
                        >
                          Adicionar (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplyPrescriptionModel(model, 'replace')}
                          className="touch-target btn-tactile-primary px-3 py-1 min-h-[44px] rounded-lg text-xs font-bold focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
                          title="Substituir todos os medicamentos da receita por este modelo"
                        >
                          Substituir receita
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="p-4 border-t border-[var(--hairline)] flex justify-end gap-2">
              {isCreatingCustomModel ? (
                <>
                  <ActionButton variant="ghost" onClick={onExitCreateCustomModel}>
                    Voltar
                  </ActionButton>
                  <ActionButton
                    variant="primary"
                    onClick={onSaveCustomCreatedModel}
                    disabled={!customModelDraftTitle.trim() || customModelDraftItems.length === 0}
                  >
                    Salvar modelo
                  </ActionButton>
                </>
              ) : (
                <ActionButton variant="ghost" onClick={onCloseLoadModelModal}>
                  Fechar
                </ActionButton>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
