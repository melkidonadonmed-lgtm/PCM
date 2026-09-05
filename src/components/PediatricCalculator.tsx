import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Search, 
  Plus, 
  Check, 
  Scale, 
  AlertTriangle, 
  ArrowRight,
  Clock,
  Droplets,
  Utensils,
  User,
  Baby,
  Activity,
  Info,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { PEDIATRIC_MEDICATIONS } from '../data/pediatricMeds';
import { PediatricMedication, PrescriptionItem, Patient } from '../types';
import { calculatePediatricDose } from '../utils/doseCalculator';

interface PediatricCalculatorProps {
  darkMode: boolean;
  patient: Patient;
  onUpdatePatientWeight: (weight: number) => void;
  onAddPrescriptionItem: (item: PrescriptionItem) => void;
  onNavigateToPrescription: () => void;
}

interface AdultMedication {
  id: string;
  name: string;
  presentation: string;
  route: string;
  category: string;
  baseDose: string;
  maxDoseDay: string;
  calcDose: (weight: number, renalFunction: 'normal' | 'moderate' | 'severe') => {
    instructions: string;
    warning?: string;
  };
}

const ADULT_MEDS: AdultMedication[] = [
  {
    id: 'ad_dipirona',
    name: 'Dipirona Sódica 500mg ou 1g',
    presentation: 'Comprimidos',
    route: 'Uso Oral',
    category: 'Analgésicos',
    baseDose: '500mg a 1000mg a cada 6h',
    maxDoseDay: '4.000 mg/dia',
    calcDose: (weight) => ({
      instructions: weight < 50 
        ? 'Tomar 1 comprimido de 500mg via oral de 6 em 6 horas se dor ou febre (Máx 2g/dia).' 
        : 'Tomar 1 comprimido de 1g via oral de 6 em 6 horas em caso de dor ou febre (Máx 4g/dia).'
    })
  },
  {
    id: 'ad_paracetamol',
    name: 'Paracetamol 750mg',
    presentation: 'Comprimidos',
    route: 'Uso Oral',
    category: 'Analgésicos',
    baseDose: '750mg a cada 6-8h',
    maxDoseDay: '3.000 mg/dia',
    calcDose: () => ({
      instructions: 'Tomar 1 comprimido de 750mg via oral de 6 em 6 horas em caso de dor ou febre (Não ultrapassar 4 comprimidos em 24h).',
      warning: 'Em hepatopatias prévias, manter limite máximo seguro de 2g/dia.'
    })
  },
  {
    id: 'ad_amoxicilina',
    name: 'Amoxicilina 500mg / 875mg',
    presentation: 'Cápsulas / Comprimidos',
    route: 'Uso Oral',
    category: 'Antibióticos',
    baseDose: '500mg 8/8h ou 875mg 12/12h',
    maxDoseDay: '3.000 mg/dia',
    calcDose: (_, renal) => {
      if (renal === 'severe') {
        return {
          instructions: 'Tomar 1 cápsula de 500mg via oral de 12 em 12 horas por 7 a 10 dias (ajustado para DRC grave).',
          warning: 'Ajuste de dose para ClCr < 30 mL/min.'
        };
      }
      return {
        instructions: 'Tomar 1 comprimido de 875mg via oral de 12 em 12 horas após refeições por 7 a 10 dias consecutivos.'
      };
    }
  },
  {
    id: 'ad_cipro',
    name: 'Ciprofloxacino 500mg',
    presentation: 'Comprimidos revestidos',
    route: 'Uso Oral',
    category: 'Antibióticos',
    baseDose: '500mg 12/12h',
    maxDoseDay: '1.500 mg/dia',
    calcDose: (_, renal) => {
      if (renal === 'severe') {
        return {
          instructions: 'Tomar 1 comprimido de 500mg via oral 1 vez ao dia (a cada 24h) durante 7 a 14 dias.',
          warning: 'Redução de 50% na dose recomendada em insuficiência renal grave (ClCr < 30).'
        };
      }
      return {
        instructions: 'Tomar 1 comprimido de 500mg via oral de 12 em 12 horas por 7 a 14 dias consecutivos.'
      };
    }
  },
  {
    id: 'ad_enoxaparina',
    name: 'Enoxaparina Sódica (Clexane)',
    presentation: 'Seringa preenchida',
    route: 'Uso Subcutâneo',
    category: 'Anticoagulantes',
    baseDose: 'Profilaxia: 40mg/dia | Plena: 1mg/kg 12/12h',
    maxDoseDay: 'Conforme peso e indicação',
    calcDose: (weight, renal) => {
      const doseTherapeutic = Math.round(weight * 1);
      if (renal === 'severe') {
        return {
          instructions: `Administrar ${doseTherapeutic}mg via subcutânea 1 vez ao dia (24/24h) com monitorização de anti-Xa se disponível.`,
          warning: 'ClCr < 30 mL/min: dose terapêutica plena ajustada para 1x ao dia (não usar 12/12h).'
        };
      }
      return {
        instructions: `Terapêutica plena: Administrar ${doseTherapeutic}mg via subcutânea de 12 em 12 horas. (Profilaxia TVP: 40mg SC 1x ao dia).`
      };
    }
  },
  {
    id: 'ad_ceftriaxona',
    name: 'Ceftriaxona 1g ou 2g',
    presentation: 'Frasco-ampola IV/IM',
    route: 'Uso Intravenoso',
    category: 'Antibióticos',
    baseDose: '1g a 2g 1x ao dia (ou 12/12h se meningite)',
    maxDoseDay: '4.000 mg/dia',
    calcDose: () => ({
      instructions: 'Administrar 2g via intravenosa em infusão de 30 minutos 1 vez ao dia durante 7 a 14 dias.',
      warning: 'Eliminação mista (biliar e renal). Não requer redução de dose em disfunção renal isolada.'
    })
  }
];

