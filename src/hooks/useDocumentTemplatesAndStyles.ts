import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  PrescriptionStyle,
} from '../types';
import { db, initializeDefaultTemplates } from '../services/db';
import { storageService } from '../services/storageService';
import { PRESET_CLINICAL_TEMPLATES } from '../data/presetClinicalTemplates';
import type { RegimeReceita } from '../utils/isSpecialControlOrAntibiotic';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';
import {
  PresetQuickTemplateType,
  INITIAL_EDITOR_CONTENT,
  interpolateMedicalTags,
  buildActivePrescriptionPayload,
  buildActiveReferralPayload,
  buildActiveCertificatePayload,
  buildPresetQuickTemplatePayload,
} from '../components/editor/editorConfigAndFormatters';
import { EditorConfirmDialogState } from './useDocumentLogoManager';

export interface UseDocumentTemplatesAndStylesParams {
  editor: Editor | null;
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems: PrescriptionItem[];
  onUpdatePrescriptionItems?: (items: PrescriptionItem[]) => void;
  referral?: MedicalReferral;
  certificate?: MedicalCertificate;
  initialDocumentToLoad?: { html: string; title: string; type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom' } | null;
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
  const [currentModel, setCurrentModel] = useState<{
    id: string | null;
    title: string;
    isPreset: boolean;
  }>({
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

  const [customStyles, setCustomStyles] = useState<PrescriptionStyle[]>(() => {
    return storageService.loadItem<PrescriptionStyle[]>('prescmed_custom_styles', []);
  });
  const [isSaveStyleModalOpen, setIsSaveStyleModalOpen] = useState(false);
  const [newStyleTitle, setNewStyleTitle] = useState('');

  const [activeLoadedRecipeType, setActiveLoadedRecipeType] = useState<RegimeReceita | null>(null);

  const handleSaveCustomStyle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStyleTitle.trim()) return;
    const newStyle: PrescriptionStyle = {
      id: 'style-' + Date.now(),
      name: newStyleTitle.trim(),
      fontFamilyId,
      baseFontSize,
      pageOrientation,
      viaLayout,
      showHeader: headerConfig.showHeader ?? true,
      showFooter: headerConfig.showFooter ?? true,
      watermarkType: docWatermark,
      isCustom: true,
    };
    const updated = [...customStyles, newStyle];
    setCustomStyles(updated);
    storageService.saveItem('prescmed_custom_styles', updated);
    setIsSaveStyleModalOpen(false);
    setNewStyleTitle('');
    showToast(`Estilo "${newStyle.name}" salvo com sucesso!`);
  };

  const handleDeleteCustomStyle = (id: string, name: string) => {
    setConfirmDialog({
      title: 'Remover Estilo Personalizado',
      description: `Deseja remover o estilo personalizado "${name}"?`,
      confirmLabel: 'Remover Estilo',
      variant: 'danger',
      onConfirm: () => {
        const updated = customStyles.filter(s => s.id !== id);
        setCustomStyles(updated);
        storageService.saveItem('prescmed_custom_styles', updated);
        setConfirmDialog(null);
        showToast(`Estilo "${name}" removido.`);
      },
    });
  };

  const handleApplyStyle = (st: PrescriptionStyle) => {
    setFontFamilyId(st.fontFamilyId);
    setBaseFontSize(st.baseFontSize);
    setPageOrientation(st.pageOrientation);
    setViaLayout(st.viaLayout);
    setHeaderConfig(prev => ({
      ...prev,
      showHeader: st.showHeader,
      showFooter: st.showFooter,
      badgeText: st.viaLayout === '2-vias' ? 'RECEITUÁRIO DE CONTROLE ESPECIAL' : prev.badgeText,
    }));
    handleWatermarkChange(st.watermarkType);
    if (editor) triggerAutoSave(editor);
    showToast(`Estilo "${st.name}" aplicado!`);
  };

  const handleLoadActivePrescription = useCallback((showToastMsg = true, targetMode: 'auto' | RegimeReceita = 'auto') => {
    if (!editor) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const {
      regime,
      receita,
      newHtml,
      nextHeader,
      nextViaLayout,
      nextOrientation,
      nextFontSize,
    } = buildActivePrescriptionPayload(
      prescriptionItems || [],
      patient,
      draftMetaRef.current.headerConfig,
      targetMode
    );

    setActiveLoadedRecipeType(regime);
    setViaLayout(nextViaLayout);
    setPageOrientation(nextOrientation);
    setBaseFontSize(nextFontSize);

    editor.commands.setContent(newHtml);
    setEditorHtml(newHtml);
    setHeaderConfig(nextHeader);

    setCurrentModel({
      id: null,
      title: receita.modelo,
      isPreset: false,
    });

    isDraftRestoredRef.current = true;
    triggerAutoSave(editor, nextHeader, undefined, {
      title: receita.modelo,
      fontSize: nextFontSize,
      orientation: nextOrientation,
      viaLayout: nextViaLayout,
    });
    if (showToastMsg) {
      showToast(receita.aviso);
    }
  }, [editor, prescriptionItems, patient, triggerAutoSave, showToast, setViaLayout, setPageOrientation, setBaseFontSize, setEditorHtml, setHeaderConfig, isDraftRestoredRef, saveTimerRef, draftMetaRef]);

  const handleLoadActiveReferral = useCallback((showToastMsg = true) => {
    if (!editor) return;

    const { specialty, referralHtml, nextHeader } = buildActiveReferralPayload(
      patient,
      referral,
      draftMetaRef.current.headerConfig
    );

    setActiveLoadedRecipeType(null);
    setViaLayout('1-via');
    setPageOrientation('portrait');
    setBaseFontSize(11);
    editor.commands.setContent(referralHtml);
    setEditorHtml(referralHtml);
    setHeaderConfig(nextHeader);
    setCurrentModel({
      id: null,
      title: `Encaminhamento - ${specialty}`,
      isPreset: false,
    });
    isDraftRestoredRef.current = true;
    triggerAutoSave(editor, nextHeader, undefined, {
      title: `Encaminhamento - ${specialty}`,
      fontSize: 11,
      orientation: 'portrait',
      viaLayout: '1-via',
    });
    if (showToastMsg) {
      showToast('Encaminhamento carregado no editor com formatação limpa!');
    }
  }, [editor, patient, referral, triggerAutoSave, showToast, setViaLayout, setPageOrientation, setBaseFontSize, setEditorHtml, setHeaderConfig, isDraftRestoredRef, draftMetaRef]);

  const handleLoadActiveCertificate = useCallback((showToastMsg = true) => {
    if (!editor) return;

    const { certHtml, nextHeader } = buildActiveCertificatePayload(
      patient,
      certificate,
      draftMetaRef.current.headerConfig
    );

    setActiveLoadedRecipeType(null);
    setViaLayout('1-via');
    setPageOrientation('portrait');
    setBaseFontSize(12);
    editor.commands.setContent(certHtml);
    setEditorHtml(certHtml);
    setHeaderConfig(nextHeader);
    setCurrentModel({
      id: null,
      title: 'Atestado Médico',
      isPreset: false,
    });
    isDraftRestoredRef.current = true;
    triggerAutoSave(editor, nextHeader, undefined, {
      title: 'Atestado Médico',
      fontSize: 12,
      orientation: 'portrait',
      viaLayout: '1-via',
    });
    if (showToastMsg) {
      showToast('Atestado médico carregado no editor com formatação limpa!');
    }
  }, [editor, patient, certificate, triggerAutoSave, showToast, setViaLayout, setPageOrientation, setBaseFontSize, setEditorHtml, setHeaderConfig, isDraftRestoredRef, draftMetaRef]);

  const lastTriggerRef = useRef(0);
  useEffect(() => {
    if (editor && editorInitialSyncTrigger && editorInitialSyncTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = editorInitialSyncTrigger;
      handleLoadActivePrescription(true);
    }
  }, [editor, editorInitialSyncTrigger, handleLoadActivePrescription]);

  const applyInitialDocumentLayout = useCallback((doc: { html: string; title: string; type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom' }) => {
    if (doc.type !== 'prescription') {
      setActiveLoadedRecipeType(null);
      setViaLayout('1-via');
      setPageOrientation('portrait');
    }
    if (doc.type === 'sus') {
      setHeaderConfig(prev => ({
        ...prev,
        showHeader: false,
        showFooter: false,
        showPatientBanner: false,
      }));
    } else if (doc.type === 'referral') {
      setHeaderConfig(prev => ({
        ...prev,
        showHeader: true,
        showFooter: true,
        showPatientBanner: false,
        badgeText: 'ENCAMINHAMENTO MÉDICO',
      }));
    } else if (doc.type === 'certificate') {
      setHeaderConfig(prev => ({
        ...prev,
        showHeader: true,
        showFooter: true,
        showPatientBanner: false,
        badgeText: 'ATESTADO MÉDICO',
      }));
    } else if (doc.type === 'prescription') {
      setPageOrientation('landscape');
      setHeaderConfig(prev => ({
        ...prev,
        showHeader: true,
        showFooter: true,
        showPatientBanner: true,
        badgeText: 'RECEITUÁRIO MÉDICO',
      }));
    }
  }, [setViaLayout, setPageOrientation, setHeaderConfig]);

  const lastInitialDocRef = useRef<UseDocumentTemplatesAndStylesParams['initialDocumentToLoad']>(null);
  useEffect(() => {
    if (editor && initialDocumentToLoad && initialDocumentToLoad !== lastInitialDocRef.current) {
      lastInitialDocRef.current = initialDocumentToLoad;
      isDraftRestoredRef.current = true;
      editor.commands.setContent(initialDocumentToLoad.html);
      setEditorHtml(initialDocumentToLoad.html);
      applyInitialDocumentLayout(initialDocumentToLoad);
      setCurrentModel({
        id: null,
        title: initialDocumentToLoad.title || 'Documento Clínico',
        isPreset: false,
      });
      triggerAutoSave(editor);
      showToast(`Documento "${initialDocumentToLoad.title}" carregado no editor!`);
    }
  }, [editor, initialDocumentToLoad, applyInitialDocumentLayout, triggerAutoSave, showToast, isDraftRestoredRef, setEditorHtml]);

  useEffect(() => {
    if (!editor || isDraftRestoredRef.current) return;
    isDraftRestoredRef.current = true;

    let isMounted = true;
    const restoreDraft = async () => {
      if (initialDocumentToLoad) {
        lastInitialDocRef.current = initialDocumentToLoad;
        if (isMounted) {
          editor.commands.setContent(initialDocumentToLoad.html);
          setEditorHtml(initialDocumentToLoad.html);
          applyInitialDocumentLayout(initialDocumentToLoad);
          setCurrentModel({
            id: null,
            title: initialDocumentToLoad.title || 'Documento Clínico',
            isPreset: false,
          });
        }
        return;
      }

      if (editorInitialSyncTrigger && editorInitialSyncTrigger > 0 && editorInitialSyncTrigger !== lastTriggerRef.current) {
        lastTriggerRef.current = editorInitialSyncTrigger;
        if (isMounted) {
          handleLoadActivePrescription(false);
        }
        return;
      }

      try {
        const draft = await db.savedDocuments.get('draft-current');
        if (isMounted) {
          if (draft && (draft.contentJson || draft.contentHtml)) {
            if (draft.contentJson) {
              editor.commands.setContent(draft.contentJson);
              setEditorHtml(draft.contentHtml || '');
            } else {
              editor.commands.setContent(draft.contentHtml);
              setEditorHtml(draft.contentHtml || '');
            }
            if (draft.headerConfig) {
              setHeaderConfig(draft.headerConfig);
              if (/controle especial/i.test(draft.headerConfig.badgeText || '')) {
                setActiveLoadedRecipeType('controle_especial');
              } else if (/antimicrobiano/i.test(draft.headerConfig.badgeText || '')) {
                setActiveLoadedRecipeType('antimicrobiano');
              } else if (/receitu[áa]rio/i.test(draft.headerConfig.badgeText || '')) {
                setActiveLoadedRecipeType('simples');
              }
            }
            if (draft.logoConfig) {
              setLogoConfig(draft.logoConfig);
            }
            if (draft.typography) {
              if (draft.typography === 'serif') setFontFamilyId('cormorant');
              else if (draft.typography === 'sans') setFontFamilyId('jakarta');
              else if (draft.typography === 'inter') setFontFamilyId('inter');
              else setFontFamilyId(draft.typography);
            }
            if (draft.fontSize) {
              setBaseFontSize(draft.fontSize);
            }
            if (draft.orientation) {
              setPageOrientation(draft.orientation);
            }
            if (draft.viaLayout) {
              setViaLayout(draft.viaLayout);
            }
            if (draft.title && draft.title !== 'Rascunho Automático') {
              setCurrentModel({
                id: null,
                title: draft.title,
                isPreset: false,
              });
            }
            setLastSavedTime(
              new Date(draft.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            );
            setSaveStatus('saved');
          } else {
            if (prescriptionItems && prescriptionItems.length > 0) {
              handleLoadActivePrescription(false);
            } else {
              editor.commands.setContent(INITIAL_EDITOR_CONTENT);
              setEditorHtml(INITIAL_EDITOR_CONTENT);
              setHeaderConfig(buildDefaultHeader());
              setSaveStatus('idle');
            }
          }
        }
      } catch (err) {
        console.error('Erro ao ler rascunho do IndexedDB:', err);
        if (isMounted) {
          editor.commands.setContent(INITIAL_EDITOR_CONTENT);
          setEditorHtml(INITIAL_EDITOR_CONTENT);
        }
      }
    };

    restoreDraft();

    return () => {
      isMounted = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [editor, buildDefaultHeader, editorInitialSyncTrigger, initialDocumentToLoad, handleLoadActivePrescription, prescriptionItems, applyInitialDocumentLayout, setLogoConfig, isDraftRestoredRef, saveTimerRef, setEditorHtml, setHeaderConfig, setFontFamilyId, setBaseFontSize, setPageOrientation, setViaLayout, setLastSavedTime, setSaveStatus]);

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
    } else {
      const hasEmbeddedHeader = tpl.contentHtml && (
        tpl.contentHtml.includes('border-bottom: 2px solid') ||
        tpl.contentHtml.includes('UNIDADE DE SAÚDE') ||
        tpl.contentHtml.includes('POLICLÍNICA') ||
        tpl.contentHtml.includes('RECEITUÁRIO DE CONTROLE ESPECIAL')
      );
      if (hasEmbeddedHeader) {
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
    }

    if (tpl.logoConfig) {
      setLogoConfig(tpl.logoConfig);
    }

    if (tpl.typography) {
      if (tpl.typography === 'serif') setFontFamilyId('cormorant');
      else if (tpl.typography === 'sans') setFontFamilyId('jakarta');
      else if (tpl.typography === 'inter') setFontFamilyId('inter');
      else setFontFamilyId(tpl.typography);
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
