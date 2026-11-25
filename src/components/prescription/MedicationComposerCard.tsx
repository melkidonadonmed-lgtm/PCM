import React from 'react';
import { UnifiedMedication } from '../../data/medicationDatabase';
import { classificarReceita, type RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';
import { descreverNotificacao, type NotificacaoDeReceita } from '../../utils/notificacaoDeReceita';
import { FrequenciaHorario, UnidadeDose } from '../../utils/prescricaoRapida';
import { Icon } from '../Icon';
import { ActionButton } from '../ui/ActionButton';

interface MedicationComposerCardProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  editingItemId: string | null;
  selectedMedName: string;
  selectedRoute: string;
  selectedQuantity: string;
  selectedPosology: string;
  selectedRegime: RegimeReceita;
  doseAmount: number;
  doseUnit: UnidadeDose;
  doseFrequency: FrequenciaHorario;
  doseDays: number;
  isContinuousDose: boolean;
  showSuggestions: boolean;
  highlightedSuggestionIndex: number;
  searchSuggestions: UnifiedMedication[];
  notificacaoDoFormulario: NotificacaoDeReceita | null;
  regimeLabels: Record<RegimeReceita, { rotulo: string; detalhe: string; tituloTexto: string }>;
  onOpenPediatricDrawer?: () => void;
  onCancelEdit: () => void;
  onMedNameChange: (value: string) => void;
  onFocusSearch: () => void;
  onBlurSearch: () => void;
  onMedInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClearMedication: () => void;
  onSelectMedication: (med: UnifiedMedication) => void;
  onHighlightSuggestion: (index: number) => void;
  onAtualizarConstrutor: (
    novoDose: number,
    novoUnit: UnidadeDose,
    novoFreq: FrequenciaHorario,
    novoDays: number,
    novoContinuo: boolean,
    viaAtual?: string
  ) => void;
  onChangeRoute: (route: string) => void;
  onChangeQuantity: (quantity: string) => void;
  onChangePosology: (posology: string) => void;
  onSubmitMedication: () => void;
}

