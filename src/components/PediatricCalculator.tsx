import React, { useState, useMemo, useRef } from 'react';
import { PEDIATRIC_MEDICATIONS } from '../data/pediatricMeds';
import { PediatricMedication, PrescriptionItem, Patient } from '../types';
import { calculatePediatricDose } from '../utils/doseCalculator';
import { isSpecialControlOrAntibiotic } from '../utils/isSpecialControlOrAntibiotic';
import { Icon } from './Icon';

/**
 * Ilha e Gaveta da Calculadora Pediátrica ("Sem peso, sem dose").
 * Estados de UI cobertos: empty (peso vazio ou nenhum fármaco filtrado), loading (carregando cálculo),
 * success (dose calculada e inserida com sucesso) e error (alerta de teto/bloqueio sem peso).
 */
interface PediatricCalculatorProps {
  darkMode: boolean;
  patient: Patient;
  onUpdatePatientWeight: (weight: number) => void;
  onAddPrescriptionItem: (item: PrescriptionItem) => void;
  onNavigateToPrescription: () => void;
  isDrawer?: boolean;
  onClose?: () => void;
}

export const PediatricCalculator: React.FC<PediatricCalculatorProps> = ({
  darkMode,
  patient,
  onUpdatePatientWeight,
  onAddPrescriptionItem,
  onNavigateToPrescription,
  isDrawer = false,
  onClose
}) => {
  const weightInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [addedMedsMap, setAddedMedsMap] = useState<{ [id: string]: boolean }>({});

  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const patientName = patient?.name?.trim() || 'Não identificado';

  const categories = useMemo(() => {
    const list = Array.from(new Set(PEDIATRIC_MEDICATIONS.map(m => m.category)));
    return ['Todos', ...list];
  }, []);

  const weightPresets = [
    { label: 'RN (3.5 kg)', weight: 3.5 },
    { label: '6m (8 kg)', weight: 8 },
    { label: '1 ano (10 kg)', weight: 10 },
    { label: '2 anos (12 kg)', weight: 12 },
    { label: '3 anos (15 kg)', weight: 15 },
    { label: '5 anos (20 kg)', weight: 20 },
    { label: '8 anos (25 kg)', weight: 25 },
    { label: '10 anos (32 kg)', weight: 32 },
    { label: '12 anos (40 kg)', weight: 40 }
  ];

  const filteredMedications = useMemo(() => {
    return PEDIATRIC_MEDICATIONS.filter(med => {
      const matchCategory = selectedCategory === 'Todos' || med.category === selectedCategory;
      const matchSearch = 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.presentation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.observations.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  const handleAddMedication = (med: PediatricMedication) => {
    const calc = calculatePediatricDose(med, patientWeight);

    let doseText = '';
    if (med.unitType === 'drops' && calc.calculatedDrops !== undefined) {
      doseText = `${calc.dropsText} (${calc.volumeText})`;
    } else if (med.unitType === 'fixed') {
      doseText = med.doseCustomLabel || 'Conforme orientação';
    } else {
      doseText = `${calc.volumeText} (${calc.rawDoseText})`;
    }

    const newItem: PrescriptionItem = {
      id: `presc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: med.name,
      presentation: med.presentation,
      route: med.route,
      quantity: '1 frasco',
      doseCalculatedText: doseText,
      frequencyText: med.frequency,
      scheduleInterval: med.frequency.includes('6/6') ? '6/6h' : med.frequency.includes('8/8') ? '8/8h' : med.frequency.includes('12/12') ? '12/12h' : '24/24h',
      scheduleTimes: [],
      durationDays: med.defaultDays || 5,
      instructions: calc.formattedPrescriptionText,
      isContinuous: false,
      isSpecialControl: Boolean(med.isSpecialControl) || isSpecialControlOrAntibiotic(med.name) || med.category.toLowerCase().includes('antibiótico') || med.category.toLowerCase().includes('antibiotico'),
      calculatedFromWeight: patientWeight
    };

    onAddPrescriptionItem(newItem);

    // Visual feedback
    setAddedMedsMap(prev => ({ ...prev, [med.id]: true }));
    setTimeout(() => {
      setAddedMedsMap(prev => ({ ...prev, [med.id]: false }));
    }, 1800);
  };

  return (
    <div
      data-state={patientWeight <= 0 ? 'error' : 'idle'}
      aria-busy={false}
      id="pediatric-calculator-section"
      className="@container w-full max-w-full space-y-4 sm:space-y-5"
    >
      {/* Top Controller: Weight Hero Tactile Card */}
      <div 
        className="tactile-card p-4 sm:p-5 rounded-2xl relative overflow-hidden w-full"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
        }}
      >
        <div className="flex flex-col @4xl:flex-row @4xl:items-center justify-between gap-4 sm:gap-6">
          {/* Left: Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span 
                className="p-2 rounded-xl text-white flex-shrink-0 bg-emerald-700 dark:bg-emerald-800 border border-white/12 flex items-center justify-center"
              >
                <Icon name="calculate" className="text-[20px] text-slate-100" />
              </span>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--text-main)]">
                Calculadora de doses pediátricas
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-[var(--text-muted)]">
              Paciente: <span className="text-sky-600 dark:text-sky-400 font-semibold">{patientName}</span> • cálculo automático em mg, mL e gotas com teto de segurança.
            </p>
          </div>

          {/* Right: Interactive Weight Stepper & Display (Ergonomic & Touch-friendly) */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-between sm:justify-center gap-2 p-2 sm:p-2.5 rounded-2xl border w-full @4xl:w-auto flex-shrink-0 tactile-flat bg-[var(--surface-inset)] border-[var(--border-subtle)]"
          >
            {/* Bloco do Peso com Rótulo Associado */}
            <div className="w-full sm:w-auto sm:order-2 px-3 text-center sm:min-w-[110px]">
              <label 
                htmlFor="peso-paciente"
                className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block cursor-pointer"
              >
                Peso atual (kg)
              </label>
              <div className="flex items-baseline justify-center gap-1 clinical-tabular-nums">
                <input
                  id="peso-paciente"
                  ref={weightInputRef}
                  type="number"
                  min="0.5"
                  max="120"
                  step="0.5"
                  value={patientWeight}
                  onChange={(e) => onUpdatePatientWeight(parseFloat(e.target.value) || 1)}
                  className="w-16 sm:w-20 font-black text-2xl text-center bg-transparent border-b-2 border-clinical dark:border-clinical focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus:border-info text-sky-700 dark:text-sky-400 rounded clinical-tabular-nums"
                />
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">kg</span>
              </div>
            </div>

            {/* Grade de 4 colunas em mobile; itens em linha via sm:contents em telas sm+ */}
            <div className="grid grid-cols-4 gap-1.5 w-full sm:w-auto sm:contents clinical-tabular-nums">
              <button
                type="button"
                onClick={() => onUpdatePatientWeight(Math.max(1, +(patientWeight - 1).toFixed(1)))}
                className="w-full sm:w-11 h-11 min-w-[44px] min-h-[44px] p-0 rounded-xl font-extrabold text-sm flex items-center justify-center transition cursor-pointer tactile-btn-secondary active:scale-95 bg-[var(--surface-card)] text-[var(--text-main)] sm:order-1 focus-visible:ring-2 focus-visible:ring-sky-500 clinical-tabular-nums"
                title="Diminuir 1 kg"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => onUpdatePatientWeight(Math.max(1, +(patientWeight - 0.5).toFixed(1)))}
                className="w-full sm:w-11 h-11 min-w-[44px] min-h-[44px] p-0 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer tactile-btn-secondary active:scale-95 bg-[var(--surface-card)] text-[var(--text-muted)] sm:order-1 focus-visible:ring-2 focus-visible:ring-sky-500 clinical-tabular-nums"
                title="Diminuir 0.5 kg"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => onUpdatePatientWeight(Math.min(120, +(patientWeight + 0.5).toFixed(1)))}
                className="w-full sm:w-11 h-11 min-w-[44px] min-h-[44px] p-0 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer tactile-btn-secondary active:scale-95 bg-[var(--surface-card)] text-[var(--text-muted)] sm:order-3 focus-visible:ring-2 focus-visible:ring-sky-500 clinical-tabular-nums"
                title="Aumentar 0.5 kg"
              >
                +0.5
              </button>
              <button
                type="button"
                onClick={() => onUpdatePatientWeight(Math.min(120, +(patientWeight + 1).toFixed(1)))}
                className="w-full sm:w-11 h-11 min-w-[44px] min-h-[44px] p-0 rounded-xl font-extrabold text-sm flex items-center justify-center transition cursor-pointer tactile-btn-secondary active:scale-95 bg-[var(--surface-card)] text-[var(--text-main)] sm:order-3 focus-visible:ring-2 focus-visible:ring-sky-500 clinical-tabular-nums"
                title="Aumentar 1 kg"
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {/* Quick Weight Range Presets */}
        <div className="mt-3.5 pt-3.5 border-t flex items-center gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar fade-scroll-x" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,19,43,0.08)' }}>
          <span className="text-xs font-bold whitespace-nowrap text-[var(--text-muted)] dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Icon name="balanca" className="text-[16px] text-sky-500" /> Faixas:
          </span>
          {weightPresets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onUpdatePatientWeight(p.weight)}
              className={`text-xs px-3.5 py-2 min-h-[44px] rounded-xl border font-bold whitespace-nowrap transition cursor-pointer flex-shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 clinical-tabular-nums ${
                patientWeight === p.weight
                  ? 'bg-emerald-600 text-white border-clinical shadow-md shadow-emerald-600/25'
                  : darkMode
                  ? 'bg-slate-800/80 text-slate-300 border-strong hover:bg-slate-700 hover:text-white'
                  : 'bg-white text-slate-700 border-subtle hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Icon name="search" className="text-[16px] absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] dark:text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Ex.: Paracetamol, Amoxicilina, Dipirona, Ondansetrona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition tactile-input"
          />
        </div>

        {/* View Prescription Action Button */}
        <button
          type="button"
          onClick={isDrawer && onClose ? onClose : onNavigateToPrescription}
          className="tactile-btn-primary px-5 py-3 min-h-[44px] flex items-center justify-center gap-2 text-xs font-bold cursor-pointer whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <span>{isDrawer ? 'Concluir e voltar à receita' : 'Ir para receita'}</span>
          <Icon name="arrow_forward" className="text-[16px]" />
        </button>
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
                  ? 'bg-navy-900 text-white dark:bg-sky-600 dark:text-white border-navy-800 dark:border-info shadow-tactile-navy dark:shadow-tactile-blue'
                  : darkMode
                  ? 'bg-slate-800/80 text-slate-300 border-strong hover:bg-slate-700/90'
                  : 'bg-white text-slate-700 border-subtle hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Aviso de peso obrigatório acima da lista */}
      {patientWeight <= 0 && (
        <div 
          id="aviso-peso-obrigatorio"
          role="alert"
          aria-live="assertive"
          className="p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/30 border-warning dark:border-amber-900/40 text-amber-800 dark:text-amber-300"
        >
          <div className="flex items-center gap-2.5">
            <Icon name="warning" className="text-[20px] flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-xs sm:text-sm font-semibold">
              Informe o peso do paciente para calcular as doses.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              weightInputRef.current?.focus();
              weightInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="btn-tactile-secondary px-3.5 py-1.5 min-h-[44px] text-xs font-bold whitespace-nowrap cursor-pointer self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Definir peso
          </button>
        </div>
      )}

      {/* Medications Table / Cards Container */}
      <div 
        className="tactile-card rounded-2xl overflow-hidden"
      >
        <div className="p-3.5 sm:p-4 border-b flex items-center justify-between" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <h3 className="font-semibold text-xs sm:text-sm clinical-tabular-nums" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
              Tabela de medicamentos calculados ({filteredMedications.length} itens)
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 clinical-tabular-nums">
            Dose base: {patientWeight} kg
          </span>
        </div>

        {/* Desktop Table View (@container >= 4xl) */}
        <div className="hidden @4xl:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr 
                className="font-bold uppercase tracking-wider text-xs border-b"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-inset)' : 'var(--bg-app)',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                  color: 'var(--text-muted)'
                }}
              >
                <th className="py-3 px-4">Medicamento / Apresentação</th>
                <th className="py-3 px-3">Concentração</th>
                <th className="py-3 px-3">Dose Padrão</th>
                <th className="py-3 px-3 bg-emerald-500/10 border-x border-clinical">Dose Calculada</th>
                <th className="py-3 px-3 bg-emerald-500/10">Volume (mL)</th>
                <th className="py-3 px-3 bg-emerald-500/10 border-r border-clinical">Gotas</th>
                <th className="py-3 px-4">Posologia / Observações</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y clinical-tabular-nums" style={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)' }}>
              {filteredMedications.map((med) => {
                const calc = calculatePediatricDose(med, patientWeight);
                const isAdded = addedMedsMap[med.id];

                return (
                  <tr 
                    key={med.id}
                    className={`transition-colors hover:bg-slate-500/5 ${isAdded ? 'bg-emerald-500/10' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-xs" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                        {med.name}
                      </div>
                      <div className="text-xs text-sky-700 dark:text-sky-400 font-medium">{med.presentation}</div>
                      <span className="inline-block mt-0.5 text-xs uppercase font-bold px-1.5 py-0.2 rounded bg-slate-500/10 text-[var(--text-muted)] dark:text-slate-400">
                        {med.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold clinical-tabular-nums" style={{ color: darkMode ? '#CBD5E1' : '#334155' }}>
                      {med.concentrationMgPerMl > 0 ? `${med.concentrationMgPerMl} mg/mL` : '-'}
                    </td>
                    <td className="py-3 px-3 clinical-tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {med.standardDoseMgKg > 0 ? `${med.standardDoseMgKg} mg/kg` : 'Dose Fixa'}
                      {med.maxDoseMg > 0 && (
                        <div className="text-xs text-amber-700 dark:text-amber-400 clinical-tabular-nums">Máx {med.maxDoseMg} mg</div>
                      )}
                    </td>
                    <td className="py-3 px-3 bg-emerald-500/[0.04] border-x border-clinical clinical-tabular-nums">
                      {patientWeight > 0 ? (
                        <>
                          <div className="font-black text-sm text-sky-700 dark:text-sky-400 clinical-tabular-nums">
                            {calc.rawDoseText}
                          </div>
                          {calc.isMaxDoseReached && (
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                              <Icon name="warning" className="text-xs" /> Teto Máx
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-semibold text-sm text-[var(--text-muted)] dark:text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 bg-emerald-500/[0.04] clinical-tabular-nums">
                      <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 clinical-tabular-nums">
                        {patientWeight > 0 ? calc.volumeText : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 bg-emerald-500/[0.04] border-r border-clinical clinical-tabular-nums">
                      <span className={`font-black text-sm clinical-tabular-nums ${patientWeight > 0 && calc.dropsText !== '-' ? 'text-amber-700 dark:text-amber-400' : 'text-[var(--text-muted)] dark:text-slate-400'}`}>
                        {patientWeight > 0 ? calc.dropsText : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-xs line-clamp-2" style={{ color: darkMode ? '#CBD5E1' : '#475569' }}>
                        {med.frequency}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] dark:text-slate-400 line-clamp-1 italic mt-0.5">
                        {med.observations}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleAddMedication(med)}
                        disabled={patientWeight <= 0}
                        aria-describedby={patientWeight <= 0 ? "aviso-peso-obrigatorio" : undefined}
                        className={`px-3 py-1.5 min-h-[44px] rounded-xl font-semibold text-xs transition flex items-center gap-1.5 ml-auto focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isAdded
                            ? 'bg-emerald-700 text-white border border-clinical'
                            : 'btn-tactile-secondary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Icon name="check" className="text-[14px]" />
                            <span>Adicionado</span>
                          </>
                        ) : (
                          <>
                            <Icon name="add" className="text-[14px]" />
                            <span>Prescrever</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile / Tablet / Drawer Cards View (@container < 4xl) */}
        <div className="@4xl:hidden divide-y clinical-tabular-nums" style={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}>
          {filteredMedications.map((med) => {
            const calc = calculatePediatricDose(med, patientWeight);
            const isAdded = addedMedsMap[med.id];

            return (
              <div 
                key={med.id} 
                className={`p-3.5 sm:p-4 space-y-3 transition-colors ${isAdded ? 'bg-emerald-500/10' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-slate-500/10 text-[var(--text-muted)] dark:text-slate-400 border border-strong">
                      {med.category}
                    </span>
                    <h4 className="font-bold text-sm mt-1" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                      {med.name}
                    </h4>
                    <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">{med.presentation}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddMedication(med)}
                    disabled={patientWeight <= 0}
                    aria-describedby={patientWeight <= 0 ? "aviso-peso-obrigatorio" : undefined}
                    className={`px-3 py-1.5 min-h-[44px] rounded-xl font-semibold text-xs flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      isAdded
                        ? 'bg-emerald-700 text-white border border-clinical'
                        : 'btn-tactile-secondary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isAdded ? <Icon name="check" className="text-[14px]" /> : <Icon name="add" className="text-[14px]" />}
                    <span>{isAdded ? 'Adicionado' : 'Prescrever'}</span>
                  </button>
                </div>

                {/* Calculation Badges Grid */}
                <div 
                  className="grid grid-cols-3 gap-2 p-2.5 rounded-xl border tactile-flat clinical-tabular-nums"
                  style={{
                    backgroundColor: darkMode ? 'var(--surface-inset)' : 'var(--bg-app)',
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                  }}
                >
                  <div className="text-center">
                    <span className="text-xs font-bold text-[var(--text-muted)] dark:text-slate-400 uppercase block">Dose (mg)</span>
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 clinical-tabular-nums">
                      {patientWeight > 0 ? calc.rawDoseText : '—'}
                    </span>
                  </div>
                  <div className="text-center border-x" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
                    <span className="text-xs font-bold text-[var(--text-muted)] dark:text-slate-400 uppercase block">Volume (mL)</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 clinical-tabular-nums">
                      {patientWeight > 0 ? calc.volumeText : '—'}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-[var(--text-muted)] dark:text-slate-400 uppercase block">Gotas</span>
                    <span className={`text-xs font-bold clinical-tabular-nums ${patientWeight > 0 && calc.dropsText !== '-' ? 'text-amber-700 dark:text-amber-400' : 'text-[var(--text-muted)] dark:text-slate-400'}`}>
                      {patientWeight > 0 ? calc.dropsText : '—'}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5" style={{ color: darkMode ? '#CBD5E1' : '#334155' }}>
                    <Icon name="schedule" className="text-[14px] text-[var(--text-muted)] dark:text-slate-400 flex-shrink-0" />
                    <span>{med.frequency}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] dark:text-slate-400 italic">
                    {med.observations}
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
