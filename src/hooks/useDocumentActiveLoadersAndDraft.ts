import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Patient,
  PrescriptionItem,
  MedicalCertificate,
  MedicalReferral,
  WatermarkType,
  DocumentHeaderConfig,
  DocumentLogoConfig,
  DocumentOrientation,
  DocumentViaLayout,
  PrescriptionStyle,
} from '../types';
import { db } from '../services/db';
import { storageService } from '../services/storageService';
import type { RegimeReceita } from '../utils/isSpecialControlOrAntibiotic';
import {
  INITIAL_EDITOR_CONTENT,
  buildActivePrescriptionPayload,
  buildActiveReferralPayload,
  buildActiveCertificatePayload,
} from '../components/editor/editorConfigAndFormatters';
import { EditorConfirmDialogState } from './useDocumentLogoManager';

export interface ActiveEditorModelMeta {
  id: string | null;
  title: string;
  isPreset: boolean;
}

export interface InitialDocumentToLoadPayload {
  html: string;
  title: string;
  type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom';
}

export function resolveDraftRecipeType(badgeText?: string | null): RegimeReceita | null {
  if (!badgeText || !badgeText.trim()) return null;
  if (/controle especial/i.test(badgeText)) return 'controle_especial';
  if (/antimicrobiano/i.test(badgeText)) return 'antimicrobiano';
  if (/receitu[áa]rio/i.test(badgeText)) return 'simples';
  return null;
}

export function resolveLegacyTypographyId(typography?: string | null): string | null {
  if (!typography || !typography.trim()) return null;
  const trimmed = typography.trim();
  if (trimmed === 'serif') return 'cormorant';
  if (trimmed === 'sans') return 'jakarta';
  if (trimmed === 'inter') return 'inter';
  return trimmed;
}

export function hasEmbeddedInstitutionalHeader(html?: string | null): boolean {
  if (!html || !html.trim()) return false;
  return (
    html.includes('border-bottom: 2px solid') ||
    html.includes('UNIDADE DE SAÚDE') ||
    html.includes('POLICLÍNICA') ||
    html.includes('RECEITUÁRIO DE CONTROLE ESPECIAL')
  );
}

export interface UseDocumentActiveLoadersAndDraftParams {
  editor: Editor | null;
  patient: Patient;
  prescriptionItems: PrescriptionItem[];
  referral?: MedicalReferral;
  certificate?: MedicalCertificate;
  initialDocumentToLoad?: InitialDocumentToLoadPayload | null;
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
  setLogoConfig: React.Dispatch<React.SetStateAction<DocumentLogoConfig>>;
  docWatermark: WatermarkType;
  handleWatermarkChange: (newType: WatermarkType) => Promise<void> | void;
  setEditorHtml: React.Dispatch<React.SetStateAction<string>>;
  setCurrentModel: React.Dispatch<React.SetStateAction<ActiveEditorModelMeta>>;
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
}

export function useDocumentActiveLoadersAndDraft({
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
}: UseDocumentActiveLoadersAndDraftParams) {
  const [activeLoadedRecipeType, setActiveLoadedRecipeType] = useState<RegimeReceita | null>(null);
  const [customStyles, setCustomStyles] = useState<PrescriptionStyle[]>(() => {
    return storageService.loadItem<PrescriptionStyle[]>('prescmed_custom_styles', []);
  });
  const [isSaveStyleModalOpen, setIsSaveStyleModalOpen] = useState(false);
  const [newStyleTitle, setNewStyleTitle] = useState('');

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
  }, [editor, prescriptionItems, patient, triggerAutoSave, showToast, setViaLayout, setPageOrientation, setBaseFontSize, setEditorHtml, setHeaderConfig, setCurrentModel, isDraftRestoredRef, saveTimerRef, draftMetaRef]);

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
  }, [editor, patient, referral, triggerAutoSave, showToast, setViaLayout, setPageOrientation, setBaseFontSize, setEditorHtml, setHeaderConfig, setCurrentModel, isDraftRestoredRef, draftMetaRef]);

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
  }, [editor, patient, certificate, triggerAutoSave, showToast, setViaLayout, setPageOrientation, setBaseFontSize, setEditorHtml, setHeaderConfig, setCurrentModel, isDraftRestoredRef, draftMetaRef]);

  const lastTriggerRef = useRef(0);
  useEffect(() => {
    if (editor && editorInitialSyncTrigger && editorInitialSyncTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = editorInitialSyncTrigger;
      handleLoadActivePrescription(true);
    }
  }, [editor, editorInitialSyncTrigger, handleLoadActivePrescription]);

  const applyInitialDocumentLayout = useCallback((doc: InitialDocumentToLoadPayload) => {
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

  const lastInitialDocRef = useRef<InitialDocumentToLoadPayload | null | undefined>(null);
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
  }, [editor, initialDocumentToLoad, applyInitialDocumentLayout, triggerAutoSave, showToast, isDraftRestoredRef, setEditorHtml, setCurrentModel]);

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
              const freshHeader = buildDefaultHeader();
              setHeaderConfig({
                ...draft.headerConfig,
                doctorName: freshHeader.doctorName || draft.headerConfig.doctorName,
                doctorCrm: freshHeader.doctorCrm || draft.headerConfig.doctorCrm,
                doctorSpecialty: freshHeader.doctorSpecialty || draft.headerConfig.doctorSpecialty,
                footerDocName: freshHeader.footerDocName || draft.headerConfig.footerDocName,
                footerCrm: freshHeader.footerCrm || draft.headerConfig.footerCrm,
                footerSpecialty: freshHeader.footerSpecialty || draft.headerConfig.footerSpecialty,
                clinicName: freshHeader.clinicName || draft.headerConfig.clinicName,
                clinicAddress: freshHeader.clinicAddress || draft.headerConfig.clinicAddress,
              });
              const detectedRegime = resolveDraftRecipeType(draft.headerConfig.badgeText);
              if (detectedRegime) {
                setActiveLoadedRecipeType(detectedRegime);
              }
            }
            if (draft.logoConfig) {
              setLogoConfig(draft.logoConfig);
            }
            const nextFontId = resolveLegacyTypographyId(draft.typography);
            if (nextFontId) {
              setFontFamilyId(nextFontId);
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
  }, [editor, buildDefaultHeader, editorInitialSyncTrigger, initialDocumentToLoad, handleLoadActivePrescription, prescriptionItems, applyInitialDocumentLayout, setLogoConfig, isDraftRestoredRef, saveTimerRef, setEditorHtml, setHeaderConfig, setFontFamilyId, setBaseFontSize, setPageOrientation, setViaLayout, setCurrentModel, setLastSavedTime, setSaveStatus]);

  return {
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
  };
}
