import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PrescriptionItem, Patient, DoctorProfile, WorkContext } from '../types';
import { searchUnifiedMedicationsFuzzy } from '../utils/fuzzySearch';
import { UNIFIED_MEDICATIONS, UnifiedMedication } from '../data/medicationDatabase';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { classificarReceita, type RegimeReceita } from '../utils/isSpecialControlOrAntibiotic';
import { DOCUMENTO_DO_REGIME, separarPorRegime, type TipoDocumento } from '../utils/documentoClinico';
import { notificacaoExigida } from '../utils/notificacaoDeReceita';
import {
  calcularPrescricaoRapida,
  FrequenciaHorario,
  UnidadeDose,
  formatarUnidadeDose
} from '../utils/prescricaoRapida';
import { Icon } from './Icon';
import { ConfirmationModal } from './ConfirmationModal';
import { formatarReceitaCopiaTexto, formatarReceitaWhatsAppTexto } from '../utils/compartilhamentoTexto';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { usePrescriptionModels, type ConfirmActionState } from '../hooks/usePrescriptionModels';
import { PatientQuickCard } from './prescription/PatientQuickCard';
import { MedicationComposerCard } from './prescription/MedicationComposerCard';
import { PrescribedItemsList } from './prescription/PrescribedItemsList';
import { PrescriptionModelsModal } from './prescription/PrescriptionModelsModal';
import { PrescriptionPreviewColumn } from './prescription/PrescriptionPreviewColumn';

const REGIMES: RegimeReceita[] = ['simples', 'antimicrobiano', 'controle_especial'];

/**
 * Resolve de forma determinística a ação de teclado no combobox de medicamentos (#med-search-input).
 * Garante que pressionar Enter sem ter navegado com as setas (highlightedIndex === -1)
 * nunca sobrescreva um medicamento manipulado/personalizado com uma sugestão aproximada do catálogo.
 */
export function resolveMedicationKeyAction(
  key: string,
  showSuggestions: boolean,
  suggestions: UnifiedMedication[],
  highlightedIndex: number,
  typedName: string
):
  | { type: 'none' }
  | { type: 'highlight'; nextIndex: number }
  | { type: 'select'; medication: UnifiedMedication }
  | { type: 'dismiss' } {
  if (!showSuggestions || suggestions.length === 0) {
    return { type: 'none' };
  }

  if (key === 'ArrowDown') {
    const nextIndex = highlightedIndex < 0 ? 0 : (highlightedIndex + 1) % suggestions.length;
    return { type: 'highlight', nextIndex };
  }

  if (key === 'ArrowUp') {
    const nextIndex = highlightedIndex <= 0 ? suggestions.length - 1 : highlightedIndex - 1;
    return { type: 'highlight', nextIndex };
  }

  if (key === 'Escape') {
    return { type: 'dismiss' };
  }

  if (key === 'Enter') {
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      return { type: 'select', medication: suggestions[highlightedIndex] };
    }
    const cleanTyped = typedName.trim().toLowerCase();
    const exactMatch = suggestions.find((m) => m.name.trim().toLowerCase() === cleanTyped);
    if (exactMatch) {
      return { type: 'select', medication: exactMatch };
    }
    return { type: 'dismiss' };
  }

  return { type: 'none' };
}

/** Como cada tipo de receita é apresentado na tela e no texto compartilhado. */
const REGIME_INFO: Record<RegimeReceita, { rotulo: string; detalhe: string; tituloTexto: string }> = {
  simples: {
    rotulo: 'Simples',
    detalhe: '1 via',
    tituloTexto: 'RECEITUÁRIO MÉDICO'
  },
  antimicrobiano: {
    rotulo: 'Antimicrobiano',
    detalhe: '2 vias • válida por 10 dias • a farmácia retém a 2ª via',
    tituloTexto: 'RECEITUÁRIO MÉDICO — ANTIMICROBIANO (2 vias • válida por 10 dias)'
  },
  controle_especial: {
    rotulo: 'Controle especial',
    detalhe: '2 vias • a farmácia retém a 1ª via',
    tituloTexto: 'RECEITUÁRIO DE CONTROLE ESPECIAL (2 vias • retenção na farmácia)'
  }
};

