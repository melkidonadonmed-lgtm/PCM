import React from 'react';
import { PrescriptionItem } from '../../types';
import { classificarReceita, type RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';
import { descreverNotificacao, notificacaoExigida } from '../../utils/notificacaoDeReceita';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import { AcoesDaReceita } from '../AcoesDaReceita';
import { AvisoNotificacaoReceita } from '../AvisoNotificacaoReceita';

export interface PrescribedItemsListProps {
  items: PrescriptionItem[];
  editingItemId: string | null;
  regimesComItens: RegimeReceita[];
  porRegime: Record<RegimeReceita, PrescriptionItem[]>;
  itensEmDuasVias: number;
  regimeLabels: Record<RegimeReceita, { rotulo: string; detalhe: string; tituloTexto: string }>;
  savedModelsCount: number;
  isDoctorConfigured: boolean;
  copiedSuccess: boolean;
  onOpenModelsModal: () => void;
  onOpenSaveModelModal: () => void;
  onOpenCreateCustomModel: () => void;
  onClearPrescription?: () => void;
  onStartEdit: (item: PrescriptionItem) => void;
  onMoveItem: (index: number, direction: 'up' | 'down') => void;
  onRemoveItem: (id: string) => void;
  onNavigateToPrint: () => void;
  onNavigateToEditor?: () => void;
  onSendWhatsApp: () => void;
  onCopyText: () => void;
  onAbrirPerfilMedico?: () => void;
}

/**
 * Ilha de Medicamentos Prescritos e Segregação Sanitária (Camada prescription/).
 */
export const PrescribedItemsList: React.FC<PrescribedItemsListProps> = ({
  items,
  editingItemId,
  regimesComItens,
  porRegime,
  itensEmDuasVias,
  regimeLabels,
  savedModelsCount,
  isDoctorConfigured,
  copiedSuccess,
  onOpenModelsModal,
  onOpenSaveModelModal,
  onOpenCreateCustomModel,
  onClearPrescription,
  onStartEdit,
  onMoveItem,
  onRemoveItem,
  onNavigateToPrint,
  onNavigateToEditor,
  onSendWhatsApp,
  onCopyText,
  onAbrirPerfilMedico,
}) => {
  return (
    <section
      data-state={editingItemId ? 'pressed' : 'idle'}
      aria-busy={false}
      aria-label="Medicamentos prescritos na consulta"
      className="card-surface surface-card-minimal rounded-2xl p-4 sm:p-5 border border-subtle dark:border-strong space-y-3"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Medicamentos prescritos
          </h3>
          <Badge tone="navy" tabular>
            {items.length}
          </Badge>
          {itensEmDuasVias > 0 && (
            <Badge tone="warning" tabular>
              {itensEmDuasVias} em 2 vias
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenModelsModal}
            className="chip-neutral text-xs flex items-center gap-1.5 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5 py-1"
            title="Abrir biblioteca de modelos de receitas salvos"
          >
            <Icon name="folder_open" className="text-[15px] text-amber-500" />
            <span>Modelos</span>
            {savedModelsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold clinical-tabular-nums">
                {savedModelsCount}
              </span>
            )}
          </button>

          {items.length > 0 ? (
            <button
              type="button"
              onClick={onOpenSaveModelModal}
              className="chip-neutral text-xs flex items-center gap-1 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5 py-1"
              title="Salvar esta combinação de medicamentos como um modelo reutilizável"
            >
              <Icon name="bookmark_add" className="text-[15px] text-sky-600 dark:text-sky-400" />
              <span>Salvar modelo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCreateCustomModel}
              className="chip-neutral text-xs flex items-center gap-1 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5 py-1"
              title="Criar e salvar um novo modelo de receita reutilizável mesmo sem receita ativa na consulta"
            >
              <Icon name="add" className="text-[15px] text-sky-600 dark:text-sky-400" />
              <span>Novo modelo</span>
            </button>
          )}

          {items.length > 0 && onClearPrescription && (
            <button
              type="button"
              onClick={onClearPrescription}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-rose-500 px-2 py-1"
            >
              <Icon name="delete" className="text-[14px]" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Aviso de segregação sanitária quando há múltiplos regimes */}
      {regimesComItens.length > 1 && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-amber-500/10 border border-warning text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5"
        >
          <Icon name="shield" className="text-amber-600 dark:text-amber-400 text-base shrink-0 mt-0.5" />
          <p className="flex-1 min-w-0 leading-relaxed font-medium">
            <strong className="font-bold">Esta consulta gera {regimesComItens.length} receitas separadas: </strong>
            {regimesComItens
              .map((regime) => `${regimeLabels[regime].rotulo.toLowerCase()} (${porRegime[regime].length})`)
              .join(', ')}
            . Cada uma é emitida em sua própria folha.
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-dashed border-subtle dark:border-strong text-[var(--text-muted)] dark:text-slate-400 text-xs">
          Nenhum medicamento adicionado ainda. Busque acima ou aplique um kit de plantão na barra lateral.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it, idx) => {
            const regimeDoItem = classificarReceita(it);
            const notificacaoDoItem = notificacaoExigida(it);
            const isEditing = editingItemId === it.id;

            return (
              <div
                key={it.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 shadow-tactile-sm transition ${
                  isEditing
                    ? 'bg-sky-50/70 dark:bg-sky-950/40 border-info dark:border-info ring-2 ring-sky-400/40'
                    : 'bg-slate-50/80 dark:bg-slate-950/60 border border-subtle dark:border-strong'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 clinical-tabular-nums ${
                        isEditing ? 'bg-sky-600' : 'bg-navy-800 dark:bg-navy-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {it.name}
                    </h4>
                    <Badge tone="neutral" tabular>
                      {it.route} • {it.quantity}
                    </Badge>
                    {isEditing && (
                      <Badge tone="info" tabular={false}>
                        <Icon name="edit" className="text-xs" />
                        <span>Em edição</span>
                      </Badge>
                    )}
                    {regimeDoItem !== 'simples' && (
                      <Badge tone="warning" tabular={false}>
                        <Icon name="security" className="text-xs" />
                        <span>{regimeLabels[regimeDoItem].rotulo} • 2 vias</span>
                      </Badge>
                    )}
                    {notificacaoDoItem && (
                      <Badge
                        tone="danger"
                        tabular={false}
                        title={`Exige ${descreverNotificacao(notificacaoDoItem)}`}
                      >
                        <Icon name="warning" className="text-xs" />
                        <span>
                          {notificacaoDoItem.ressalva ? 'Verificar' : 'Exige'} {notificacaoDoItem.rotuloCurto}
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed font-medium">
                    {it.instructions}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartEdit(it)}
                    className={`p-1 rounded-lg transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
                      isEditing
                        ? 'bg-sky-600 text-white shadow-tactile-sm'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title="Editar este medicamento diretamente"
                    aria-label={`Editar ${it.name}`}
                  >
                    <Icon name="edit" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                    title="Mover para cima"
                  >
                    <Icon name="expand_less" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                    title="Mover para baixo"
                  >
                    <Icon name="expand_more" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(it.id)}
                    className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[var(--text-muted)] dark:text-slate-400 hover:text-rose-500 transition focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                    title="Remover medicamento"
                  >
                    <Icon name="delete" className="text-[16px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="block xl:hidden pt-3 border-t border-subtle dark:border-strong space-y-3">
          <AvisoNotificacaoReceita items={porRegime.controle_especial} />
          <AcoesDaReceita
            itemsCount={items.length}
            isMedicoConfigurado={isDoctorConfigured}
            onNavigateToPrint={onNavigateToPrint}
            onNavigateToEditor={onNavigateToEditor}
            onSendWhatsApp={onSendWhatsApp}
            onCopyText={onCopyText}
            copiedSuccess={copiedSuccess}
            onAbrirPerfilMedico={onAbrirPerfilMedico}
          />
        </div>
      )}
    </section>
  );
};