export const PediatricCalculator: React.FC<PediatricCalculatorProps> = ({
  darkMode,
  patient,
  onUpdatePatientWeight,
  onAddPrescriptionItem,
  onNavigateToPrescription
}) => {
  // Aba Ativa da Calculadora Multimodal
  const [activeTab, setActiveTab] = useState<'pediatric' | 'adult' | 'hydration' | 'diet'>('pediatric');

  // Estados de Busca e Filtro (Pediátrico)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [addedMedsMap, setAddedMedsMap] = useState<{ [id: string]: boolean }>({});

  // Estados do Módulo Adulto
  const [adultRenalFunction, setAdultRenalFunction] = useState<'normal' | 'moderate' | 'severe'>('normal');

  // Estados do Módulo Dieta
  const [dietAgeCategory, setDietAgeCategory] = useState<'lactente' | 'infantil' | 'adulto'>('infantil');

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
    { label: 'Adulto (70 kg)', weight: 70 }
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

  // Adicionar Medicamento Pediátrico à Receita
  const handleAddMedication = (med: PediatricMedication) => {
    const calc = calculatePediatricDose(med, patientWeight);

    let doseText = '';
    if (med.unitType === 'drops' && calc.calculatedDrops !== undefined) {
      doseText = `${calc.calculatedDrops} gotas (${calc.volumeText})`;
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
      calculatedFromWeight: patientWeight
    };

    onAddPrescriptionItem(newItem);

    // Visual feedback
    setAddedMedsMap(prev => ({ ...prev, [med.id]: true }));
    setTimeout(() => {
      setAddedMedsMap(prev => ({ ...prev, [med.id]: false }));
    }, 1800);
  };

  // Adicionar Medicamento Adulto à Receita
  const handleAddAdultMedication = (med: AdultMedication) => {
    const { instructions } = med.calcDose(patientWeight || 70, adultRenalFunction);

    const newItem: PrescriptionItem = {
      id: `ad-${Date.now()}-${med.id}`,
      name: med.name,
      presentation: med.presentation,
      route: med.route,
      quantity: '1 caixa',
      doseCalculatedText: med.baseDose,
      frequencyText: instructions,
      scheduleInterval: '8/8h',
      scheduleTimes: [],
      instructions: instructions,
      isContinuous: false,
      isSpecialControl: med.category === 'Antibióticos'
    };

    onAddPrescriptionItem(newItem);
    setAddedMedsMap(prev => ({ ...prev, [med.id]: true }));
    setTimeout(() => {
      setAddedMedsMap(prev => ({ ...prev, [med.id]: false }));
    }, 1800);
  };

  // Cálculo da Hidratação Venosa (Regra de Holliday-Segar)
  const hollidaySegar = useMemo(() => {
    const w = patientWeight > 0 ? patientWeight : 10;
    let vol = 0;
    if (w <= 10) {
      vol = w * 100;
    } else if (w <= 20) {
      vol = 1000 + (w - 10) * 50;
    } else {
      vol = 1500 + (w - 20) * 20;
    }

    const volume24h = Math.round(vol);
    const mlHora = parseFloat((volume24h / 24).toFixed(1));
    const microgotasMin = Math.round(mlHora);
    const macrogotasMin = Math.round(mlHora / 3);

    // Solução padrão 4:1 (SG 5% 80% e SF 0,9% 20%)
    const sg5Ml = Math.round(volume24h * 0.8);
    const sfMl = Math.round(volume24h * 0.2);
    const kcl10Ml = parseFloat(((volume24h / 100) * 2).toFixed(1));

    return {
      volume24h,
      mlHora,
      microgotasMin,
      macrogotasMin,
      sg5Ml,
      sfMl,
      kcl10Ml
    };
  }, [patientWeight]);

  const handleAddHydrationToPrescription = () => {
    const hs = hollidaySegar;
    const newItem: PrescriptionItem = {
      id: `hs-${Date.now()}`,
      name: 'Hidratação Venosa de Manutenção (Regra de Holliday-Segar)',
      presentation: `${hs.volume24h} mL/dia`,
      route: 'Uso Intravenoso',
      quantity: `${hs.volume24h} mL em 24h`,
      doseCalculatedText: `${hs.mlHora} mL/h (${hs.microgotasMin} microgotas/min)`,
      frequencyText: 'Infusão intravenosa contínua em 24 horas',
      scheduleInterval: '24/24h',
      scheduleTimes: [],
      instructions: `Administrar solução de manutenção por via intravenosa: SG 5% (${hs.sg5Ml} mL) + SF 0,9% (${hs.sfMl} mL) + KCl 10% (${hs.kcl10Ml} mL) em bomba de infusão contínua a ${hs.mlHora} mL/hora (${hs.microgotasMin} microgotas/minuto).`,
      isContinuous: true,
      calculatedFromWeight: patientWeight
    };

    onAddPrescriptionItem(newItem);
    setAddedMedsMap(prev => ({ ...prev, hydration: true }));
    setTimeout(() => {
      setAddedMedsMap(prev => ({ ...prev, hydration: false }));
    }, 1800);
  };

  // Cálculo da Necessidade Calórica & Dieta
  const caloricNeed = useMemo(() => {
    const w = patientWeight > 0 ? patientWeight : (dietAgeCategory === 'adulto' ? 70 : 10);
    let kcal = 0;
    let feedings = 6;
    let mlPerFeeding = 0;

    if (dietAgeCategory === 'lactente') {
      kcal = Math.round(w * 115);
      const totalMl = Math.round(kcal / 0.67);
      feedings = 8;
      mlPerFeeding = Math.round(totalMl / feedings);
    } else if (dietAgeCategory === 'infantil') {
      if (w <= 10) kcal = w * 100;
      else if (w <= 20) kcal = 1000 + (w - 10) * 50;
      else kcal = 1500 + (w - 20) * 20;
      feedings = 5;
      mlPerFeeding = Math.round(kcal / feedings);
    } else {
      kcal = Math.round(w * 28);
      feedings = 4;
      mlPerFeeding = Math.round(kcal / feedings);
    }

    return {
      kcal,
      feedings,
      mlPerFeeding
    };
  }, [patientWeight, dietAgeCategory]);

  const handleAddDietToPrescription = () => {
    const diet = caloricNeed;
    const newItem: PrescriptionItem = {
      id: `diet-${Date.now()}`,
      name: 'Plano Nutricional & Orientação de Dieta',
      presentation: `${diet.kcal} kcal/dia`,
      route: 'Uso Oral',
      quantity: `${diet.feedings} refeições/dia`,
      doseCalculatedText: `${diet.mlPerFeeding} mL por refeição`,
      frequencyText: `${diet.feedings}x ao dia`,
      scheduleInterval: diet.feedings === 8 ? '3/3h' : diet.feedings === 6 ? '4/4h' : '6/6h',
      scheduleTimes: [],
      instructions: `Ofertar dieta/fórmula conforme necessidade calórica estimada de ${diet.kcal} kcal/dia fracionada em ${diet.feedings} tomadas diárias de aproximadamente ${diet.mlPerFeeding} mL por tomada. Manter hidratação hídrica complementar.`,
      isContinuous: true,
      calculatedFromWeight: patientWeight
    };

    onAddPrescriptionItem(newItem);
    setAddedMedsMap(prev => ({ ...prev, diet: true }));
    setTimeout(() => {
      setAddedMedsMap(prev => ({ ...prev, diet: false }));
    }, 1800);
  };

  return (
    <div id="pediatric-calculator-section" className="w-full max-w-full space-y-4 sm:space-y-5">
      
      {/* Top Navigation Tabs: Calculadora Multimodal */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('pediatric')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeTab === 'pediatric'
              ? 'bg-navy-800 text-white dark:bg-cream-100 dark:text-navy-950 shadow-tactile-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-cream-100'
          }`}
        >
          <Baby className="w-4 h-4 text-emerald-500" />
          <span>Doses Pediátricas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('adult')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeTab === 'adult'
              ? 'bg-navy-800 text-white dark:bg-cream-100 dark:text-navy-950 shadow-tactile-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-cream-100'
          }`}
        >
          <User className="w-4 h-4 text-sky-500" />
          <span>Doses Adultos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hydration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeTab === 'hydration'
              ? 'bg-navy-800 text-white dark:bg-cream-100 dark:text-navy-950 shadow-tactile-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-cream-100'
          }`}
        >
          <Droplets className="w-4 h-4 text-cyan-500" />
          <span>Hidratação Venosa (Holliday-Segar)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeTab === 'diet'
              ? 'bg-navy-800 text-white dark:bg-cream-100 dark:text-navy-950 shadow-tactile-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-cream-100'
          }`}
        >
          <Utensils className="w-4 h-4 text-amber-500" />
          <span>Dieta & Calorias</span>
        </button>
      </div>

      {/* Controller: Weight Hero Tactile Card */}
      <div 
        className="tactile-card p-4 sm:p-5 rounded-2xl relative overflow-hidden w-full"
        style={{
          backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          {/* Left: Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span 
                className="p-2 rounded-xl text-white flex-shrink-0"
                style={{
                  backgroundColor: darkMode ? '#155730' : '#15803D',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <Calculator className="w-5 h-5 text-slate-100" strokeWidth={1.75} />
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                {activeTab === 'pediatric' && 'Calculadora de Doses Pediátricas'}
                {activeTab === 'adult' && 'Ajuste de Doses para Adultos & Função Renal'}
                {activeTab === 'hydration' && 'Hidratação Venosa por Regra de Holliday-Segar'}
                {activeTab === 'diet' && 'Estimativa de Necessidade Calórica e Dieta'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: darkMode ? '#8E9CAE' : '#64748B' }}>
              Paciente: <span className="text-sky-700 dark:text-sky-400 font-semibold">{patientName}</span> • Peso atual: <span className="font-bold text-emerald-600 dark:text-emerald-400">{patientWeight || 0} kg</span>.
            </p>
          </div>

          {/* Right: Interactive Weight Stepper & Display */}
          <div 
            className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-2xl border w-full lg:w-auto flex-shrink-0 tactile-flat"
            style={{
              backgroundColor: darkMode ? 'var(--surface-inset)' : 'var(--bg-app)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdatePatientWeight(Math.max(1, +(patientWeight - 1).toFixed(1)))}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl font-extrabold text-sm flex items-center justify-center transition-all cursor-pointer tactile-btn-secondary active:scale-95"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-card)' : 'var(--surface-card)',
                  color: darkMode ? '#F4F7FC' : '#0B132B'
                }}
                title="Diminuir 1 kg"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => onUpdatePatientWeight(Math.max(1, +(patientWeight - 0.5).toFixed(1)))}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer tactile-btn-secondary active:scale-95"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-card)' : 'var(--surface-card)',
                  color: darkMode ? '#94A3B8' : '#526071'
                }}
                title="Diminuir 0.5 kg"
              >
                -0.5
              </button>
            </div>

            <div className="px-3 text-center min-w-[90px] sm:min-w-[110px]">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                PESO ATUAL
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <input
                  type="number"
                  min="0.5"
                  max="160"
                  step="0.5"
                  value={patientWeight}
                  onChange={(e) => onUpdatePatientWeight(parseFloat(e.target.value) || 1)}
                  className="w-16 sm:w-20 font-black text-2xl text-center bg-transparent border-b-2 border-emerald-600 dark:border-emerald-500 focus:outline-none focus:border-sky-500"
                  style={{ color: darkMode ? '#388EE6' : '#0F5E94' }}
                />
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">kg</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdatePatientWeight(Math.min(160, +(patientWeight + 0.5).toFixed(1)))}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer tactile-btn-secondary active:scale-95"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-card)' : 'var(--surface-card)',
                  color: darkMode ? '#94A3B8' : '#526071'
                }}
                title="Aumentar 0.5 kg"
              >
                +0.5
              </button>
              <button
                type="button"
                onClick={() => onUpdatePatientWeight(Math.min(160, +(patientWeight + 1).toFixed(1)))}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl font-extrabold text-sm flex items-center justify-center transition-all cursor-pointer tactile-btn-secondary active:scale-95"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-card)' : 'var(--surface-card)',
                  color: darkMode ? '#F4F7FC' : '#0B132B'
                }}
                title="Aumentar 1 kg"
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {/* Quick Weight Range Presets */}
        <div className="mt-3.5 pt-3.5 border-t flex items-center gap-2 overflow-x-auto pb-1 max-w-full" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,19,43,0.08)' }}>
          <span className="text-xs font-bold whitespace-nowrap text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Scale className="w-4 h-4 text-sky-500" strokeWidth={2} /> Faixas Rápidas:
          </span>
          {weightPresets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onUpdatePatientWeight(p.weight)}
              className={`text-xs px-3.5 py-2 min-h-[44px] rounded-xl border font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                patientWeight === p.weight
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/25'
                  : darkMode
                  ? 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTEÚDO 1: ABA PEDIÁTRICA */}
      {activeTab === 'pediatric' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Buscar medicamento ou apresentação pediátrica (ex: Paracetamol, Amoxicilina, Dipirona)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl text-xs font-medium focus:outline-none transition-all tactile-input"
              />
            </div>

            <button
              onClick={onNavigateToPrescription}
              className="tactile-btn-primary px-5 py-3 min-h-[44px] flex items-center justify-center gap-2 text-xs font-bold cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>Ir para Receita</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar fade-scroll-x">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3.5 py-2 min-h-[44px] rounded-xl border whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 border-navy-800 dark:border-white/30 shadow-tactile-navy dark:shadow-tactile-cream'
                    : darkMode
                    ? 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Pediatric Medications Table */}
          <div 
            className="tactile-card rounded-2xl overflow-hidden border"
            style={{
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b text-slate-400 font-extrabold uppercase text-[10px]" style={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}>
                    <th className="p-3.5">Fármaco & Apresentação</th>
                    <th className="p-3.5">Dose em mg</th>
                    <th className="p-3.5">Volume (mL)</th>
                    <th className="p-3.5">Gotas</th>
                    <th className="p-3.5">Frequência</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}>
                  {filteredMedications.map((med) => {
                    const calc = calculatePediatricDose(med, patientWeight);
                    const isAdded = addedMedsMap[med.id];

                    return (
                      <tr key={med.id} className={`hover:bg-slate-500/5 transition ${isAdded ? 'bg-emerald-500/10' : ''}`}>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-cream-50">{med.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{med.presentation}</p>
                        </td>
                        <td className="p-3.5 font-bold text-sky-600 dark:text-sky-400">{calc.rawDoseText}</td>
                        <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{calc.volumeText}</td>
                        <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">{calc.dropsText}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{med.frequency}</td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleAddMedication(med)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ml-auto cursor-pointer ${
                              isAdded ? 'bg-emerald-700 text-white' : 'tactile-btn-primary'
                            }`}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            <span>{isAdded ? 'Adicionado' : 'Prescrever'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO 2: ABA DOSES ADULTOS & FUNÇÃO RENAL */}
      {activeTab === 'adult' && (
        <div className="space-y-4">
          <div 
            className="tactile-card p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-cream-50 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500" />
                Ajuste por Função Renal (Clearance de Creatinina Estimado)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione o estágio de filtração glomerular para adequação posológica e segurança antimicrobiana.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 shrink-0">
              {[
                { id: 'normal', label: 'Normal (ClCr > 60)' },
                { id: 'moderate', label: 'Mod. (ClCr 30-59)' },
                { id: 'severe', label: 'Grave (ClCr < 30)' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAdultRenalFunction(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    adultRenalFunction === f.id
                      ? 'bg-navy-800 dark:bg-navy-700 text-white shadow-tactile-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ADULT_MEDS.map((med) => {
              const { instructions, warning } = med.calcDose(patientWeight || 70, adultRenalFunction);
              const isAdded = addedMedsMap[med.id];

              return (
                <div
                  key={med.id}
                  className="tactile-card p-4 rounded-2xl border space-y-3 flex flex-col justify-between"
                  style={{
                    backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          {med.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-cream-50 mt-1">
                          {med.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {med.presentation} • {med.route}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-navy-800 px-2 py-1 rounded-lg">
                        Máx: {med.maxDoseDay}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      👉 {instructions}
                    </div>

                    {warning && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{warning}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddAdultMedication(med)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 ${
                      isAdded ? 'bg-emerald-700 text-white' : 'tactile-btn-primary'
                    }`}
                  >
                    {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdded ? 'Adicionado à Receita' : 'Prescrever Dose Adulto'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTEÚDO 3: ABA HIDRATAÇÃO VENOSA (HOLLIDAY-SEGAR) */}
      {activeTab === 'hydration' && (
        <div className="space-y-4">
          <div 
            className="tactile-card p-5 rounded-2xl border space-y-4"
            style={{
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/20">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-cream-50">
                    Regra de Holliday-Segar (Manutenção Hidroeletrolítica)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cálculo exato de reposição diária com velocidade de infusão e eletrólitos.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                Peso Base: {patientWeight > 0 ? `${patientWeight} kg` : '10 kg (Padrão)'}
              </span>
            </div>

            {/* Badges de Resultado de Holliday-Segar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Volume Diário</span>
                <span className="text-base sm:text-lg font-black text-cyan-600 dark:text-cyan-400">{hollidaySegar.volume24h} mL</span>
                <span className="text-[10px] text-slate-400 block">em 24 horas</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Velocidade Bomba</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{hollidaySegar.mlHora} mL/h</span>
                <span className="text-[10px] text-slate-400 block">infusão contínua</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Microgotas</span>
                <span className="text-base sm:text-lg font-black text-sky-600 dark:text-sky-400">{hollidaySegar.microgotasMin}</span>
                <span className="text-[10px] text-slate-400 block">microgotas/min</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Macrogotas</span>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">{hollidaySegar.macrogotasMin}</span>
                <span className="text-[10px] text-slate-400 block">gotas/min</span>
              </div>
            </div>

            {/* Composição Proporcional da Solução (4:1) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-cream-50 uppercase tracking-wider">
                Composição da Solução de Manutenção (4 Partes SG 5% : 1 Parte SF 0,9%)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold">
                <div className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200">
                  🔹 Soro Glicosado 5%: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{hollidaySegar.sg5Ml} mL</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200">
                  🔹 Soro Fisiológico 0,9%: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{hollidaySegar.sfMl} mL</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200">
                  🔹 KCl 10% (Reposição K+): <span className="text-cyan-600 dark:text-cyan-400 font-bold">{hollidaySegar.kcl10Ml} mL</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddHydrationToPrescription}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${
                addedMedsMap.hydration ? 'bg-emerald-700 text-white' : 'tactile-btn-primary'
              }`}
            >
              {addedMedsMap.hydration ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{addedMedsMap.hydration ? 'Prescrição de Hidratação Adicionada!' : 'Inserir Prescrição de Hidratação Venosa na Receita'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO 4: ABA DIETA & NECESSIDADE CALÓRICA */}
      {activeTab === 'diet' && (
        <div className="space-y-4">
          <div 
            className="tactile-card p-5 rounded-2xl border space-y-4"
            style={{
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-cream-50">
                    Cálculo de Necessidade Calórica e Volume por Refeição
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Divisão de calorias e fracionamento de mamadas/refeições em mL.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                {[
                  { id: 'lactente', label: 'Lactente (0-12m)' },
                  { id: 'infantil', label: 'Criança (> 1 ano)' },
                  { id: 'adulto', label: 'Adulto' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setDietAgeCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dietAgeCategory === cat.id
                        ? 'bg-navy-800 dark:bg-navy-700 text-white shadow-tactile-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges de Resultado de Dieta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Necessidade Energética</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">{caloricNeed.kcal} kcal</span>
                <span className="text-[10px] text-slate-400 block">por dia (24h)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Fracionamento</span>
                <span className="text-xl font-black text-sky-600 dark:text-sky-400">{caloricNeed.feedings}x ao dia</span>
                <span className="text-[10px] text-slate-400 block">
                  {caloricNeed.feedings === 8 ? 'de 3 em 3 horas' : caloricNeed.feedings === 6 ? 'de 4 em 4 horas' : 'principais refeições'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Volume por Tomada</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{caloricNeed.mlPerFeeding} mL</span>
                <span className="text-[10px] text-slate-400 block">por refeição / mamadeira</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddDietToPrescription}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${
                addedMedsMap.diet ? 'bg-emerald-700 text-white' : 'tactile-btn-primary'
              }`}
            >
              {addedMedsMap.diet ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{addedMedsMap.diet ? 'Orientação Nutricional Adicionada!' : 'Inserir Orientação de Dieta na Receita'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
