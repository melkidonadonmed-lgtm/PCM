import React, { useState, useMemo } from 'react';
import { 
  HeartPulse, 
  Droplet, 
  Scale, 
  Clock,
  Stethoscope,
  Pill,
  Plus,
  Check,
  ArrowRight,
  Info,
  AlertTriangle,
  Baby
} from 'lucide-react';
import { CLINICAL_PROTOCOLS, PEDIATRIC_MEDICATIONS } from '../data/pediatricMeds';
import { PATHOLOGY_PROTOCOLS } from '../data/clinicalProtocols';
import { Patient, PrescriptionItem, ProtocolMedication, PathologyProtocol } from '../types';
import { calculatePediatricDose } from '../utils/doseCalculator';
import { UNIFIED_MEDICATIONS, UnifiedMedication, CATEGORY_LABELS } from '../data/medicationDatabase';
import { Icon } from './Icon';

interface ClinicalProtocolsViewProps {
  darkMode: boolean;
  patient: Patient;
  onUpdatePatientWeight: (weight: number) => void;
  onAddPrescriptionItem: (item: PrescriptionItem) => void;
  onNavigateToPrescription: () => void;
  onUsarMedicamento?: (med: UnifiedMedication) => void;
}

// Badges de categoria com contraste WCAG 2.2 AA (texto 800 sobre 50 no claro; texto 200/300 sobre 950 no escuro)
const CATEGORY_BADGE_CLASSES: { [category: string]: string } = {
  'Infectológica': 'text-blue-800 bg-blue-50 border-blue-200 dark:text-blue-200 dark:bg-blue-950/60 dark:border-blue-800/60',
  'Cardiovascular': 'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-200 dark:bg-rose-950/60 dark:border-rose-800/60',
  'Endocrinológica': 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/60',
  'Gastrointestinal': 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-200 dark:bg-amber-950/60 dark:border-amber-800/60',
  'Ginecológica': 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/60'
};

