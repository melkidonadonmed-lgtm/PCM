import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Check,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  FileText,
  Pencil,
  BookmarkPlus,
  FolderOpen
} from 'lucide-react';
import { PrescriptionItem, Patient, DoctorProfile } from '../types';
import { db, SavedDocument } from '../services/db';
import { searchUnifiedMedicationsFuzzy } from '../utils/fuzzySearch';
import { UNIFIED_MEDICATIONS, UnifiedMedication } from '../data/medicationDatabase';
import { PRESET_CLINICAL_TEMPLATES } from '../data/presetClinicalTemplates';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { isSpecialControlOrAntibiotic } from '../utils/isSpecialControlOrAntibiotic';
import {
  calcularPrescricaoRapida,
  FrequenciaHorario,
  UnidadeDose,
  formatarUnidadeDose
} from '../utils/prescricaoRapida';
import { EXEMPLO_MEDICO, EXEMPLO_PACIENTE } from '../data/exemplos';
import { Icon } from './Icon';
import { AcoesDaReceita } from './AcoesDaReceita';
import { PediatricCalculator } from './PediatricCalculator';

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
  onNavigateToPrint: (docType?: 'prescription' | 'special_prescription') => void;
  onNavigateToPediatricCalc?: () => void;
  onNavigateToEditor?: () => void;
  onNavigateToCertificate?: () => void;
  onNavigateToReferral?: () => void;
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
  onNavigateToCertificate,
  onNavigateToReferral,
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
  const [selectedQuantity, setSelectedQuantity] = useState('30 comprimidos');
  const [selectedPosology, setSelectedPosology] = useState('');
  const [selectedIsSpecial, setSelectedIsSpecial] = useState(false);

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

  // Modelos de Prescrição Salvos
  const [isSaveModelModalOpen, setIsSaveModelModalOpen] = useState(false);
  const [isLoadModelModalOpen, setIsLoadModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [savedPrescriptionModels, setSavedPrescriptionModels] = useState<SavedDocument[]>([]);
  const [prescriptionModelToast, setPrescriptionModelToast] = useState<string | null>(null);

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
      setPrescriptionModelToast(`Modelo "${newDoc.title}" criado e salvo com sucesso!`);
      setTimeout(() => setPrescriptionModelToast(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar modelo criado:', err);
      alert('Falha ao salvar modelo no banco local.');
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
    setPrescriptionModelToast(`Modelo "${newDoc.title}" salvo com sucesso!`);
    loadPrescriptionModels();
    setTimeout(() => setPrescriptionModelToast(null), 3000);
  };

  const handleApplyPrescriptionModel = (model: SavedDocument, mode: 'replace' | 'append') => {
    if (!model.prescriptionItems || model.prescriptionItems.length === 0) return;
    if (mode === 'replace') {
      onUpdateItems([...model.prescriptionItems]);
      setPrescriptionModelToast(`Modelo "${model.title}" aplicado na receita!`);
    } else {
      onUpdateItems([...items, ...model.prescriptionItems]);
      setPrescriptionModelToast(`Medicamentos do modelo "${model.title}" adicionados à receita!`);
    }
    setIsLoadModelModalOpen(false);
    setTimeout(() => setPrescriptionModelToast(null), 3000);
  };

  const handleDeletePrescriptionModel = async (modelId: string, modelTitle: string) => {
    if (confirm(`Deseja realmente excluir o modelo "${modelTitle}"?`)) {
      await db.savedDocuments.delete(modelId);
      loadPrescriptionModels();
      setPrescriptionModelToast(`Modelo "${modelTitle}" excluído.`);
      setTimeout(() => setPrescriptionModelToast(null), 3000);
    }
  };

  // Controle de expansão de dados extras do paciente (CPF e Peso)
  const [showExtraPatientFields, setShowExtraPatientFields] = useState(() => {
    return Boolean((patient?.documentNumber && patient.documentNumber.trim()) || (patient?.weightKg && patient.weightKg > 0));
  });

  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasWeight = patientWeight > 0;
  const patientName = patient?.name?.trim() || '';

  // Classificação sanitária automática: medicamentos simples vs antibióticos / controle especial (2 vias)
  const specialItems = useMemo(() => items.filter(i => isSpecialControlOrAntibiotic(i)), [items]);
  const simpleItems = useMemo(() => items.filter(i => !isSpecialControlOrAntibiotic(i)), [items]);
  const hasBothPrescriptionTypes = specialItems.length > 0 && simpleItems.length > 0;

  // Alternância da folha na bancada de prévia A4
  const [previewTab, setPreviewTab] = useState<'auto' | 'simple' | 'special'>('auto');

  // Tipo ativo da folha na prévia
  const activePreviewType = useMemo<'simple' | 'special'>(() => {
    if (previewTab === 'special') return 'special';
    if (previewTab === 'simple') return 'simple';
    // Se tiver apenas antibióticos/especiais, exibe direto a folha de 2 vias
    if (specialItems.length > 0 && simpleItems.length === 0) return 'special';
    return 'simple';
  }, [previewTab, specialItems.length, simpleItems.length]);

  // Itens exibidos na folha de prévia A4
  const itemsInPreview = useMemo(() => {
    if (activePreviewType === 'special') {
      return specialItems.length > 0 ? specialItems : items;
    }
    if (hasBothPrescriptionTypes) {
      return simpleItems;
    }
    return items;
  }, [activePreviewType, specialItems, simpleItems, hasBothPrescriptionTypes, items]);

  const handlePrintClick = () => {
    if (activePreviewType === 'special') {
      onNavigateToPrint('special_prescription');
    } else {
      onNavigateToPrint('prescription');
    }
  };

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

  // Atalhos de Teclado Globais: '/', 'Ctrl+K' para busca, e 'Escape' para fechar o Drawer
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Escape fecha o Drawer da Calculadora se estiver aberto
      if (e.key === 'Escape' && isPediatricDrawerOpen) {
        e.preventDefault();
        setIsPediatricDrawerOpen(false);
        return;
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
  }, [isPediatricDrawerOpen]);

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
    setSelectedIsSpecial(isSpecialControlOrAntibiotic(med));

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

    setSearchTerm('');
    setShowSuggestions(false);
  };

  // Detecção proativa: se o médico digita ou cola um nome de antibiótico ou substância controlada, ativa 2 vias automaticamente
  useEffect(() => {
    if (selectedMedName.trim() && isSpecialControlOrAntibiotic(selectedMedName)) {
      setSelectedIsSpecial(true);
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
    setSelectedIsSpecial(Boolean(item.isSpecialControl));

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
    setSelectedIsSpecial(false);
    setDoseAmount(1);
    setDoseUnit('comprimido');
    setDoseFrequency('8/8h');
    setDoseDays(5);
    setIsContinuousDose(false);
  };

  // Add Item to Prescription or Update existing item
  const handleAddMedicationToPrescription = () => {
    if (!selectedMedName.trim()) {
      alert('Por favor, selecione ou digite o nome do medicamento.');
      return;
    }
    if (!selectedPosology.trim()) {
      alert('Por favor, informe a posologia / instruções de uso.');
      return;
    }

    const isSpecial = selectedIsSpecial || isSpecialControlOrAntibiotic(selectedMedName);

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
            isSpecialControl: isSpecial
          };
        }
        return it;
      });

      onUpdateItems(updatedItems);
      setEditingItemId(null);
      if (isSpecial) {
        setPreviewTab('special');
      }
      setItemAddedToast(true);
      setTimeout(() => setItemAddedToast(false), 2000);

      // Reset fields
      setSelectedMedName('');
      setSelectedQuantity('30 comprimidos');
      setSelectedPosology('');
      setSelectedIsSpecial(false);
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
      isSpecialControl: isSpecial
    };

    onUpdateItems([...items, newItem]);
    if (isSpecial) {
      setPreviewTab('special');
    }
    setItemAddedToast(true);
    setTimeout(() => setItemAddedToast(false), 2000);

    // Reset fields for next entry (sem caixa ou frasco desnecessário)
    setSelectedMedName('');
    setSelectedQuantity('30 comprimidos');
    setSelectedPosology('');
    setSelectedIsSpecial(false);
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
    let text = '';
    if (hasBothPrescriptionTypes) {
      text += '📋 RECEITUÁRIO MÉDICO (Receita Simples)\n------------------------------------\n';
      simpleItems.forEach((it, idx) => {
        text += `${idx + 1}. ${it.name} (${it.route})\n   Qtd: ${it.quantity}\n   Posologia: ${it.instructions}\n\n`;
      });
      text += '📑 RECEITUÁRIO DE CONTROLE ESPECIAL (2 Vias • Retenção na Farmácia)\n------------------------------------\n';
      specialItems.forEach((it, idx) => {
        text += `${idx + 1}. ${it.name} (${it.route})\n   Qtd: ${it.quantity}\n   Posologia: ${it.instructions}\n\n`;
      });
    } else {
      const headerLabel = items.every(i => isSpecialControlOrAntibiotic(i))
        ? '📑 RECEITUÁRIO DE CONTROLE ESPECIAL (2 Vias • Retenção na Farmácia)\n------------------------------------\n'
        : '📋 RECEITUÁRIO MÉDICO\n------------------------------------\n';
      text += headerLabel;
      items.forEach((it, idx) => {
        text += `${idx + 1}. ${it.name} (${it.route})\n   Qtd: ${it.quantity}\n   Posologia: ${it.instructions}\n\n`;
      });
    }
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

    if (hasBothPrescriptionTypes) {
      text += `\n💊 *RECEITUÁRIO MÉDICO (Receita Simples):*\n`;
      simpleItems.forEach((it, idx) => {
        text += `\n*${idx + 1}. ${it.name}* (${it.route})\n   📦 *Qtd:* ${it.quantity}\n   👉 *Posologia:* ${it.instructions}\n`;
      });
      text += `\n📑 *RECEITUÁRIO DE CONTROLE ESPECIAL (2 Vias • Retenção na Farmácia):*\n`;
      specialItems.forEach((it, idx) => {
        text += `\n*${idx + 1}. ${it.name}* (${it.route})\n   📦 *Qtd:* ${it.quantity}\n   👉 *Posologia:* ${it.instructions}\n`;
      });
    } else {
      const isAllSpecial = items.every(i => isSpecialControlOrAntibiotic(i));
      text += isAllSpecial
        ? `\n📑 *RECEITUÁRIO DE CONTROLE ESPECIAL (2 Vias • Portaria 344/98 & RDC 20/2011):*\n`
        : `\n💊 *PRESCRIÇÃO:*\n`;
      items.forEach((it, idx) => {
        text += `\n*${idx + 1}. ${it.name}* (${it.route})\n   📦 *Qtd:* ${it.quantity}\n   👉 *Posologia:* ${it.instructions}\n`;
      });
    }

    text += `\n------------------------------------\n⚠️ _Documento de orientação terapêutica emitido pelo médico. Siga as orientações e horários informados. Para medicamentos controlados e antibióticos, a 1ª via fica retida na farmácia._`;
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

            {/* Linha principal: Nome do Paciente e Atalhos Rápidos */}
            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="quick-patient-name" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Nome do Paciente *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowExtraPatientFields(prev => !prev)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
                    title="Alternar exibição de CPF e Peso"
                  >
                    {showExtraPatientFields ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Ocultar CPF / Peso</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>
                          {patient.weightKg > 0 || (patient.documentNumber && patient.documentNumber.trim())
                            ? `Ver dados (${patient.weightKg > 0 ? `${patient.weightKg} kg` : ''}${patient.documentNumber ? ` • ${patient.documentNumber}` : ''})`
                            : '+ CPF e Peso'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  id="quick-patient-name"
                  type="text"
                  value={patient.name || ''}
                  onChange={(e) => onUpdatePatient({ ...patient, name: e.target.value })}
                  placeholder="Nome completo do paciente"
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm"
                />
              </div>

              {/* Atalhos Rápidos para Documentos com este Paciente */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <span className="text-[11px] text-[var(--text-muted)] dark:text-slate-400">
                  Emitir com este paciente:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsPediatricDrawerOpen(true)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:border-emerald-400 font-semibold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-tactile-sm"
                    title="Abrir Calculadora Pediátrica em painel lateral sem sair da receita"
                  >
                    <Icon name="balanca" className="text-[14px] text-emerald-600 dark:text-emerald-400" />
                    <span>Dose Pediátrica</span>
                  </button>
                  {onNavigateToCertificate && (
                    <button
                      type="button"
                      onClick={onNavigateToCertificate}
                      className="text-xs px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-slate-900 border border-blue-200/60 dark:border-slate-800 text-blue-700 dark:text-blue-300 hover:border-blue-400 font-semibold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-tactile-sm"
                      title="Abrir formulário de Atestado Médico para este paciente"
                    >
                      <Icon name="atestado" className="text-[14px] text-blue-600 dark:text-blue-400" />
                      <span>Atestado</span>
                    </button>
                  )}
                  {onNavigateToReferral && (
                    <button
                      type="button"
                      onClick={onNavigateToReferral}
                      className="text-xs px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-slate-900 border border-blue-200/60 dark:border-slate-800 text-blue-700 dark:text-blue-300 hover:border-blue-400 font-semibold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-tactile-sm"
                      title="Abrir Encaminhamento Médico para este paciente"
                    >
                      <Icon name="encaminhamento" className="text-[14px] text-blue-600 dark:text-blue-400" />
                      <span>Encaminhamento</span>
                    </button>
                  )}
                  {onNavigateToEditor && (
                    <button
                      type="button"
                      onClick={onNavigateToEditor}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 font-semibold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-tactile-sm"
                      title="Abrir no Editor de Texto Livre"
                    >
                      <Icon name="editor" className="text-[14px] text-slate-600 dark:text-slate-400" />
                      <span>Editor Livre</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Campos Extras Expansíveis: CPF e Peso */}
              {showExtraPatientFields && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-200">
                  <div>
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

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="quick-patient-weight" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Peso (kg)
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsPediatricDrawerOpen(true)}
                        className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        title="Abrir Calculadora Pediátrica lateral"
                      >
                        <Icon name="balanca" className="text-[12px]" />
                        <span>Calculadora</span>
                      </button>
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
              )}
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
              <button
                type="button"
                onClick={() => setIsPediatricDrawerOpen(true)}
                className="text-xs px-2.5 py-1 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 font-semibold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-tactile-sm"
                title="Abrir Calculadora Pediátrica em painel lateral sem sair da receita"
              >
                <Icon name="balanca" className="text-[14px] text-emerald-600 dark:text-emerald-400" />
                <span>Dose Pediátrica</span>
              </button>
            </div>

            {/* Banner de Edição Direta Ativa */}
            {editingItemId && (
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800 flex items-center justify-between gap-3 text-xs text-sky-900 dark:text-sky-200 shadow-tactile-sm animate-in fade-in duration-150">
                <div className="flex items-center gap-2 min-w-0">
                  <Pencil className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="font-semibold truncate">
                    Modo de Edição: <strong>{selectedMedName || 'Medicamento'}</strong>. Altere os campos e salve a alteração.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 rounded-lg border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-sky-900 font-bold text-xs shrink-0 cursor-pointer shadow-tactile-sm"
                >
                  Cancelar
                </button>
              </div>
            )}

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

              {/* Grid: 2 Colunas para Via e Quantidade Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="presc-route-select" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Via de administração
                  </label>
                  <select
                    id="presc-route-select"
                    value={selectedRoute}
                    onChange={(e) => {
                      const novaVia = e.target.value;
                      setSelectedRoute(novaVia);
                      handleAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, doseDays, isContinuousDose, novaVia);
                    }}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="presc-quantity-input" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Quantidade total a dispensar *
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                      Sem caixa • Total exato
                    </span>
                  </div>
                  <input
                    id="presc-quantity-input"
                    type="text"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    placeholder="Ex.: 30 comprimidos, 20 cápsulas, 1 frasco..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-tactile-sm"
                  />
                  {/* Atalhos Rápidos Táteis de Quantidade de Comprimidos */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Comprimidos:</span>
                    {['10 comp', '14 comp', '15 comp', '20 comp', '30 comp', '60 comp'].map((qtdLabel) => {
                      const qtdValor = qtdLabel.replace('comp', 'comprimidos');
                      const isAtivo = selectedQuantity.toLowerCase().includes(qtdLabel.replace(' comp', '')) && selectedQuantity.toLowerCase().includes('comp');
                      return (
                        <button
                          key={qtdLabel}
                          type="button"
                          onClick={() => setSelectedQuantity(qtdValor)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                            isAtivo
                              ? 'bg-blue-600 text-white shadow-tactile-sm'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                          }`}
                        >
                          {qtdLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MODO RÁPIDO DE PRESCRIÇÃO (Dose • Unidade • Horários • Dias) */}
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-slate-900/60 border border-blue-100 dark:border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-blue-100/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Icon name="medication" className="text-blue-600 dark:text-blue-400 text-[16px]" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Modo Rápido de Prescrição
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    Calcula Posologia & Quantidade
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* 1. Quantidade por dose */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Dose por tomada
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={doseAmount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1;
                          handleAtualizarConstrutor(val, doseUnit, doseFrequency, doseDays, isContinuousDose);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 text-center outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm"
                      />
                    </div>
                  </div>

                  {/* 2. Apresentação / Unidade */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Apresentação
                    </label>
                    <select
                      value={doseUnit}
                      onChange={(e) => {
                        const val = e.target.value as UnidadeDose;
                        handleAtualizarConstrutor(doseAmount, val, doseFrequency, doseDays, isContinuousDose);
                      }}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm cursor-pointer"
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

                  {/* 3. Horários / Frequência */}
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Horários / Frequência
                    </label>
                    <select
                      value={doseFrequency}
                      onChange={(e) => {
                        const val = e.target.value as FrequenciaHorario;
                        handleAtualizarConstrutor(doseAmount, doseUnit, val, doseDays, isContinuousDose);
                      }}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm cursor-pointer"
                    >
                      <option value="8/8h">8/8h (a cada 8 horas • 3x/dia)</option>
                      <option value="12/12h">12/12h (a cada 12 horas • 2x/dia)</option>
                      <option value="6/6h">6/6h (a cada 6 horas • 4x/dia)</option>
                      <option value="4/4h">4/4h (a cada 4 horas • 6x/dia)</option>
                      <option value="24h">24h (1x ao dia)</option>
                      <option value="manha">Manhã (1x ao dia, pela manhã)</option>
                      <option value="noite">Noite (1x ao dia, ao deitar)</option>
                      <option value="DU">DU (Dose Única)</option>
                      <option value="SOS">S.O.S (se dor ou febre)</option>
                    </select>
                  </div>
                </div>

                {/* Linha 2 do Modo Rápido: Duração / Dias e Uso Contínuo */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      Duração:
                    </span>
                    {[3, 5, 7, 10, 14, 30].map((dias) => (
                      <button
                        key={dias}
                        type="button"
                        onClick={() => handleAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, dias, false)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                          !isContinuousDose && doseDays === dias
                            ? 'bg-blue-600 text-white shadow-tactile-sm'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {dias} dias
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, 0, true)}
                      className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        isContinuousDose
                          ? 'bg-emerald-600 text-white shadow-tactile-sm'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      Uso Contínuo
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAtualizarConstrutor(doseAmount, doseUnit, doseFrequency, doseDays, isContinuousDose)}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Recalcular
                  </button>
                </div>
              </div>

              {/* Posologia & Orientações */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="presc-posology-textarea" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Posologia e orientações ao paciente *
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Gerada pelo modo rápido • 100% editável
                  </span>
                </div>
                <textarea
                  id="presc-posology-textarea"
                  rows={2}
                  value={selectedPosology}
                  onChange={(e) => setSelectedPosology(e.target.value)}
                  placeholder="Ex.: Tomar 1 comprimido via oral a cada 8 horas se dor ou febre por até 5 dias..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-900 dark:text-slate-100 shadow-tactile-sm resize-none"
                />
              </div>

              {/* Atalhos Rápidos Compactos em Dropdown de Linha Única */}
              <div>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedPosology(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm cursor-pointer"
                  aria-label="Atalhos rápidos de posologia"
                >
                  <option value="">⚡ Selecionar posologia padrão (atalhos rápidos)...</option>
                  {posologyShortcuts.map((ps, idx) => (
                    <option key={idx} value={ps.text}>
                      {ps.label} — {ps.text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ação Primária: Inserir ou Salvar Alterações na Receita */}
              <div className="pt-0.5 flex items-center gap-2">
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
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      <span>Salvar Alterações no Medicamento</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                      <span>Inserir na Receita</span>
                    </>
                  )}
                </button>
                {editingItemId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer shadow-tactile-sm transition"
                    title="Cancelar edição e voltar ao modo de inserção"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* Opções Auxiliares: Controle Especial e Cálculo de Dose Pediátrica */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedIsSpecial}
                    onChange={(e) => setSelectedIsSpecial(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span>Receita de 2 Vias (Controle Especial / Antibiótico)</span>
                    {selectedIsSpecial && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded">
                        2 Vias Ativo
                      </span>
                    )}
                  </span>
                </label>

                {onNavigateToPediatricCalc && (
                  <button
                    type="button"
                    onClick={onNavigateToPediatricCalc}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    title="Abrir calculadora de doses pediátricas pelo peso"
                  >
                    <Icon name="scale" className="text-[14px]" />
                    <span>Calcular dose pelo peso</span>
                  </button>
                )}
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
                {specialItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {specialItems.length} em 2 Vias
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Botão Biblioteca de Modelos Salvos */}
                <button
                  type="button"
                  onClick={() => {
                    loadPrescriptionModels();
                    setIsLoadModelModalOpen(true);
                  }}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 flex items-center gap-1.5 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 transition"
                  title="Abrir biblioteca de modelos de receitas salvos"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modelos</span>
                  {savedPrescriptionModels.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                      {savedPrescriptionModels.length}
                    </span>
                  )}
                </button>

                {/* Botão Salvar como Modelo / Criar Novo Modelo */}
                {items.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setNewModelName('');
                      setIsSaveModelModalOpen(true);
                    }}
                    className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition"
                    title="Salvar esta combinação de medicamentos como um modelo reutilizável"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Salvar Modelo</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCustomModel(true);
                      setCustomModelDraftTitle('');
                      setCustomModelDraftItems([]);
                      setIsLoadModelModalOpen(true);
                    }}
                    className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition"
                    title="Criar e salvar um novo modelo de receita reutilizável mesmo sem receita ativa na consulta"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Novo Modelo</span>
                  </button>
                )}

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearPrescription}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-rose-500 px-2 py-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Limpar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Aviso de Segregação Sanitária Automática quando houver itens comuns e antimicrobianos/controlados */}
            {hasBothPrescriptionTypes && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <Icon name="shield" className="text-amber-600 dark:text-amber-400 text-base shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="font-bold">Segregação Sanitária Automática (Portaria 344/98 e RDC 20/2011)</p>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300 font-medium">
                    Esta consulta contém {simpleItems.length} {simpleItems.length === 1 ? 'medicamento comum' : 'medicamentos comuns'} (Receita Simples) e {specialItems.length} {specialItems.length === 1 ? 'antimicrobiano/controlado' : 'antimicrobianos/controlados'} (Controle Especial • 2 Vias). Eles serão emitidos em folhas separadas no Editor e no PDF para garantir a retenção na farmácia.
                  </p>
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-navy-950 border border-dashed border-slate-300 dark:border-navy-800 text-[var(--text-muted)] dark:text-slate-400 text-xs italic">
                Nenhum medicamento adicionado ainda. Use a busca acima ou clique nos atalhos.
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((it, idx) => {
                  const isSpecial = isSpecialControlOrAntibiotic(it);
                  return (
                    <div
                      key={it.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 shadow-tactile-sm transition ${
                        editingItemId === it.id
                          ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 ring-2 ring-sky-400/40'
                          : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0 ${
                            editingItemId === it.id ? 'bg-sky-600' : 'bg-navy-800 dark:bg-navy-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {it.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                            {it.route} • {it.quantity}
                          </span>
                          {editingItemId === it.id && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-sky-500 text-white flex items-center gap-1 animate-pulse">
                              <Pencil className="w-2.5 h-2.5" />
                              <span>Em Edição</span>
                            </span>
                          )}
                          {isSpecial && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Icon name="security" className="text-[11px]" />
                              <span>2 Vias (Controle Especial / Antibiótico)</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed font-medium">
                          {it.instructions}
                        </p>
                      </div>

                      {/* Action buttons (Edit, Move Up, Move Down, Delete) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(it)}
                          className={`p-1 rounded-lg transition focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer ${
                            editingItemId === it.id
                              ? 'bg-sky-600 text-white shadow-tactile-sm'
                              : 'hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-400'
                          }`}
                          title="Editar este medicamento diretamente"
                          aria-label={`Editar ${it.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'down')}
                          disabled={idx === items.length - 1}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 disabled:opacity-30 text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[var(--text-muted)] dark:text-slate-400 hover:text-rose-500 transition focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                          title="Remover medicamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Barra de Ações: visível apenas abaixo de xl (nunca duplicada) */}
            {items.length > 0 && (
              <div className="block xl:hidden pt-3 border-t border-slate-200 dark:border-slate-800">
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
              onClick={() => {
                if (onNavigateToEditor) {
                  onNavigateToEditor();
                } else {
                  handlePrintClick();
                }
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-sky-500"
              title="Abrir folha oficial no Editor para conferir ou editar livremente"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Editor de Folha A4</span>
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

          {/* Abas de Alternância da Folha A4 na Prévia quando houver prescrição mista */}
          {hasBothPrescriptionTypes && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 w-full overflow-x-auto shadow-tactile-sm">
              <button
                type="button"
                onClick={() => setPreviewTab('simple')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activePreviewType === 'simple'
                    ? 'bg-white dark:bg-navy-800 text-blue-700 dark:text-blue-300 shadow-tactile-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Receita Simples ({simpleItems.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('special')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activePreviewType === 'special'
                    ? 'bg-amber-600 text-white shadow-tactile-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon name="security" className="text-[14px] shrink-0" />
                <span>Controle Especial • 2 Vias ({specialItems.length})</span>
              </button>
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

              {/* Document Title & Badge */}
              <div className="text-center mb-4">
                {activePreviewType === 'special' ? (
                  <>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        2ª Via: Paciente • 1ª Via: Retenção na Farmácia
                      </span>
                    </div>
                    <h3 className="serif-title text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-1 inline-block">
                      Receituário de Controle Especial
                    </h3>
                    <p className="text-[10px] text-sky-900 font-bold uppercase tracking-wider mt-1">
                      Portaria SVS/MS 344/98 • RDC Anvisa 20/2011 (Antimicrobianos)
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="serif-title text-sm font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 inline-block">
                      Receituário Médico
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Receituário Simples • Uso Ambulatorial
                    </p>
                  </>
                )}
              </div>

              {/* Prescription Body Items */}
              {itemsInPreview.length === 0 ? (
                <div className="py-16 text-center text-slate-500 italic text-xs">
                  {activePreviewType === 'special'
                    ? 'Nenhum medicamento sob controle especial ou antimicrobiano nesta prescrição.'
                    : 'Nenhum medicamento simples nesta prescrição.'}
                </div>
              ) : (
                <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                  {itemsInPreview.map((it, idx) => (
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

                  {/* Advertências Sanitárias em caso de Controle Especial */}
                  {activePreviewType === 'special' && (
                    <div className="mt-4 p-2 rounded bg-amber-50/80 border border-amber-200 text-[9px] text-amber-950 space-y-0.5">
                      <span className="font-bold uppercase block text-amber-900">
                        ⚠️ Orientações e Retenção de Receita (Portaria 344/98 & RDC 20/2011)
                      </span>
                      <p>• 1ª Via: Retenção obrigatória na farmácia / drogaria.</p>
                      <p>• 2ª Via: Orientação médica do paciente.</p>
                    </div>
                  )}
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
          <Check className="w-4 h-4" />
          <span>Medicamento inserido na receita com sucesso!</span>
        </div>
      )}

      {/* Drawer Lateral Flutuante da Calculadora Pediátrica */}
      {isPediatricDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsPediatricDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-3xl h-full bg-[var(--surface-card)] shadow-2xl border-l border-[var(--border-subtle)] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Drawer */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-elevated)] shrink-0">
              <div className="flex items-center gap-2.5">
                <Icon name="balanca" className="text-emerald-600 dark:text-emerald-400 text-[22px]" />
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">Calculadora Pediátrica Integrada</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Prescreva doses calculadas direto na receita do paciente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPediatricDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Fechar calculadora"
              >
                <X className="w-5 h-5" />
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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-tactile-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-tab-fade">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{prescriptionModelToast}</span>
        </div>
      )}

      {/* MODAL: Salvar Combinação Atual como Modelo de Receita */}
      {isSaveModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-tab-fade">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-tactile-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Salvar como Modelo de Receita
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Este modelo salvará os <strong>{items.length} medicamentos</strong> prescritos para que você possa reutilizá-los com 1 clique em consultas futuras.
            </p>

            <div>
              <label htmlFor="model-name-input" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Nome do Modelo
              </label>
              <input
                id="model-name-input"
                type="text"
                autoFocus
                value={newModelName}
                onChange={e => setNewModelName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSavePrescriptionModel();
                }}
                placeholder="Ex: Hipertensão Inicial, GECA Pediátrica, Amigdalite..."
                className="w-full p-3 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              />
            </div>

            <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Itens inclusos:</span>
              {items.map((it, idx) => (
                <div key={it.id} className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
                  <span className="font-mono text-slate-400">{idx + 1}.</span>
                  <span className="font-semibold truncate">{it.name}</span>
                  <span className="text-[10px] text-slate-500">({it.quantity})</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSaveModelModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePrescriptionModel}
                disabled={!newModelName.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white cursor-pointer shadow-tactile-btn transition active:scale-95"
              >
                Salvar Modelo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Biblioteca e Criador de Modelos de Receitas Salvos */}
      {isLoadModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-tab-fade">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-tactile-lg">
            
            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              {isCreatingCustomModel ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustomModel(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Voltar para a lista de modelos"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Novo Modelo de Receita
                  </h3>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Modelos de Receitas Salvos
                  </h3>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isCreatingCustomModel && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCustomModel(true);
                      setCustomModelDraftTitle('');
                      setCustomModelDraftItems([]);
                      setCustomModelSearchTerm('');
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-lg cursor-pointer flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Criar Modelo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadModelModalOpen(false);
                    setIsCreatingCustomModel(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CONTEÚDO DO MODAL */}
            {isCreatingCustomModel ? (
              /* MODO CRIAÇÃO DIRETA DE MODELO */
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome do Modelo
                  </label>
                  <input
                    type="text"
                    value={customModelDraftTitle}
                    onChange={(e) => setCustomModelDraftTitle(e.target.value)}
                    placeholder="Ex: Hipertensão Leve, ITU Ambulatorial, Pós-Op..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    autoFocus
                  />
                </div>

                {/* Busca de medicamentos para o modelo */}
                <div className="relative">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Adicionar Medicamento ao Modelo
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customModelSearchTerm}
                      onChange={(e) => handleCustomModelSearchChange(e.target.value)}
                      placeholder="Buscar medicamento (ex: Amoxicilina, Dipirona, Losartana)..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Sugestões do Autocomplete */}
                  {customModelSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-tactile-lg max-h-48 overflow-y-auto p-1 space-y-1">
                      {customModelSuggestions.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => handleAddCustomModelItem(sug)}
                          className="w-full text-left p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {sug.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {sug.route} • {sug.defaultQuantity}
                            </span>
                          </div>
                          <Plus className="w-4 h-4 text-sky-600 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de Medicamentos do Rascunho */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Medicamentos deste modelo ({customModelDraftItems.length}):
                  </span>

                  {customModelDraftItems.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      Nenhum medicamento incluído ainda. Digite o nome acima para adicionar.
                    </div>
                  ) : (
                    customModelDraftItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {item.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomModelItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition rounded"
                            title="Remover do modelo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                              Quantidade
                            </label>
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={(e) => handleUpdateCustomModelItem(item.id, { quantity: e.target.value })}
                              placeholder="1 caixa"
                              className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                              Posologia / Instruções
                            </label>
                            <input
                              type="text"
                              value={item.instructions}
                              onChange={(e) => handleUpdateCustomModelItem(item.id, { instructions: e.target.value })}
                              placeholder="Instruções de tomada"
                              className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* MODO LISTA DE MODELOS SALVOS */
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
                {savedPrescriptionModels.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                    <BookmarkPlus className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nenhum modelo de receita salvo ainda.
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                        Você pode criar um modelo agora mesmo ou salvar uma receita ativa na consulta.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCustomModel(true);
                        setCustomModelDraftTitle('');
                        setCustomModelDraftItems([]);
                        setCustomModelSearchTerm('');
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer transition shadow-tactile-btn inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Criar Meu Primeiro Modelo</span>
                    </button>
                  </div>
                ) : (
                  savedPrescriptionModels.map((model) => (
                    <div
                      key={model.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-sky-300 dark:hover:border-sky-800 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {model.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {model.prescriptionItems?.length || 0} medicamentos cadastrados
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePrescriptionModel(model.id, model.title)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition rounded"
                          title="Excluir este modelo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {model.prescriptionItems?.map(i => i.name).join(' • ')}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => handleApplyPrescriptionModel(model, 'append')}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 cursor-pointer transition"
                          title="Adicionar estes medicamentos mantendo os que já estão na receita"
                        >
                          Adicionar (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPrescriptionModel(model, 'replace')}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 cursor-pointer transition shadow-xs"
                          title="Substituir todos os medicamentos da receita por este modelo"
                        >
                          Substituir Receita
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* RODAPÉ DO MODAL */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              {isCreatingCustomModel ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustomModel(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomCreatedModel}
                    disabled={!customModelDraftTitle.trim() || customModelDraftItems.length === 0}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white cursor-pointer shadow-tactile-btn transition active:scale-95"
                  >
                    Salvar Modelo
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoadModelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
