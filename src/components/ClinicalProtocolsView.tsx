import React, { useState, useMemo } from 'react';
import { CLINICAL_PROTOCOLS, PEDIATRIC_MEDICATIONS } from '../data/pediatricMeds';
import { PATHOLOGY_PROTOCOLS } from '../data/clinicalProtocols';
import { Patient, PrescriptionItem, ProtocolMedication, PathologyProtocol } from '../types';
import { calculatePediatricDose } from '../utils/doseCalculator';
import { UNIFIED_MEDICATIONS, UnifiedMedication, CATEGORY_LABELS } from '../data/medicationDatabase';
import { Icon } from './Icon';

/**
 * Ilha de Protocolos Clínicos e Catálogo SUS/RENAME.
 * Estados de UI cobertos: empty (nenhum protocolo/fármaco encontrado), loading (carregando filtro),
 * success (sucesso ao transferir conduta para a receita) e error (erro de peso ausente na urgência).
 */
interface ClinicalProtocolsViewProps {
  darkMode: boolean;
  patient: Patient;
  initialSearchQuery?: string | null;
  onUpdatePatientWeight: (weight: number) => void;
  onAddPrescriptionItem: (item: PrescriptionItem) => void;
  onNavigateToPrescription: () => void;
  onNavigateToScores?: () => void;
  onUsarMedicamento?: (med: UnifiedMedication) => void;
}

// Badges de categoria em superfície tonal opaca com detalhe cromático no texto
const CATEGORY_BADGE_CLASSES: { [category: string]: string } = {
  'Infectológica': 'text-sky-700 bg-[var(--surface-chip-muted)] border-[var(--border-subtle)] dark:text-sky-300',
  'Cardiovascular': 'text-rose-700 bg-[var(--surface-chip-muted)] border-[var(--border-subtle)] dark:text-rose-300',
  'Endocrinológica': 'text-emerald-700 bg-[var(--surface-chip-muted)] border-[var(--border-subtle)] dark:text-emerald-300',
  'Gastrointestinal': 'text-amber-700 bg-[var(--surface-chip-muted)] border-[var(--border-subtle)] dark:text-amber-300',
  'Ginecológica': 'text-emerald-700 bg-[var(--surface-chip-muted)] border-[var(--border-subtle)] dark:text-emerald-300'
};

