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
      data-state={items.length === 0 ? 'empty' : 'idle'}
      aria-busy={false}
      aria-label="Medicamentos prescritos na consulta"
      className="card-surface surface-card-minimal rounded-2xl p-3.5 sm:p-4 border border-subtle dark:border-strong space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="prescriptions" size={18} className="text-[var(--ink-clinical)] shrink-0" />
          <h3 className="text-sm font-semibold text-[var(--text-main)]">
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
            className="touch-target chip-neutral min-h-[44px] min-w-[44px] py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 px-3"
            title="Abrir biblioteca de modelos de receitas salvos"
          >
            <Icon name="folder_open" size={15} className="text-[var(--text-muted)]" />
            <span>Modelos</span>
            {savedModelsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold clinical-tabular-nums">
                {savedModelsCount}
              </span>
            )}
          </button>

          {items.length > 0 ? (
            <button
              type="button"
              onClick={onOpenSaveModelModal}
              className="touch-target chip-neutral min-h-[44px] min-w-[44px] py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 px-3"
              title="Salvar esta combinação de medicamentos como um modelo reutilizável"
            >
              <Icon name="bookmark_add" size={15} className="text-[var(--text-muted)]" />
              <span>Salvar modelo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCreateCustomModel}
              className="touch-target chip-neutral min-h-[44px] min-w-[44px] py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 px-3"
              title="Criar e salvar um novo modelo de receita reutilizável mesmo sem receita ativa na consulta"
            >
              <Icon name="add" size={15} className="text-[var(--text-muted)]" />
              <span>Novo modelo</span>
            </button>
          )}

          {items.length > 0 && onClearPrescription && (
            <button
              type="button"
              onClick={onClearPrescription}
              className="touch-target chip-neutral min-h-[44px] min-w-[44px] py-2 text-xs font-semibold text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-400/35 bg-rose-50/90 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-950/70 hover:text-rose-900 dark:hover:text-rose-100 inline-flex items-center gap-1.5 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-rose-500 px-3 transition"
              title="Limpar todos os medicamentos prescritos"
            >
              <Icon name="delete" size={15} className="text-rose-800 dark:text-rose-200" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Aviso de segregação sanitária quando há múltiplos regimes */}
      {regimesComItens.length > 1 && (
        <div
          role="alert"
          className="px-3 py-2.5 rounded-xl bg-[var(--surface-chip-muted)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs flex items-center gap-2.5"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
          <p className="flex-1 min-w-0 leading-relaxed font-medium">
            <strong className="font-semibold">Esta consulta gera {regimesComItens.length} receitas separadas: </strong>
            {regimesComItens
              .map((regime) => `${regimeLabels[regime].rotulo.toLowerCase()} (${porRegime[regime].length})`)
              .join(', ')}
            . Cada uma é emitida em sua própria folha.
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-5 text-center rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs leading-relaxed">
          Nenhum medicamento prescrito ainda. Busque um fármaco acima ou escolha uma prescrição pronta em Modelos.
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
                    ? 'bg-[var(--surface-clinical-subtle)] border-[var(--border-clinical-subtle)] ring-1 ring-teal-600/30 dark:ring-teal-400/30'
                    : 'bg-[var(--surface-inset)] border border-subtle dark:border-strong'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 clinical-tabular-nums ${
                        isEditing ? 'bg-[var(--clinical)]' : 'bg-navy-800 dark:bg-navy-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--text-main)] truncate">
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
                  <p className="text-xs text-[var(--text-secondary)] pl-7 leading-relaxed font-medium">
                    {it.instructions}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartEdit(it)}
                    className={`touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg transition focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 cursor-pointer ${
                      isEditing
                        ? 'bg-[var(--clinical)] text-white shadow-tactile-sm'
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
                    className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 cursor-pointer"
                    title="Mover para cima"
                    aria-label={`Mover ${it.name} para cima`}
                  >
                    <Icon name="expand_less" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 cursor-pointer"
                    title="Mover para baixo"
                    aria-label={`Mover ${it.name} para baixo`}
                  >
                    <Icon name="expand_more" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(it.id)}
                    className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[var(--text-muted)] dark:text-slate-400 hover:text-rose-500 transition focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                    title="Remover medicamento"
                    aria-label={`Remover ${it.name}`}
                  >
                    <Icon name="delete" className="text-[16px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
    </section>
  );
};
