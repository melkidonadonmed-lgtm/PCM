import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Search,
  Scale,
  AlertTriangle,
  X,
  Pill,
  RotateCcw,
  Printer,
  FileText,
  Sparkles,
  ArrowRight,
  Calculator,
  Clock,
  Layers,
  Edit2,
  Send,
  Share2,
  User,
  ShieldCheck,
  Lock,
  AlertCircle
} from 'lucide-react';
import { PrescriptionItem, Patient, DoctorProfile } from '../types';
import { generateScheduleTimes } from '../utils/doseCalculator';
import { QuantityAssistant, EMPTY_QUANTITY_PLAN } from './QuantityAssistant';
import type { PrescriptionKind, QuantityPlan } from '../types';
import {
  PRESCRIPTION_LABELS,
  normalizePrescriptionItem,
  prescriptionIssues,
  catalogPresentation,
  isAntimicrobialDrug,
  extractPresentationFromName,
  buildPrescriptionDocuments
} from '../utils/prescriptionRules';
import { safeStorage } from '../utils/storage';
import { UNIFIED_MEDICATIONS, UnifiedMedication, CATEGORY_LABELS } from '../data/medicationDatabase';

interface PrescriptionBuilderProps {
  isActive?: boolean;
  darkMode: boolean;
  doctor: DoctorProfile;
  onUpdateDoctor: (doctor: DoctorProfile) => void;
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  items: PrescriptionItem[];
  onUpdateItems: (items: PrescriptionItem[]) => void;
  weightCalcEnabled?: boolean;
  onToggleWeightCalc?: (enabled: boolean) => void;
  onClearPrescription?: () => void;
  onNavigateToPrint: () => void;
  onNavigateToPediatricCalc: () => void;
  onOpenDoctorModal: () => void;
  onOpenPatientModal: () => void;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  darkMode,
  isActive = true,
  doctor,
  patient,
  onUpdatePatient,
  items,
  onUpdateItems,
  onClearPrescription,
  onNavigateToPrint,
  onNavigateToPediatricCalc,
  onOpenPatientModal
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Mobile active tab ('composer' | 'preview')
  const [mobileSection, setMobileSection] = useState<'composer' | 'preview'>('composer');

  // Search & Category Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Fechar dropdown de sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atalho de Teclado Global: '/' ou 'Ctrl+K' / 'Cmd+K' para focar na busca rápida de fármacos
  useEffect(() => {
    if (!isActive) return;
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
  }, [isActive]);

  // Active form fields for adding/editing
  const [selectedMedName, setSelectedMedName] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('Uso Oral');
  const [selectedQuantity, setSelectedQuantity] = useState('1 caixa');
  const [selectedPosology, setSelectedPosology] = useState('');
  const [selectedKind, setSelectedKind] = useState<PrescriptionKind>('simple');
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>();
  const [selectedPresentation, setSelectedPresentation] = useState('');
  const [selectedSubstances, setSelectedSubstances] = useState('');
  const [selectedDays, setSelectedDays] = useState('');
  const [editDays, setEditDays] = useState('');
  const [quantityPlan, setQuantityPlan] = useState<QuantityPlan>(EMPTY_QUANTITY_PLAN);
  const [formError, setFormError] = useState('');
  const [editPresentation, setEditPresentation] = useState('');
  const [editKind, setEditKind] = useState<PrescriptionKind>('simple');
  const [editSubstances, setEditSubstances] = useState('');
  const [editQuantityPlan, setEditQuantityPlan] = useState<QuantityPlan>(EMPTY_QUANTITY_PLAN);

