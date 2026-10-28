import React from 'react';
import { UnifiedMedication } from '../../data/medicationDatabase';
import { classificarReceita, type RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';
import { descreverNotificacao, type NotificacaoDeReceita } from '../../utils/notificacaoDeReceita';
import { FrequenciaHorario, UnidadeDose } from '../../utils/prescricaoRapida';
import { Icon } from '../Icon';

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
  onOpenPediatricDrawer: () => void;
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
  onOpenPediatricDrawer,
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
    <section className="cq-card card-surface surface-card-minimal rounded-2xl p-3.5 sm:p-4 space-y-2.5 border border-subtle dark:border-strong">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="medication" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
          <h2 className="text-sm font-semibold text-[var(--text-main)]">
            Prescrição
          </h2>
        </div>
        <button
          type="button"
          onClick={onOpenPediatricDrawer}
          className="chip-neutral min-h-[44px] sm:min-h-0 sm:h-8 text-xs px-3 rounded-xl inline-flex items-center gap-1.5 transition active:translate-y-px cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
          title="Abrir Calculadora Pediátrica em painel lateral sem sair da receita"
        >
          <Icon name="calculate" size={15} className="text-emerald-600 dark:text-emerald-400" />
          <span>Calcular dose pelo peso</span>
        </button>
      </div>

      {/* Banner de Edição Direta Ativa */}
      {editingItemId && (
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10 flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)] shadow-tactile-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="edit" size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="font-semibold truncate">
              Modo de edição: <strong className="text-[var(--text-main)]">{selectedMedName || 'Medicamento'}</strong>. Altere os campos e salve a alteração.
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/12 bg-white dark:bg-[#334155] hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 font-bold text-xs shrink-0 cursor-pointer shadow-tactile-sm"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Linha 1: Fármaco e Quantidade a Dispensar Lado a Lado (Enxuto) */}
      <div>
        <div className="grid grid-cols-12 gap-2 items-end">
          {/* Coluna Esquerda: Fármaco (7 cols no mobile, 8 cols no desktop) */}
          <div className="col-span-7 sm:col-span-8 flex flex-col justify-end min-w-0">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="med-search-input" className="block text-xs font-medium text-[var(--text-muted)] truncate">
                Fármaco ou princípio ativo *
              </label>
              {selectedMedName.trim() && selectedRegime !== 'simples' && (
                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hidden sm:inline shrink-0">
                  {regimeLabels[selectedRegime].rotulo} • 2 vias automático
                </span>
              )}
            </div>
            <div className="relative">
              <Icon name="search" size={15} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                placeholder="Ex.: Dipirona 500 mg, Amoxicilina 500 mg, Losartana 50 mg..."
                className="w-full h-9 pl-8 pr-12 bg-[var(--surface-inset)] border border-subtle dark:border-strong rounded-xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition placeholder:text-[var(--text-placeholder)] placeholder:font-normal shadow-tactile-sm"
              />
              {selectedMedName ? (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <Icon name="check" size={15} className="text-emerald-500 pointer-events-none" />
                  <button
                    type="button"
                    onClick={onClearMedication}
                    aria-label="Limpar medicamento"
                    title="Limpar medicamento"
                    className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer p-1 rounded-lg hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <Icon name="close" size={15} />
                  </button>
                </div>
              ) : (
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[var(--text-muted)] bg-[var(--surface-card)] px-1.5 py-0.5 rounded border border-subtle dark:border-strong hidden sm:block pointer-events-none">
                  Ctrl+K
                </kbd>
              )}

              {/* Suggestions Dropdown (Instant, Keyboard-Navigable) */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div
                  id="med-search-listbox"
                  role="listbox"
                  className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl tactile-dropdown z-30 divide-y divide-slate-100 dark:divide-white/5"
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
                        className={`p-2.5 cursor-pointer flex items-center justify-between gap-2 transition ${
                          isHighlighted
                            ? 'bg-sky-50 dark:bg-[var(--surface-hover)]'
                            : 'hover:bg-sky-50/60 dark:hover:bg-[var(--surface-hover)]/60'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                              {med.name}
                            </p>
                            {medRegime !== 'simples' && (
                              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#27354A] text-amber-700 dark:text-amber-300 border border-slate-300 dark:border-white/10 shrink-0">
                                {regimeLabels[medRegime].rotulo}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                            {med.defaultPosology}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-[var(--surface-inset)] text-sky-600 dark:text-sky-400 shrink-0">
                          {med.route}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Quantidade a dispensar (5 cols no mobile, 4 cols no desktop) */}
          <div className="col-span-5 sm:col-span-4">
            <label htmlFor="presc-quantity-input" className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate">
              Quantidade a dispensar *
            </label>
            <input
              id="presc-quantity-input"
              type="text"
              value={selectedQuantity}
              onChange={(e) => onChangeQuantity(e.target.value)}
              placeholder="Ex.: 15 comp, 1 frasco"
              className="w-full h-9 px-2.5 rounded-xl bg-[var(--surface-inset)] border border-subtle dark:border-strong text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-[var(--text-main)] shadow-tactile-sm clinical-tabular-nums"
            />
          </div>
        </div>

        {notificacaoDoFormulario && (
          <p role="status" className="mt-2 text-xs font-medium text-[var(--text-secondary)] bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5">
            Exige {descreverNotificacao(notificacaoDoFormulario)}. O PresCMed não emite a notificação, e a folha impressa aqui não a substitui.
          </p>
        )}
      </div>

      {/* Linha 2: Grade Compacta Lado a Lado de Dose, Apresentação, Frequência, Duração e Via */}
      <div className="posology-cq-grid grid grid-cols-12 sm:grid-cols-[minmax(44px,0.5fr)_minmax(108px,1.35fr)_minmax(82px,0.95fr)_minmax(86px,0.95fr)_minmax(96px,1.1fr)] gap-1.5 sm:gap-2">
        {/* 1. Dose */}
        <div className="col-span-3 sm:col-span-1">
          <label htmlFor="presc-dose-input" className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate">
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
            className="w-full h-9 px-1 rounded-xl bg-[var(--surface-inset)] border border-subtle dark:border-strong text-xs font-medium text-[var(--text-main)] text-center outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm clinical-tabular-nums"
          />
        </div>

        {/* 2. Apresentação */}
        <div className="col-span-5 sm:col-span-1">
          <label htmlFor="presc-unit-select" className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate">
            Apresentação
          </label>
          <select
            id="presc-unit-select"
            value={doseUnit}
            onChange={(e) => {
              const val = e.target.value as UnidadeDose;
              onAtualizarConstrutor(doseAmount, val, doseFrequency, doseDays, isContinuousDose);
            }}
            className="w-full h-9 px-1.5 rounded-xl bg-[var(--surface-inset)] border border-subtle dark:border-strong text-xs font-medium text-[var(--text-main)] outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm cursor-pointer"
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
        </div>

        {/* 3. Frequência / Horário */}
        <div className="col-span-4 sm:col-span-1">
          <label htmlFor="presc-frequency-select" className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate">
            Frequência
          </label>
          <select
            id="presc-frequency-select"
            value={doseFrequency}
            onChange={(e) => {
              const val = e.target.value as FrequenciaHorario;
              onAtualizarConstrutor(doseAmount, doseUnit, val, doseDays, isContinuousDose);
            }}
            className="w-full h-9 px-1.5 rounded-xl bg-[var(--surface-inset)] border border-subtle dark:border-strong text-xs font-medium text-[var(--text-main)] outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm cursor-pointer"
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
        </div>

        {/* 4. Duração em dias */}
        <div className="col-span-4 sm:col-span-1">
          <label htmlFor="presc-duration-input" className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate">
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
            className="w-full h-9 px-1.5 rounded-xl bg-[var(--surface-inset)] border border-subtle dark:border-strong text-xs font-medium text-[var(--text-main)] text-center outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm clinical-tabular-nums"
          />
        </div>

        {/* 5. Via de administração */}
        <div className="col-span-8 sm:col-span-1">
          <label htmlFor="presc-route-select" className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate">
            Via
          </label>
          <select
            id="presc-route-select"
            value={selectedRoute}
            onChange={(e) => {
              const novaVia = e.target.value;
              onChangeRoute(novaVia);
              onAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, doseDays, isContinuousDose, novaVia);
            }}
            className="w-full h-9 px-1.5 rounded-xl bg-[var(--surface-inset)] border border-subtle dark:border-strong text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-[var(--text-main)] shadow-tactile-sm cursor-pointer"
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
        </div>
      </div>

      {/* Linha 3: Posologia Compacta + Ação Primária Lado a Lado no Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
        <div className={`flex flex-col justify-end min-w-0 ${editingItemId ? 'sm:col-span-7' : 'sm:col-span-8'}`}>
          <label htmlFor="presc-posology-textarea" className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate">
            Posologia e orientações ao paciente
          </label>
          <textarea
            id="presc-posology-textarea"
            rows={1}
            value={selectedPosology}
            onChange={(e) => onChangePosology(e.target.value)}
            placeholder="Ex.: Tomar 1 comprimido VO de 8/8h por 5 dias"
            className="block w-full h-11 min-h-[44px] py-3 px-3 rounded-xl bg-[var(--surface-inset)] border border-subtle dark:border-strong text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-[var(--text-main)] shadow-tactile-sm resize-none leading-tight overflow-hidden"
          />
        </div>

        <div className={`flex items-center gap-1.5 ${editingItemId ? 'sm:col-span-5' : 'sm:col-span-4'}`}>
          <button
            type="button"
            onClick={onSubmitMedication}
            className={`flex-1 h-11 min-h-[44px] px-3 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition active:translate-y-px cursor-pointer shadow-tactile-btn focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap ${
              editingItemId
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'btn-tactile-primary button-primary'
            }`}
            title={editingItemId ? 'Salvar alterações feitas neste medicamento' : 'Inserir este medicamento na receita'}
          >
            {editingItemId ? (
              <>
                <Icon name="check" size={16} />
                <span>Salvar alterações</span>
              </>
            ) : (
              <>
                <Icon name="add" size={16} />
                <span>Inserir na receita</span>
              </>
            )}
          </button>
          {editingItemId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="h-11 min-h-[44px] px-3 rounded-xl border border-medium dark:border-strong bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] font-semibold text-xs cursor-pointer shadow-tactile-sm transition shrink-0"
              title="Cancelar edição e voltar ao modo de inserção"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
