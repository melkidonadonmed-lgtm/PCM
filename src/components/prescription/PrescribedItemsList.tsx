import React from 'react';
import { PrescriptionItem } from '../../types';
import { classificarReceita, type RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';
import { descreverNotificacao, notificacaoExigida } from '../../utils/notificacaoDeReceita';
import { Icon } from '../Icon';
import { ActionButton } from '../ui/ActionButton';
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
 * Prescribed Medications and Sanitary Segregation Island (prescription/ layer).
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
      className="card-surface surface-card-minimal rounded-[16px] p-3.5 sm:p-4 space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap xl:flex-nowrap">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="prescriptions" size={18} className="text-[var(--ink-clinical)] shrink-0" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)] whitespace-nowrap">
            Medicamentos prescritos
          </h3>
          <span
            className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-[6px] bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border border-[var(--hairline)] text-xs font-semibold tabular-nums clinical-tabular-nums shrink-0"
            aria-label={`${items.length} ${items.length === 1 ? 'medicamento prescrito' : 'medicamentos prescritos'}`}
          >
            {items.length}
          </span>
          {itensEmDuasVias > 0 && regimesComItens.length === 1 && (
            <Badge tone="warning" tabular>
              {itensEmDuasVias}× 2 vias
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <ActionButton
            variant="secondary"
            size="sm"
            iconName="folder_open"
            iconClassName="text-[var(--ink-muted)]"
            onClick={onOpenModelsModal}
            className="whitespace-nowrap px-2.5"
            title="Abrir biblioteca de modelos de receitas salvos"
          >
            <span className="inline-flex items-center gap-1.5">
              <span>Modelos</span>
              {savedModelsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-[6px] bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border border-[var(--hairline)] text-[11px] font-semibold tabular-nums clinical-tabular-nums">
                  {savedModelsCount}
                </span>
              )}
            </span>
          </ActionButton>

          {items.length > 0 ? (
            <ActionButton
              variant="secondary"
              size="sm"
              iconName="bookmark_add"
              iconClassName="text-[var(--ink-muted)]"
              onClick={onOpenSaveModelModal}
              className="whitespace-nowrap px-2.5"
              title="Salvar esta combinação de medicamentos como um modelo reutilizável"
            >
              Salvar
            </ActionButton>
          ) : (
            <ActionButton
              variant="secondary"
              size="sm"
              iconName="add"
              iconClassName="text-[var(--ink-muted)]"
              onClick={onOpenCreateCustomModel}
              className="whitespace-nowrap px-2.5"
              title="Criar e salvar um novo modelo de receita reutilizável mesmo sem receita ativa na consulta"
            >
              Novo modelo
            </ActionButton>
          )}

          {items.length > 0 && onClearPrescription && (
            <ActionButton
              variant="danger"
              size="sm"
              iconName="delete"
              onClick={onClearPrescription}
              className="whitespace-nowrap px-2.5"
              title="Limpar todos os medicamentos prescritos"
            >
              Limpar
            </ActionButton>
          )}
        </div>
      </div>

      {/* Sanitary Segregation Notice when multiple regimes exist */}
      {regimesComItens.length > 1 && (
        <div
          role="alert"
          className="px-3 py-2.5 rounded-[10px] bg-[var(--surface-card-lit)] border border-[var(--hairline)] border-l-[3px] border-l-[var(--accent-amber)] text-[var(--ink-secondary)] text-xs flex items-center gap-2.5"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)] shrink-0" aria-hidden="true" />
          <p className="flex-1 min-w-0 leading-relaxed font-medium">
            <strong className="font-semibold text-[var(--ink-primary)]">Esta consulta gera {regimesComItens.length} receitas separadas: </strong>
            {regimesComItens
              .map((regime) => `${regimeLabels[regime].rotulo.toLowerCase()} (${porRegime[regime].length})`)
              .join(', ')}
            . Cada uma é emitida em sua própria folha.
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="pt-4 pb-2.5 px-2 border-t border-[var(--hairline)] flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs text-[var(--ink-muted)] leading-relaxed">
          <Icon name="medication" size={16} className="text-[var(--ink-muted)] shrink-0 opacity-75" />
          <span>
            Nenhum medicamento prescrito ainda. Busque um fármaco acima ou escolha um modelo salvo.
          </span>
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
                className={`p-3 rounded-[10px] border flex items-start justify-between gap-3 transition-colors duration-150 ${
                  isEditing
                    ? 'bg-[var(--surface-card-lit)] border-[var(--border-control)] border-l-[3px] border-l-[var(--ink-clinical)] ring-1 ring-[var(--accent-focus)]/30'
                    : 'bg-[var(--surface-card-lit)] border-[var(--hairline)]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`w-5 h-5 rounded-[6px] text-white text-xs font-semibold flex items-center justify-center shrink-0 tabular-nums clinical-tabular-nums ${
                        isEditing ? 'bg-[var(--clinical)]' : 'bg-[var(--primary)]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="text-[13px] font-semibold text-[var(--ink-primary)] truncate">
                      {it.name}
                    </h4>
                    <Badge tone="neutral" tabular>
                      {it.route} • {it.quantity}
                    </Badge>
                    {isEditing && (
                      <Badge tone="info" tabular={false}>
                        <Icon name="edit" size={12} />
                        <span>Em edição</span>
                      </Badge>
                    )}
                    {regimeDoItem !== 'simples' && (
                      <Badge tone="warning" tabular={false}>
                        <span>{regimeLabels[regimeDoItem].rotulo} • 2 vias</span>
                      </Badge>
                    )}
                    {notificacaoDoItem && (
                      <Badge
                        tone="danger"
                        tabular={false}
                        title={`Exige ${descreverNotificacao(notificacaoDoItem)}`}
                      >
                        <span>
                          {notificacaoDoItem.ressalva ? 'Verificar' : 'Exige'} {notificacaoDoItem.rotuloCurto}
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--ink-secondary)] pl-7 leading-relaxed font-medium">
                    {it.instructions}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartEdit(it)}
                    className={`touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-[10px] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none cursor-pointer ${
                      isEditing
                        ? 'bg-[var(--clinical)] text-white'
                        : 'hover:bg-[var(--surface-hover)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                    }`}
                    title="Editar este medicamento diretamente"
                    aria-label={`Editar ${it.name}`}
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-[10px] hover:bg-[var(--surface-hover)] disabled:opacity-35 disabled:cursor-not-allowed text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none transition-colors duration-150 cursor-pointer"
                    title="Mover para cima"
                    aria-label={`Mover ${it.name} para cima`}
                  >
                    <Icon name="expand_less" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-[10px] hover:bg-[var(--surface-hover)] disabled:opacity-35 disabled:cursor-not-allowed text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none transition-colors duration-150 cursor-pointer"
                    title="Mover para baixo"
                    aria-label={`Mover ${it.name} para baixo`}
                  >
                    <Icon name="expand_more" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(it.id)}
                    className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-[10px] hover:bg-[var(--surface-hover)] text-[var(--ink-muted)] hover:text-[var(--status-danger)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] outline-none cursor-pointer"
                    title="Remover medicamento"
                    aria-label={`Remover ${it.name}`}
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="block xl:hidden pt-3 border-t border-[var(--hairline)] space-y-3">
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
