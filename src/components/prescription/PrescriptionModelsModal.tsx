import React from 'react';
import { PrescriptionItem } from '../../types';
import { SavedDocument } from '../../services/db';
import { UnifiedMedication } from '../../data/medicationDatabase';
import { Icon } from '../Icon';
import { ActionButton } from '../ui/ActionButton';

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
  if (!isSaveModelModalOpen && !isLoadModelModalOpen) {
    return null;
  }

  return (
    <>
      {isSaveModelModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-busy={false}
          data-state="idle"
          aria-label="Salvar como modelo de receita"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 animate-backdrop-fade"
        >
          <div className="bg-white dark:bg-slate-900 border border-subtle dark:border-strong rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-tactile-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-strong">
              <div className="flex items-center gap-2">
                <Icon name="bookmark_add" className="text-[20px] text-sky-600" />
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                  Salvar como modelo de receita
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseSaveModelModal}
                aria-label="Fechar modal"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Este modelo salvará os <strong>{items.length} medicamentos</strong> prescritos para reutilização em 1 clique.
            </p>

            <div>
              <label htmlFor="model-name-input" className="block text-xs font-bold uppercase text-slate-500 mb-1">
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
                className="w-full p-3 rounded-xl text-xs sm:text-sm font-semibold border border-medium dark:border-strong bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              />
            </div>

            <div className="max-h-36 overflow-y-auto rounded-xl border border-subtle dark:border-strong p-2.5 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5 text-xs">
              <span className="text-xs font-bold text-slate-400 uppercase block">Itens inclusos:</span>
              {items.map((it, idx) => (
                <div key={it.id} className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
                  <span className="font-mono text-slate-400 clinical-tabular-nums">{idx + 1}.</span>
                  <span className="font-semibold truncate">{it.name}</span>
                  <span className="text-xs text-slate-500">({it.quantity})</span>
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
          role="dialog"
          aria-modal="true"
          aria-busy={false}
          data-state="idle"
          aria-label="Modelos de receitas salvos"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 animate-tab-fade"
        >
          <div className="bg-white dark:bg-slate-900 border border-subtle dark:border-strong rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-tactile-lg">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-strong">
              {isCreatingCustomModel ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onExitCreateCustomModel}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Voltar para a lista de modelos"
                  >
                    <Icon name="arrow_back" className="text-[18px]" />
                  </button>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                    Novo modelo de receita
                  </h3>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon name="folder_open" className="text-[20px] text-amber-500" />
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                    Modelos de receitas salvos
                  </h3>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isCreatingCustomModel && (
                  <button
                    type="button"
                    onClick={onStartCreateCustomModel}
                    className="chip-neutral px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition"
                  >
                    <Icon name="add" className="text-[14px] text-sky-600 dark:text-sky-400" />
                    <span>+ Criar modelo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onCloseLoadModelModal}
                  aria-label="Fechar biblioteca de modelos"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
            </div>

            {isCreatingCustomModel ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome do modelo
                  </label>
                  <input
                    type="text"
                    value={customModelDraftTitle}
                    onChange={(e) => onChangeCustomModelDraftTitle(e.target.value)}
                    placeholder="Ex.: Hipertensão leve, ITU ambulatorial, Pós-operatório..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-subtle dark:border-strong text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-info"
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Adicionar medicamento ao modelo
                  </label>
                  <div className="relative">
                    <Icon name="search" className="text-[16px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={customModelSearchTerm}
                      onChange={(e) => onCustomModelSearchChange(e.target.value)}
                      placeholder="Ex.: Amoxicilina 500 mg, Dipirona 500 mg, Losartana..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-subtle dark:border-strong text-xs text-slate-900 dark:text-white outline-none focus:border-info"
                    />
                  </div>

                  {customModelSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-subtle dark:border-strong rounded-xl shadow-tactile-lg max-h-48 overflow-y-auto p-1 space-y-1">
                      {customModelSuggestions.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => onAddCustomModelItem(sug)}
                          className="w-full text-left p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {sug.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {sug.route} • {sug.defaultQuantity}
                            </span>
                          </div>
                          <Icon name="add" className="text-[16px] text-sky-600 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block clinical-tabular-nums">
                    Medicamentos deste modelo ({customModelDraftItems.length}):
                  </span>

                  {customModelDraftItems.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-subtle dark:border-strong text-xs text-slate-500">
                      Nenhum medicamento incluído ainda. Digite o nome acima para adicionar.
                    </div>
                  ) : (
                    customModelDraftItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-subtle dark:border-strong bg-slate-50/60 dark:bg-slate-950/40 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {item.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveCustomModelItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition rounded"
                            title="Remover do modelo"
                          >
                            <Icon name="delete" className="text-[14px]" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs font-semibold text-slate-500 block mb-0.5">
                              Quantidade
                            </label>
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={(e) => onUpdateCustomModelItem(item.id, { quantity: e.target.value })}
                              placeholder="Ex.: 30 comprimidos"
                              className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-subtle dark:border-strong text-slate-800 dark:text-slate-200 outline-none focus:border-info"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 block mb-0.5">
                              Posologia / Instruções
                            </label>
                            <input
                              type="text"
                              value={item.instructions}
                              onChange={(e) => onUpdateCustomModelItem(item.id, { instructions: e.target.value })}
                              placeholder="Ex.: Tomar 1 comprimido de 8 em 8 horas"
                              className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-subtle dark:border-strong text-slate-800 dark:text-slate-200 outline-none focus:border-info"
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
                  <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-subtle dark:border-strong space-y-3">
                    <Icon name="bookmark_add" className="text-[32px] text-slate-400 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nenhum modelo de receita salvo ainda.
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
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
                      className="p-3.5 rounded-xl border border-subtle dark:border-strong bg-slate-50/60 dark:bg-slate-950/40 hover:border-info dark:hover:border-info transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {model.title}
                          </h4>
                          <span className="text-xs font-semibold text-slate-500 clinical-tabular-nums">
                            {model.prescriptionItems?.length || 0} medicamentos cadastrados
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeletePrescriptionModel(model.id, model.title)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition rounded"
                          title="Excluir este modelo"
                        >
                          <Icon name="delete" className="text-[14px]" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {model.prescriptionItems?.map((i) => i.name).join(' • ')}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-subtle dark:border-strong">
                        <button
                          type="button"
                          onClick={() => onApplyPrescriptionModel(model, 'append')}
                          className="chip-neutral px-3 py-1 rounded-lg text-xs cursor-pointer transition"
                          title="Adicionar estes medicamentos mantendo os que já estão na receita"
                        >
                          Adicionar (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplyPrescriptionModel(model, 'replace')}
                          className="btn-tactile-primary px-3 py-1 min-h-[34px] rounded-lg text-xs font-bold cursor-pointer transition"
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

            <div className="p-4 border-t border-slate-100 dark:border-strong flex justify-end gap-2">
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