export const MedicationComposerCard: React.FC<MedicationComposerCardProps> = ({
  searchInputRef,
  editingItemId,
  selectedMedName,
  selectedRoute,
  selectedQuantity,
  selectedPosology,
  selectedRegime,
  doseAmount,
  doseUnit,
  doseFrequency,
  doseDays,
  isContinuousDose,
  showSuggestions,
  highlightedSuggestionIndex,
  searchSuggestions,
  notificacaoDoFormulario,
  regimeLabels,
  onCancelEdit,
  onMedNameChange,
  onFocusSearch,
  onBlurSearch,
  onMedInputKeyDown,
  onClearMedication,
  onSelectMedication,
  onHighlightSuggestion,
  onAtualizarConstrutor,
  onChangeRoute,
  onChangeQuantity,
  onChangePosology,
  onSubmitMedication,
}) => {
  return (
    <section className="cq-card card-surface surface-card-minimal rounded-[16px] p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="medication" size={18} className="text-[var(--ink-clinical)] shrink-0" />
          <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
            Prescrição
          </h2>
        </div>
      </div>

      {/* Direct Edit Mode Banner */}
      {editingItemId && (
        <div className="px-3 py-2 rounded-[10px] bg-[var(--surface-card-lit)] border border-[var(--hairline)] border-l-[3px] border-l-[var(--ink-clinical)] flex items-center justify-between gap-3 text-xs text-[var(--ink-secondary)] animate-tab-fade">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="edit" size={16} className="text-[var(--ink-clinical)] shrink-0" />
            <span className="font-medium truncate">
              Modo de edição: <strong className="font-semibold text-[var(--ink-primary)]">{selectedMedName || 'Medicamento'}</strong>. Altere os campos e salve a alteração.
            </span>
          </div>
          <ActionButton
            variant="secondary"
            size="sm"
            onClick={onCancelEdit}
            className="shrink-0 whitespace-nowrap"
          >
            Cancelar
          </ActionButton>
        </div>
      )}

      {/* Row 1: Medication Search and Dispensed Quantity */}
      <div>
        <div className="grid grid-cols-12 gap-2 items-end">
          {/* Left Column: Medication (7 cols mobile, 8 cols desktop) */}
          <div className="col-span-7 sm:col-span-8 flex flex-col justify-end min-w-0">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="med-search-input" className="block text-xs font-medium text-[var(--ink-muted)] truncate">
                Fármaco ou princípio ativo *
              </label>
              {selectedMedName.trim() && selectedRegime !== 'simples' && (
                <span className="text-[11px] font-semibold text-[var(--ink-clinical)] hidden sm:inline shrink-0">
                  {regimeLabels[selectedRegime].rotulo} • 2 vias automático
                </span>
              )}
            </div>
            <div className="relative">
              <Icon name="search" size={16} className="text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="med-search-input"
                type="text"
                role="combobox"
                aria-expanded={showSuggestions && searchSuggestions.length > 0}
                aria-autocomplete="list"
                aria-controls="med-search-listbox"
                aria-activedescendant={
                  showSuggestions && highlightedSuggestionIndex >= 0 && searchSuggestions[highlightedSuggestionIndex]
                    ? `med-suggestion-${highlightedSuggestionIndex}`
                    : undefined
                }
                value={selectedMedName}
                onChange={(e) => onMedNameChange(e.target.value)}
                onFocus={onFocusSearch}
                onBlur={onBlurSearch}
                onKeyDown={onMedInputKeyDown}
                placeholder="Ex.: Dipirona, Amoxicilina, Losartana..."
                className="tactile-input w-full h-11 min-h-[44px] pl-9 pr-12 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] placeholder:text-[var(--text-placeholder)] placeholder:font-normal"
              />
              {selectedMedName ? (
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <Icon name="check" size={15} className="text-[var(--ink-clinical)] pointer-events-none" />
                  <button
                    type="button"
                    onClick={onClearMedication}
                    aria-label="Limpar medicamento"
                    title="Limpar medicamento"
                    className="touch-target text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-[10px] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none transition-colors duration-150"
                  >
                    <Icon name="close" size={15} />
                  </button>
                </div>
              ) : null}

              {/* Suggestions Dropdown (Instant, Keyboard-Navigable) */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div
                  id="med-search-listbox"
                  role="listbox"
                  className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-[10px] tactile-dropdown z-30 divide-y divide-[var(--hairline)]"
                >
                  {searchSuggestions.map((med, idx) => {
                    const isHighlighted = idx === highlightedSuggestionIndex;
                    const medRegime = classificarReceita(med);
                    return (
                      <div
                        key={med.id}
                        id={`med-suggestion-${idx}`}
                        role="option"
                        aria-selected={isHighlighted}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onSelectMedication(med);
                        }}
                        onMouseEnter={() => onHighlightSuggestion(idx)}
                        className={`p-2.5 cursor-pointer flex items-center justify-between gap-2 transition-colors duration-150 ${
                          isHighlighted
                            ? 'bg-[var(--surface-card-lit)] border-l-[3px] border-l-[var(--ink-clinical)]'
                            : 'hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-[var(--ink-primary)] truncate">
                              {med.name}
                            </p>
                            {medRegime !== 'simples' && (
                              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-[6px] bg-[var(--surface-chip-muted)] text-[var(--accent-amber)] border border-[var(--hairline)] shrink-0">
                                {regimeLabels[medRegime].rotulo}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--ink-muted)] truncate mt-0.5">
                            {med.defaultPosology}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-[6px] font-medium bg-[var(--surface-chip-muted)] text-[var(--ink-clinical)] shrink-0">
                          {med.route}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quantity to Dispense (5 cols mobile, 4 cols desktop) */}
          <div className="col-span-5 sm:col-span-4">
            <label htmlFor="presc-quantity-input" className="block text-xs font-medium text-[var(--ink-muted)] mb-1 truncate">
              Quantidade a dispensar *
            </label>
            <input
              id="presc-quantity-input"
              type="text"
              value={selectedQuantity}
              onChange={(e) => onChangeQuantity(e.target.value)}
              placeholder="Ex.: 15 comp, 1 frasco"
              className="tactile-input w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] tabular-nums clinical-tabular-nums"
            />
          </div>
        </div>

        {notificacaoDoFormulario && (
          <p role="status" className="mt-2 text-xs font-medium text-[var(--ink-secondary)] bg-[var(--surface-card-lit)] border border-[var(--hairline)] border-l-[3px] border-l-[var(--accent-amber)] rounded-[10px] px-3 py-2">
            Exige {descreverNotificacao(notificacaoDoFormulario)}. O PresCMed não emite a notificação, e a folha impressa aqui não a substitui.
          </p>
        )}
      </div>

      {/* Row 2: Compact Side-by-Side Posology Grid */}
      <div className="posology-cq-grid grid grid-cols-12 sm:grid-cols-[minmax(44px,0.5fr)_minmax(108px,1.35fr)_minmax(82px,0.95fr)_minmax(86px,0.95fr)_minmax(96px,1.1fr)] gap-1.5 sm:gap-2">
        {/* 1. Dose */}
        <div className="col-span-3 sm:col-span-1">
          <label htmlFor="presc-dose-input" className="block text-xs font-medium text-[var(--ink-muted)] mb-1 truncate">
            Dose
          </label>
          <input
            id="presc-dose-input"
            type="number"
            step="0.5"
            min="0.5"
            value={doseAmount}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 1;
              onAtualizarConstrutor(val, doseUnit, doseFrequency, doseDays, isContinuousDose);
            }}
            className="tactile-input w-full h-11 min-h-[44px] px-1.5 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] tabular-nums clinical-tabular-nums"
          />
        </div>

        {/* 2. Presentation */}
        <div className="col-span-5 sm:col-span-1">
          <label htmlFor="presc-unit-select" className="block text-xs font-medium text-[var(--ink-muted)] mb-1 truncate">
            Apresentação
          </label>
          <div className="relative">
            <select
              id="presc-unit-select"
              value={doseUnit}
              onChange={(e) => {
                const val = e.target.value as UnidadeDose;
                onAtualizarConstrutor(doseAmount, val, doseFrequency, doseDays, isContinuousDose);
              }}
              className="tactile-input pcm-select appearance-none w-full h-11 min-h-[44px] pl-2.5 pr-7 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] cursor-pointer"
            >
              <option value="comprimido">Comprimido</option>
              <option value="cápsula">Cápsula</option>
              <option value="gota">Gotas</option>
              <option value="mL">mL</option>
              <option value="sachê">Sachê</option>
              <option value="jato">Jatos</option>
              <option value="ampola">Ampola</option>
              <option value="aplicação">Aplicação</option>
            </select>
            <Icon name="expand_more" size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
          </div>
        </div>

        {/* 3. Frequency */}
        <div className="col-span-4 sm:col-span-1">
          <label htmlFor="presc-frequency-select" className="block text-xs font-medium text-[var(--ink-muted)] mb-1 truncate">
            Frequência
          </label>
          <div className="relative">
            <select
              id="presc-frequency-select"
              value={doseFrequency}
              onChange={(e) => {
                const val = e.target.value as FrequenciaHorario;
                onAtualizarConstrutor(doseAmount, doseUnit, val, doseDays, isContinuousDose);
              }}
              className="tactile-input pcm-select appearance-none w-full h-11 min-h-[44px] pl-2.5 pr-7 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] cursor-pointer"
            >
              <option value="8/8h">8/8h</option>
              <option value="12/12h">12/12h</option>
              <option value="6/6h">6/6h</option>
              <option value="4/4h">4/4h</option>
              <option value="24h">24h</option>
              <option value="1x/dia">1x ao dia</option>
              <option value="2x/dia">2x ao dia</option>
              <option value="3x/dia">3x ao dia</option>
              <option value="4x/dia">4x ao dia</option>
              <option value="manha">Pela manhã</option>
              <option value="noite">À noite</option>
              <option value="DU">Dose única</option>
              <option value="SOS">Se necessário</option>
            </select>
            <Icon name="expand_more" size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
          </div>
        </div>

        {/* 4. Duration (days) */}
        <div className="col-span-4 sm:col-span-1">
          <label htmlFor="presc-duration-input" className="block text-xs font-medium text-[var(--ink-muted)] mb-1 truncate">
            Duração (dias)
          </label>
          <input
            id="presc-duration-input"
            type="number"
            min="0"
            max="365"
            value={isContinuousDose ? '' : (doseDays || '')}
            placeholder="Ex.: 7"
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (!raw || parseInt(raw, 10) <= 0) {
                onAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, 0, true);
              } else {
                const dias = parseInt(raw, 10);
                onAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, dias, false);
              }
            }}
            className="tactile-input w-full h-11 min-h-[44px] px-2 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] tabular-nums clinical-tabular-nums"
          />
        </div>

        {/* 5. Administration Route */}
        <div className="col-span-8 sm:col-span-1">
          <label htmlFor="presc-route-select" className="block text-xs font-medium text-[var(--ink-muted)] mb-1 truncate">
            Via
          </label>
          <div className="relative">
            <select
              id="presc-route-select"
              value={selectedRoute}
              onChange={(e) => {
                const novaVia = e.target.value;
                onChangeRoute(novaVia);
                onAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, doseDays, isContinuousDose, novaVia);
              }}
              className="tactile-input pcm-select appearance-none w-full h-11 min-h-[44px] pl-2.5 pr-7 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] cursor-pointer"
            >
              <option value="Uso Oral">Uso Oral</option>
              <option value="Uso Tópico">Uso Tópico</option>
              <option value="Uso Inalatória">Uso Inalatória</option>
              <option value="Uso Nasal">Uso Nasal</option>
              <option value="Uso Oftálmico">Uso Oftálmico</option>
              <option value="Uso Otológico">Uso Otológico</option>
              <option value="Uso Retal">Uso Retal</option>
              <option value="Uso Sublingual">Uso Sublingual</option>
              <option value="Uso Intramuscular">Uso Intramuscular</option>
              <option value="Uso Intravenoso">Uso Intravenoso</option>
              <option value="Uso Subcutâneo">Uso Subcutâneo</option>
            </select>
            <Icon name="expand_more" size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
          </div>
        </div>
      </div>

      {/* Row 3: Posology Textarea + Clinical Submit CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
        <div className={`flex flex-col justify-end min-w-0 ${editingItemId ? 'sm:col-span-7' : 'sm:col-span-8'}`}>
          <label htmlFor="presc-posology-textarea" className="block text-xs font-medium text-[var(--ink-muted)] mb-1 truncate">
            Posologia e orientações ao paciente
          </label>
          <textarea
            id="presc-posology-textarea"
            rows={1}
            value={selectedPosology}
            onChange={(e) => onChangePosology(e.target.value)}
            placeholder="Ex.: Tomar 1 comprimido VO de 8/8h por 5 dias"
            className="tactile-input block w-full h-11 min-h-[44px] py-3 px-3 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] resize-none leading-tight overflow-hidden"
          />
        </div>

        <div className={`flex items-center gap-2 ${editingItemId ? 'sm:col-span-5' : 'sm:col-span-4'}`}>
          <ActionButton
            variant="primary"
            iconName={editingItemId ? 'check' : 'add'}
            onClick={onSubmitMedication}
            className="flex-1 whitespace-nowrap"
            title={editingItemId ? 'Salvar alterações feitas neste medicamento' : 'Inserir este medicamento na receita'}
          >
            {editingItemId ? 'Salvar alterações' : 'Inserir na receita'}
          </ActionButton>
          {editingItemId && (
            <ActionButton
              variant="secondary"
              onClick={onCancelEdit}
              className="shrink-0 whitespace-nowrap"
              title="Cancelar edição e voltar ao modo de inserção"
            >
              Cancelar
            </ActionButton>
          )}
        </div>
      </div>
    </section>
  );
};