export const ClinicalProtocolsView: React.FC<ClinicalProtocolsViewProps> = ({
  darkMode,
  patient,
  onAddPrescriptionItem,
  onNavigateToPrescription,
  onUsarMedicamento
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedMedCategory, setSelectedMedCategory] = useState<string>('all');
  const [addedProtocolsMap, setAddedProtocolsMap] = useState<{ [id: string]: boolean }>({});

  const patientWeight = patient?.weightKg ?? 0;

  const categories = useMemo(() => {
    const list = Array.from(new Set(PATHOLOGY_PROTOCOLS.map(p => p.category)));
    return ['Todas', ...list];
  }, []);

  const filteredProtocols = useMemo(() => {
    return selectedCategory === 'Todas'
      ? PATHOLOGY_PROTOCOLS
      : PATHOLOGY_PROTOCOLS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const filteredUnifiedMeds = useMemo(() => {
    if (selectedMedCategory === 'all') {
      return UNIFIED_MEDICATIONS;
    }
    return UNIFIED_MEDICATIONS.filter(med => med.category === selectedMedCategory);
  }, [selectedMedCategory]);

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
    const item = buildPrescriptionItem(protocolMed, protocol);
    onAddPrescriptionItem(item);

    const key = `${protocol.id}-med-${index}`;
    setAddedProtocolsMap(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedProtocolsMap(prev => ({ ...prev, [key]: false }));
    }, 1800);
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

    medsToAdd.forEach(protocolMed => {
      onAddPrescriptionItem(buildPrescriptionItem(protocolMed, protocol));
    });

    setAddedProtocolsMap(prev => ({ ...prev, [protocol.id]: true }));
    setTimeout(() => {
      setAddedProtocolsMap(prev => ({ ...prev, [protocol.id]: false }));
    }, 1800);
  };

  return (
    <div id="clinical-protocols-section" className="space-y-4 sm:space-y-5">
      {/* Top Banner */}
      <div 
        className="tactile-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{
              backgroundColor: darkMode ? '#155E75' : '#0E7490',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <Stethoscope className="w-5 h-5 text-slate-100" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
              Decks de Protocolos por Patologia
            </h2>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Tratamentos de 1ª linha acionáveis, com dose pediátrica calculada para <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{patientWeight > 0 ? `${patientWeight} kg` : 'peso não informado'}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border tactile-flat"
            style={{
              backgroundColor: 'var(--surface-inset)',
              borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
            }}
          >
            <Scale className="w-4 h-4 text-emerald-700 dark:text-emerald-400" strokeWidth={1.75} />
            <span className="text-xs font-semibold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
              Peso: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{patientWeight > 0 ? `${patientWeight} kg` : '—'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToPrescription}
            className="tactile-btn-primary px-4 py-2 min-h-[44px] flex items-center justify-center gap-2 text-xs font-bold cursor-pointer whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <span>Ir para Receita</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Aviso YMYL */}
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-start gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
        <span>
          Os protocolos abaixo são <span className="font-bold">referências de apoio</span> baseadas em protocolos do Ministério da Saúde e diretrizes das sociedades de especialidade. A avaliação do paciente, a adaptação de doses e a <span className="font-bold">conduta final são de responsabilidade exclusiva do médico assistente</span>.
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar fade-scroll-x">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3.5 py-2 min-h-[44px] rounded-xl whitespace-nowrap transition cursor-pointer border active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                isSelected
                  ? 'bg-navy-900 text-white dark:bg-blue-600 dark:text-white border-navy-800 dark:border-blue-400/30 shadow-tactile-navy dark:shadow-tactile-blue'
                  : darkMode
                  ? 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Pathology Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProtocols.map((protocol) => {
          const isAdded = addedProtocolsMap[protocol.id];

          return (
            <div
              key={protocol.id}
              className="tactile-card-interactive p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-3.5"
              style={{
                backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
              }}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span 
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      CATEGORY_BADGE_CLASSES[protocol.category] || 'text-blue-800 bg-blue-50 border-blue-200 dark:text-blue-200 dark:bg-blue-950/60 dark:border-blue-800/60'
                    }`}
                  >
                    {protocol.category}
                  </span>
                  {protocol.pediatricRelevant && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50 flex items-center gap-1">
                      <Baby className="w-3 h-3" strokeWidth={1.75} /> Pediátrico
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold tracking-tight" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                  {protocol.name}
                </h3>
                <p className="text-xs font-medium mt-1 leading-relaxed text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-muted)] dark:text-slate-300">1ª linha: </span>
                  {protocol.firstLineSummary}
                </p>
              </div>

              {/* Medications List with Individual Add Actions */}
              <div 
                className="rounded-xl border divide-y tactile-flat"
                style={{
                  backgroundColor: 'var(--surface-inset)',
                  borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                }}
              >
                {protocol.medications.map((med, idx) => {
                  const isMedAdded = addedProtocolsMap[`${protocol.id}-med-${idx}`];
                  const isPed = !!med.pediatricMedId;
                  const isAdult = !isPed && (med.presentation.toLowerCase().includes('comprimido') || med.posology.toLowerCase().includes('adulto'));

                  return (
                    <div key={`${protocol.id}-med-${idx}`} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <Pill className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                              {med.name}
                            </span>
                            {isPed && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
                                {patientWeight > 0 ? `Dose p/ ${patientWeight} kg` : 'Pediátrico'}
                              </span>
                            )}
                            {isAdult && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50">
                                Adulto
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
                            {med.presentation}
                          </div>
                          <div className="text-[11px] font-medium mt-0.5 leading-relaxed text-[var(--text-muted)]">
                            {med.posology}
                          </div>
                        </div>
                      </div>

                      {/* Individual Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddSingleMedication(med, protocol, idx)}
                        className={`px-3 py-2 min-h-[38px] rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isMedAdded 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'tactile-btn-secondary hover:border-sky-500'
                        }`}
                        title={`Adicionar apenas ${med.name} à receita`}
                      >
                        {isMedAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                            <span>Adicionado!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-sky-500" strokeWidth={2} />
                            <span>Adicionar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Clinical Warning */}
              {protocol.clinicalWarning && (
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span>{protocol.clinicalWarning}</span>
                </div>
              )}

              {/* Footer: reference + actions */}
              <div className="border-t pt-3 space-y-2.5" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
                <span className="block text-[10px] italic text-[var(--text-muted)] dark:text-slate-300">
                  Referência: {protocol.reference}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddProtocol(protocol)}
                    className={`flex-1 px-3 py-2 min-h-[44px] rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      isAdded ? 'bg-emerald-700 text-white' : 'tactile-btn-primary'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={1.75} />
                        <span>Adicionado</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" strokeWidth={1.75} />
                        <span>Adicionar à prescrição</span>
                      </>
                    )}
                  </button>
                  {isAdded && (
                    <button
                      type="button"
                      onClick={onNavigateToPrescription}
                      className="tactile-btn-secondary px-3 py-2 min-h-[44px] rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <span>Ver receita</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção Medicamentos por classe (SUS/RENAME) */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{
              backgroundColor: darkMode ? '#1E3A8A' : '#1D4ED8',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <Icon name="medication" className="w-4 h-4 text-slate-100" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Medicamentos por classe (SUS/RENAME)
            </h3>
            <p className="text-xs font-medium text-[var(--text-muted)] dark:text-slate-300">
              Catálogo de fármacos de referência da Atenção Primária e Ambulatorial.
            </p>
          </div>
        </div>

        {/* Pills de Categoria */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar fade-scroll-x">
          {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
            const isSelected = selectedMedCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMedCategory(catKey)}
                className={`text-xs font-bold px-3.5 py-2 min-h-[44px] rounded-xl whitespace-nowrap transition cursor-pointer border active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-navy-900 text-white dark:bg-blue-600 dark:text-white border-navy-800 dark:border-blue-400/30 shadow-tactile-navy dark:shadow-tactile-blue'
                    : darkMode
                    ? 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>

        {/* Lista dos UNIFIED_MEDICATIONS da categoria escolhida */}
        <div 
          className="rounded-2xl border divide-y tactile-flat overflow-hidden"
          style={{
            backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
          }}
        >
          {filteredUnifiedMeds.map((med) => (
            <div
              key={med.id}
              className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Pill className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {med.name}
                    </span>
                    {med.isSpecialControl && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                        Controle Especial
                      </span>
                    )}
                    {med.isPediatric && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                        Pediátrico
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
                    {med.defaultQuantity} • {med.route}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onUsarMedicamento?.(med)}
                className="tactile-btn-primary px-3.5 py-2 min-h-[40px] rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                title={`Usar ${med.name} na receita`}
              >
                <span>Usar na receita</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency Protocols Section */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-3">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{
              backgroundColor: darkMode ? '#881337' : '#BE123C',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <HeartPulse className="w-4 h-4 text-slate-100" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Urgência & Expansão Volêmica
            </h3>
            <p className="text-xs font-medium text-[var(--text-muted)] dark:text-slate-300">
              Dengue (Grupos A, C e D), Choque Séptico e Hipoglicemia — cálculo para <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{patientWeight > 0 ? `${patientWeight} kg` : 'peso não informado'}</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CLINICAL_PROTOCOLS.map((protocol) => {
            const hasWeight = patientWeight > 0;
            const calc = hasWeight ? protocol.calculateVolume(patientWeight) : null;

            const isEmergency = protocol.id.includes('dengue-grupo-d') || 
                                protocol.id.includes('choque') || 
                                protocol.id.includes('hipoglicemia');

            return (
              <div
                key={protocol.id}
                className="tactile-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-3.5 relative overflow-hidden"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
                  borderColor: isEmergency 
                    ? (darkMode ? 'rgba(244, 63, 94, 0.3)' : 'rgba(190, 18, 60, 0.25)')
                    : (darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)')
                }}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      isEmergency 
                        ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800/40' 
                        : 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800/40'
                    }`}>
                      {isEmergency ? 'Emergência Crítica' : 'Protocolo Clínico'}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-muted)] dark:text-slate-300">
                      Regra: {protocol.ruleFormula}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {protocol.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                    {protocol.condition}
                  </p>
                </div>

                {/* Volume / Dose Result Highlight */}
                {calc ? (
                  <div 
                    className="p-3.5 rounded-xl border space-y-1 text-center tactile-flat"
                    style={{
                      backgroundColor: 'var(--surface-inset)',
                      borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                    }}
                  >
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] dark:text-slate-300 tracking-wider block">
                      Volume Calculado ({patientWeight} kg):
                    </span>
                    <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {calc.volumeText}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: darkMode ? '#CBD5E1' : '#475569' }}>
                      {calc.detail}
                    </div>
                    {calc.rate && (
                      <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                        Taxa: {calc.rate}
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    className="p-3.5 rounded-xl border space-y-1 text-center tactile-flat"
                    style={{
                      backgroundColor: 'var(--surface-inset)',
                      borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                    }}
                  >
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] dark:text-slate-300 tracking-wider block">
                      Volume Calculado:
                    </span>
                    <div className="text-xs font-medium py-1.5 text-[var(--text-muted)] dark:text-slate-300">
                      Informe o peso do paciente para calcular os volumes.
                    </div>
                  </div>
                )}

                {/* Details & Clinical Notes */}
                <div className="text-xs space-y-2 border-t pt-3" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
                  <div className="flex items-start gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <span className="font-bold text-[var(--text-muted)] dark:text-slate-300">Via / Diluição: </span>
                      <span style={{ color: darkMode ? '#CBD5E1' : '#334155' }}>{protocol.routeDilution}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div>
                      <span className="font-bold text-[var(--text-muted)] dark:text-slate-300">Tempo / Frequência: </span>
                      <span style={{ color: darkMode ? '#CBD5E1' : '#334155' }}>{protocol.frequencyTime}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                    <span className="font-bold">Atenção Médica: </span>
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