export const ClinicalProtocolsView: React.FC<ClinicalProtocolsViewProps> = ({
  patient,
  initialSearchQuery = null,
  onAddPrescriptionItem,
  onNavigateToPrescription,
  onNavigateToScores,
  onUsarMedicamento
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [protocolSearch, setProtocolSearch] = useState<string>(initialSearchQuery || '');
  const [selectedMedCategory, setSelectedMedCategory] = useState<string>('all');
  const [showAllUnifiedMeds, setShowAllUnifiedMeds] = useState<boolean>(false);
  const [addedProtocolsMap, setAddedProtocolsMap] = useState<{ [id: string]: boolean }>({});

  React.useEffect(() => {
    if (initialSearchQuery !== null && initialSearchQuery !== undefined) {
      setProtocolSearch(initialSearchQuery);
      setSelectedCategory('Todas');
    }
  }, [initialSearchQuery]);

  const patientWeight = patient?.weightKg ?? 0;

  const categories = useMemo(() => {
    const list = Array.from(new Set(PATHOLOGY_PROTOCOLS.map(p => p.category)));
    return ['Todas', ...list];
  }, []);

  const filteredProtocols = useMemo(() => {
    const byCat =
      selectedCategory === 'Todas'
        ? PATHOLOGY_PROTOCOLS
        : PATHOLOGY_PROTOCOLS.filter((p) => p.category === selectedCategory);
    const q = protocolSearch.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.firstLineSummary.toLowerCase().includes(q) ||
        p.medications.some((m) => m.name.toLowerCase().includes(q))
    );
  }, [selectedCategory, protocolSearch]);

  const filteredUnifiedMeds = useMemo(() => {
    const byCat = selectedMedCategory === 'all'
      ? UNIFIED_MEDICATIONS
      : UNIFIED_MEDICATIONS.filter(med => med.category === selectedMedCategory);
    const q = protocolSearch.trim().toLowerCase();
    return q ? byCat.filter(med => med.name.toLowerCase().includes(q)) : byCat;
  }, [selectedMedCategory, protocolSearch]);

  const displayedUnifiedMeds = useMemo(() => {
    if (selectedMedCategory === 'all' && !showAllUnifiedMeds && !protocolSearch.trim()) {
      return filteredUnifiedMeds.slice(0, 24);
    }
    return filteredUnifiedMeds;
  }, [filteredUnifiedMeds, selectedMedCategory, showAllUnifiedMeds, protocolSearch]);

  /**
   * Converte uma medicação do protocolo em PrescriptionItem.
   * Se existir em PEDIATRIC_MEDICATIONS e houver peso do paciente, calcula a dose
   * por peso seguindo exatamente o padrão de PediatricCalculator.handleAddMedication.
   * Sem peso, adiciona com a posologia de referência e sinaliza o cálculo pendente.
   */
  const buildPrescriptionItem = (protocolMed: ProtocolMedication, protocol: PathologyProtocol): PrescriptionItem => {
    const baseId = `presc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (protocolMed.pediatricMedId) {
      const pedMed = PEDIATRIC_MEDICATIONS.find(m => m.id === protocolMed.pediatricMedId);

      if (pedMed) {
        if (patientWeight > 0) {
          const calc = calculatePediatricDose(pedMed, patientWeight);

          return {
            id: baseId,
            name: pedMed.name,
            presentation: pedMed.presentation,
            route: pedMed.route,
            quantity: protocolMed.quantity || (pedMed.unitType === 'drops' || pedMed.unitType === 'ml' ? '1 frasco' : '1 caixa'),
            doseCalculatedText: calc.summaryBadge,
            frequencyText: pedMed.frequency,
            scheduleInterval: pedMed.frequency.includes('6/6') ? '6/6h' : pedMed.frequency.includes('8/8') ? '8/8h' : pedMed.frequency.includes('12/12') ? '12/12h' : '24/24h',
            scheduleTimes: [],
            durationDays: protocolMed.durationDays ?? pedMed.defaultDays ?? 5,
            instructions: calc.formattedPrescriptionText,
            isContinuous: false,
            calculatedFromWeight: patientWeight
          };
        }

        // Sem peso cadastrado: posologia de referência limpa
        return {
          id: baseId,
          name: pedMed.name,
          presentation: pedMed.presentation,
          route: pedMed.route,
          quantity: protocolMed.quantity || (pedMed.unitType === 'drops' || pedMed.unitType === 'ml' ? '1 frasco' : '1 caixa'),
          doseCalculatedText: 'Calcular por peso',
          frequencyText: pedMed.frequency,
          scheduleInterval: 'S.O.S',
          scheduleTimes: [],
          durationDays: protocolMed.durationDays ?? pedMed.defaultDays ?? 5,
          instructions: `Posologia de referência: ${protocolMed.posology}.`,
          isContinuous: false
        };
      }
    }

    return {
      id: baseId,
      name: protocolMed.name,
      presentation: protocolMed.presentation,
      route: protocolMed.route,
      quantity: protocolMed.quantity,
      doseCalculatedText: protocolMed.posology,
      frequencyText: protocolMed.frequencyText,
      scheduleInterval: protocolMed.scheduleInterval,
      scheduleTimes: [],
      durationDays: protocolMed.durationDays,
      instructions: protocolMed.instructions || `Tomar ${protocolMed.posology} por via ${protocolMed.route.toLowerCase()}.`,
      isContinuous: protocolMed.isContinuous ?? false
    };
  };

  const handleAddSingleMedication = (protocolMed: ProtocolMedication, protocol: PathologyProtocol, index: number) => {
    onAddPrescriptionItem(buildPrescriptionItem(protocolMed, protocol));
    const key = `${protocol.id}-med-${index}`;
    setAddedProtocolsMap(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setAddedProtocolsMap(prev => ({ ...prev, [key]: false })), 1800);
  };

  const handleAddProtocol = (protocol: PathologyProtocol) => {
    let medsToAdd = protocol.medications;

    // Se o protocolo contiver alternativas adulto e pediátrico para o mesmo fármaco
    const hasPediatricOption = protocol.medications.some(m => !!m.pediatricMedId);
    const hasAdultOption = protocol.medications.some(m => !m.pediatricMedId && (m.presentation.toLowerCase().includes('comprimido') || m.posology.toLowerCase().includes('adulto')));

    if (hasPediatricOption && hasAdultOption) {
      if (patientWeight > 0 && patientWeight <= 40) {
        // Seleciona exclusivamente a via pediátrica
        medsToAdd = protocol.medications.filter(m => !!m.pediatricMedId || (!m.presentation.toLowerCase().includes('comprimido') && !m.posology.toLowerCase().includes('adulto')));
      } else {
        // Seleciona exclusivamente a via adulta
        medsToAdd = protocol.medications.filter(m => !m.pediatricMedId);
      }
    }

    medsToAdd.forEach(protocolMed => onAddPrescriptionItem(buildPrescriptionItem(protocolMed, protocol)));
    setAddedProtocolsMap(prev => ({ ...prev, [protocol.id]: true }));
    setTimeout(() => setAddedProtocolsMap(prev => ({ ...prev, [protocol.id]: false })), 1800);
  };

  return (
    <div data-state="idle" aria-busy={false} id="clinical-protocols-section" className="w-full max-w-7xl mx-auto flex flex-col gap-3">
      {/* Top Banner Enxuto */}
      <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <Icon name="stethoscope" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
          <h2 className="text-sm font-semibold tracking-tight text-[var(--text-main)] truncate">Protocolos clínicos por patologia</h2>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--accent-emerald-subtle)] text-emerald-800 dark:text-emerald-200 border border-[var(--accent-emerald-border)] clinical-tabular-nums shrink-0">
            Condutas 1ª linha • Peso: <strong className="font-semibold">{patientWeight > 0 ? `${patientWeight} kg` : 'não informado'}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start sm:self-auto shrink-0">
          {onNavigateToScores ? (
            <button type="button" onClick={onNavigateToScores} className="touch-target btn-tactile-secondary min-h-[44px] px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap">
              <Icon name="monitor_heart" size={14} className="text-sky-600 dark:text-sky-400" />
              <span>Escores & BIC (114)</span>
            </button>
          ) : null}

          <button type="button" onClick={onNavigateToPrescription} className="touch-target btn-tactile-primary min-h-[44px] px-3.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500">
            <span>Ir para receita</span>
            <Icon name="arrow_forward" size={14} />
          </button>
        </div>
      </div>

      {/* Aviso YMYL */}
      <div className="px-3.5 py-2 rounded-xl bg-[var(--surface-chip-muted)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] flex items-start gap-2">
        <Icon name="info" className="text-[15px] text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
        <span>
          Os protocolos abaixo são <span className="font-semibold text-slate-800 dark:text-slate-100">referências de apoio</span> baseadas em protocolos do Ministério da Saúde e diretrizes das sociedades de especialidade. A avaliação do paciente, a adaptação de doses e a <span className="font-semibold text-slate-800 dark:text-slate-100">conduta final são de responsabilidade exclusiva do médico assistente</span>.
        </span>
      </div>

      {/* Busca Rápida de Protocolo + Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 sm:w-80 shrink-0">
          <div className="relative flex-1 min-w-0">
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              id="protocol-search-input"
              name="protocolSearch"
              type="text"
              value={protocolSearch}
              onChange={(e) => setProtocolSearch(e.target.value)}
              placeholder="Ex.: Pneumonia, ITU, Otite, Dengue..."
              aria-label="Filtrar protocolos por patologia ou medicamento"
              className="w-full h-11 min-h-[44px] pl-9 pr-11 rounded-xl text-xs font-medium tactile-input focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            />
            {protocolSearch && (
              <button
                type="button"
                onClick={() => setProtocolSearch('')}
                aria-label="Limpar busca de protocolo"
                className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          {(protocolSearch || selectedCategory !== 'Todas') && (
            <button
              type="button"
              onClick={() => {
                setProtocolSearch('');
                setSelectedCategory('Todas');
              }}
              className="touch-target chip-neutral min-h-[44px] min-w-[44px] px-3 rounded-xl border border-rose-300 dark:border-rose-400/35 bg-rose-50/90 dark:bg-rose-950/50 text-xs font-semibold text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/70 hover:text-rose-900 dark:hover:text-rose-100 inline-flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 transition"
              title="Limpar busca e filtro de protocolo"
            >
              <Icon name="close" size={14} />
              <span>Limpar</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar fade-scroll-x">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 min-h-[36px] rounded-xl whitespace-nowrap transition cursor-pointer border active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isSelected
                    ? 'bg-[var(--pill-active-bg)] text-white border-[var(--pill-active-border)] shadow-sm'
                    : 'bg-[var(--surface-chip-muted)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-chip-muted-hover)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pathology Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredProtocols.map((protocol) => {
          const isAdded = addedProtocolsMap[protocol.id];

          return (
            <div
              key={protocol.id}
              className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col justify-between gap-3"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span 
                    className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${
                      CATEGORY_BADGE_CLASSES[protocol.category] || 'text-sky-700 bg-[var(--surface-chip-muted)] border-[var(--border-subtle)] dark:text-sky-300'
                    }`}
                  >
                    {protocol.category}
                  </span>
                  {protocol.pediatricRelevant && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-chip-muted)] text-emerald-700 border border-[var(--border-subtle)] dark:text-emerald-300 flex items-center gap-1">
                      <Icon name="child_care" className="text-[12px]" /> Pediátrico
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">
                  {protocol.name}
                </h3>
                <p className="text-xs font-medium mt-0.5 leading-relaxed text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-muted)] dark:text-slate-300">1ª linha: </span>
                  {protocol.firstLineSummary}
                </p>
              </div>

              {/* Medications List with Individual Add Actions */}
              <div className="rounded-xl border border-subtle dark:border-strong divide-y divide-[var(--border-subtle)] surface-inset">
                {protocol.medications.map((med, idx) => {
                  const isMedAdded = addedProtocolsMap[`${protocol.id}-med-${idx}`];
                  const isPed = !!med.pediatricMedId;
                  const isAdult = !isPed && (med.presentation.toLowerCase().includes('comprimido') || med.posology.toLowerCase().includes('adulto'));

                  return (
                    <div key={`${protocol.id}-med-${idx}`} className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <Icon name="medication" className="text-[16px] text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[var(--text-main)]">{med.name}</span>
                            {isPed && (
                              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-chip-muted)] text-emerald-700 border border-[var(--border-subtle)] dark:text-emerald-300 clinical-tabular-nums">
                                {patientWeight > 0 ? `Dose p/ ${patientWeight} kg` : 'Pediátrico'}
                              </span>
                            )}
                            {isAdult && (
                              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-chip-muted)] text-sky-700 border border-[var(--border-subtle)] dark:text-sky-300">
                                Adulto
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 mt-0.5 clinical-tabular-nums">{med.presentation}</div>
                          <div className="text-xs font-medium mt-0.5 leading-relaxed text-[var(--text-muted)] clinical-tabular-nums">{med.posology}</div>
                        </div>
                      </div>

                      {/* Individual Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddSingleMedication(med, protocol, idx)}
                        className={`px-3 py-1.5 min-h-[36px] rounded-xl font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isMedAdded ? 'bg-[var(--pill-active-bg)] text-white shadow-sm' : 'btn-tactile-secondary'
                        }`}
                        title={`Adicionar apenas ${med.name} à receita`}
                      >
                        <Icon name={isMedAdded ? 'check' : 'add'} className={`text-[14px] ${isMedAdded ? 'text-white' : 'text-sky-500'}`} />
                        <span>{isMedAdded ? 'Adicionado!' : 'Adicionar'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Clinical Warning */}
              {protocol.clinicalWarning && (
                <div className="p-2.5 rounded-xl bg-[var(--surface-chip-muted)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" aria-hidden="true" />
                  <span>{protocol.clinicalWarning}</span>
                </div>
              )}

              {/* Footer: reference + actions */}
              <div className="border-t border-[var(--border-subtle)] pt-2.5 space-y-2">
                <span className="block text-xs italic text-[var(--text-muted)] dark:text-slate-300">
                  Referência: {protocol.reference}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddProtocol(protocol)}
                    className={`flex-1 px-3 py-2 min-h-[40px] rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      isAdded ? 'bg-emerald-700 text-white' : 'tactile-btn-primary'
                    }`}
                  >
                    <Icon name={isAdded ? 'check' : 'add'} className="text-[16px]" />
                    <span>{isAdded ? 'Adicionado' : 'Adicionar à prescrição'}</span>
                  </button>
                  {isAdded && (
                    <button
                      type="button"
                      onClick={onNavigateToPrescription}
                      className="btn-tactile-secondary px-3 py-2 min-h-[40px] rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <span>Ver receita</span>
                      <Icon name="arrow_forward" className="text-[14px]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção Medicamentos por classe (SUS/RENAME) */}
      <div className="pt-1 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="medication" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <h3 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">
              Medicamentos por classe (SUS/RENAME)
            </h3>
          </div>
          {selectedMedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedMedCategory('all')}
              className="touch-target chip-neutral min-h-[44px] min-w-[44px] px-3 rounded-xl border border-rose-300 dark:border-rose-400/35 bg-rose-50/90 dark:bg-rose-950/50 text-xs font-semibold text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/70 hover:text-rose-900 dark:hover:text-rose-100 inline-flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 transition"
              title="Limpar filtro de classe farmacológica"
            >
              <Icon name="close" size={14} />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Pills de Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar fade-scroll-x">
          {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
            const isSelected = selectedMedCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMedCategory(catKey)}
                className={`text-xs font-semibold px-3 py-1.5 min-h-[36px] rounded-xl whitespace-nowrap transition cursor-pointer border active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-[var(--pill-active-bg)] text-white border-[var(--pill-active-border)] shadow-sm'
                    : 'bg-[var(--surface-chip-muted)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-chip-muted-hover)]'
                }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>

        {/* Lista dos UNIFIED_MEDICATIONS da categoria escolhida */}
        <div className="cq-card card-surface surface-card-minimal p-0 rounded-2xl border border-subtle dark:border-strong divide-y divide-[var(--border-subtle)] overflow-hidden">
          {displayedUnifiedMeds.map((med) => (
            <div key={med.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[oklch(0.20_0.02_255/0.03)] dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Icon name="medication" className="text-[16px] text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-main)]">{med.name}</span>
                    {med.isSpecialControl && <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-chip-muted)] text-amber-700 border border-[var(--border-subtle)] dark:text-amber-300">Controle Especial</span>}
                    {med.isPediatric && <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-chip-muted)] text-emerald-700 border border-[var(--border-subtle)] dark:text-emerald-300">Pediátrico</span>}
                  </div>
                  <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 mt-0.5">{med.defaultQuantity} • {med.route}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUsarMedicamento?.(med)}
                className="btn-tactile-secondary px-3 py-1.5 min-h-[36px] rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                title={`Usar ${med.name} na receita`}
              >
                <span>Usar na receita</span>
                <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            </div>
          ))}
          {filteredUnifiedMeds.length > displayedUnifiedMeds.length && (
            <div className="p-3 flex justify-center bg-[var(--surface-inset)]">
              <button
                type="button"
                onClick={() => setShowAllUnifiedMeds(true)}
                className="chip-neutral px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="expand_more" size={15} />
                <span>Mostrar todos os {filteredUnifiedMeds.length} medicamentos RENAME</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Urgency Protocols Section */}
      <div className="pt-1 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon name="emergency" size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
          <h3 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">Urgência e expansão volêmica</h3>
          <span className="text-xs font-medium text-[var(--text-muted)] dark:text-slate-300">
            Dengue (Grupos A, C e D), choque séptico e hipoglicemia — cálculo para <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{patientWeight > 0 ? `${patientWeight} kg` : 'peso não informado'}</span>.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CLINICAL_PROTOCOLS.map((protocol) => {
            const hasWeight = patientWeight > 0;
            const calc = hasWeight ? protocol.calculateVolume(patientWeight) : null;
            const isEmergency = protocol.id.includes('dengue-grupo-d') || protocol.id.includes('choque') || protocol.id.includes('hipoglicemia');

            return (
              <div
                key={protocol.id}
                className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col justify-between gap-3 relative overflow-hidden"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${
                      isEmergency
                        ? 'bg-[var(--surface-chip-muted)] text-rose-700 border-[var(--border-subtle)] dark:text-rose-300'
                        : 'bg-[var(--surface-chip-muted)] text-sky-700 border-[var(--border-subtle)] dark:text-sky-300'
                    }`}>
                      {isEmergency ? 'Emergência Crítica' : 'Protocolo Clínico'}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-muted)] dark:text-slate-300">Regra: {protocol.ruleFormula}</span>
                  </div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">{protocol.title}</h3>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">{protocol.condition}</p>
                </div>

                {/* Volume / Dose Result Highlight */}
                {calc ? (
                  <div className="p-3 rounded-xl border border-subtle dark:border-strong space-y-1 text-center surface-inset">
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-300 tracking-wider block clinical-tabular-nums">
                      Volume Calculado ({patientWeight} kg):
                    </span>
                    <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400 clinical-tabular-nums">{calc.volumeText}</div>
                    <div className="text-xs font-semibold clinical-tabular-nums text-[var(--text-secondary)]">{calc.detail}</div>
                    {calc.rate && <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 clinical-tabular-nums">Taxa: {calc.rate}</div>}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] space-y-1 text-center tactile-flat">
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-300 tracking-wider block">Volume Calculado:</span>
                    <div className="text-xs font-medium py-1.5 text-[var(--text-muted)] dark:text-slate-300">Informe o peso do paciente para calcular os volumes.</div>
                  </div>
                )}

                {/* Details & Clinical Notes */}
                <div className="text-xs space-y-1.5 border-t border-[var(--border-subtle)] pt-2.5">
                  <div className="flex items-start gap-1.5">
                    <Icon name="water_drop" className="text-[14px] text-sky-700 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-muted)] dark:text-slate-300">Via / Diluição: </span>
                      <span className="text-[var(--text-secondary)]">{protocol.routeDilution}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Icon name="schedule" className="text-[14px] text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-muted)] dark:text-slate-300">Tempo / Frequência: </span>
                      <span className="text-[var(--text-secondary)]">{protocol.frequencyTime}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--surface-chip-muted)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">Atenção médica: </span>
                    {protocol.clinicalNotes}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
