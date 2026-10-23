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
  onUpdatePatientWeight: (weight: number) => void;
  onAddPrescriptionItem: (item: PrescriptionItem) => void;
  onNavigateToPrescription: () => void;
  onUsarMedicamento?: (med: UnifiedMedication) => void;
}

// Badges de categoria em superfície tonal opaca com detalhe cromático no texto
const CATEGORY_BADGE_CLASSES: { [category: string]: string } = {
  'Infectológica': 'text-sky-700 bg-slate-100 border-slate-300 dark:text-sky-300 dark:bg-[#27354A] dark:border-white/10',
  'Cardiovascular': 'text-rose-700 bg-slate-100 border-slate-300 dark:text-rose-300 dark:bg-[#27354A] dark:border-white/10',
  'Endocrinológica': 'text-emerald-700 bg-slate-100 border-slate-300 dark:text-emerald-300 dark:bg-[#27354A] dark:border-white/10',
  'Gastrointestinal': 'text-amber-700 bg-slate-100 border-slate-300 dark:text-amber-300 dark:bg-[#27354A] dark:border-white/10',
  'Ginecológica': 'text-emerald-700 bg-slate-100 border-slate-300 dark:text-emerald-300 dark:bg-[#27354A] dark:border-white/10'
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
    <div data-state="idle" aria-busy={false} id="clinical-protocols-section" className="space-y-4 sm:space-y-5">
      {/* Top Banner */}
      <div 
        className="tactile-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--surface-card)',
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
            <Icon name="stethoscope" className="text-[20px] text-slate-100" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
              Protocolos clínicos por patologia
            </h2>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Condutas de 1ª linha acionáveis • dose pediátrica calculada para <span className="text-emerald-700 dark:text-emerald-400 font-semibold clinical-tabular-nums">{patientWeight > 0 ? `${patientWeight} kg` : 'peso não informado'}</span>.
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
            <Icon name="calculate" className="text-[16px] text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-semibold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
              Peso: <span className="text-emerald-700 dark:text-emerald-400 font-bold clinical-tabular-nums">{patientWeight > 0 ? `${patientWeight} kg` : '—'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToPrescription}
            className="tactile-btn-primary px-4 py-2 min-h-[44px] flex items-center justify-center gap-2 text-xs font-bold cursor-pointer whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <span>Ir para receita</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </div>

      {/* Aviso YMYL */}
      <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
        <Icon name="info" className="text-[15px] text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
        <span>
          Os protocolos abaixo são <span className="font-semibold text-slate-800 dark:text-slate-100">referências de apoio</span> baseadas em protocolos do Ministério da Saúde e diretrizes das sociedades de especialidade. A avaliação do paciente, a adaptação de doses e a <span className="font-semibold text-slate-800 dark:text-slate-100">conduta final são de responsabilidade exclusiva do médico assistente</span>.
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
              className={`text-xs font-semibold px-3.5 py-2 min-h-[40px] rounded-xl whitespace-nowrap transition cursor-pointer border active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                isSelected
                  ? 'bg-navy-900 text-white dark:bg-[#0369A1] dark:text-white border-navy-900 dark:border-sky-500/30 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-[#27354A] dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#334155]'
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
              className="tactile-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-3.5"
              style={{
                backgroundColor: 'var(--surface-card)',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
              }}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span 
                    className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${
                      CATEGORY_BADGE_CLASSES[protocol.category] || 'text-sky-700 bg-slate-100 border-slate-300 dark:text-sky-300 dark:bg-[#27354A] dark:border-white/10'
                    }`}
                  >
                    {protocol.category}
                  </span>
                  {protocol.pediatricRelevant && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-emerald-700 border border-slate-300 dark:bg-[#27354A] dark:text-emerald-300 dark:border-white/10 flex items-center gap-1">
                      <Icon name="child_care" className="text-[12px]" /> Pediátrico
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-semibold tracking-tight" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
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
                        <Icon name="medication" className="text-[16px] text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                              {med.name}
                            </span>
                            {isPed && (
                              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-emerald-700 border border-slate-300 dark:bg-[#27354A] dark:text-emerald-300 dark:border-white/10 clinical-tabular-nums">
                                {patientWeight > 0 ? `Dose p/ ${patientWeight} kg` : 'Pediátrico'}
                              </span>
                            )}
                            {isAdult && (
                              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-sky-700 border border-slate-300 dark:bg-[#27354A] dark:text-sky-300 dark:border-white/10">
                                Adulto
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 mt-0.5 clinical-tabular-nums">
                            {med.presentation}
                          </div>
                          <div className="text-xs font-medium mt-0.5 leading-relaxed text-[var(--text-muted)] clinical-tabular-nums">
                            {med.posology}
                          </div>
                        </div>
                      </div>

                      {/* Individual Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddSingleMedication(med, protocol, idx)}
                        className={`px-3 py-2 min-h-[40px] rounded-xl font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isMedAdded 
                            ? 'bg-navy-900 dark:bg-[#0369A1] text-white shadow-sm' 
                            : 'btn-tactile-secondary'
                        }`}
                        title={`Adicionar apenas ${med.name} à receita`}
                      >
                        {isMedAdded ? (
                          <>
                            <Icon name="check" className="text-[14px] text-white" />
                            <span>Adicionado!</span>
                          </>
                        ) : (
                          <>
                            <Icon name="add" className="text-[14px] text-sky-500" />
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
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" aria-hidden="true" />
                  <span>{protocol.clinicalWarning}</span>
                </div>
              )}

              {/* Footer: reference + actions */}
              <div className="border-t pt-3 space-y-2.5" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
                <span className="block text-xs italic text-[var(--text-muted)] dark:text-slate-300">
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
                        <Icon name="check" className="text-[16px]" />
                        <span>Adicionado</span>
                      </>
                    ) : (
                      <>
                        <Icon name="add" className="text-[16px]" />
                        <span>Adicionar à prescrição</span>
                      </>
                    )}
                  </button>
                  {isAdded && (
                    <button
                      type="button"
                      onClick={onNavigateToPrescription}
                      className="btn-tactile-secondary px-3 py-2 min-h-[44px] rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
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
      <div className="pt-2 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{
              backgroundColor: darkMode ? '#1E3A8A' : '#0369A1',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <Icon name="medication" className="text-[18px] text-slate-100" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Medicamentos por classe (SUS/RENAME)
            </h3>
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
                className={`text-xs font-semibold px-3.5 py-2 min-h-[40px] rounded-xl whitespace-nowrap transition cursor-pointer border active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-navy-900 text-white dark:bg-[#0369A1] dark:text-white border-navy-900 dark:border-sky-500/30 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-[#27354A] dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#334155]'
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
            backgroundColor: 'var(--surface-card)',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
          }}
        >
          {filteredUnifiedMeds.map((med) => (
            <div
              key={med.id}
              className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Icon name="medication" className="text-[16px] text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {med.name}
                    </span>
                    {med.isSpecialControl && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-amber-700 border border-slate-300 dark:bg-[#27354A] dark:text-amber-300 dark:border-white/10">
                        Controle Especial
                      </span>
                    )}
                    {med.isPediatric && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-emerald-700 border border-slate-300 dark:bg-[#27354A] dark:text-emerald-300 dark:border-white/10">
                        Pediátrico
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
                    {med.defaultQuantity} • {med.route}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onUsarMedicamento?.(med)}
                className="btn-tactile-secondary px-3.5 py-2 min-h-[40px] rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                title={`Usar ${med.name} na receita`}
              >
                <span>Usar na receita</span>
                <Icon name="arrow_forward" className="text-[14px]" />
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
            <Icon name="emergency" className="text-[18px] text-slate-100" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Urgência e expansão volêmica
            </h3>
            <p className="text-xs font-medium text-[var(--text-muted)] dark:text-slate-300">
              Dengue (Grupos A, C e D), choque séptico e hipoglicemia — cálculo para <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{patientWeight > 0 ? `${patientWeight} kg` : 'peso não informado'}</span>.
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
                  backgroundColor: 'var(--surface-card)',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                }}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${
                      isEmergency 
                        ? 'bg-slate-100 text-rose-700 border-slate-300 dark:bg-[#27354A] dark:text-rose-300 dark:border-white/10' 
                        : 'bg-slate-100 text-sky-700 border-slate-300 dark:bg-[#27354A] dark:text-sky-300 dark:border-white/10'
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
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-300 tracking-wider block clinical-tabular-nums">
                      Volume Calculado ({patientWeight} kg):
                    </span>
                    <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400 clinical-tabular-nums">
                      {calc.volumeText}
                    </div>
                    <div className="text-xs font-semibold clinical-tabular-nums" style={{ color: darkMode ? '#CBD5E1' : '#475569' }}>
                      {calc.detail}
                    </div>
                    {calc.rate && (
                      <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 clinical-tabular-nums">
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
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-300 tracking-wider block">
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
                    <Icon name="water_drop" className="text-[14px] text-sky-700 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-muted)] dark:text-slate-300">Via / Diluição: </span>
                      <span style={{ color: darkMode ? '#CBD5E1' : '#334155' }}>{protocol.routeDilution}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Icon name="schedule" className="text-[14px] text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--text-muted)] dark:text-slate-300">Tempo / Frequência: </span>
                      <span style={{ color: darkMode ? '#CBD5E1' : '#334155' }}>{protocol.frequencyTime}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 dark:bg-[#27354A] dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300">
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