interface PrescriptionBuilderProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  onUpdateDoctor?: (doctor: DoctorProfile) => void;
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  activeContext?: WorkContext | null;
  items: PrescriptionItem[];
  onUpdateItems: (items: PrescriptionItem[]) => void;
  weightCalcEnabled?: boolean;
  onToggleWeightCalc?: (enabled: boolean) => void;
  onClearPrescription?: () => void;
  onClearPatient?: () => void;
  onNavigateToPrint: (docType?: TipoDocumento) => void;
  onNavigateToPediatricCalc?: () => void;
  onNavigateToEditor?: () => void;
  onNavigateToCertificate?: () => void;
  onNavigateToReferral?: () => void;
  onNavigateToExams?: () => void;
  onNavigateToSus?: () => void;
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
  activeContext = null,
  items,
  onUpdateItems,
  onClearPrescription,
  onClearPatient,
  onNavigateToPrint,
  onNavigateToEditor,
  onNavigateToCertificate,
  onNavigateToReferral,
  onNavigateToExams,
  onNavigateToSus,
  onOpenDoctorModal,
  onOpenPatientModal,
  medicamentoPendente,
  onConsumirMedicamentoPendente,
  onAbrirPerfilMedico
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pediatricDrawerRef = useRef<HTMLDivElement>(null);

  // Mobile active tab ('composer' | 'preview')
  const [mobileSection, setMobileSection] = useState<'composer' | 'preview'>('composer');

  // Autocomplete dropdown control
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState<number>(-1);

  // Active form fields for adding/editing
  const [selectedMedName, setSelectedMedName] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('Uso Oral');
  const [selectedQuantity, setSelectedQuantity] = useState('30 comprimidos');
  const [selectedPosology, setSelectedPosology] = useState('');
  const [selectedRegime, setSelectedRegime] = useState<RegimeReceita>('simples');

  // Estados do Construtor Rápido de Prescrição (Dose, Unidade, Frequência, Duração)
  const [doseAmount, setDoseAmount] = useState<number>(1);
  const [doseUnit, setDoseUnit] = useState<UnidadeDose>('comprimido');
  const [doseFrequency, setDoseFrequency] = useState<FrequenciaHorario>('8/8h');
  const [doseDays, setDoseDays] = useState<number>(5);
  const [isContinuousDose, setIsContinuousDose] = useState<boolean>(false);

  // Estado para edição direta de medicamento existente na receita
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Feedbacks
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [itemAddedToast, setItemAddedToast] = useState(false);
  const [isPediatricDrawerOpen, setIsPediatricDrawerOpen] = useState(false);

  useModalAccessibility({
    isOpen: isPediatricDrawerOpen,
    onClose: () => setIsPediatricDrawerOpen(false),
    containerRef: pediatricDrawerRef,
  });

  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);

  const {
    isSaveModelModalOpen,
    setIsSaveModelModalOpen,
    isLoadModelModalOpen,
    setIsLoadModelModalOpen,
    newModelName,
    setNewModelName,
    savedPrescriptionModels,
    prescriptionModelToast,
    showNotice,
    isCreatingCustomModel,
    setIsCreatingCustomModel,
    customModelDraftTitle,
    setCustomModelDraftTitle,
    customModelDraftItems,
    setCustomModelDraftItems,
    customModelSearchTerm,
    setCustomModelSearchTerm,
    customModelSuggestions,
    loadPrescriptionModels,
    handleCustomModelSearchChange,
    handleAddCustomModelItem,
    handleRemoveCustomModelItem,
    handleUpdateCustomModelItem,
    handleSaveCustomCreatedModel,
    handleSavePrescriptionModel,
    handleApplyPrescriptionModel,
    handleDeletePrescriptionModel,
  } = usePrescriptionModels({
    items,
    onUpdateItems,
    setConfirmAction,
  });

  // Controle de expansão de dados extras do paciente (CPF e Peso)
  const [showExtraPatientFields, setShowExtraPatientFields] = useState(() => {
    return Boolean((patient?.documentNumber && patient.documentNumber.trim()) || (patient?.weightKg && patient.weightKg > 0));
  });

  const patientName = patient?.name?.trim() || '';

  // Cada regime sanitário sai em um documento próprio (simples, antimicrobiano, controle especial)
  const porRegime = useMemo(() => separarPorRegime(items), [items]);
  const regimesComItens = REGIMES.filter((regime) => porRegime[regime].length > 0);
  const itensEmDuasVias = porRegime.antimicrobiano.length + porRegime.controle_especial.length;

  // Folha mostrada na bancada: a escolhida pelo médico ou, por padrão, a primeira receita com itens
  const [previewRegime, setPreviewRegime] = useState<RegimeReceita | null>(null);
  const regimeAtivo: RegimeReceita =
    previewRegime && porRegime[previewRegime].length > 0 ? previewRegime : (regimesComItens[0] ?? 'simples');
  const itemsInPreview = porRegime[regimeAtivo];

  const handlePrintClick = () => onNavigateToPrint(DOCUMENTO_DO_REGIME[regimeAtivo]);

  // Medicamento em digitação que só é dispensado com Notificação de Receita (talonário próprio)
  const notificacaoDoFormulario = notificacaoExigida(selectedMedName);

  const isDoctorConfigured = medicoConfigurado(doctor);
  const handleAbrirPerfilMedico = onAbrirPerfilMedico || onOpenDoctorModal;

  // Atalhos de Teclado Globais: '/' e 'Ctrl+K' para busca (Escape e Focus Trap de modais/drawers gerenciados por useModalAccessibility)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Não intercepta atalhos de busca se houver qualquer modal/drawer aberto (ex.: Command Palette Ctrl+K)
      if (document.querySelector('[role="dialog"], [aria-modal="true"]')) {
        return;
      }

      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isEditing =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;

      // Ctrl+K seleciona o texto do campo de fármaco quando ele já está focado com texto (caso contrário o useNavigationSync abre a Command Palette global)
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        if (document.activeElement === searchInputRef.current && searchInputRef.current?.value.trim()) {
          e.preventDefault();
          searchInputRef.current.select();
          setShowSuggestions(true);
        }
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

  // Autocomplete suggestions (top 8)
  const searchSuggestions = useMemo(() => {
    const term = selectedMedName.trim();
    if (!term || term.length < 2) return [];
    return searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, term, 'all').slice(0, 8);
  }, [selectedMedName]);

  // Aplica o cálculo rápido da posologia e quantidade total de comprimidos
  const handleAtualizarConstrutor = (
    novoDose: number,
    novoUnit: UnidadeDose,
    novoFreq: FrequenciaHorario,
    novoDays: number,
    novoContinuo: boolean,
    viaAtual: string = selectedRoute
  ) => {
    setDoseAmount(novoDose);
    setDoseUnit(novoUnit);
    setDoseFrequency(novoFreq);
    setDoseDays(novoDays);
    setIsContinuousDose(novoContinuo);

    const res = calcularPrescricaoRapida({
      dose: novoDose,
      unidade: novoUnit,
      frequencia: novoFreq,
      diasTratamento: novoDays,
      usoContinuo: novoContinuo,
      via: viaAtual
    });

    setSelectedPosology(res.posologiaTexto);
    setSelectedQuantity(res.quantidadeTotalTexto);
  };

  // Handler reutilizado para selecionar medicamento da base ou de tela externa
  const handleSelectMedication = (med: UnifiedMedication) => {
    setSelectedMedName(med.name);
    setSelectedRoute(med.route);
    const qtdInicial = med.defaultQuantity || '30 comprimidos';
    setSelectedQuantity(qtdInicial);
    setSelectedPosology(med.defaultPosology);
    setSelectedRegime(classificarReceita(med));

    // Deduzir forma da dose para o modo ágil de prescrição
    const lower = med.name.toLowerCase();
    let unit: UnidadeDose = 'comprimido';
    if (lower.includes('cáps') || lower.includes('caps')) unit = 'cápsula';
    else if (lower.includes('gotas') || lower.includes('gota')) unit = 'gota';
    else if (lower.includes('xarope') || lower.includes('suspens') || lower.includes('/ml')) unit = 'mL';
    else if (lower.includes('sachê') || lower.includes('sache') || lower.includes('envelope')) unit = 'sachê';
    else if (lower.includes('ampola')) unit = 'ampola';
    else if (lower.includes('spray') || lower.includes('jato')) unit = 'jato';
    else if (lower.includes('pomada') || lower.includes('creme') || lower.includes('gel')) unit = 'aplicação';
    setDoseUnit(unit);

    setShowSuggestions(false);
    setHighlightedSuggestionIndex(-1);
  };

  // Navegação fluida por teclado na lista de medicamentos sem sobrescrever medicamentos livres
  const handleMedInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const action = resolveMedicationKeyAction(
      e.key,
      showSuggestions,
      searchSuggestions,
      highlightedSuggestionIndex,
      selectedMedName
    );

    if (action.type === 'highlight') {
      e.preventDefault();
      setHighlightedSuggestionIndex(action.nextIndex);
      return;
    }

    if (action.type === 'select') {
      e.preventDefault();
      handleSelectMedication(action.medication);
      return;
    }

    if (action.type === 'dismiss') {
      e.preventDefault();
      setShowSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  // Detecção automática do regime de receita pelo nome do medicamento
  useEffect(() => {
    setSelectedRegime(classificarReceita(selectedMedName));
  }, [selectedMedName]);

  // Consumir medicamento pendente vindo de outra tela
  useEffect(() => {
    if (medicamentoPendente) {
      handleSelectMedication(medicamentoPendente);
      onConsumirMedicamentoPendente?.();
    }
  }, [medicamentoPendente, onConsumirMedicamentoPendente]);

  // Iniciar edição direta de um medicamento já inserido na receita
  const handleStartEdit = (item: PrescriptionItem) => {
    setEditingItemId(item.id);
    setSelectedMedName(item.name);
    setSelectedRoute(item.route);
    setSelectedQuantity(item.quantity);
    setSelectedPosology(item.instructions);
    setSelectedRegime(classificarReceita(item));

    const lower = item.name.toLowerCase();
    let unit: UnidadeDose = 'comprimido';
    if (lower.includes('cáps') || lower.includes('caps')) unit = 'cápsula';
    else if (lower.includes('gotas') || lower.includes('gota')) unit = 'gota';
    else if (lower.includes('xarope') || lower.includes('suspens') || lower.includes('/ml')) unit = 'mL';
    else if (lower.includes('sachê') || lower.includes('sache') || lower.includes('envelope')) unit = 'sachê';
    else if (lower.includes('ampola')) unit = 'ampola';
    else if (lower.includes('spray') || lower.includes('jato')) unit = 'jato';
    else if (lower.includes('pomada') || lower.includes('creme') || lower.includes('gel')) unit = 'aplicação';
    setDoseUnit(unit);

    if (searchInputRef.current) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      searchInputRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setSelectedMedName('');
    setSelectedQuantity('30 comprimidos');
    setSelectedPosology('');
    setSelectedRegime('simples');
    setDoseAmount(1);
    setDoseUnit('comprimido');
    setDoseFrequency('8/8h');
    setDoseDays(5);
    setIsContinuousDose(false);
  };

  // Add Item to Prescription or Update existing item
  const handleAddMedicationToPrescription = () => {
    if (!selectedMedName.trim()) {
      showNotice('Por favor, informe o nome do medicamento.');
      return;
    }

    const posologiaFinal =
      selectedPosology.trim() ||
      calcularPrescricaoRapida({
        dose: doseAmount,
        unidade: doseUnit,
        frequencia: doseFrequency,
        diasTratamento: doseDays,
        usoContinuo: isContinuousDose,
        via: selectedRoute
      }).posologiaTexto;

    // Classificação automática do tipo de receita pelo medicamento
    const regime: RegimeReceita = classificarReceita(selectedMedName);

    if (editingItemId) {
      const updatedItems = items.map(it => {
        if (it.id === editingItemId) {
          return {
            ...it,
            name: selectedMedName.trim(),
            presentation: doseUnit || it.presentation || 'comprimido',
            route: selectedRoute,
            quantity: selectedQuantity.trim() || '30 comprimidos',
            doseCalculatedText: `${doseAmount} ${formatarUnidadeDose(doseUnit, doseAmount)}`,
            frequencyText: posologiaFinal,
            scheduleInterval: doseFrequency,
            instructions: posologiaFinal,
            isContinuous: isContinuousDose || posologiaFinal.toLowerCase().includes('contínuo'),
            isSpecialControl: regime !== 'simples',
            regimeReceita: regime
          };
        }
        return it;
      });

      onUpdateItems(updatedItems);
      setEditingItemId(null);
      setPreviewRegime(regime);
      setItemAddedToast(true);
      setTimeout(() => setItemAddedToast(false), 2000);

      // Reset fields
      setSelectedMedName('');
      setSelectedQuantity('30 comprimidos');
      setSelectedPosology('');
      setSelectedRegime('simples');
      setDoseAmount(1);
      setDoseUnit('comprimido');
      setDoseFrequency('8/8h');
      setDoseDays(5);
      setIsContinuousDose(false);
      return;
    }

    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: selectedMedName.trim(),
      presentation: doseUnit || 'comprimido',
      route: selectedRoute,
      quantity: selectedQuantity.trim() || '30 comprimidos',
      doseCalculatedText: `${doseAmount} ${formatarUnidadeDose(doseUnit, doseAmount)}`,
      frequencyText: posologiaFinal,
      scheduleInterval: doseFrequency,
      scheduleTimes: [],
      instructions: posologiaFinal,
      isContinuous: isContinuousDose || posologiaFinal.toLowerCase().includes('contínuo'),
      isSpecialControl: regime !== 'simples',
      regimeReceita: regime
    };

    onUpdateItems([...items, newItem]);
    setPreviewRegime(regime);
    setItemAddedToast(true);
    setTimeout(() => setItemAddedToast(false), 2000);

    // Reset fields for next entry (sem caixa ou frasco desnecessário)
    setSelectedMedName('');
    setSelectedQuantity('30 comprimidos');
    setSelectedPosology('');
    setSelectedRegime('simples');
    setDoseAmount(1);
    setDoseUnit('comprimido');
    setDoseFrequency('8/8h');
    setDoseDays(5);
    setIsContinuousDose(false);
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
    const text = formatarReceitaCopiaTexto(items, regimesComItens, porRegime);
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Format prescription for WhatsApp
  const formatPrescriptionForWhatsApp = () =>
    formatarReceitaWhatsAppTexto({ items, regimesComItens, porRegime, doctor, patient });

  // Open WhatsApp with formatted prescription
  const handleSendWhatsApp = () => {
    if (!medicoConfigurado(doctor)) return;
    const text = formatPrescriptionForWhatsApp();
    if (!text) {
      showNotice('Adicione pelo menos um medicamento à receita antes de enviar.');
      return;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div data-state="idle" aria-busy={false} className="w-full max-w-7xl mx-auto space-y-5 surface-raised">
      
      {/* Top Mobile View Switcher em Trilho Segmentado Esculpido */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-2xl nav-segmented-track gap-1">
        <button
          type="button"
          onClick={() => setMobileSection('composer')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
            mobileSection === 'composer'
              ? 'nav-segmented-pill-active font-bold'
              : 'text-[var(--text-secondary)] font-semibold'
          }`}
        >
          <Icon name="medication" size={15} filled={mobileSection === 'composer'} className={mobileSection === 'composer' ? 'text-sky-600 dark:text-sky-400' : 'opacity-70'} />
          <span>Prescrever medicamentos</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('preview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer clinical-tabular-nums ${
            mobileSection === 'preview'
              ? 'nav-segmented-pill-active font-bold'
              : 'text-[var(--text-secondary)] font-semibold'
          }`}
        >
          <Icon name="description" size={15} filled={mobileSection === 'preview'} className={mobileSection === 'preview' ? 'text-sky-600 dark:text-sky-400' : 'opacity-70'} />
          <span>Visualizar receita ({items.length})</span>
        </button>
      </div>

      {/* Main Grid: Left Controls & Right A4 Simulation */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-5 items-start">
        
        {/* LEFT COLUMN: Composer, Search and Prescribed Items */}
        <div className={`xl:col-span-7 space-y-4 ${mobileSection === 'preview' ? 'hidden md:block' : 'block'}`}>
          
          {/* Card 1: Identificação rápida do paciente */}
          <PatientQuickCard
            patient={patient}
            showExtraPatientFields={showExtraPatientFields}
            onToggleExtraFields={() => setShowExtraPatientFields((prev) => !prev)}
            onUpdatePatient={onUpdatePatient}
            onOpenPatientModal={onOpenPatientModal}
            onRequestClearPatient={
              patientName && onClearPatient
                ? () => {
                    setConfirmAction({
                      title: 'Limpar atendimento e paciente?',
                      description: 'Deseja limpar os dados deste paciente e reiniciar a consulta atual para segurança clínica?',
                      confirmLabel: 'Limpar atendimento',
                      onConfirm: () => {
                        setConfirmAction(null);
                        onClearPatient();
                      }
                    });
                  }
                : undefined
            }
            onNavigateToCertificate={onNavigateToCertificate}
            onNavigateToReferral={onNavigateToReferral}
            onNavigateToExams={onNavigateToExams}
            onNavigateToSus={onNavigateToSus}
          />

          {/* Card 2: Prescrição (Unificado e Minimalista) */}
          <MedicationComposerCard
            searchInputRef={searchInputRef}
            editingItemId={editingItemId}
            selectedMedName={selectedMedName}
            selectedRoute={selectedRoute}
            selectedQuantity={selectedQuantity}
            selectedPosology={selectedPosology}
            selectedRegime={selectedRegime}
            doseAmount={doseAmount}
            doseUnit={doseUnit}
            doseFrequency={doseFrequency}
            doseDays={doseDays}
            isContinuousDose={isContinuousDose}
            showSuggestions={showSuggestions}
            highlightedSuggestionIndex={highlightedSuggestionIndex}
            searchSuggestions={searchSuggestions}
            notificacaoDoFormulario={notificacaoDoFormulario}
            regimeLabels={REGIME_INFO}
            onOpenPediatricDrawer={() => setIsPediatricDrawerOpen(true)}
            onCancelEdit={handleCancelEdit}
            onMedNameChange={(val) => {
              setSelectedMedName(val);
              setShowSuggestions(true);
              setHighlightedSuggestionIndex(-1);
            }}
            onFocusSearch={() => setShowSuggestions(true)}
            onBlurSearch={() => setShowSuggestions(false)}
            onMedInputKeyDown={handleMedInputKeyDown}
            onClearMedication={() => {
              setSelectedMedName('');
              setShowSuggestions(false);
              setHighlightedSuggestionIndex(-1);
              searchInputRef.current?.focus();
            }}
            onSelectMedication={handleSelectMedication}
            onHighlightSuggestion={setHighlightedSuggestionIndex}
            onAtualizarConstrutor={handleAtualizarConstrutor}
            onChangeRoute={setSelectedRoute}
            onChangeQuantity={setSelectedQuantity}
            onChangePosology={setSelectedPosology}
            onSubmitMedication={handleAddMedicationToPrescription}
          />

          {/* Card 3: Medicamentos prescritos */}
          <PrescribedItemsList
            items={items}
            editingItemId={editingItemId}
            regimesComItens={regimesComItens}
            porRegime={porRegime}
            itensEmDuasVias={itensEmDuasVias}
            regimeLabels={REGIME_INFO}
            savedModelsCount={savedPrescriptionModels.length}
            isDoctorConfigured={isDoctorConfigured}
            copiedSuccess={copiedSuccess}
            onOpenModelsModal={() => {
              loadPrescriptionModels();
              setIsLoadModelModalOpen(true);
            }}
            onOpenSaveModelModal={() => {
              setNewModelName('');
              setIsSaveModelModalOpen(true);
            }}
            onOpenCreateCustomModel={() => {
              setIsCreatingCustomModel(true);
              setCustomModelDraftTitle('');
              setCustomModelDraftItems([]);
              setIsLoadModelModalOpen(true);
            }}
            onClearPrescription={onClearPrescription}
            onStartEdit={handleStartEdit}
            onMoveItem={handleMoveItem}
            onRemoveItem={handleRemoveItem}
            onNavigateToPrint={handlePrintClick}
            onNavigateToEditor={onNavigateToEditor}
            onSendWhatsApp={handleSendWhatsApp}
            onCopyText={handleCopyText}
            onAbrirPerfilMedico={handleAbrirPerfilMedico}
          />
        </div>

        {/* RIGHT COLUMN: Real-Time A4 Document Simulation (Sticky Tactile Sheet) + Pediatric Drawer */}
        <PrescriptionPreviewColumn
          darkMode={_darkMode}
          mobileSection={mobileSection}
          isDoctorConfigured={isDoctorConfigured}
          porRegime={porRegime}
          regimesComItens={regimesComItens}
          regimeAtivo={regimeAtivo}
          itemsInPreview={itemsInPreview}
          itemsCount={items.length}
          regimeLabels={REGIME_INFO}
          doctor={doctor}
          patient={patient}
          activeContext={activeContext}
          copiedSuccess={copiedSuccess}
          isPediatricDrawerOpen={isPediatricDrawerOpen}
          pediatricDrawerRef={pediatricDrawerRef}
          onSelectPreviewRegime={setPreviewRegime}
          onNavigateToPrint={handlePrintClick}
          onNavigateToEditor={onNavigateToEditor}
          onSendWhatsApp={handleSendWhatsApp}
          onCopyText={handleCopyText}
          onAbrirPerfilMedico={handleAbrirPerfilMedico}
          onClosePediatricDrawer={() => setIsPediatricDrawerOpen(false)}
          onUpdatePatientWeight={(newWeight) => onUpdatePatient({ ...patient, weightKg: newWeight })}
          onAddPediatricItem={(item) => {
            onUpdateItems([...items, item]);
            setItemAddedToast(true);
            setTimeout(() => setItemAddedToast(false), 2500);
          }}
        />

      </div>

      {/* Item Added Toast Alert */}
      {itemAddedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-tactile-lg animate-tab-fade"
        >
          <Icon name="check" className="text-[16px]" />
          <span>Medicamento inserido na receita com sucesso!</span>
        </div>
      )}
      {/* Toast de Notificação de Modelo de Receita */}
      {prescriptionModelToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-tactile-lg text-xs font-semibold flex items-center gap-2 border border-strong animate-tab-fade"
        >
          <Icon name="check" className="text-[16px] text-emerald-400" />
          <span>{prescriptionModelToast}</span>
        </div>
      )}

      {/* Modais Desacoplados de Biblioteca e Criação de Modelos de Receita */}
      <PrescriptionModelsModal
        isSaveModelModalOpen={isSaveModelModalOpen}
        isLoadModelModalOpen={isLoadModelModalOpen}
        isCreatingCustomModel={isCreatingCustomModel}
        items={items}
        newModelName={newModelName}
        savedPrescriptionModels={savedPrescriptionModels}
        customModelDraftTitle={customModelDraftTitle}
        customModelDraftItems={customModelDraftItems}
        customModelSearchTerm={customModelSearchTerm}
        customModelSuggestions={customModelSuggestions}
        onChangeNewModelName={setNewModelName}
        onSavePrescriptionModel={handleSavePrescriptionModel}
        onCloseSaveModelModal={() => setIsSaveModelModalOpen(false)}
        onCloseLoadModelModal={() => {
          setIsLoadModelModalOpen(false);
          setIsCreatingCustomModel(false);
        }}
        onStartCreateCustomModel={() => {
          setIsCreatingCustomModel(true);
          setCustomModelDraftTitle('');
          setCustomModelDraftItems([]);
          setCustomModelSearchTerm('');
        }}
        onExitCreateCustomModel={() => setIsCreatingCustomModel(false)}
        onChangeCustomModelDraftTitle={setCustomModelDraftTitle}
        onCustomModelSearchChange={handleCustomModelSearchChange}
        onAddCustomModelItem={handleAddCustomModelItem}
        onRemoveCustomModelItem={handleRemoveCustomModelItem}
        onUpdateCustomModelItem={handleUpdateCustomModelItem}
        onSaveCustomCreatedModel={handleSaveCustomCreatedModel}
        onApplyPrescriptionModel={handleApplyPrescriptionModel}
        onDeletePrescriptionModel={handleDeletePrescriptionModel}
      />

      <ConfirmationModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Confirmar'}
        cancelLabel="Cancelar"
        variant="danger"
        darkMode={_darkMode}
        onConfirm={() => confirmAction?.onConfirm()}
        onCancel={() => setConfirmAction(null)}
      />

    </div>
  );
};
