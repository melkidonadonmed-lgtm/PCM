import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PrescriptionItem, Patient, DoctorProfile, WorkContext } from '../types';
import { db, SavedDocument } from '../services/db';
import { searchUnifiedMedicationsFuzzy } from '../utils/fuzzySearch';
import { UNIFIED_MEDICATIONS, UnifiedMedication } from '../data/medicationDatabase';
import { PRESET_CLINICAL_TEMPLATES } from '../data/presetClinicalTemplates';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { classificarReceita, type RegimeReceita } from '../utils/isSpecialControlOrAntibiotic';
import { DOCUMENTO_DO_REGIME, separarPorRegime, type TipoDocumento } from '../utils/documentoClinico';
import { descreverNotificacao, notificacaoExigida } from '../utils/notificacaoDeReceita';
import {
  calcularPrescricaoRapida,
  FrequenciaHorario,
  UnidadeDose,
  formatarUnidadeDose
} from '../utils/prescricaoRapida';
import { FolhaA4 } from './documento/FolhaA4';
import { DocumentoClinico } from './documento/DocumentoClinico';
import { Icon } from './Icon';
import { AcoesDaReceita } from './AcoesDaReceita';
import { AvisoNotificacaoReceita } from './AvisoNotificacaoReceita';
import { PediatricCalculator } from './PediatricCalculator';
import { ConfirmationModal } from './ConfirmationModal';
import { formatarReceitaCopiaTexto, formatarReceitaWhatsAppTexto } from '../utils/compartilhamentoTexto';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { PatientQuickCard } from './prescription/PatientQuickCard';
import { PrescribedItemsList } from './prescription/PrescribedItemsList';
import { PrescriptionModelsModal } from './prescription/PrescriptionModelsModal';

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

  // Modelos de Prescrição Salvos
  const [isSaveModelModalOpen, setIsSaveModelModalOpen] = useState(false);
  const [isLoadModelModalOpen, setIsLoadModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [savedPrescriptionModels, setSavedPrescriptionModels] = useState<SavedDocument[]>([]);
  const [prescriptionModelToast, setPrescriptionModelToast] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const showNotice = useCallback((msg: string) => {
    setPrescriptionModelToast(msg);
    setTimeout(() => setPrescriptionModelToast(null), 3000);
  }, []);

  // Estado para criar modelo diretamente sem precisar gerar receita na consulta
  const [isCreatingCustomModel, setIsCreatingCustomModel] = useState(false);
  const [customModelDraftTitle, setCustomModelDraftTitle] = useState('');
  const [customModelDraftItems, setCustomModelDraftItems] = useState<PrescriptionItem[]>([]);
  const [customModelSearchTerm, setCustomModelSearchTerm] = useState('');
  const [customModelSuggestions, setCustomModelSuggestions] = useState<UnifiedMedication[]>([]);

  const handleCustomModelSearchChange = (term: string) => {
    setCustomModelSearchTerm(term);
    if (!term || term.trim().length < 2) {
      setCustomModelSuggestions([]);
    } else {
      const matches = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, term, 'all').slice(0, 6);
      setCustomModelSuggestions(matches);
    }
  };

  const handleAddCustomModelItem = (med: UnifiedMedication) => {
    const newItem: PrescriptionItem = {
      id: `draft-rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: med.name,
      presentation: med.route || 'Uso Oral',
      quantity: med.defaultQuantity || '1 caixa',
      doseCalculatedText: '1 dose',
      frequencyText: 'Conforme posologia',
      instructions: med.defaultPosology || 'Tomar conforme orientação médica.',
      route: med.route || 'Uso Oral',
      scheduleInterval: 'Conforme posologia',
      scheduleTimes: [],
      isContinuous: false,
      isSpecialControl: med.isSpecialControl || false
    };
    setCustomModelDraftItems(prev => [...prev, newItem]);
    setCustomModelSearchTerm('');
    setCustomModelSuggestions([]);
  };

  const handleRemoveCustomModelItem = (id: string) => {
    setCustomModelDraftItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateCustomModelItem = (id: string, updates: Partial<PrescriptionItem>) => {
    setCustomModelDraftItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const loadPrescriptionModels = useCallback(async () => {
    try {
      const allDocs = await db.savedDocuments.toArray();
      const models = allDocs.filter(d => {
        if (!d.isTemplate) return false;
        if (d.prescriptionItems && d.prescriptionItems.length > 0) return true;
        if (d.contentHtml) {
          const parsed = parsePrescriptionHtmlToItems(d.contentHtml);
          if (parsed && parsed.length > 0) {
            d.prescriptionItems = parsed;
            return true;
          }
        }
        return false;
      });

      // Também inclui os presets de presetClinicalTemplates se não estiverem no banco
      PRESET_CLINICAL_TEMPLATES.forEach(preset => {
        if (preset.prescriptionItems && preset.prescriptionItems.length > 0) {
          if (!models.some(m => m.id === preset.id)) {
            models.push(preset);
          }
        }
      });

      setSavedPrescriptionModels(models.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    } catch (err) {
      console.error('Erro ao carregar modelos de receita:', err);
    }
  }, []);

  useEffect(() => {
    loadPrescriptionModels();
  }, [loadPrescriptionModels]);

  const handleSaveCustomCreatedModel = async () => {
    if (!customModelDraftTitle.trim() || customModelDraftItems.length === 0) return;
    const docId = `rx-model-${Date.now()}`;
    const newDoc: SavedDocument = {
      id: docId,
      title: customModelDraftTitle.trim(),
      contentJson: null,
      contentHtml: '',
      contextId: 'general',
      isTemplate: true,
      prescriptionItems: [...customModelDraftItems],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    try {
      await db.savedDocuments.put(newDoc);
      await loadPrescriptionModels();
      setIsCreatingCustomModel(false);
      setCustomModelDraftTitle('');
      setCustomModelDraftItems([]);
      showNotice(`Modelo "${newDoc.title}" criado e salvo com sucesso!`);
    } catch (err) {
      console.error('Erro ao salvar modelo criado:', err);
      showNotice('Falha ao salvar modelo no banco local.');
    }
  };

  const handleSavePrescriptionModel = async () => {
    if (!newModelName.trim() || items.length === 0) return;
    const docId = `rx-model-${Date.now()}`;
    const newDoc: SavedDocument = {
      id: docId,
      title: newModelName.trim(),
      contentJson: null,
      contentHtml: '',
      contextId: 'general',
      isTemplate: true,
      prescriptionItems: [...items],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.savedDocuments.put(newDoc);
    setIsSaveModelModalOpen(false);
    setNewModelName('');
    showNotice(`Modelo "${newDoc.title}" salvo com sucesso!`);
    loadPrescriptionModels();
  };

  const handleApplyPrescriptionModel = (model: SavedDocument, mode: 'replace' | 'append') => {
    if (!model.prescriptionItems || model.prescriptionItems.length === 0) return;
    if (mode === 'replace') {
      onUpdateItems([...model.prescriptionItems]);
      showNotice(`Modelo "${model.title}" aplicado na receita!`);
    } else {
      onUpdateItems([...items, ...model.prescriptionItems]);
      showNotice(`Medicamentos do modelo "${model.title}" adicionados à receita!`);
    }
    setIsLoadModelModalOpen(false);
  };

  const handleDeletePrescriptionModel = (modelId: string, modelTitle: string) => {
    setConfirmAction({
      title: 'Excluir modelo de receita?',
      description: `Deseja realmente excluir o modelo "${modelTitle}" do banco local?`,
      confirmLabel: 'Excluir modelo',
      onConfirm: async () => {
        setConfirmAction(null);
        await db.savedDocuments.delete(modelId);
        loadPrescriptionModels();
        showNotice(`Modelo "${modelTitle}" excluído.`);
      }
    });
  };

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

  // Atalhos de Teclado Globais: '/', 'Ctrl+K' para busca, e 'Escape' para fechar o Drawer ou Modais
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPediatricDrawerOpen) {
          e.preventDefault();
          setIsPediatricDrawerOpen(false);
          return;
        }
        if (isSaveModelModalOpen) {
          e.preventDefault();
          setIsSaveModelModalOpen(false);
          return;
        }
        if (isLoadModelModalOpen) {
          e.preventDefault();
          setIsLoadModelModalOpen(false);
          setIsCreatingCustomModel(false);
          return;
        }
      }

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
  }, [isPediatricDrawerOpen, isSaveModelModalOpen, isLoadModelModalOpen]);

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

  // Detecção proativa: se o médico digita ou cola um nome de antibiótico ou substância controlada, ativa 2 vias automaticamente
  useEffect(() => {
    const detectado = classificarReceita(selectedMedName);
    if (selectedMedName.trim() && detectado !== 'simples') {
      setSelectedRegime(detectado);
    }
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
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      showNotice('Por favor, selecione ou digite o nome do medicamento.');
      return;
    }
    if (!selectedPosology.trim()) {
      showNotice('Por favor, informe a posologia / instruções de uso.');
      return;
    }

    // O tipo detectado pelo nome prevalece sobre "simples"; o médico só pode torná-lo mais restritivo.
    const detectado = classificarReceita(selectedMedName);
    const regime: RegimeReceita =
      detectado === 'simples' || selectedRegime === 'controle_especial' ? selectedRegime : detectado;

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
            frequencyText: selectedPosology.trim(),
            scheduleInterval: doseFrequency,
            instructions: selectedPosology.trim(),
            isContinuous: isContinuousDose || selectedPosology.toLowerCase().includes('contínuo'),
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
      frequencyText: selectedPosology.trim(),
      scheduleInterval: doseFrequency,
      scheduleTimes: [],
      instructions: selectedPosology.trim(),
      isContinuous: isContinuousDose || selectedPosology.toLowerCase().includes('contínuo'),
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
      
      {/* Top Mobile View Switcher */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-medium dark:border-strong">
        <button
          type="button"
          onClick={() => setMobileSection('composer')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
            mobileSection === 'composer'
              ? 'bg-navy-800 text-white shadow-tactile-btn'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Prescrever medicamentos
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
            mobileSection === 'preview'
              ? 'bg-navy-800 text-white shadow-tactile-btn'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Visualizar receita ({items.length})
        </button>
      </div>

      {/* Main Grid: Left Controls & Right A4 Simulation */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
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
          <section className="card-surface surface-card-minimal rounded-2xl p-4 sm:p-5 space-y-4 border border-subtle dark:border-strong">
            <div className="flex items-center justify-between pb-3 border-b border-subtle dark:border-strong">
              <div className="flex items-center gap-2.5">
                <Icon name="medication" className="text-sky-600 dark:text-sky-400 text-[22px]" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Prescrição
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPediatricDrawerOpen(true)}
                className="chip-neutral text-xs px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
                title="Abrir Calculadora Pediátrica em painel lateral sem sair da receita"
              >
                <Icon name="balanca" className="text-[14px] text-emerald-600 dark:text-emerald-400" />
                <span>Calcular dose pelo peso</span>
              </button>
            </div>

            {/* Banner de Edição Direta Ativa */}
            {editingItemId && (
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-info dark:border-info flex items-center justify-between gap-3 text-xs text-sky-900 dark:text-sky-200 shadow-tactile-sm animate-in fade-in duration-150">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="edit" className="text-[16px] text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="font-semibold truncate">
                    Modo de edição: <strong>{selectedMedName || 'Medicamento'}</strong>. Altere os campos e salve a alteração.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 rounded-lg border border-info dark:border-info bg-white dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-sky-900 font-bold text-xs shrink-0 cursor-pointer shadow-tactile-sm"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* ZONA 1: Busca e Seleção Unificada de Fármaco + Tipo de Receita */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="med-search-input" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Fármaco ou princípio ativo *
                  </label>
                  <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                    Selecione do catálogo SUS/RENAME ou digite livremente
                  </span>
                </div>
                <div className="relative">
                  <Icon name="search" className="text-[16px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    onChange={(e) => {
                      setSelectedMedName(e.target.value);
                      setShowSuggestions(true);
                      setHighlightedSuggestionIndex(-1);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setShowSuggestions(false)}
                    onKeyDown={handleMedInputKeyDown}
                    placeholder="Ex.: Dipirona 500 mg, Amoxicilina 500 mg, Losartana 50 mg..."
                    className={`w-full pl-9 pr-16 py-2.5 bg-slate-50/80 dark:bg-slate-950 border rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus:border-info transition placeholder:text-[var(--text-placeholder)] placeholder:font-normal shadow-tactile-sm ${
                      selectedMedName.trim()
                        ? 'border-clinical dark:border-clinical'
                        : 'border-subtle dark:border-strong'
                    }`}
                  />
                  {selectedMedName ? (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Icon name="check" className="text-[16px] text-emerald-500 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMedName('');
                          setShowSuggestions(false);
                          setHighlightedSuggestionIndex(-1);
                          searchInputRef.current?.focus();
                        }}
                        aria-label="Limpar medicamento"
                        title="Limpar medicamento"
                        className="text-[var(--text-muted)] dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500"
                      >
                        <Icon name="close" className="text-[16px]" />
                      </button>
                    </div>
                  ) : (
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)] dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-subtle dark:border-strong hidden sm:block pointer-events-none">
                      Ctrl+K
                    </kbd>
                  )}

                  {/* Suggestions Dropdown (Instant, Keyboard-Navigable) */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div
                      id="med-search-listbox"
                      role="listbox"
                      className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl tactile-dropdown z-30 divide-y divide-slate-100 dark:divide-slate-800"
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
                              // Evita que o onBlur do input feche a lista antes do clique
                              e.preventDefault();
                              handleSelectMedication(med);
                            }}
                            onMouseEnter={() => setHighlightedSuggestionIndex(idx)}
                            className={`p-3 cursor-pointer flex items-center justify-between gap-2 transition ${
                              isHighlighted
                                ? 'bg-blue-50 dark:bg-slate-800/90'
                                : 'hover:bg-blue-50/60 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {med.name}
                                </p>
                                {medRegime !== 'simples' && (
                                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-warning shrink-0">
                                    {REGIME_INFO[medRegime].rotulo}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {med.defaultPosology}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 shrink-0">
                              {med.route}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo de receita compacto: preenchido pelo nome do medicamento; o médico pode ajustar */}
              <fieldset className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <legend className="text-xs font-medium text-slate-600 dark:text-slate-400 float-left mr-1">
                    Tipo de receita:
                  </legend>
                  <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Tipo de receita">
                    {REGIMES.map((regime) => {
                      const ativo = selectedRegime === regime;
                      return (
                        <button
                          key={regime}
                          type="button"
                          role="radio"
                          aria-checked={ativo}
                          onClick={() => setSelectedRegime(regime)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                            ativo
                              ? 'bg-sky-500/15 text-sky-900 dark:text-sky-200 border-info font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-subtle dark:border-strong hover:border-medium'
                          }`}
                        >
                          {REGIME_INFO[regime].rotulo}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {REGIME_INFO[selectedRegime].detalhe}
                  {selectedMedName.trim() && classificarReceita(selectedMedName) !== 'simples' && ' • automático'}
                </p>
              </fieldset>
              {notificacaoDoFormulario && (
                <p role="status" className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-warning rounded-xl px-3 py-2">
                  Exige {descreverNotificacao(notificacaoDoFormulario)}. O PresCMed não emite a notificação, e a folha impressa aqui não a substitui.
                </p>
              )}
            </div>

            {/* ZONA 2: Modo rápido de posologia e dispensação */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-subtle dark:border-strong space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-subtle dark:border-strong">
                <div className="flex items-center gap-1.5">
                  <Icon name="schedule" className="text-sky-600 dark:text-sky-400 text-[16px]" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Cálculo rápido de posologia e quantidade
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, doseDays, isContinuousDose)}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Recalcular
                </button>
              </div>

              {/* Linha 1: Dose, Apresentação, Frequência e Via */}
              <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5">
                {/* 1. Quantidade por dose (2 cols) */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Dose
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={doseAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1;
                      handleAtualizarConstrutor(val, doseUnit, doseFrequency, doseDays, isContinuousDose);
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-subtle dark:border-strong text-xs font-bold text-slate-900 dark:text-slate-100 text-center outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm clinical-tabular-nums"
                  />
                </div>

                {/* 2. Apresentação / Unidade (3 cols) */}
                <div className="col-span-1 sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Apresentação
                  </label>
                  <select
                    value={doseUnit}
                    onChange={(e) => {
                      const val = e.target.value as UnidadeDose;
                      handleAtualizarConstrutor(doseAmount, val, doseFrequency, doseDays, isContinuousDose);
                    }}
                    className="w-full px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-subtle dark:border-strong text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm cursor-pointer"
                  >
                    <option value="comprimido">comp (comprimido)</option>
                    <option value="cápsula">caps (cápsula)</option>
                    <option value="gota">gotas</option>
                    <option value="mL">mL</option>
                    <option value="sachê">sachê</option>
                    <option value="jato">jatos</option>
                    <option value="ampola">ampola</option>
                    <option value="aplicação">aplicação</option>
                  </select>
                </div>

                {/* 3. Horários / Frequência (4 cols) */}
                <div className="col-span-2 sm:col-span-4">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Frequência
                  </label>
                  <select
                    value={doseFrequency}
                    onChange={(e) => {
                      const val = e.target.value as FrequenciaHorario;
                      handleAtualizarConstrutor(doseAmount, doseUnit, val, doseDays, isContinuousDose);
                    }}
                    className="w-full px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-subtle dark:border-strong text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm cursor-pointer"
                  >
                    <option value="8/8h">8/8h (3x/dia)</option>
                    <option value="12/12h">12/12h (2x/dia)</option>
                    <option value="6/6h">6/6h (4x/dia)</option>
                    <option value="4/4h">4/4h (6x/dia)</option>
                    <option value="24h">24h (1x/dia)</option>
                    <option value="manha">Manhã (1x/dia)</option>
                    <option value="noite">Noite (ao deitar)</option>
                    <option value="DU">Dose única</option>
                    <option value="SOS">S.O.S (se dor/febre)</option>
                  </select>
                </div>

                {/* 4. Via de administração (3 cols) */}
                <div className="col-span-2 sm:col-span-3">
                  <label htmlFor="presc-route-select" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Via
                  </label>
                  <select
                    id="presc-route-select"
                    value={selectedRoute}
                    onChange={(e) => {
                      const novaVia = e.target.value;
                      setSelectedRoute(novaVia);
                      handleAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, doseDays, isContinuousDose, novaVia);
                    }}
                    className="w-full px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-subtle dark:border-strong text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-tactile-sm cursor-pointer"
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

              {/* Linha 2: Duração / Dias e Uso Contínuo */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-0.5">
                  Duração:
                </span>
                {[3, 5, 7, 10, 14, 30].map((dias) => {
                  const ativo = !isContinuousDose && doseDays === dias;
                  return (
                    <button
                      key={dias}
                      type="button"
                      data-active={ativo}
                      onClick={() => handleAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, dias, false)}
                      className="chip-neutral text-xs px-2.5 py-0.5 rounded-md cursor-pointer clinical-tabular-nums focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      {dias} dias
                    </button>
                  );
                })}
                <button
                  type="button"
                  data-active={isContinuousDose}
                  onClick={() => handleAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, 0, true)}
                  className="chip-neutral text-xs px-2.5 py-0.5 rounded-md cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Uso contínuo
                </button>
              </div>

              {/* Linha 3: Quantidade Total a Dispensar + Pílulas Rápidas Contextuais */}
              <div className="pt-2 border-t border-subtle dark:border-strong">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="sm:w-64 shrink-0">
                    <label htmlFor="presc-quantity-input" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Quantidade total a dispensar *
                    </label>
                    <input
                      id="presc-quantity-input"
                      type="text"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(e.target.value)}
                      placeholder="Ex.: 30 comprimidos, 1 frasco..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-subtle dark:border-strong text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-tactile-sm clinical-tabular-nums"
                    />
                  </div>
                  {(doseUnit === 'comprimido' || doseUnit === 'cápsula') && (
                    <div className="flex-1">
                      <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                        Atalhos de dispensação (sem caixa):
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['10 comp', '14 comp', '15 comp', '20 comp', '30 comp', '60 comp'].map((qtdLabel) => {
                          const qtdValor = qtdLabel.replace('comp', doseUnit === 'cápsula' ? 'cápsulas' : 'comprimidos');
                          const num = qtdLabel.replace(' comp', '');
                          const isAtivo =
                            selectedQuantity.toLowerCase().includes(num) &&
                            (selectedQuantity.toLowerCase().includes('comp') || selectedQuantity.toLowerCase().includes('cáps'));
                          return (
                            <button
                              key={qtdLabel}
                              type="button"
                              data-active={isAtivo}
                              onClick={() => setSelectedQuantity(qtdValor)}
                              className="chip-neutral text-xs px-2 py-1 rounded-md cursor-pointer clinical-tabular-nums focus-visible:ring-2 focus-visible:ring-sky-500"
                            >
                              {qtdLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ZONA 3: Posologia & Orientações + Ação Primária */}
            <div className="space-y-3">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                  <label htmlFor="presc-posology-textarea" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Posologia e orientações ao paciente *
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedPosology(e.target.value);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-subtle dark:border-strong text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer max-w-full sm:max-w-xs"
                    aria-label="Atalhos rápidos de posologia"
                  >
                    <option value="">Selecionar posologia padrão...</option>
                    {posologyShortcuts.map((ps, idx) => (
                      <option key={idx} value={ps.text}>
                        {ps.label} — {ps.text}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  id="presc-posology-textarea"
                  rows={2}
                  value={selectedPosology}
                  onChange={(e) => setSelectedPosology(e.target.value)}
                  placeholder="Ex.: Tomar 1 comprimido via oral a cada 8 horas se dor ou febre por até 5 dias..."
                  className="w-full p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950 border border-subtle dark:border-strong text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-tactile-sm resize-none"
                />
              </div>

              {/* Ação Primária: Inserir ou Salvar Alterações na Receita */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddMedicationToPrescription}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-tactile-btn focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    editingItemId
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'btn-tactile-primary'
                  }`}
                  title={editingItemId ? 'Salvar alterações feitas neste medicamento' : 'Inserir este medicamento na receita'}
                >
                  {editingItemId ? (
                    <>
                      <Icon name="check" className="text-[16px]" />
                      <span>Salvar alterações no medicamento</span>
                    </>
                  ) : (
                    <>
                      <Icon name="add" className="text-[16px]" />
                      <span>Inserir na receita</span>
                    </>
                  )}
                </button>
                {editingItemId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-2.5 px-3 rounded-xl border border-medium dark:border-strong bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer shadow-tactile-sm transition"
                    title="Cancelar edição e voltar ao modo de inserção"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </section>

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

        {/* RIGHT COLUMN: Real-Time A4 Document Simulation (Sticky Tactile Sheet) */}
        <div className={`xl:col-span-5 xl:sticky xl:top-20 space-y-3.5 ${mobileSection === 'composer' ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Icon name="visibility" className="text-[15px] text-sky-600 dark:text-sky-400" />
              <span>Prévia da folha — é exatamente o que será impresso</span>
            </h3>
          </div>

          {/* Aviso de Prévia de Exemplo (fora da folha) */}
          {!isDoctorConfigured && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-warning dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon name="warning" className="text-amber-600 dark:text-amber-400 text-[18px] shrink-0" />
                <span className="font-semibold">Prévia de exemplo: configure o médico para emitir.</span>
              </div>
              {handleAbrirPerfilMedico && (
                <button
                  type="button"
                  onClick={handleAbrirPerfilMedico}
                  className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  Configurar médico
                </button>
              )}
            </div>
          )}

          {/* Controlados que exigem Notificação de Receita: no desktop (xl) fica aqui; abaixo disso, junto das ações */}
          {porRegime.controle_especial.some((it) => notificacaoExigida(it)) && (
            <div className="hidden xl:block">
              <AvisoNotificacaoReceita items={porRegime.controle_especial} />
            </div>
          )}

          {/* Uma aba por receita quando a consulta gera mais de um documento */}
          {regimesComItens.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-navy-900 border border-medium dark:border-navy-700 w-full overflow-x-auto shadow-tactile-sm">
              {regimesComItens.map((regime) => (
                <button
                  key={regime}
                  type="button"
                  onClick={() => setPreviewRegime(regime)}
                  aria-pressed={regimeAtivo === regime}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    regimeAtivo === regime
                      ? 'bg-white dark:bg-navy-800 text-sky-700 dark:text-blue-300 shadow-tactile-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{REGIME_INFO[regime].rotulo} ({porRegime[regime].length})</span>
                </button>
              ))}
            </div>
          )}

          {/* Folha A4 da bancada: o mesmo documento que será impresso / exportado em PDF (sempre paisagem no padrão PEC do SUS) */}
          <FolhaA4 orientacao="landscape">
            <DocumentoClinico
              tipo={DOCUMENTO_DO_REGIME[regimeAtivo]}
              doctor={doctor}
              patient={patient}
              activeContext={activeContext}
              prescriptionItems={itemsInPreview}
            />
          </FolhaA4>

          {/* Action Buttons: visível no desktop (xl), nunca duplicado com o cartão */}
          <div className="hidden xl:block">
            <AcoesDaReceita
              itemsCount={items.length}
              isMedicoConfigurado={isDoctorConfigured}
              onNavigateToPrint={handlePrintClick}
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
          <Icon name="check" className="text-[16px]" />
          <span>Medicamento inserido na receita com sucesso!</span>
        </div>
      )}

      {/* Drawer Lateral Flutuante da Calculadora Pediátrica */}
      {isPediatricDrawerOpen && (
        <div 
          ref={pediatricDrawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Calculadora pediátrica por peso"
          className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-backdrop-fade"
          onClick={() => setIsPediatricDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-3xl h-full bg-[var(--surface-card)] shadow-2xl border-l border-[var(--border-subtle)] flex flex-col animate-drawer-right overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Drawer */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-elevated)] shrink-0">
              <div className="flex items-center gap-2.5">
                <Icon name="balanca" className="text-emerald-600 dark:text-emerald-400 text-[22px]" />
                <h3 className="font-semibold text-sm text-[var(--text-main)]">
                  Calculadora pediátrica por peso
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPediatricDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer inline-flex items-center justify-center"
                title="Fechar calculadora (Esc)"
                aria-label="Fechar calculadora"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            
            {/* Corpo do Drawer com rolagem */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
              <PediatricCalculator
                darkMode={_darkMode}
                patient={patient}
                onUpdatePatientWeight={(newWeight) => onUpdatePatient({ ...patient, weightKg: newWeight })}
                onAddPrescriptionItem={(item) => {
                  onUpdateItems([...items, item]);
                  setItemAddedToast(true);
                  setTimeout(() => setItemAddedToast(false), 2500);
                }}
                onNavigateToPrescription={() => setIsPediatricDrawerOpen(false)}
                isDrawer={true}
                onClose={() => setIsPediatricDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      {/* Toast de Notificação de Modelo de Receita */}
      {prescriptionModelToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-tactile-lg text-xs font-semibold flex items-center gap-2 border border-strong animate-tab-fade"
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
