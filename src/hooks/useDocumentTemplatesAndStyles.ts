import React, { useState, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import {
  DoctorProfile,
  Patient,
  WorkContext,
  PrescriptionItem,
  MedicalCertificate,
  MedicalReferral,
  WatermarkType,
  DocumentHeaderConfig,
  DocumentLogoConfig,
  SavedDocument,
  DocumentOrientation,
  DocumentViaLayout,
} from '../types';
import { db, initializeDefaultTemplates } from '../services/db';
import { PRESET_CLINICAL_TEMPLATES } from '../data/presetClinicalTemplates';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';
import {
  PresetQuickTemplateType,
  interpolateMedicalTags,
  buildPresetQuickTemplatePayload,
} from '../components/editor/editorConfigAndFormatters';
import { EditorConfirmDialogState } from './useDocumentLogoManager';
import {
  ActiveEditorModelMeta,
  InitialDocumentToLoadPayload,
  resolveDraftRecipeType,
  resolveLegacyTypographyId,
  hasEmbeddedInstitutionalHeader,
  useDocumentActiveLoadersAndDraft,
} from './useDocumentActiveLoadersAndDraft';

export {
  resolveDraftRecipeType,
  resolveLegacyTypographyId,
  hasEmbeddedInstitutionalHeader,
  useDocumentActiveLoadersAndDraft,
};
export type { ActiveEditorModelMeta, InitialDocumentToLoadPayload };

export interface UseDocumentTemplatesAndStylesParams {
  editor: Editor | null;
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems: PrescriptionItem[];
  onUpdatePrescriptionItems?: (items: PrescriptionItem[]) => void;
  referral?: MedicalReferral;
  certificate?: MedicalCertificate;
  initialDocumentToLoad?: InitialDocumentToLoadPayload | null;
  activeContext: WorkContext | null;
  editorInitialSyncTrigger: number;
  fontFamilyId: string;
  setFontFamilyId: React.Dispatch<React.SetStateAction<string>>;
  baseFontSize: number;
  setBaseFontSize: React.Dispatch<React.SetStateAction<number>>;
  pageOrientation: DocumentOrientation;
  setPageOrientation: React.Dispatch<React.SetStateAction<DocumentOrientation>>;
  viaLayout: DocumentViaLayout;
  setViaLayout: React.Dispatch<React.SetStateAction<DocumentViaLayout>>;
  headerConfig: DocumentHeaderConfig;
  setHeaderConfig: React.Dispatch<React.SetStateAction<DocumentHeaderConfig>>;
  logoConfig: DocumentLogoConfig;
  setLogoConfig: React.Dispatch<React.SetStateAction<DocumentLogoConfig>>;
  docWatermark: WatermarkType;
  handleWatermarkChange: (newType: WatermarkType) => Promise<void> | void;
  setEditorHtml: React.Dispatch<React.SetStateAction<string>>;
  buildDefaultHeader: () => DocumentHeaderConfig;
  isDraftRestoredRef: React.MutableRefObject<boolean>;
  saveTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  draftMetaRef: React.MutableRefObject<{
    headerConfig: DocumentHeaderConfig;
    logoConfig: DocumentLogoConfig;
    fontFamilyId: string;
    baseFontSize: number;
    pageOrientation: DocumentOrientation;
    viaLayout: DocumentViaLayout;
    title: string;
  }>;
  triggerAutoSave: (
    editorInstance: { getJSON?: () => Record<string, unknown> | null; getHTML?: () => string } | null | undefined,
    updatedHeader?: DocumentHeaderConfig,
    updatedLogo?: DocumentLogoConfig,
    overrides?: Partial<{ title: string; fontSize: number; orientation: DocumentOrientation; viaLayout: DocumentViaLayout }>
  ) => void;
  setSaveStatus: React.Dispatch<React.SetStateAction<'idle' | 'saving' | 'saved'>>;
  setLastSavedTime: React.Dispatch<React.SetStateAction<string | null>>;
  showToast: (msg: string) => void;
  setConfirmDialog: React.Dispatch<React.SetStateAction<EditorConfirmDialogState | null>>;
  setIsModelsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useDocumentTemplatesAndStyles({
  editor,
  doctor,
  patient,
  prescriptionItems,
  onUpdatePrescriptionItems,
  referral,
  certificate,
  initialDocumentToLoad,
  activeContext,
  editorInitialSyncTrigger,
  fontFamilyId,
  setFontFamilyId,
  baseFontSize,
  setBaseFontSize,
  pageOrientation,
  setPageOrientation,
  viaLayout,
  setViaLayout,
  headerConfig,
  setHeaderConfig,
  logoConfig,
  setLogoConfig,
  docWatermark,
  handleWatermarkChange,
  setEditorHtml,
  buildDefaultHeader,
  isDraftRestoredRef,
  saveTimerRef,
  draftMetaRef,
  triggerAutoSave,
  setSaveStatus,
  setLastSavedTime,
  showToast,
  setConfirmDialog,
  setIsModelsDrawerOpen,
}: UseDocumentTemplatesAndStylesParams) {
  const [currentModel, setCurrentModel] = useState<ActiveEditorModelMeta>({
    id: null,
    title: 'Documento Livre (Rascunho)',
    isPreset: false,
  });
  const [isEditingModelTitle, setIsEditingModelTitle] = useState(false);
  const [tempModelTitle, setTempModelTitle] = useState('');

  const [isSaveModelModalOpen, setIsSaveModelModalOpen] = useState(false);
  const [newModelTitle, setNewModelTitle] = useState('');
  const [saveAsGlobal, setSaveAsGlobal] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedDocument[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateTitle, setEditingTemplateTitle] = useState('');

  const {
    customStyles,
    isSaveStyleModalOpen,
    setIsSaveStyleModalOpen,
    newStyleTitle,
    setNewStyleTitle,
    activeLoadedRecipeType,
    handleSaveCustomStyle,
    handleDeleteCustomStyle,
    handleApplyStyle,
    handleLoadActivePrescription,
    handleLoadActiveReferral,
    handleLoadActiveCertificate,
  } = useDocumentActiveLoadersAndDraft({
    editor,
    patient,
    prescriptionItems,
    referral,
    certificate,
    initialDocumentToLoad,
    editorInitialSyncTrigger,
    fontFamilyId,
    setFontFamilyId,
    baseFontSize,
    setBaseFontSize,
    pageOrientation,
    setPageOrientation,
    viaLayout,
    setViaLayout,
    headerConfig,
    setHeaderConfig,
    setLogoConfig,
    docWatermark,
    handleWatermarkChange,
    setEditorHtml,
    setCurrentModel,
    buildDefaultHeader,
    isDraftRestoredRef,
    saveTimerRef,
    draftMetaRef,
    triggerAutoSave,
    setSaveStatus,
    setLastSavedTime,
    showToast,
    setConfirmDialog,
  });

  const loadSavedTemplates = useCallback(async () => {
    try {
      let allDocs = await db.savedDocuments.toArray();
      let templates = allDocs
        .filter(doc => doc.isTemplate)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      if (templates.length === 0) {
        await initializeDefaultTemplates();
        allDocs = await db.savedDocuments.toArray();
        templates = allDocs
          .filter(doc => doc.isTemplate)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      }
      setSavedTemplates(templates);
    } catch (err) {
      console.error('Erro ao carregar modelos do Dexie:', err);
    }
  }, []);

  useEffect(() => {
    loadSavedTemplates();
  }, [loadSavedTemplates]);

  const syncWithActivePrescription = useCallback(() => {
    if (!editor || !onUpdatePrescriptionItems) return;
    try {
      const currentHtml = editor.getHTML();
      if (!currentHtml || !currentHtml.trim()) return;
      const parsedItems = parsePrescriptionHtmlToItems(currentHtml, prescriptionItems);
      if (parsedItems && parsedItems.length > 0) {
        onUpdatePrescriptionItems(parsedItems);
      }
    } catch (err) {
      console.warn('[PresCMed] Falha ao sincronizar HTML do editor com a receita ativa:', err);
    }
  }, [editor, onUpdatePrescriptionItems, prescriptionItems]);

  const handleSaveModelDirectly = async () => {
    if (!editor) return;

    syncWithActivePrescription();
    triggerAutoSave(editor);

    if (currentModel.id && !currentModel.isPreset) {
      try {
        const now = Date.now();
        const updatedDoc: SavedDocument = {
          id: currentModel.id,
          title: currentModel.title,
          contentJson: editor.getJSON(),
          contentHtml: editor.getHTML(),
          contextId: activeContext?.id || 'global',
          isTemplate: true,
          headerConfig,
          logoConfig,
          typography: fontFamilyId,
          fontSize: baseFontSize,
          orientation: pageOrientation,
          viaLayout: viaLayout,
          createdAt: now,
          updatedAt: now,
        };
        await db.savedDocuments.put(updatedDoc);
        await loadSavedTemplates();
        setSaveStatus('saved');
        setLastSavedTime(
          new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
        showToast(`Modelo "${currentModel.title}" atualizado e receita sincronizada!`);
      } catch (err) {
        console.error('Erro ao atualizar modelo ativo:', err);
        showToast('Falha ao atualizar o modelo.');
      }
    } else {
      setSaveStatus('saved');
      setLastSavedTime(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      showToast('Receita médica salva e sincronizada com a consulta!');
    }
  };

  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !newModelTitle.trim()) return;

    try {
      const tplId = 'tpl-' + Date.now();
      const now = Date.now();
      const contextId = saveAsGlobal ? 'global' : (activeContext?.id || 'global');

      const parsedItems = parsePrescriptionHtmlToItems(editor.getHTML(), prescriptionItems);

      const templateDoc: SavedDocument = {
        id: tplId,
        title: newModelTitle.trim(),
        contentJson: editor.getJSON(),
        contentHtml: editor.getHTML(),
        contextId,
        isTemplate: true,
        prescriptionItems: parsedItems,
        headerConfig,
        logoConfig,
        typography: fontFamilyId,
        fontSize: baseFontSize,
        orientation: pageOrientation,
        viaLayout: viaLayout,
        createdAt: now,
        updatedAt: now,
      };

      await db.savedDocuments.put(templateDoc);
      await loadSavedTemplates();
      setCurrentModel({
        id: tplId,
        title: templateDoc.title,
        isPreset: false,
      });
      setIsSaveModelModalOpen(false);
      setNewModelTitle('');
      setSaveAsGlobal(false);
      showToast(`Modelo "${templateDoc.title}" salvo com sucesso!`);
    } catch (err) {
      console.error('Erro ao salvar modelo:', err);
      showToast('Falha ao salvar modelo no banco local.');
    }
  };

  const handleApplyTemplate = (tpl: SavedDocument) => {
    if (!editor) return;

    if (tpl.contentHtml) {
      const interpolated = interpolateMedicalTags(tpl.contentHtml, patient, prescriptionItems, doctor, activeContext);
      editor.commands.setContent(interpolated);
      setEditorHtml(interpolated);
    } else if (tpl.contentJson) {
      editor.commands.setContent(tpl.contentJson);
      setEditorHtml(tpl.contentHtml || '');
    }

    const presetMatch = PRESET_CLINICAL_TEMPLATES.find(p => p.id === tpl.id);
    const effectiveHeaderConfig = tpl.headerConfig || presetMatch?.headerConfig;
    if (effectiveHeaderConfig) {
      setHeaderConfig({
        ...buildDefaultHeader(),
        ...effectiveHeaderConfig,
        dateText: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      });
    } else if (hasEmbeddedInstitutionalHeader(tpl.contentHtml)) {
      setHeaderConfig({
        ...buildDefaultHeader(),
        showHeader: false,
        showFooter: false,
        showPatientBanner: false,
        dateText: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      });
    } else {
      setHeaderConfig(prev => ({
        ...prev,
        badgeText: tpl.title.toUpperCase().slice(0, 32),
      }));
    }

    if (tpl.logoConfig) {
      setLogoConfig(tpl.logoConfig);
    }

    const nextFontId = resolveLegacyTypographyId(tpl.typography);
    if (nextFontId) {
      setFontFamilyId(nextFontId);
    }

    if (tpl.fontSize) {
      setBaseFontSize(tpl.fontSize);
    }

    if (tpl.orientation) {
      setPageOrientation(tpl.orientation);
    }

    if (tpl.viaLayout) {
      setViaLayout(tpl.viaLayout);
    }

    setCurrentModel({
      id: tpl.id,
      title: tpl.title,
      isPreset: false,
    });

    triggerAutoSave(editor);
    setIsModelsDrawerOpen(false);
    showToast(`Modelo "${tpl.title}" carregado na folha A4.`);
  };

  const handleStartNewDocument = () => {
    if (!editor) return;
    setConfirmDialog({
      title: 'Novo Documento em Branco',
      description: 'Deseja iniciar um novo documento em branco na folha A4?',
      confirmLabel: 'Iniciar em Branco',
      variant: 'warning',
      onConfirm: () => {
        editor.commands.setContent('<p><br></p>');
        setEditorHtml('<p><br></p>');
        setCurrentModel({
          id: null,
          title: 'Novo Documento Livre',
          isPreset: false,
        });
        setHeaderConfig(buildDefaultHeader());
        triggerAutoSave(editor);
        setConfirmDialog(null);
        showToast('Folha A4 pronta para novo documento.');
      },
    });
  };

  const handleDeleteTemplate = (id: string, title: string) => {
    setConfirmDialog({
      title: 'Excluir Modelo',
      description: `Deseja realmente excluir o modelo "${title}"?`,
      confirmLabel: 'Excluir Modelo',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await db.savedDocuments.delete(id);
          await loadSavedTemplates();
          if (currentModel.id === id) {
            setCurrentModel({
              id: null,
              title: 'Documento Livre (Rascunho)',
              isPreset: false,
            });
          }
          showToast('Modelo excluído.');
        } catch (err) {
          console.error('Erro ao excluir modelo:', err);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleStartRename = (tpl: SavedDocument) => {
    setEditingTemplateId(tpl.id);
    setEditingTemplateTitle(tpl.title);
  };

  const handleSaveRename = async (id: string) => {
    if (!editingTemplateTitle.trim()) return;
    try {
      const existing = await db.savedDocuments.get(id);
      if (existing) {
        await db.savedDocuments.put({
          ...existing,
          title: editingTemplateTitle.trim(),
          updatedAt: Date.now(),
        });
        await loadSavedTemplates();
        if (currentModel.id === id) {
          setCurrentModel(prev => ({ ...prev, title: editingTemplateTitle.trim() }));
        }
      }
      setEditingTemplateId(null);
      setEditingTemplateTitle('');
      showToast('Modelo renomeado com sucesso.');
    } catch (err) {
      console.error('Erro ao renomear modelo:', err);
    }
  };

  const handleSaveCurrentModelTitle = () => {
    if (tempModelTitle.trim()) {
      setCurrentModel(prev => ({ ...prev, title: tempModelTitle.trim() }));
      setIsEditingModelTitle(false);
      if (editor) triggerAutoSave(editor);
      showToast('Nome do modelo atualizado.');
    }
  };

  const applyPresetTemplate = (type: PresetQuickTemplateType) => {
    if (!editor) return;
    const {
      templateHtml,
      presetTitle,
      badge,
      viaLayout: nextVia,
      pageOrientation: nextOrient,
      baseFontSize: nextSize,
    } = buildPresetQuickTemplatePayload(type, patient, prescriptionItems);

    if (nextVia) setViaLayout(nextVia);
    if (nextOrient) setPageOrientation(nextOrient);
    if (nextSize) setBaseFontSize(nextSize);

    const interpolated = interpolateMedicalTags(templateHtml, patient, prescriptionItems, doctor, activeContext);
    editor.commands.setContent(interpolated);
    setEditorHtml(interpolated);
    setHeaderConfig(prev => ({
      ...prev,
      badgeText: badge,
    }));

    setCurrentModel({
      id: null,
      title: presetTitle,
      isPreset: true,
    });

    triggerAutoSave(editor);
    setIsModelsDrawerOpen(false);
    showToast(`Modelo "${presetTitle}" carregado. Faça suas alterações e clique em "Salvar Alterações".`);
  };

  const filteredSavedTemplates = savedTemplates.filter(tpl => {
    return tpl.title.toLowerCase().includes(templateSearch.toLowerCase());
  });

  return {
    currentModel,
    setCurrentModel,
    isEditingModelTitle,
    setIsEditingModelTitle,
    tempModelTitle,
    setTempModelTitle,
    isSaveModelModalOpen,
    setIsSaveModelModalOpen,
    newModelTitle,
    setNewModelTitle,
    saveAsGlobal,
    setSaveAsGlobal,
    savedTemplates,
    filteredSavedTemplates,
    templateSearch,
    setTemplateSearch,
    editingTemplateId,
    setEditingTemplateId,
    editingTemplateTitle,
    setEditingTemplateTitle,
    customStyles,
    isSaveStyleModalOpen,
    setIsSaveStyleModalOpen,
    newStyleTitle,
    setNewStyleTitle,
    activeLoadedRecipeType,
    handleSaveCustomStyle,
    handleDeleteCustomStyle,
    handleApplyStyle,
    handleLoadActivePrescription,
    handleLoadActiveReferral,
    handleLoadActiveCertificate,
    syncWithActivePrescription,
    handleSaveModelDirectly,
    handleSaveAsTemplate,
    handleApplyTemplate,
    handleStartNewDocument,
    handleDeleteTemplate,
    handleStartRename,
    handleSaveRename,
    handleSaveCurrentModelTitle,
    applyPresetTemplate,
  };
}
