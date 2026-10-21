import { useState, useEffect, useCallback } from 'react';
import { PrescriptionItem } from '../types';
import { db, SavedDocument } from '../services/db';
import { searchUnifiedMedicationsFuzzy } from '../utils/fuzzySearch';
import { UNIFIED_MEDICATIONS, UnifiedMedication } from '../data/medicationDatabase';
import { PRESET_CLINICAL_TEMPLATES } from '../data/presetClinicalTemplates';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';

export interface ConfirmActionState {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

interface UsePrescriptionModelsParams {
  items: PrescriptionItem[];
  onUpdateItems: (items: PrescriptionItem[]) => void;
  setConfirmAction: React.Dispatch<React.SetStateAction<ConfirmActionState | null>>;
}

export function usePrescriptionModels({
  items,
  onUpdateItems,
  setConfirmAction,
}: UsePrescriptionModelsParams) {
  const [isSaveModelModalOpen, setIsSaveModelModalOpen] = useState(false);
  const [isLoadModelModalOpen, setIsLoadModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [savedPrescriptionModels, setSavedPrescriptionModels] = useState<SavedDocument[]>([]);
  const [prescriptionModelToast, setPrescriptionModelToast] = useState<string | null>(null);

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
      isSpecialControl: med.isSpecialControl || false,
    };
    setCustomModelDraftItems((prev) => [...prev, newItem]);
    setCustomModelSearchTerm('');
    setCustomModelSuggestions([]);
  };

  const handleRemoveCustomModelItem = (id: string) => {
    setCustomModelDraftItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateCustomModelItem = (id: string, updates: Partial<PrescriptionItem>) => {
    setCustomModelDraftItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const loadPrescriptionModels = useCallback(async () => {
    try {
      const allDocs = await db.savedDocuments.toArray();
      const models = allDocs.filter((d) => {
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
      PRESET_CLINICAL_TEMPLATES.forEach((preset) => {
        if (preset.prescriptionItems && preset.prescriptionItems.length > 0) {
          if (!models.some((m) => m.id === preset.id)) {
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
      updatedAt: Date.now(),
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
      updatedAt: Date.now(),
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
      },
    });
  };

  return {
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
  };
}
