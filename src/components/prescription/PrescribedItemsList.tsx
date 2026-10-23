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
      className="card-surface surface-card-minimal rounded-2xl p-4 sm:p-5 border border-subtle dark:border-strong space-y-3"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="prescriptions" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
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
            className="chip-neutral h-9 text-xs inline-flex items-center gap-1.5 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5"
            title="Abrir biblioteca de modelos de receitas salvos"
          >
            <Icon name="folder_open" size={15} className="text-sky-600 dark:text-sky-400" />
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
              className="chip-neutral h-9 text-xs inline-flex items-center gap-1.5 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5"
              title="Salvar esta combinação de medicamentos como um modelo reutilizável"
            >
              <Icon name="bookmark_add" size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Salvar modelo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCreateCustomModel}
              className="chip-neutral h-9 text-xs inline-flex items-center gap-1.5 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5"
              title="Criar e salvar um novo modelo de receita reutilizável mesmo sem receita ativa na consulta"
            >
              <Icon name="add" size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Novo modelo</span>
            </button>
          )}

          {items.length > 0 && onClearPrescription && (
            <button
              type="button"
              onClick={onClearPrescription}
              className="h-9 text-xs font-medium text-rose-500 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-rose-500 px-2.5 transition"
            >
              <Icon name="delete" size={15} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Aviso de segregação sanitária quando há múltiplos regimes */}
      {regimesComItens.length > 1 && (
        <div
          role="alert"
          className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs flex items-center gap-2.5"
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
                    ? 'bg-slate-100 dark:bg-[#27354A] border-slate-300 dark:border-white/15 ring-1 ring-sky-500/40'
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
                    className={`p-1.5 rounded-lg transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
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
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                    title="Mover para cima"
                    aria-label={`Mover ${it.name} para cima`}
                  >
                    <Icon name="expand_less" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                    title="Mover para baixo"
                    aria-label={`Mover ${it.name} para baixo`}
                  >
                    <Icon name="expand_more" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(it.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[var(--text-muted)] dark:text-slate-400 hover:text-rose-500 transition focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
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
