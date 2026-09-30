import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Trash2,
  Check,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  ArrowRight
} from 'lucide-react';
import { PrescriptionItem, Patient, DoctorProfile } from '../types';
import { searchUnifiedMedicationsFuzzy } from '../utils/fuzzySearch';
import { UNIFIED_MEDICATIONS, UnifiedMedication } from '../data/medicationDatabase';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { EXEMPLO_MEDICO, EXEMPLO_PACIENTE } from '../data/exemplos';
import { Icon } from './Icon';
import { AcoesDaReceita } from './AcoesDaReceita';

interface PrescriptionBuilderProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  onUpdateDoctor?: (doctor: DoctorProfile) => void;
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  items: PrescriptionItem[];
  onUpdateItems: (items: PrescriptionItem[]) => void;
  weightCalcEnabled?: boolean;
  onToggleWeightCalc?: (enabled: boolean) => void;
  onClearPrescription?: () => void;
  onClearPatient?: () => void;
  onNavigateToPrint: () => void;
  onNavigateToPediatricCalc?: () => void;
  onNavigateToEditor?: () => void;
  onOpenDoctorModal?: () => void;
  onOpenPatientModal: () => void;
  medicamentoPendente?: UnifiedMedication | null;
  onConsumirMedicamentoPendente?: () => void;
  onAbrirPerfilMedico?: () => void;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  darkMode: _darkMode,
  doctor,
  patient,
  onUpdatePatient,
  items,
  onUpdateItems,
  onClearPrescription,
  onClearPatient,
  onNavigateToPrint,
  onNavigateToPediatricCalc,
  onNavigateToEditor,
  onOpenDoctorModal,
  onOpenPatientModal,
  medicamentoPendente,
  onConsumirMedicamentoPendente,
  onAbrirPerfilMedico
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mobile active tab ('composer' | 'preview')
  const [mobileSection, setMobileSection] = useState<'composer' | 'preview'>('composer');

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Active form fields for adding/editing
  const [selectedMedName, setSelectedMedName] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('Uso Oral');
  const [selectedQuantity, setSelectedQuantity] = useState('1 caixa');
  const [selectedPosology, setSelectedPosology] = useState('');
  const [selectedIsSpecial, setSelectedIsSpecial] = useState(false);

  // Feedbacks
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [itemAddedToast, setItemAddedToast] = useState(false);

  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasWeight = patientWeight > 0;
  const patientName = patient?.name?.trim() || '';

  const isDoctorConfigured = medicoConfigurado(doctor);
  const handleAbrirPerfilMedico = onAbrirPerfilMedico || onOpenDoctorModal;

  // Dados para exibição na folha de prévia A4
  const displayDoctorName = isDoctorConfigured
    ? doctor.name.trim()
    : EXEMPLO_MEDICO.name;

  const displayDoctorCRM = isDoctorConfigured
    ? `CRM ${doctor.crm.trim()}/${doctor.crmState || 'SP'}${doctor.rqe ? ` • RQE ${doctor.rqe}` : ''}`
    : `CRM-${EXEMPLO_MEDICO.crmState} ${EXEMPLO_MEDICO.crm}`;

  const displayDoctorSpecialty = isDoctorConfigured
    ? (doctor.specialty || 'Clínica Médica')
    : EXEMPLO_MEDICO.specialty;

  const displayDoctorSignatureCRM = isDoctorConfigured
    ? `CRM: ${doctor.crm.trim()}/${doctor.crmState || 'SP'}`
    : `CRM-${EXEMPLO_MEDICO.crmState} ${EXEMPLO_MEDICO.crm}`;

  const displayPatientName = patientName
    ? patientName
    : (!isDoctorConfigured ? EXEMPLO_PACIENTE.name : 'Não identificado');

  // Atalho de Teclado Global: '/' ou 'Ctrl+K' / 'Cmd+K' para focar na busca rápida de fármacos
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isEditing = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Ctrl+K ou Cmd+K sempre foca na busca
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMobileSection('composer');
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setShowSuggestions(true);
        return;
      }

      // Tecla '/' foca na busca apenas quando o usuário não estiver editando outro input
      if (e.key === '/' && !isEditing) {
        e.preventDefault();
        setMobileSection('composer');
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setShowSuggestions(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Quick Posology text shortcuts
  const posologyShortcuts = [
    { label: '6/6h se dor/febre', text: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor ou febre.' },
    { label: '8/8h por 3-5 dias', text: 'Tomar 1 comprimido via oral de 8 em 8 horas após as refeições por 3 a 5 dias.' },
    { label: '1x ao dia (Manhã)', text: 'Tomar 1 comprimido via oral 1 vez ao dia, pela manhã.' },
    { label: '12/12h por 7-10 dias', text: 'Tomar 1 comprimido via oral de 12 em 12 horas durante 7 a 10 dias seguidos.' },
    { label: 'Uso Contínuo', text: 'Uso contínuo conforme orientação médica.' },
    { label: 'À noite ao deitar', text: 'Tomar 1 comprimido via oral à noite ao deitar.' },
    { label: 'Jejum 30min antes', text: 'Tomar 1 cápsula via oral pela manhã em jejum, 30 minutos antes do café da manhã.' }
  ];

  // Autocomplete suggestions (top 8)
  const searchSuggestions = useMemo(() => {
    const term = searchTerm.trim();
    if (!term || term.length < 2) return [];
    return searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, term, 'all').slice(0, 8);
  }, [searchTerm]);

  // Handler reutilizado para selecionar medicamento da base ou de tela externa
  const handleSelectMedication = (med: UnifiedMedication) => {
    setSelectedMedName(med.name);
    setSelectedRoute(med.route);
    setSelectedQuantity(med.defaultQuantity);
    setSelectedPosology(med.defaultPosology);
    setSelectedIsSpecial(Boolean(med.isSpecialControl));
    setSearchTerm('');
    setShowSuggestions(false);
  };

  // Consumir medicamento pendente vindo de outra tela
  useEffect(() => {
    if (medicamentoPendente) {
      handleSelectMedication(medicamentoPendente);
      onConsumirMedicamentoPendente?.();
    }
  }, [medicamentoPendente, onConsumirMedicamentoPendente]);

  // Add Item to Prescription
  const handleAddMedicationToPrescription = () => {
    if (!selectedMedName.trim()) {
      alert('Por favor, selecione ou digite o nome do medicamento.');
      return;
    }
    if (!selectedPosology.trim()) {
      alert('Por favor, informe a posologia / instruções de uso.');
      return;
    }

    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: selectedMedName.trim(),
      presentation: selectedQuantity || 'Uso oral',
      route: selectedRoute,
      quantity: selectedQuantity.trim() || '1 unidade',
      doseCalculatedText: '',
      frequencyText: selectedPosology.trim(),
      // Intervalo desconhecido: não gerar horários, para o documento não imprimir
      // uma grade que contradiga a posologia escrita.
      scheduleInterval: 'Conforme posologia',
      scheduleTimes: [],
      instructions: selectedPosology.trim(),
      isContinuous: selectedPosology.toLowerCase().includes('contínuo'),
      isSpecialControl: selectedIsSpecial
    };

    onUpdateItems([...items, newItem]);
    setItemAddedToast(true);
    setTimeout(() => setItemAddedToast(false), 2000);

    // Reset fields for next entry
    setSelectedMedName('');
    setSelectedQuantity('1 caixa');
    setSelectedPosology('');
    setSelectedIsSpecial(false);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    onUpdateItems(items.filter(i => i.id !== id));
  };

  // Move item up/down
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onUpdateItems(newItems);
  };

  // Copy prescription text
  const handleCopyText = () => {
    if (items.length === 0 || !medicoConfigurado(doctor)) return;
    const text = items.map((it, idx) => `${idx + 1}. ${it.name} (${it.route})\n   Qtd: ${it.quantity}\n   Posologia: ${it.instructions}\n`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Format prescription for WhatsApp
  const formatPrescriptionForWhatsApp = () => {
    if (items.length === 0) return '';
    const doctorLine = doctor?.name?.trim()
      ? `👨‍⚕️ *${doctor.name.trim()}* — CRM ${doctor.crm || '------'}/${doctor.crmState || 'SP'}\n`
      : '👨‍⚕️ *Receituário Médico*\n';
    const patientLine = patient?.name?.trim()
      ? `👤 *Paciente:* ${patient.name.trim()}${patient?.weightKg && patient.weightKg > 0 ? ` (${patient.weightKg} kg)` : ''}\n`
      : '';
    const dateLine = `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n`;

    let text = `📋 *RECEITUÁRIO MÉDICO DIGITAL*\n${doctorLine}${patientLine}${dateLine}------------------------------------\n`;

    items.forEach((it, idx) => {
      text += `\n*${idx + 1}. ${it.name}* (${it.route})\n   📦 *Qtd:* ${it.quantity}\n   👉 *Posologia:* ${it.instructions}\n`;
    });

    text += `\n------------------------------------\n⚠️ _Documento de orientação terapêutica emitido pelo médico. Siga as orientações e horários informados._`;
    return text;
  };

  // Open WhatsApp with formatted prescription
  const handleSendWhatsApp = () => {
    if (!medicoConfigurado(doctor)) return;
    const text = formatPrescriptionForWhatsApp();
    if (!text) {
      alert('Adicione pelo menos um medicamento à receita antes de enviar.');
      return;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Top Mobile View Switcher */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-xl bg-slate-200 dark:bg-navy-900 border border-slate-300 dark:border-navy-700">
        <button
          onClick={() => setMobileSection('composer')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-sky-500 ${
            mobileSection === 'composer'
              ? 'bg-navy-800 text-white shadow-tactile-btn'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Prescrever Medicamentos
        </button>
        <button
          onClick={() => setMobileSection('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-sky-500 ${
            mobileSection === 'preview'
              ? 'bg-navy-800 text-white shadow-tactile-btn'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Visualizar Receita ({items.length})
        </button>
      </div>

      {/* Main Grid: Left Controls & Right A4 Simulation */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Composer, Search and Prescribed Items */}
        <div className={`xl:col-span-7 space-y-5 ${mobileSection === 'preview' ? 'hidden md:block' : 'block'}`}>
          
          {/* Card: Identificação Rápida do Paciente (Sincronizado) */}
          <section className="card-surface rounded-2xl p-4 sm:p-5 space-y-3.5 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Icon name="person" className="text-blue-600 dark:text-blue-400 text-[20px]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Identificação do Paciente
                </h2>
                {patientName && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Sincronizado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {patientName && onClearPatient && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Deseja limpar os dados deste paciente e reiniciar a consulta atual para segurança clínica?')) {
                        onClearPatient();
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer transition p-1 rounded focus-visible:ring-2 focus-visible:ring-rose-500"
                    title="Limpar paciente e reiniciar consulta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Limpar Atendimento</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenPatientModal}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer p-1 rounded focus-visible:ring-2 focus-visible:ring-sky-500"
                  title="Abrir cadastro clínico detalhado"
                >
                  <span>Cadastro completo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label htmlFor="quick-patient-name" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Nome do Paciente *
                </label>
                <input
                  id="quick-patient-name"
                  type="text"
                  value={patient.name || ''}
                  onChange={(e) => onUpdatePatient({ ...patient, name: e.target.value })}
                  placeholder="Nome completo do paciente"
                  className="w-full px-3 py-2 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="quick-patient-doc" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  CPF / RG
                </label>
                <input
                  id="quick-patient-doc"
                  type="text"
                  value={patient.documentNumber || ''}
                  onChange={(e) => onUpdatePatient({ ...patient, documentNumber: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="quick-patient-weight" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Peso (kg)
                  </label>
                  {onNavigateToPediatricCalc && (
                    <button
                      type="button"
                      onClick={onNavigateToPediatricCalc}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Dose
                    </button>
                  )}
                </div>
                <input
                  id="quick-patient-weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={patient.weightKg > 0 ? patient.weightKg : ''}
                  onChange={(e) => onUpdatePatient({ ...patient, weightKg: parseFloat(e.target.value) || 0 })}
                  placeholder="Ex.: 14.5"
                  className="w-full px-3 py-2 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm"
                />
              </div>
            </div>
          </section>

          {/* Card: Prescrição */}
          <section className="card-surface rounded-2xl p-4 sm:p-5 mb-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Icon name="medication" className="text-blue-600 dark:text-blue-400 text-[22px]" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Prescrição
                </h2>
              </div>
            </div>

            {/* Campo de Busca Instantânea com Atalho de Teclado */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="med-search-input" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Fármaco ou princípio ativo
                </label>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  id="med-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Ex.: Dipirona 500 mg, Amoxicilina 500 mg, Losartana..."
                  className="w-full pl-9 pr-14 py-2.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus:border-blue-500 transition placeholder:text-[var(--text-placeholder)] shadow-tactile-sm font-semibold"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    aria-label="Limpar busca"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1 rounded focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-muted)] dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 hidden sm:block">
                    Ctrl+K
                  </kbd>
                )}

                {/* Suggestions Dropdown (Instant, No Blocker) */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl tactile-dropdown z-30 divide-y divide-slate-100 dark:divide-slate-800">
                    {searchSuggestions.map(med => (
                      <div
                        key={med.id}
                        onClick={() => handleSelectMedication(med)}
                        className="p-3 hover:bg-blue-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-2 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {med.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {med.defaultPosology}
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0">
                          {med.route}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form de Edição e Adição Direta */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
              <div>
                <label htmlFor="presc-farmaco-input" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Fármaco selecionado *
                </label>
                <div className="relative">
                  <input
                    id="presc-farmaco-input"
                    type="text"
                    value={selectedMedName}
                    onChange={(e) => setSelectedMedName(e.target.value)}
                    placeholder="Ex.: Dipirona 500 mg (ou selecione na busca acima)"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus:border-blue-500 transition shadow-tactile-sm ${
                      selectedMedName.trim()
                        ? 'border-emerald-500/60'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {selectedMedName.trim() && (
                    <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                  )}
                </div>
              </div>

              {/* Grid: 2 Colunas para Via e Apresentação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="presc-route-select" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Via de administração
                  </label>
                  <select
                    id="presc-route-select"
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-tactile-sm cursor-pointer"
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

                <div>
                  <label htmlFor="presc-quantity-input" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Quantidade / Apresentação
                  </label>
                  <input
                    id="presc-quantity-input"
                    type="text"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    placeholder="Ex.: 1 caixa, 2 frascos"
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-tactile-sm"
                  />
                </div>
              </div>

              {/* Posologia & Orientações */}
              <div>
                <label htmlFor="presc-posology-textarea" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Posologia e orientações ao paciente *
                </label>
                <textarea
                  id="presc-posology-textarea"
                  rows={3}
                  value={selectedPosology}
                  onChange={(e) => setSelectedPosology(e.target.value)}
                  placeholder="Ex.: Tomar 1 comprimido via oral a cada 8 horas se dor ou febre por até 5 dias..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-tactile-sm resize-none"
                />
              </div>

              {/* Atalhos Rápidos Discretos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-[var(--text-muted)] dark:text-slate-400 mr-1">Atalhos:</span>
                {posologyShortcuts.map((ps, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPosology(ps.text)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition active:scale-95 cursor-pointer shadow-tactile-sm focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    {ps.label}
                  </button>
                ))}
              </div>

              {/* Rodapé: Checkbox, Ação Pediátrica Secundária e Adicionar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedIsSpecial}
                    onChange={(e) => setSelectedIsSpecial(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Receita de Controle Especial (Notificação C)</span>
                </label>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {onNavigateToPediatricCalc && (
                    <button
                      type="button"
                      onClick={onNavigateToPediatricCalc}
                      className="btn-tactile-secondary w-full sm:w-auto px-3.5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-tactile-sm focus-visible:ring-2 focus-visible:ring-sky-500"
                      title="Abrir calculadora de doses pediátricas pelo peso"
                    >
                      <Icon name="scale" className="text-[16px] text-blue-600 dark:text-blue-400" />
                      <span>Calcular dose pelo peso</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleAddMedicationToPrescription}
                    className="btn-tactile-primary w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-tactile-btn shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    <span>Adicionar à Receita</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Card: Medicamentos prescritos */}
          <section className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-tactile dark:shadow-tactile-navy space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Medicamentos prescritos
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-navy-800 dark:bg-navy-700 text-white">
                  {items.length}
                </span>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearPrescription}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Limpar Receita</span>
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-navy-950 border border-dashed border-slate-300 dark:border-navy-800 text-[var(--text-muted)] dark:text-slate-400 text-xs italic">
                Nenhum medicamento adicionado ainda. Use a busca acima ou clique nos atalhos.
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start justify-between gap-3 shadow-tactile-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-navy-800 dark:bg-navy-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {it.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                          {it.route} • {it.quantity}
                        </span>
                        {it.isSpecialControl && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Controle Especial
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed font-medium">
                        {it.instructions}
                      </p>
                    </div>

                    {/* Action buttons (Move Up, Move Down, Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveItem(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500"
                        title="Mover para cima"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(idx, 'down')}
                        disabled={idx === items.length - 1}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500"
                        title="Mover para baixo"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.id)}
                        className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[var(--text-muted)] dark:text-slate-400 hover:text-rose-500 transition focus-visible:ring-2 focus-visible:ring-rose-500"
                        title="Remover medicamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Barra de Ações: visível apenas abaixo de xl (nunca duplicada) */}
            {items.length > 0 && (
              <div className="block xl:hidden pt-3 border-t border-slate-200 dark:border-slate-800">
                <AcoesDaReceita
                  itemsCount={items.length}
                  isMedicoConfigurado={isDoctorConfigured}
                  onNavigateToPrint={onNavigateToPrint}
                  onNavigateToEditor={onNavigateToEditor}
                  onSendWhatsApp={handleSendWhatsApp}
                  onCopyText={handleCopyText}
                  copiedSuccess={copiedSuccess}
                  onAbrirPerfilMedico={handleAbrirPerfilMedico}
                />
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Real-Time A4 Document Simulation (Tactile Sheet) */}
        <div className={`xl:col-span-5 space-y-4 ${mobileSection === 'composer' ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Visualização em tempo real (A4)
              </h3>
            </div>
            <button
              type="button"
              onClick={onNavigateToPrint}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <span>Abrir tela cheia</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Aviso de Prévia de Exemplo (fora da folha) */}
          {!isDoctorConfigured && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon name="warning" className="text-amber-600 dark:text-amber-400 text-[18px] shrink-0" />
                <span className="font-semibold">Prévia de exemplo: configure o médico para emitir.</span>
              </div>
              {handleAbrirPerfilMedico && (
                <button
                  type="button"
                  onClick={handleAbrirPerfilMedico}
                  className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] transition shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  Configurar médico
                </button>
              )}
            </div>
          )}

          {/* Printable Simulated A4 Sheet */}
          <div
            className={`prescription-sheet paper-sheet-floating p-6 sm:p-8 rounded-2xl min-h-[560px] flex flex-col justify-between text-left relative overflow-hidden transition ${
              !isDoctorConfigured ? 'no-print' : ''
            }`}
          >
            {/* Marca d'água diagonal "EXEMPLO" */}
            {!isDoctorConfigured && (
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden"
              >
                <span className="text-slate-300/40 text-7xl sm:text-8xl font-black tracking-widest uppercase transform -rotate-45">
                  EXEMPLO
                </span>
              </div>
            )}

            <div className="relative z-20">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                  {displayDoctorName}
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  {displayDoctorSpecialty} • {displayDoctorCRM}
                </p>
                {isDoctorConfigured && doctor?.clinicName && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {doctor.clinicName} {doctor?.address ? `• ${doctor.address}` : ''} {doctor?.phone ? `• Tel: ${doctor.phone}` : ''}
                  </p>
                )}
              </div>

              {/* Patient Info Bar */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-4 flex flex-wrap justify-between items-center text-xs text-slate-800">
                <div>
                  <span className="font-bold text-slate-500">Paciente:</span>
                  <span className="font-bold text-slate-900 ml-1">
                    {displayPatientName}
                  </span>
                </div>
                <div className="flex gap-3 text-[11px] text-slate-600 font-medium">
                  {patient?.ageText && <span>Idade: {patient.ageText}</span>}
                  {hasWeight && <span className="font-bold text-emerald-700">Peso: {patientWeight} kg</span>}
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center mb-4">
                <h3 className="serif-title text-sm font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 inline-block">
                  Receituário Médico
                </h3>
              </div>

              {/* Prescription Body Items */}
              {items.length === 0 ? (
                <div className="py-16 text-center text-slate-500 italic text-xs">
                  Nenhum medicamento inserido na receita.
                </div>
              ) : (
                <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                  {items.map((it, idx) => (
                    <div key={it.id} className="mb-3">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{idx + 1}. {it.name} ({it.route})</span>
                        <span className="text-[11px] font-semibold text-slate-600">{it.quantity}</span>
                      </div>
                      <p className="text-slate-700 pl-4 mt-0.5 leading-relaxed">
                        {it.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Footer (Date, Place & Signature Line) */}
            <div className="relative z-20 pt-6 mt-6 border-t border-slate-200 text-center space-y-3">
              <p className="text-[11px] text-slate-600">
                {doctor?.cityState || 'Brasil'}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              {doctor?.showSignature !== false && (
                <div className="pt-3 max-w-[240px] mx-auto border-t border-dashed border-slate-400">
                  <p className="text-xs font-bold text-slate-900">
                    {displayDoctorName}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {displayDoctorSignatureCRM}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: visível no desktop (xl), nunca duplicado com o cartão */}
          <div className="hidden xl:block">
            <AcoesDaReceita
              itemsCount={items.length}
              isMedicoConfigurado={isDoctorConfigured}
              onNavigateToPrint={onNavigateToPrint}
              onNavigateToEditor={onNavigateToEditor}
              onSendWhatsApp={handleSendWhatsApp}
              onCopyText={handleCopyText}
              copiedSuccess={copiedSuccess}
              onAbrirPerfilMedico={handleAbrirPerfilMedico}
            />
          </div>
        </div>

      </div>

      {/* Item Added Toast Alert */}
      {itemAddedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-tactile-lg animate-tab-fade"
        >
          <Check className="w-4 h-4" />
          <span>Medicamento inserido na receita com sucesso!</span>
        </div>
      )}

    </div>
  );
};