  // Estados para edição inline nos cards de medicamentos prescritos
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editInstructions, setEditInstructions] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Feedbacks
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [itemAddedToast, setItemAddedToast] = useState(false);

  // Estados de Recolher/Expandir (Collapsible) para Kits e Calculadora Pediátrica
  const [showKits, setShowKits] = useState<boolean>(() => {
    const saved = safeStorage.getItem('prescmed_show_kits');
    return saved !== null ? saved === 'true' : false; // Fechado por padrão para dar prioridade máxima à busca
  });

  const toggleKits = () => {
    setShowKits(prev => {
      const next = !prev;
      safeStorage.setItem('prescmed_show_kits', String(next));
      return next;
    });
  };

  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasWeight = patientWeight > 0;
  const patientName = patient?.name?.trim() || '';

  // Auto-reconciliação de itens legados ou incompletos na lista para prevenir discrepâncias e falsos erros
  useEffect(() => {
    if (!items || items.length === 0) return;
    let needsUpdate = false;
    const reconciled = items.map(it => {
      const normalized = normalizePrescriptionItem(it);
      if (
        it.schemaVersion !== 2 ||
        it.prescriptionKind !== normalized.prescriptionKind ||
        (!it.presentation && normalized.presentation) ||
        (!it.medicationId && normalized.medicationId) ||
        (!it.classificationReviewed && normalized.classificationReviewed)
      ) {
        needsUpdate = true;
        return normalized;
      }
      return it;
    });
    if (needsUpdate) {
      onUpdateItems(reconciled);
    }
  }, [items, onUpdateItems]);

  const prescriptionDocuments = useMemo(() => buildPrescriptionDocuments(items), [items]);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const activeDoc = prescriptionDocuments[activeDocIndex] || prescriptionDocuments[0];

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

  // Kits Clínicos Rápidos com Classificação Normativa (RDC 20/2011 & Port. 344/98)
  const clinicalKits = [
    {
      id: 'kit_amigdalite',
      name: 'Amigdalite Bacteriana',
      badge: 'Amoxicilina + AINE',
      description: 'Amoxicilina 500mg (10d) + Ibuprofeno 600mg + Dipirona',
      items: [
        {
          medicationId: 'amoxicilina-500mg',
          prescriptionKind: 'antimicrobial' as PrescriptionKind,
          presentation: '500 mg, cápsula',
          name: 'Amoxicilina 500mg cápsula (Amoxil)',
          route: 'Uso Oral',
          quantity: '1 caixa (21 cápsulas)',
          instructions: 'Tomar 1 cápsula via oral de 8 em 8 horas durante 7 a 10 dias consecutivos.',
          pediaDrugKey: 'amoxicilina_susp'
        },
        {
          medicationId: 'ibuprofeno-600mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '600 mg, comprimido',
          name: 'Ibuprofeno 600mg comprimido',
          route: 'Uso Oral',
          quantity: '1 caixa (10 comprimidos)',
          instructions: 'Tomar 1 comprimido via oral de 8 em 8 horas após as refeições por 3 dias.',
          pediaDrugKey: 'ibuprofeno_100'
        },
        {
          medicationId: 'dipirona-500mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '500 mg, comprimido',
          name: 'Dipirona Sódica 500mg comprimido (Novalgina)',
          route: 'Uso Oral',
          quantity: '1 caixa (20 comprimidos)',
          instructions: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor ou febre.',
          pediaDrugKey: 'dipirona_gotas'
        }
      ]
    },
    {
      id: 'kit_geca',
      name: 'Gastroenterite & Vômitos (GECA)',
      badge: 'Antiemético + SRO',
      description: 'Ondansetrona + SRO Hidratação + Simeticona',
      items: [
        {
          medicationId: 'ondansetrona-8mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '8 mg, comprimido orodispersível',
          name: 'Ondansetrona 8mg comprimido de desintegração oral (Vonau Flash)',
          route: 'Uso Oral',
          quantity: '1 caixa (10 comprimidos)',
          instructions: 'Dissolver 1 comprimido sob a língua de 8 em 8 horas em caso de náuseas ou vômitos.'
        },
        {
          medicationId: 'sro-sache',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '27,9 g, sachê',
          name: 'Sais para Reidratação Oral (SRO) 27,9g sachê',
          route: 'Uso Oral',
          quantity: '4 envelopes',
          instructions: 'Diluir 1 envelope em 1 litro de água filtrada/fervida. Beber ao longo do dia e após cada evacuação líquida.'
        },
        {
          medicationId: 'simeticona-gotas-75mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '75 mg/mL, gotas',
          name: 'Simeticona 75mg/mL emulsão oral gotas (Luftal)',
          route: 'Uso Oral',
          quantity: '1 frasco (15 mL)',
          instructions: 'Tomar 40 gotas via oral de 8 em 8 horas em caso de cólicas e gases.'
        }
      ]
    },
    {
      id: 'kit_ivas',
      name: 'IVAS / Gripe & Resfriado',
      badge: 'Sintomáticos + Lavagem',
      description: 'Dipirona + Paracetamol + Lavagem Nasal com SF 0,9%',
      items: [
        {
          medicationId: 'dipirona-500mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '500 mg, comprimido',
          name: 'Dipirona Sódica 500mg comprimido (Novalgina)',
          route: 'Uso Oral',
          quantity: '1 caixa (20 comprimidos)',
          instructions: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor ou febre.',
          pediaDrugKey: 'dipirona_gotas'
        },
        {
          medicationId: 'paracetamol-750mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '750 mg, comprimido',
          name: 'Paracetamol 750mg comprimido (Tylenol)',
          route: 'Uso Oral',
          quantity: '1 caixa (20 comprimidos)',
          instructions: 'Tomar 1 comprimido via oral de 8 em 8 horas se dor persistente.',
          pediaDrugKey: 'paracetamol_gotas'
        },
        {
          medicationId: 'soro-fisiologico-09',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '0,9%, frasco',
          name: 'Cloreto de Sódio 0,9% frasco para lavagem nasal (Soro Fisiológico)',
          route: 'Uso Nasal',
          quantity: '1 frasco (100 mL)',
          instructions: 'Aplicar 5 a 10 mL em cada narina com seringa ou spray de 4 em 4 horas.'
        }
      ]
    },
    {
      id: 'kit_lombalgia',
      name: 'Lombalgia / Dor Aguda',
      badge: 'AINE + Relaxante Muscular',
      description: 'Cetoprofeno + Dipirona 1g + Ciclobenzaprina + Omeprazol',
      items: [
        {
          medicationId: 'cetoprofeno-100mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '100 mg, comprimido',
          name: 'Cetoprofeno 100mg comprimido (Profenid)',
          route: 'Uso Oral',
          quantity: '1 caixa (10 comprimidos)',
          instructions: 'Tomar 1 comprimido via oral de 12 em 12 horas após as refeições por 5 dias.'
        },
        {
          medicationId: 'dipirona-1g',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '1 g, comprimido',
          name: 'Dipirona Sódica 1g comprimido',
          route: 'Uso Oral',
          quantity: '1 caixa (10 comprimidos)',
          instructions: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor intensa.'
        },
        {
          medicationId: 'ciclobenzaprina-5mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '5 mg, comprimido',
          name: 'Cloridrato de Ciclobenzaprina 5mg comprimido (Miosan)',
          route: 'Uso Oral',
          quantity: '1 caixa (10 comprimidos)',
          instructions: 'Tomar 1 comprimido via oral à noite ao deitar durante 5 dias.'
        },
        {
          medicationId: 'omeprazol-20mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '20 mg, cápsula',
          name: 'Omeprazol 20mg cápsula',
          route: 'Uso Oral',
          quantity: '1 caixa (14 cápsulas)',
          instructions: 'Tomar 1 cápsula via oral pela manhã em jejum durante o uso do anti-inflamatório.'
        }
      ]
    },
    {
      id: 'kit_itu',
      name: 'Infecção Urinária (ITU)',
      badge: 'Fosfomicina + Analgésico',
      description: 'Fosfomicina 3g Dose Única + Buscopan Composto',
      items: [
        {
          medicationId: 'fosfomicina-3g',
          prescriptionKind: 'antimicrobial' as PrescriptionKind,
          presentation: '3 g, sachê granulado',
          name: 'Fosfomicina Trometamol 3g sachê granulado (Monuril)',
          route: 'Uso Oral',
          quantity: '1 envelope (3g)',
          instructions: 'Dissolver em 1/2 copo de água e tomar em dose única à noite antes de deitar, após esvaziar a bexiga.'
        },
        {
          medicationId: 'buscopan-composto',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '10 mg + 250 mg, drágea',
          name: 'Butilbrometo de Escopolamina + Dipirona (Buscopan Composto)',
          route: 'Uso Oral',
          quantity: '1 caixa (20 drágeas)',
          instructions: 'Tomar 1 a 2 drágeas via oral de 8 em 8 horas em caso de dor ou cólica.'
        }
      ]
    },
    {
      id: 'kit_asma',
      name: 'Crise de Asma / Broncoespasmo',
      badge: 'Spray + Corticoide',
      description: 'Salbutamol Spray 100mcg + Prednisolona Oral',
      items: [
        {
          medicationId: 'salbutamol-spray-100mcg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '100 mcg/dose, spray aerossol',
          name: 'Sulfato de Salbutamol 100mcg/dose spray aerossol (Aerolin)',
          route: 'Uso Inalatória',
          quantity: '1 frasco (200 doses)',
          instructions: 'Inalar 2 a 4 jatos com espaçador de 6 em 6 horas ou de 4 em 4 horas se tosse/falta de ar.'
        },
        {
          medicationId: 'prednisolona-20mg',
          prescriptionKind: 'simple' as PrescriptionKind,
          presentation: '20 mg, comprimido',
          name: 'Prednisolona 20mg comprimido (ou 3mg/mL suspensão)',
          route: 'Uso Oral',
          quantity: '1 caixa (10 comprimidos)',
          instructions: 'Tomar 1 a 2 comprimidos (40mg) via oral pela manhã durante 5 dias.',
          pediaDrugKey: 'prednisolona_sol'
        }
      ]
    }
  ];

  // Filter medications based on search and category
  const filteredMedications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return UNIFIED_MEDICATIONS.filter(med => {
      const matchCat = activeCategory === 'all' || med.category === activeCategory;
      if (!matchCat) return false;
      if (!term) return true;
      return (
        med.name.toLowerCase().includes(term) ||
        med.activeIngredient.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, activeCategory]);

  // Autocomplete suggestions (Instantâneo A-Z: catálogo completo navegável de A a Z)
  const searchSuggestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let baseList = UNIFIED_MEDICATIONS;
    if (activeCategory !== 'all') {
      baseList = baseList.filter(med => med.category === activeCategory);
    }

    if (!term) {
      if (selectedLetter) {
        return baseList
          .filter(med => med.name.toUpperCase().startsWith(selectedLetter))
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      // Retorna todo o catálogo ordenado alfabeticamente para permitir rolagem de A a Z
      return [...baseList].sort((a, b) => a.name.localeCompare(b.name));
    }

    return baseList.filter(med =>
      med.name.toLowerCase().includes(term) ||
      med.activeIngredient.toLowerCase().includes(term)
    );
  }, [searchTerm, activeCategory, selectedLetter]);

  // Select medication from database into the composer form
  const handleSelectMedication = (med: UnifiedMedication) => {
    setSelectedMedName(med.name);
    setSelectedRoute(med.route);
    setSelectedQuantity(med.defaultQuantity);
    setSelectedPosology(med.defaultPosology);
    setSelectedMedicationId(med.id);
    setSelectedPresentation(catalogPresentation(med.name) || extractPresentationFromName(med.name));
    setSelectedSubstances((med.controlledSubstances || []).join(', '));
    setSelectedDays('');
    const kind = med.category === 'antibioticos' || isAntimicrobialDrug(med.name) ? 'antimicrobial' : med.prescriptionKind;
    setSelectedKind(kind);
    setQuantityPlan(EMPTY_QUANTITY_PLAN);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  // Add Item to Prescription
  const handleAddMedicationToPrescription = () => {
    if (!selectedMedName.trim()) {
      setFormError('Selecione ou digite o nome do medicamento.');
      return;
    }
    if (!selectedPosology.trim()) {
      setFormError('Informe a posologia / instruções de uso.');
      return;
    }

    const finalKind: PrescriptionKind = isAntimicrobialDrug(selectedMedName)
      ? 'antimicrobial'
      : (selectedKind !== 'pending' ? selectedKind : 'simple');
    const finalPresentation = selectedPresentation.trim() || extractPresentationFromName(selectedMedName) || 'Dose padrão';

    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: selectedMedName.trim(),
      presentation: finalPresentation,
      medicationId: selectedMedicationId,
      schemaVersion: 2,
      prescriptionKind: finalKind,
      classificationReviewed: true,
      quantityPlan,
      controlledSubstances: selectedSubstances.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      durationDays: selectedDays ? Number(selectedDays) : undefined,
      route: selectedRoute,
      quantity: selectedQuantity.trim(),
      doseCalculatedText: '',
      frequencyText: selectedPosology.trim(),
      scheduleInterval: '',
      scheduleTimes: [],
      instructions: selectedPosology.trim(),
      isContinuous: selectedPosology.toLowerCase().includes('contínuo'),
      isSpecialControl: finalKind === 'c1'
    };

    if (!newItem.quantity) { setFormError('Informe a quantidade dispensada.'); return; }
    setFormError('');
    onUpdateItems([...items, normalizePrescriptionItem(newItem)]);
    setItemAddedToast(true);
    setTimeout(() => setItemAddedToast(false), 2000);

    // Reset fields for next entry
    setSelectedMedName('');
    setSelectedQuantity('1 caixa');
    setSelectedPosology('');
    setSelectedKind('simple');
    setSelectedSubstances('');
    setSelectedDays('');
    setSelectedMedicationId(undefined);
    setSelectedPresentation('');
    setQuantityPlan(EMPTY_QUANTITY_PLAN);
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

  // Sharing always goes through the same document review and validation.
  const handleCopyText = onNavigateToPrint;
  const handleSendWhatsApp = onNavigateToPrint;

  // Apply a full clinical kit with 1 click
  const handleApplyClinicalKit = (kit: typeof clinicalKits[0]) => {
    const newPrescriptionItems: PrescriptionItem[] = kit.items.map((kitItem, idx) => {
      let itemName = kitItem.name;
      let itemPresentation = kitItem.quantity;
      let itemPresentationSpec = kitItem.presentation;
      let itemInstructions = kitItem.instructions;
      let itemDoseCalculatedText = '';
      let itemMedId = kitItem.medicationId;
      let itemKind: PrescriptionKind = kitItem.prescriptionKind || (isAntimicrobialDrug(itemName) ? 'antimicrobial' : 'simple');

      if (hasWeight && kitItem.pediaDrugKey) {
        if (kitItem.pediaDrugKey === 'dipirona_gotas') {
          const drops = Math.min(Math.round(patientWeight), 40);
          itemName = 'Dipirona Sódica 500mg/mL gotas (Novalgina)';
          itemPresentation = '1 frasco (20 mL)';
          itemPresentationSpec = '500 mg/mL, gotas';
          itemMedId = 'dipirona-gotas-500mg';
          itemKind = 'simple';
          itemInstructions = `Administrar ${drops} gotas via oral de 6 em 6 horas se dor ou febre (máx 4x ao dia).`;
          itemDoseCalculatedText = `${drops} gotas`;
        } else if (kitItem.pediaDrugKey === 'paracetamol_gotas') {
          const drops = Math.min(Math.round(patientWeight), 35);
          itemName = 'Paracetamol 200mg/mL gotas (Tylenol Bebê/Criança)';
          itemPresentation = '1 frasco (15 mL)';
          itemPresentationSpec = '200 mg/mL, gotas';
          itemMedId = 'paracetamol-gotas-200mg';
          itemKind = 'simple';
          itemInstructions = `Administrar ${drops} gotas via oral de 6 em 6 horas se dor ou febre.`;
          itemDoseCalculatedText = `${drops} gotas`;
        } else if (kitItem.pediaDrugKey === 'ibuprofeno_100') {
          const drops = Math.min(Math.round(patientWeight), 40);
          itemName = 'Ibuprofeno 100mg/mL suspensão gotas (Alivium)';
          itemPresentation = '1 frasco (20 mL)';
          itemPresentationSpec = '100 mg/mL, gotas';
          itemMedId = 'ibuprofeno-gotas-100mg';
          itemKind = 'simple';
          itemInstructions = `Administrar ${drops} gotas via oral de 8 em 8 horas após as refeições por 3 dias.`;
          itemDoseCalculatedText = `${drops} gotas`;
        } else if (kitItem.pediaDrugKey === 'amoxicilina_susp') {
          const mlPerDose = parseFloat(((patientWeight * 50) / 3 / 50).toFixed(1));
          itemName = 'Amoxicilina 250mg/5mL pó para suspensão oral (Amoxil)';
          itemPresentation = '1 frasco (150 mL)';
          itemPresentationSpec = '250 mg/5 mL, suspensão oral';
          itemMedId = 'amoxicilina-susp-250mg';
          itemKind = 'antimicrobial';
          itemInstructions = `Administrar ${mlPerDose} mL via oral de 8 em 8 horas durante 10 dias consecutivos.`;
          itemDoseCalculatedText = `${mlPerDose} mL`;
        } else if (kitItem.pediaDrugKey === 'prednisolona_sol') {
          const mlPerDose = parseFloat(((patientWeight * 1) / 3).toFixed(1));
          itemName = 'Fosfato Sódico de Prednisolona 3mg/mL solução oral (Prelone)';
          itemPresentation = '1 frasco (60 mL)';
          itemPresentationSpec = '3 mg/mL, solução oral';
          itemMedId = 'prednisolona-sol-3mg';
          itemKind = 'simple';
          itemInstructions = `Administrar ${mlPerDose} mL via oral 1 vez ao dia, pela manhã, por 5 dias.`;
          itemDoseCalculatedText = `${mlPerDose} mL`;
        }
      }

      return {
        id: `kit-item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        name: itemName,
        presentation: itemPresentationSpec || catalogPresentation(itemName) || extractPresentationFromName(itemName) || 'Dose padrão',
        prescriptionKind: itemKind,
        medicationId: itemMedId,
        schemaVersion: 2,
        classificationReviewed: true,
        route: kitItem.route,
        quantity: itemPresentation,
        doseCalculatedText: itemDoseCalculatedText,
        frequencyText: itemInstructions,
        scheduleInterval: '',
        scheduleTimes: [],
        instructions: itemInstructions,
        isContinuous: false,
        isSpecialControl: itemKind === 'c1' || Boolean((kitItem as any).isSpecial),
        calculatedFromWeight: hasWeight ? patientWeight : undefined
      };
    });

    onUpdateItems([...items, ...newPrescriptionItems.map(normalizePrescriptionItem)]);
    setItemAddedToast(true);
    setTimeout(() => setItemAddedToast(false), 2500);
  };

  // Funções de Edição Inline de Itens da Receita
  const handleStartEditItem = (it: PrescriptionItem) => {
    setEditingItemId(it.id);
    setEditInstructions(it.instructions);
    setEditQuantity(it.quantity);
    setEditDays(it.durationDays ? String(it.durationDays) : '');
    setEditPresentation(it.presentation === it.quantity ? '' : it.presentation);
    setEditKind(normalizePrescriptionItem(it).prescriptionKind);
    setEditSubstances((normalizePrescriptionItem(it).controlledSubstances || []).join(', '));
    setEditQuantityPlan(it.quantityPlan ?? EMPTY_QUANTITY_PLAN);
  };

  const handleSaveEditItem = (id: string) => {
    onUpdateItems(items.map(i => i.id === id ? {
      ...i,
      quantity: editQuantity.trim(),
      presentation: editPresentation.trim(),
      schemaVersion: 2,
      prescriptionKind: editKind,
      classificationReviewed: editKind !== 'pending',
      controlledSubstances: editSubstances.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      quantityPlan: editQuantityPlan,
      durationDays: editDays ? Number(editDays) : undefined,
      scheduleTimes: [],
      instructions: editInstructions.trim() || i.instructions,
      frequencyText: editInstructions.trim() || i.frequencyText
    } : i));
    setEditingItemId(null);
  };

  const handleCancelEditItem = () => {
    setEditingItemId(null);
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map(i => i.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItemIds.length === 0) return;
    if (confirm(`Deseja remover os ${selectedItemIds.length} medicamentos selecionados?`)) {
      onUpdateItems(items.filter(i => !selectedItemIds.includes(i.id)));
      setSelectedItemIds([]);
    }
  };

  return (
    <div className="prescription-workspace w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Stepper de Etapas do Atendimento (Linear e Acessível) */}
      <nav aria-label="Etapas da Prescrição" className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10 shadow-tactile dark:shadow-tactile-navy flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Etapa 1: Paciente Identificado */}
          <button
            type="button"
            onClick={onOpenPatientModal}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer border-none transition-all"
            title="Etapa 1: Definir identificação e dados cadastrais do paciente"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>1. {patientName || 'Identificar paciente'}</span>
          </button>

          <span className="text-slate-300 dark:text-slate-600 text-xs select-none">›</span>

          {/* Etapa 2: Prescrição Ativa (Em andamento) */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 shadow-xs"
            title="Etapa 2: Em andamento — Prescrever fármacos"
          >
            <Search className="w-3.5 h-3.5" />
            <span>2. Prescrever fármacos ({items.length})</span>
          </div>
        </div>

        {/* Etapa 3: Avançar para Revisão & Impressão */}
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 border-none shadow-tactile-btn bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onNavigateToPrint}
          disabled={!items.length}
          title="Etapa 3: Revisar as vias normativas e emitir PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>3. Revisar e exportar ({items.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </nav>
      
      {/* Barra Rápida de Identificação do Paciente (Contexto Clínico Unificado) */}
      <section className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10 shadow-tactile dark:shadow-tactile-navy flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 border shadow-tactile-sm transition-colors ${
            patientName
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
              : 'bg-navy-900/10 dark:bg-white/10 text-navy-900 dark:text-cream-100 border-navy-900/15 dark:border-white/15'
          }`}>
            <User className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="pb-patient-name" className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
              Identificação do Paciente
            </label>
            <input
              id="pb-patient-name"
              name="patientName"
              type="text"
              value={patient.name}
              onChange={(e) => onUpdatePatient({ ...patient, name: e.target.value })}
              placeholder="Nome completo do paciente em atendimento..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
          <div className="w-28 sm:w-32">
            <label htmlFor="pb-patient-weight" className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-navy-900 dark:text-cream-200" strokeWidth={1.75} />
              <span>Peso (kg)</span>
            </label>
            <input
              id="pb-patient-weight"
              name="patientWeight"
              aria-label="Peso do paciente em quilogramas"
              type="number"
              step="0.1"
              min="0"
              value={patient.weightKg || ''}
              onChange={(e) => onUpdatePatient({ ...patient, weightKg: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 14.5"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="pt-3.5">
            <button
              type="button"
              onClick={onOpenPatientModal}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all cursor-pointer border-none min-h-[44px] flex items-center justify-center"
              title="Ver e preencher dados cadastrais completos (CPF, Idade, Endereço)"
            >
              Ficha Completa
            </button>
          </div>
        </div>
      </section>

      {/* Top Mobile View Switcher */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-xl bg-slate-200 dark:bg-navy-900 border border-slate-300 dark:border-navy-700">
        <button
          onClick={() => setMobileSection('composer')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            mobileSection === 'composer'
              ? 'bg-navy-800 text-white shadow-tactile-btn'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Prescrever Medicamentos
        </button>
        <button
          onClick={() => setMobileSection('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
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
        
        {/* LEFT COLUMN: Composer, Calculator, Search and Quick Picks */}
        <div className={`xl:col-span-7 space-y-5 ${mobileSection === 'preview' ? 'hidden md:block' : 'block'}`}>
          
          {/* Card 1: Busca Rápida de Medicamentos (370+ RENAME / SUS / Referência) - TOPO PRIORITÁRIO */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-white/10 shadow-tactile dark:shadow-tactile-navy space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-navy-900/10 text-navy-900 dark:bg-white/10 dark:text-cream-100 flex items-center justify-center font-bold border border-navy-900/15 dark:border-white/15 shrink-0 shadow-tactile-sm">
                  <Search className="w-4 h-4 text-navy-900 dark:text-cream-200" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-cream-50">
                    Prescrição Rápida de Medicamentos
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Catálogo com 370+ fármacos do SUS, RENAME e Referência (Adulto & Pediátrico)
                  </p>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar fade-scroll-x">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'analgesicos', label: 'Sintomáticos & AINEs' },
                { id: 'antibioticos', label: 'Antibióticos' },
                { id: 'cardio', label: 'Cardio & HAS' },
                { id: 'diabetes', label: 'Diabetes & Endócrino' },
                { id: 'respiratorio', label: 'Respiratório' },
                { id: 'gastro', label: 'Gastroenterologia' },
                { id: 'snc', label: 'SNC & Psiquiatria' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer shadow-tactile-sm ${
                    activeCategory === cat.id
                      ? 'bg-navy-900 dark:bg-cream-100 text-white dark:text-navy-950 font-black'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input with Instant Autocomplete */}
            <div ref={searchContainerRef} className="relative">
              <label htmlFor="med-search-input" className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-navy-900 dark:bg-cream-100 text-white dark:text-navy-950 text-[9px] font-black flex items-center justify-center shrink-0">1</span>
                  Buscar Fármaco, Princípio Ativo ou Nome Comercial
                </span>
                <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline-flex items-center gap-1">
                  Atalho: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 border border-slate-300 dark:border-navy-700 font-mono text-[9px] text-slate-600 dark:text-slate-300">Ctrl+K</kbd> ou <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 border border-slate-300 dark:border-navy-700 font-mono text-[9px] text-slate-600 dark:text-slate-300">/</kbd>
                </span>
              </label>
              <div className="relative">
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
                  placeholder="Ex: Dipirona (Novalgina), Losartana, Amoxicilina, Omeprazol, Sertralina..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-sm font-semibold focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-slate-100"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown (Instant, No Blocker, A-Z Navegável) */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-80 sm:max-h-96 overflow-y-auto overscroll-contain custom-scrollbar rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-tactile-navy z-30 divide-y divide-slate-100 dark:divide-navy-800">
                  {/* Sticky Header com Total e Orientação de Rolagem */}
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-navy-950/95 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-navy-800 sticky top-0 z-20 backdrop-blur-xs">
                    <span>{searchSuggestions.length} medicamentos ({searchTerm.trim() ? 'filtrados' : selectedLetter ? `Iniciados por "${selectedLetter}"` : 'Catálogo A a Z'})</span>
                    <span className="text-[10px] text-slate-400 font-normal">Use a roda do mouse ou toque nas letras</span>
                  </div>

                  {/* Fita de Navegação Rápida A-Z (Quick Alpha Jump) */}
                  {!searchTerm.trim() && (
                    <div className="p-1.5 bg-slate-100/95 dark:bg-navy-900/95 border-b border-slate-200 dark:border-navy-800 sticky top-[33px] z-10 backdrop-blur-xs flex items-center gap-1 overflow-x-auto custom-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSelectedLetter(null)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold shrink-0 transition-all cursor-pointer ${
                          selectedLetter === null
                            ? 'bg-navy-800 text-white dark:bg-cream-100 dark:text-navy-950 shadow-xs'
                            : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
                        }`}
                      >
                        Todos
                      </button>
                      {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                          className={`w-6 h-6 rounded-lg text-[10px] font-black shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                            selectedLetter === letter
                              ? 'bg-navy-800 text-white dark:bg-cream-100 dark:text-navy-950 shadow-xs scale-105'
                              : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  )}

                  {searchSuggestions.map(med => (
                    <button type="button"
                      key={med.id}
                      onClick={() => handleSelectMedication(med)}
                      className="w-full text-left p-3 hover:bg-sky-50 dark:hover:bg-navy-800 cursor-pointer flex items-center justify-between gap-2 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-cream-50 truncate">
                          {med.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {med.defaultPosology}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-navy-800 text-sky-600 dark:text-sky-400 shrink-0">
                        {med.route}
                      </span>
                    </button>
                  ))}

                  <div className="p-2 text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-navy-950/50">
                    Fim do catálogo ({searchSuggestions.length} fármacos)
                  </div>
                </div>
              )}
            </div>

            {/* Form de Edição e Adição Direta */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-white/10 space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span className="w-4 h-4 rounded-full bg-navy-900 dark:bg-cream-100 text-white dark:text-navy-950 text-[9px] font-black flex items-center justify-center shrink-0">2</span>
                  Dados da Prescrição
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Campos marcados com * são essenciais</span>
              </div>

              {/* Linha 1: Medicamento & Apresentação */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <label htmlFor="pb-confirm-med" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medicamento / Princípio Ativo *
                  </label>
                  <div className="relative">
                    <input
                      id="pb-confirm-med"
                      name="confirmMed"
                      type="text"
                      value={selectedMedName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMedName(val);
                        setSelectedMedicationId(undefined);
                        const isAnti = isAntimicrobialDrug(val);
                        setSelectedKind(isAnti ? 'antimicrobial' : 'simple');
                        const ext = extractPresentationFromName(val);
                        if (ext) setSelectedPresentation(ext);
                      }}
                      placeholder="Preenchido ao buscar acima — ou digite o nome livremente"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-navy-900 border text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition-colors ${
                        selectedMedName.trim()
                          ? 'border-emerald-500/60 dark:border-emerald-500/50'
                          : 'border-slate-300 dark:border-white/10'
                      }`}
                    />
                    {selectedMedName.trim() && (
                      <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <label htmlFor="pb-presentation-input" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Apresentação / Concentração *
                  </label>
                  <input
                    id="pb-presentation-input"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/10 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none"
                    value={selectedPresentation}
                    onChange={e => setSelectedPresentation(e.target.value)}
                    placeholder="Ex.: 500 mg, comprimido; 250 mg/5 mL"
                  />
                </div>
              </div>

              {/* Linha 2: Via de Administração, Quantidade & Tipo de Receita */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label htmlFor="pb-route-select" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Via de Administração
                  </label>
                  <select
                    id="pb-route-select"
                    name="routeSelect"
                    aria-label="Via de Administração"
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
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

                <div className="sm:col-span-4">
                  <label htmlFor="pb-quantity-input" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quantidade Dispensada
                  </label>
                  <input
                    id="pb-quantity-input"
                    name="quantityInput"
                    type="text"
                    value={selectedQuantity}
                    onChange={(e) => { setSelectedQuantity(e.target.value); setQuantityPlan(p => ({ ...p, source: 'manual' })); }}
                    placeholder="Ex: 1 caixa, 2 frascos"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="pb-kind-select" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Receituário
                  </label>
                  <select
                    id="pb-kind-select"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100 cursor-pointer disabled:opacity-80"
                    value={selectedKind}
                    disabled={Boolean(selectedMedicationId)}
                    onChange={e => {
                      const next = e.target.value as PrescriptionKind;
                      if (next === 'simple' && isAntimicrobialDrug(selectedMedName)) {
                        setFormError('Antimicrobianos exigem Receituário de Controle Especial em 2 vias (RDC 20/2011).');
                        return;
                      }
                      setFormError('');
                      setSelectedKind(next);
                    }}
                  >
                    {Object.entries(PRESCRIPTION_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </div>
              </div>

              {/* Linha 3: Duração & Auxiliares C1 / Embalagens */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                <div className="sm:col-span-4">
                  <label htmlFor="pb-days-input" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duração / Período (dias)
                  </label>
                  <input
                    id="pb-days-input"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100"
                    type="number"
                    min="1"
                    step="1"
                    value={selectedDays}
                    onChange={e => { setSelectedDays(e.target.value); setQuantityPlan(p => ({ ...p, source: p.source === 'suggested' ? 'stale' : p.source })); }}
                    placeholder="Dias definidos"
                  />
                </div>

                {selectedKind === 'c1' && !selectedMedicationId && (
                  <div className="sm:col-span-8">
                    <label htmlFor="pb-c1-substances" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Substâncias C1 (separadas por vírgula)
                    </label>
                    <input
                      id="pb-c1-substances"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100"
                      value={selectedSubstances}
                      onChange={e => setSelectedSubstances(e.target.value)}
                      placeholder="Ex.: fluoxetina, sertralina"
                    />
                  </div>
                )}
              </div>

              {/* Assistente de Cálculo de Embalagens */}
              <QuantityAssistant value={quantityPlan} onChange={setQuantityPlan} onApply={text => { setSelectedQuantity(text); setSelectedDays(String(quantityPlan.days)); }} />

              {/* Linha 4: Posologia & Instruções de Uso com Atalhos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label htmlFor="pb-posology-textarea" className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Instruções de Uso / Posologia ao Paciente *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">Atalhos rápidos:</span>
                    <select
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer border-none transition-colors"
                      value=""
                      onChange={(e) => {
                        const escolhido = posologyShortcuts[Number(e.target.value)];
                        if (escolhido) setSelectedPosology(escolhido.text);
                      }}
                    >
                      <option value="">Aplicar modelo…</option>
                      {posologyShortcuts.map((ps, idx) => (
                        <option key={idx} value={idx}>{ps.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea
                  id="pb-posology-textarea"
                  name="posologyTextarea"
                  rows={2}
                  value={selectedPosology}
                  onChange={(e) => { setSelectedPosology(e.target.value); setQuantityPlan(p => ({ ...p, source: p.source === 'suggested' ? 'stale' : p.source })); }}
                  placeholder="Ex: Tomar 1 comprimido via oral de 8 em 8 horas após as refeições por 5 dias consecutivos..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-xs font-medium outline-none text-slate-900 dark:text-slate-100 transition-colors"
                />
              </div>

              {/* Status & Alertas */}
              {selectedKind === 'pending' && (
                <p role="status" className="text-xs p-2.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  A classificação do receituário precisa ser confirmada antes da emissão do documento.
                </p>
              )}
              {formError && (
                <p role="alert" className="text-xs p-2.5 rounded-xl bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20 font-bold">
                  {formError}
                </p>
              )}

              {/* Botão de Adição */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddMedicationToPrescription}
                  className="tactile-btn-primary w-full sm:w-auto min-h-[44px] px-7 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-tactile-sm"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>Adicionar à Receita</span>
                </button>
              </div>
            </div>
          </section>

          {/* Card 2: Kits Rápidos de Plantão & Visita Domiciliar (Com Toggle Recolhível) */}
          <section className="rounded-2xl bg-white dark:bg-navy-900 border border-cream-300/80 dark:border-navy-700 shadow-tactile dark:shadow-tactile-navy overflow-hidden transition-all">
            {/* Header Accordion Bar */}
            <button 
              type="button"
              onClick={toggleKits}
              aria-expanded={showKits}
              aria-controls="kits-content-panel"
              className="w-full p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-navy-800/60 transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-cream-100 outline-none text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-navy-900/10 dark:bg-cream-100/15 text-navy-900 dark:text-cream-100 flex items-center justify-center font-bold border border-navy-900/20 dark:border-cream-100/25 shrink-0">
                  <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-cream-50">
                      Kits Rápidos
                    </h2>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-navy-900/10 text-navy-900 dark:bg-cream-100/15 dark:text-cream-100 border border-navy-900/20 dark:border-cream-100/25">
                      {clinicalKits.length} Kits
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {showKits ? 'Recolher' : 'Expandir'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-transform duration-200">
                  {showKits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {/* Kits Content (Visible when expanded) */}
            {showKits && (
              <div id="kits-content-panel" className="p-4 sm:p-5 pt-0 sm:pt-0 border-t border-slate-100 dark:border-navy-800 animate-tab-fade">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3">
                  {clinicalKits.map(kit => (
                    <button
                      key={kit.id}
                      type="button"
                      onClick={() => handleApplyClinicalKit(kit)}
                      className="p-3 rounded-xl border bg-slate-50 dark:bg-navy-800 hover:border-navy-800/50 dark:hover:border-cream-100/50 border-slate-200 dark:border-navy-700 text-left transition active:scale-95 cursor-pointer shadow-tactile-sm group flex flex-col justify-between"
                      title="Clique para adicionar todo o combo de medicamentos à receita"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-navy-900 dark:text-cream-50 truncate group-hover:text-navy-700 dark:group-hover:text-cream-200">
                            {kit.name}
                          </span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-navy-900/10 text-navy-900 dark:bg-cream-100/15 dark:text-cream-100 shrink-0">
                            {kit.items.length} fármacos
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {kit.description}
                        </p>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-navy-700/60 flex items-center justify-between text-[10px] font-bold text-navy-900 dark:text-cream-100">
                        <span>{kit.badge}</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Inserir Kit +</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Card 3: Lista de Medicamentos Prescritos na Receita */}
          <section className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-tactile dark:shadow-tactile-navy space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-cream-50">
                  Medicamentos Prescritos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-navy-800 dark:bg-navy-700 text-white">
                  {items.length}
                </span>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-navy-900 dark:hover:text-cream-50 ml-2 cursor-pointer transition-colors"
                  >
                    {selectedItemIds.length === items.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedItemIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Excluir Selecionados ({selectedItemIds.length})</span>
                  </button>
                )}

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearPrescription}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Limpar Tudo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Resumo de Separação Normativa das Vias */}
            {items.length > 0 && (() => {
              const antimicrobials = prescriptionDocuments.filter(d => d.kind === 'antimicrobial');
              const c1Docs = prescriptionDocuments.filter(d => d.kind === 'c1');
              const simpleDocs = prescriptionDocuments.filter(d => d.kind === 'simple');
              return (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Separação por tipo de receita:
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {antimicrobials.map(d => (
                      <span key={d.id} className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>Receituário de Antimicrobianos ({d.items.length})</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">2 vias (RDC 20/2011)</span>
                      </span>
                    ))}
                    {c1Docs.map(d => (
                      <span key={d.id} className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Controle Especial C1 ({d.items.length})</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">2 vias (Port. 344/98)</span>
                      </span>
                    ))}
                    {simpleDocs.map(d => (
                      <span key={d.id} className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium text-xs">
                        <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                        <span>Receita Simples ({d.items.length})</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">1 via</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {items.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-navy-950 border border-dashed border-slate-300 dark:border-navy-800 text-slate-400 text-xs italic">
                Nenhum medicamento adicionado ainda. Use a busca acima, clique nos atalhos ou utilize a calculadora pediátrica.
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((it, idx) => {
                  const norm = normalizePrescriptionItem(it);
                  const issues = prescriptionIssues(it);
                  const kind = norm.prescriptionKind;
                  const isAnti = kind === 'antimicrobial';
                  const isC1 = kind === 'c1';
                  const isPending = kind === 'pending';

                  return (
                    <div
                      key={it.id}
                      className={`p-3.5 rounded-xl border transition-all shadow-tactile-sm ${
                        selectedItemIds.includes(it.id)
                          ? 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800/80'
                          : 'bg-white dark:bg-navy-950/70 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      {editingItemId === it.id ? (
                        /* Formulário de Edição Inline */
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-cream-50 flex items-center gap-1.5">
                              <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                              Editando: {it.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveEditItem(it.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-tactile-sm"
                                title="Salvar alterações"
                              >
                                <Check className="w-3.5 h-3.5" /> Salvar
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditItem}
                                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-navy-700 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                                title="Cancelar edição"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <label className="block">Apresentação<input className="clinical-input" value={editPresentation} onChange={e => setEditPresentation(e.target.value)} /></label>
                          <label className="block">Classificação revisada<select className="clinical-input" value={editKind} disabled={Boolean(it.medicationId)} onChange={e => setEditKind(e.target.value as PrescriptionKind)}>{Object.entries(PRESCRIPTION_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                          {editKind === 'c1' && <label className="block">Substâncias C1 (separadas por vírgula)<input className="clinical-input" disabled={Boolean(it.medicationId)} value={editSubstances} onChange={e => setEditSubstances(e.target.value)} /></label>}
                          <label className="block">Duração / período (dias)<input className="clinical-input" type="number" min="1" step="1" value={editDays} onChange={e => { setEditDays(e.target.value); setEditQuantityPlan(p => ({ ...p, source: p.source === 'suggested' ? 'stale' : p.source })); }} /></label>
                          <QuantityAssistant value={editQuantityPlan} onChange={setEditQuantityPlan} onApply={text => { setEditQuantity(text); setEditDays(String(editQuantityPlan.days)); }} />
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label htmlFor={`pb-edit-qty-${it.id}`} className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                                Quantidade dispensada
                              </label>
                              <input
                                id={`pb-edit-qty-${it.id}`}
                                name={`editQuantity-${it.id}`}
                                type="text"
                                value={editQuantity}
                                onChange={(e) => { setEditQuantity(e.target.value); setEditQuantityPlan(p => ({ ...p, source: 'manual' })); }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label htmlFor={`pb-edit-inst-${it.id}`} className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                                Instruções de Uso / Posologia
                              </label>
                              <input
                                id={`pb-edit-inst-${it.id}`}
                                name={`editInstructions-${it.id}`}
                                type="text"
                                value={editInstructions}
                                onChange={(e) => { setEditInstructions(e.target.value); setEditQuantityPlan(p => ({ ...p, source: p.source === 'suggested' ? 'stale' : p.source })); }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Visualização Normal com Checkbox e Ações Rápidas */
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center pt-0.5">
                            <input
                              type="checkbox"
                              id={`select-med-${it.id}`}
                              aria-label={`Selecionar ${it.name} para ações em lote`}
                              checked={selectedItemIds.includes(it.id)}
                              onChange={() => handleToggleSelectItem(it.id)}
                              className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="w-5 h-5 rounded-full bg-navy-900 dark:bg-cream-100 text-white dark:text-navy-950 text-[10px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h3 className="text-xs font-bold text-slate-900 dark:text-cream-50 truncate">
                                {it.name}
                              </h3>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                ({it.route} • {it.quantity})
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium ml-1">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                  isAnti
                                    ? 'bg-emerald-500'
                                    : isC1
                                    ? 'bg-amber-500'
                                    : isPending
                                    ? 'bg-rose-500'
                                    : 'bg-slate-400 dark:bg-slate-500'
                                }`} />
                                <span className={
                                  isAnti
                                    ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                                    : isC1
                                    ? 'text-amber-700 dark:text-amber-300 font-semibold'
                                    : isPending
                                    ? 'text-rose-700 dark:text-rose-300 font-semibold'
                                    : 'text-slate-600 dark:text-slate-300'
                                }>
                                  {isAnti ? 'Antimicrobiano (2 vias)' : isC1 ? 'Controle C1 (2 vias)' : PRESCRIPTION_LABELS[kind]}
                                </span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed font-medium">
                              {it.instructions}
                            </p>
                            {issues.length > 0 && (
                              <div className="mt-2.5 pl-7">
                                <div className="text-xs p-2.5 rounded-lg bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/25 flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                  <span className="font-medium">{issues.join(' • ')}</span>
                                </div>
                              </div>
                            )}
                          </div>

                        {/* Action buttons (Edit, Move Up, Move Down, Delete) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditItem(it)}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 hover:text-navy-900 transition cursor-pointer"
                            title="Editar quantidade ou posologia"
                            aria-label={`Editar ${it.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 disabled:opacity-30 text-slate-500 cursor-pointer"
                            title="Mover para cima"
                            aria-label={`Mover ${it.name} para cima`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, 'down')}
                            disabled={idx === items.length - 1}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-navy-800 disabled:opacity-30 text-slate-500 cursor-pointer"
                            title="Mover para baixo"
                            aria-label={`Mover ${it.name} para baixo`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remover medicamento"
                            aria-label={`Remover ${it.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

            {/* Quick Actions Footer */}
            {items.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="tactile-btn-success px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer min-h-[44px]"
                    title="Enviar a receita completa diretamente para o WhatsApp do paciente"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Revisar para compartilhar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="tactile-btn-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-tactile-sm min-h-[44px]"
                  >
                    {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSuccess ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToPrint}
                  className="tactile-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer min-h-[44px]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Revisar e exportar</span>
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Real-Time A4 Document Simulation (Tactile Sheet) */}
        <div className={`xl:col-span-5 space-y-3 ${mobileSection === 'composer' ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Resumo do atendimento — revise antes de emitir
              </h2>
            </div>
            <button
              type="button"
              onClick={onNavigateToPrint}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Abrir tela cheia</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Seletor de Folha Simulada quando há múltiplos documentos normativos */}
          {prescriptionDocuments.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 pl-1 mr-1">
                Visualizar Folha:
              </span>
              {prescriptionDocuments.map((doc, idx) => {
                const isSelected = (activeDoc?.id || prescriptionDocuments[0]?.id) === doc.id;
                const isAnti = doc.kind === 'antimicrobial';
                const isC1 = doc.kind === 'c1';
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setActiveDocIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? isAnti
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isC1
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-navy-900 dark:bg-cream-100 text-white dark:text-navy-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5'
                    }`}
                  >
                    {isAnti ? <ShieldCheck className="w-3.5 h-3.5" /> : isC1 ? <Lock className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    <span>{doc.title} ({doc.items.length})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Printable Simulated A4 Sheet */}
          <div className="prescription-sheet p-6 sm:p-7 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-tactile-lg min-h-[560px] flex flex-col justify-between text-left relative overflow-hidden transition-all">
            <div>
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-3 text-center">
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                  {doctor?.name || 'Dr. Médico Não Configurado'}
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  {doctor?.specialty || 'Clínica Médica'} • CRM {doctor?.crm ? `${doctor.crm}/${doctor?.crmState || 'SP'}` : 'Não informado'} {doctor?.rqe ? `• RQE ${doctor.rqe}` : ''}
                </p>
                {doctor?.clinicName && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {doctor.clinicName} {doctor?.address ? `• ${doctor.address}` : ''} {doctor?.phone ? `• Tel: ${doctor.phone}` : ''}
                  </p>
                )}
              </div>

              {/* Patient Info Bar */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3 flex flex-wrap justify-between items-center text-xs text-slate-800">
                <div>
                  <span className="font-bold text-slate-500">Paciente:</span>
                  <span className="font-bold text-slate-900 ml-1">
                    {patientName || 'Não identificado'}
                  </span>
                </div>
                <div className="flex gap-3 text-[11px] text-slate-600 font-medium">
                  {patient?.ageText && <span>Idade: {patient.ageText}</span>}
                  {hasWeight && <span className="font-bold text-emerald-700">Peso: {patientWeight} kg</span>}
                </div>
              </div>

              {/* Via Tag & Document Title */}
              <div className="text-center mb-4">
                {activeDoc?.kind === 'antimicrobial' && (
                  <div className="text-[10px] font-bold tracking-wide uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-2 inline-block">
                    1ª Via: Paciente • 2ª Via: Farmácia (RDC 20/2011)
                  </div>
                )}
                {activeDoc?.kind === 'c1' && (
                  <div className="text-[10px] font-bold tracking-wide uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-2 inline-block">
                    1ª Via: Farmácia • 2ª Via: Paciente (Portaria 344/98)
                  </div>
                )}
                <div>
                  <h3 className="serif-title text-sm font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 inline-block">
                    {activeDoc?.kind === 'c1'
                      ? 'Receita de Controle Especial'
                      : activeDoc?.kind === 'antimicrobial'
                      ? 'Receituário de Antimicrobianos'
                      : 'Receituário Médico'}
                  </h3>
                </div>
              </div>

              {/* Prescription Body Items */}
              {(!activeDoc || activeDoc.items.length === 0) ? (
                <div className="py-16 text-center text-slate-600 italic text-xs">
                  Nenhum medicamento inserido na receita.
                </div>
              ) : (
                <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                  {activeDoc.items.map((it, idx) => (
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

            {/* Document Footer (Buyer Info for C1 or Date/Signature) */}
            <div>
              {activeDoc?.kind === 'c1' && (
                <div className="mt-4 p-2.5 rounded border border-dashed border-slate-400 text-[10px] text-slate-600 space-y-1 mb-3">
                  <p className="font-bold text-slate-900 uppercase">Identificação do Comprador</p>
                  <p>Nome: __________________________________________________</p>
                  <p>CPF: ______________________ Telefone: ___________________</p>
                  <p>Endereço: ______________________________________________</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 text-center space-y-2">
                <p className="text-[11px] text-slate-600">
                  {doctor?.cityState || 'Brasil'}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                
                {doctor?.showSignature !== false && (
                  <div className="pt-2 max-w-[240px] mx-auto border-t border-dashed border-slate-400">
                    <p className="text-xs font-bold text-slate-900">
                      {doctor?.name || 'Dr(a). Médico(a)'}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      CRM: {doctor?.crm ? `${doctor.crm}/${doctor?.crmState || 'SP'}` : '------'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onNavigateToPrint}
              className="btn-tactile-primary w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF A4</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={items.length === 0}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-tactile-btn transition active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
              <span>Revisar para compartilhar</span>
            </button>
          </div>
        </div>

      </div>

      {/* Item Added Toast Alert */}
      {itemAddedToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-tactile-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4" />
          <span>Medicamento inserido na receita com sucesso!</span>
        </div>
      )}

    </div>
  );
};
