import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Icon } from './Icon';
import { exportarFolhaPdf, prepararRaizDeImpressao } from '../utils/folhaA4';
import {
  DoctorProfile, Patient, WorkContext, PrescriptionItem, MedicalCertificate,
  MedicalReferral, WatermarkType, DocumentHeaderConfig, DocumentLogoConfig,
  DocumentOrientation, DocumentViaLayout,
} from '../types';
import { db } from '../services/db';
import { separarPorRegime } from '../utils/documentoClinico';
import { ConfirmationModal } from './ConfirmationModal';
import LogoGeneratorModal from './LogoGeneratorModal';
import {
  PresetQuickTemplateType, DEFAULT_PRESCRIPTION_STYLES, CustomUnderline,
  htmlDoEditorMontado, REGIMES_RECEITA, FontOption, FONT_OPTIONS, buildDefaultHeaderConfig,
} from './editor/editorConfigAndFormatters';
import { useDocumentLogoManager, EditorConfirmDialogState } from '../hooks/useDocumentLogoManager';
import { useDocumentTemplatesAndStyles } from '../hooks/useDocumentTemplatesAndStyles';
import { EditorTopActionsBar } from './editor/EditorTopActionsBar';
import { EditorSheetConfigBar } from './editor/EditorSheetConfigBar';
import { EditorTextFormattingToolbar } from './editor/EditorTextFormattingToolbar';
import { EditorModelsAndStylesDrawer } from './editor/EditorModelsAndStylesDrawer';
import { EditorSheetViewport, mergeHeaderConfigWithDoctorProfile } from './editor/EditorSheetViewport';

export { DEFAULT_PRESCRIPTION_STYLES, FONT_OPTIONS };
export type { PresetQuickTemplateType, FontOption };

interface DocumentEditorViewProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems?: PrescriptionItem[];
  onUpdatePrescriptionItems?: (items: PrescriptionItem[]) => void;
  referral?: MedicalReferral;
  certificate?: MedicalCertificate;
  initialDocumentToLoad?: { html: string; title: string; type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom' } | null;
  activeContext: WorkContext | null;
  onSaveContext?: (updatedContext: WorkContext) => Promise<void>;
  onNavigateToPrint?: () => void;
  onOpenDoctorModal?: () => void;
  editorInitialSyncTrigger?: number;
  onNavigateBack?: () => void;
}

export const DocumentEditorView: React.FC<DocumentEditorViewProps> = ({
  darkMode,
  doctor,
  patient,
  prescriptionItems = [],
  onUpdatePrescriptionItems,
  referral,
  certificate,
  initialDocumentToLoad,
  activeContext,
  onSaveContext,
  editorInitialSyncTrigger = 0,
  onNavigateBack,
}) => {
  const [fontFamilyId, setFontFamilyId] = useState<string>('cormorant');
  const [baseFontSize, setBaseFontSize] = useState<number>(11);
  const [pageOrientation, setPageOrientation] = useState<DocumentOrientation>('portrait');
  const [viaLayout, setViaLayout] = useState<DocumentViaLayout>('1-via');
  const [drawerTab, setDrawerTab] = useState<'padrao' | 'salvos' | 'estilos'>('padrao');
  const [editorHtml, setEditorHtml] = useState<string>('');
  const [editorDomHtml, setEditorDomHtml] = useState<string>('');

  const selectedFont = useMemo(
    () => FONT_OPTIONS.find((f) => f.id === fontFamilyId) || FONT_OPTIONS[0],
    [fontFamilyId]
  );

  const sheetRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const isDraftRestoredRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeContextRef = useRef(activeContext);
  activeContextRef.current = activeContext;

  const buildDefaultHeader = useCallback(
    (): DocumentHeaderConfig => buildDefaultHeaderConfig(doctor, activeContext),
    [doctor, activeContext]
  );

  const [headerConfig, setHeaderConfig] = useState<DocumentHeaderConfig>(buildDefaultHeader);

  useEffect(() => {
    const fresh = buildDefaultHeader();
    setHeaderConfig((prev) => mergeHeaderConfigWithDoctorProfile(prev, fresh));
  }, [buildDefaultHeader]);

  const [isLogoGeneratorOpen, setIsLogoGeneratorOpen] = useState(false);
  const [isModelsDrawerOpen, setIsModelsDrawerOpen] = useState(false);
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<EditorConfirmDialogState | null>(null);
  const [docWatermark, setDocWatermark] = useState<WatermarkType>(activeContext?.watermarkType || 'none');

  useEffect(() => {
    if (activeContext?.watermarkType !== undefined) {
      setDocWatermark(activeContext.watermarkType);
    }
  }, [activeContext?.watermarkType]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const handleWatermarkChange = async (newType: WatermarkType) => {
    setDocWatermark(newType);
    if (activeContext && onSaveContext) {
      await onSaveContext({ ...activeContext, watermarkType: newType });
      showToast("Marca d'água atualizada!");
    }
  };

  const draftMetaRef = useRef<{
    headerConfig: DocumentHeaderConfig;
    logoConfig: DocumentLogoConfig;
    fontFamilyId: string;
    baseFontSize: number;
    pageOrientation: DocumentOrientation;
    viaLayout: DocumentViaLayout;
    title: string;
  }>({
    headerConfig,
    logoConfig: {
      dataUrl: activeContext?.logoDataUrl || undefined,
      position: 'top-left',
      x: 4,
      y: 3,
      size: 'md',
      visible: true,
    },
    fontFamilyId,
    baseFontSize,
    pageOrientation,
    viaLayout,
    title: 'Documento Livre (Rascunho)',
  });

  const triggerAutoSave = useCallback((
    editorInstance: { getJSON?: () => Record<string, unknown> | null; getHTML?: () => string } | null | undefined,
    updatedHeader?: DocumentHeaderConfig,
    updatedLogo?: DocumentLogoConfig,
    overrides?: Partial<{ title: string; fontSize: number; orientation: DocumentOrientation; viaLayout: DocumentViaLayout }>
  ) => {
    if (!isDraftRestoredRef.current) return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    if (updatedHeader) draftMetaRef.current.headerConfig = updatedHeader;
    if (updatedLogo) draftMetaRef.current.logoConfig = updatedLogo;
    if (overrides) {
      if (overrides.title !== undefined) draftMetaRef.current.title = overrides.title;
      if (overrides.fontSize !== undefined) draftMetaRef.current.baseFontSize = overrides.fontSize;
      if (overrides.orientation !== undefined) draftMetaRef.current.pageOrientation = overrides.orientation;
      if (overrides.viaLayout !== undefined) draftMetaRef.current.viaLayout = overrides.viaLayout;
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        if (!editorInstance || (editorInstance as { isDestroyed?: boolean }).isDestroyed) return;
        const meta = draftMetaRef.current;
        const now = Date.now();
        await db.savedDocuments.put({
          id: 'draft-current',
          title: meta.title || 'Rascunho Automático',
          contentJson: editorInstance?.getJSON?.() || null,
          contentHtml: editorInstance?.getHTML?.() || '',
          contextId: activeContextRef.current?.id || 'global',
          isTemplate: false,
          headerConfig: meta.headerConfig,
          logoConfig: meta.logoConfig,
          typography: meta.fontFamilyId,
          fontSize: meta.baseFontSize,
          orientation: meta.pageOrientation,
          viaLayout: meta.viaLayout,
          createdAt: now,
          updatedAt: now,
        });
        setSaveStatus('saved');
        setLastSavedTime(new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Falha no auto-save do rascunho:', err);
        setSaveStatus('idle');
      }
    }, 600);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ underline: false }),
      CustomUnderline,
      Placeholder.configure({
        placeholder: 'Digite ou cole o texto da receita médica, laudo ou parecer clínico livre aqui...',
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-48 leading-relaxed text-inherit selection:bg-sky-200 dark:selection:bg-sky-800',
      },
    },
    onCreate: ({ editor: ed }) => {
      queueMicrotask(() => {
        if ((ed as { isDestroyed?: boolean }).isDestroyed) return;
        const html = htmlDoEditorMontado(ed);
        if (html !== null) setEditorDomHtml(html);
      });
    },
    onUpdate: ({ editor: ed }) => {
      setEditorHtml(ed.getHTML());
      const html = htmlDoEditorMontado(ed);
      if (html !== null) setEditorDomHtml(html);
      triggerAutoSave(ed);
    },
  });

  const {
    logoConfig, setLogoConfig, activeLogoTab, setActiveLogoTab, logoUploading,
    secondaryLogoUploading, isLogoMenuOpen, setIsLogoMenuOpen, logoSelected,
    setLogoSelected, fileInputRef, secondaryFileInputRef, handleLogoUpload,
    handleApplyPresetLogo, handleChangeLogoPosition, handleChangeLogoSize,
    handleRemoveLogo, handleSecondaryLogoUpload, handleApplySecondaryPresetLogo,
    handleChangeSecondaryLogoSize, handleRemoveSecondaryLogo, handleLogoPointerDown,
    handleLogoPointerMove, handleLogoPointerUp,
  } = useDocumentLogoManager({
    activeContext, onSaveContext, headerConfig, sheetRef, editor,
    triggerAutoSave, showToast, setConfirmDialog,
  });

  const {
    currentModel, isEditingModelTitle, setIsEditingModelTitle, tempModelTitle,
    setTempModelTitle, isSaveModelModalOpen, setIsSaveModelModalOpen, newModelTitle,
    setNewModelTitle, saveAsGlobal, setSaveAsGlobal, savedTemplates,
    filteredSavedTemplates, templateSearch, setTemplateSearch, editingTemplateId,
    setEditingTemplateId, editingTemplateTitle, setEditingTemplateTitle,
    customStyles, isSaveStyleModalOpen, setIsSaveStyleModalOpen, newStyleTitle,
    setNewStyleTitle, activeLoadedRecipeType, handleSaveCustomStyle,
    handleDeleteCustomStyle, handleApplyStyle, handleLoadActivePrescription,
    handleLoadActiveReferral, handleLoadActiveCertificate, syncWithActivePrescription,
    handleSaveModelDirectly, handleSaveAsTemplate, handleApplyTemplate,
    handleStartNewDocument, handleDeleteTemplate, handleStartRename, handleSaveRename,
    handleSaveCurrentModelTitle, applyPresetTemplate,
  } = useDocumentTemplatesAndStyles({
    editor, doctor, patient, prescriptionItems, onUpdatePrescriptionItems,
    referral, certificate, initialDocumentToLoad, activeContext,
    editorInitialSyncTrigger, fontFamilyId, setFontFamilyId, baseFontSize,
    setBaseFontSize, pageOrientation, setPageOrientation, viaLayout, setViaLayout,
    headerConfig, setHeaderConfig, logoConfig, setLogoConfig, docWatermark,
    handleWatermarkChange, setEditorHtml, buildDefaultHeader, isDraftRestoredRef,
    saveTimerRef, draftMetaRef, triggerAutoSave, setSaveStatus, setLastSavedTime,
    showToast, setConfirmDialog, setIsModelsDrawerOpen,
  });

  draftMetaRef.current = {
    headerConfig, logoConfig, fontFamilyId, baseFontSize,
    pageOrientation, viaLayout, title: currentModel.title,
  };

  useEffect(() => {
    const html = htmlDoEditorMontado(editor);
    if (html !== null) setEditorDomHtml(html);
  }, [editorHtml, editor]);

  const itensPorRegime = useMemo(() => separarPorRegime(prescriptionItems || []), [prescriptionItems]);
  const regimesNaConsulta = REGIMES_RECEITA.filter((regime) => itensPorRegime[regime].length > 0);

  const handleHeaderFieldChange = <K extends keyof DocumentHeaderConfig>(field: K, value: DocumentHeaderConfig[K]) => {
    setHeaderConfig((prev) => {
      const next = { ...prev, [field]: value };
      if (editor) triggerAutoSave(editor, next, logoConfig);
      return next;
    });
  };

  const handleResetHeaderFromProfile = () => {
    const fresh = buildDefaultHeader();
    setHeaderConfig(fresh);
    if (editor) triggerAutoSave(editor, fresh, logoConfig);
    showToast('Cabeçalho sincronizado com os dados do seu Perfil Médico!');
  };

  const handlePrint = () => {
    const orientacao = pageOrientation === 'landscape' ? 'landscape' : 'portrait';
    prepararRaizDeImpressao(sheetRef.current, orientacao);
    window.print();
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    if (!sheetRef.current) {
      handlePrint();
      return;
    }

    try {
      setIsExportingPdf(true);
      showToast('Renderizando PDF com tipografia e alta fidelidade...');

      const cleanDocTitle = (currentModel.title || 'Documento_PresCMed').replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
      const cleanPatient = (patient?.name || 'Paciente').replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');

      await exportarFolhaPdf(sheetRef.current, `${cleanDocTitle}_${cleanPatient}.pdf`, {
        orientation: pageOrientation === 'landscape' ? 'landscape' : 'portrait',
      });

      showToast('PDF de alta fidelidade baixado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF no editor:', err);
      showToast('Não foi possível gerar o PDF. Tente novamente ou use Imprimir.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-3.5 sm:gap-4 pb-16 transition" onClick={() => setLogoSelected(false)}>
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          data-state="idle"
          aria-busy={false}
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-tactile-lg text-xs font-semibold flex items-center gap-2 border border-strong animate-tab-fade no-print"
        >
          <Icon name="check" size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <EditorTopActionsBar
        doctor={doctor}
        currentModel={currentModel}
        isEditingModelTitle={isEditingModelTitle}
        setIsEditingModelTitle={setIsEditingModelTitle}
        tempModelTitle={tempModelTitle}
        setTempModelTitle={setTempModelTitle}
        handleSaveCurrentModelTitle={handleSaveCurrentModelTitle}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        isExportingPdf={isExportingPdf}
        savedTemplates={savedTemplates}
        onNavigateBack={onNavigateBack}
        syncWithActivePrescription={syncWithActivePrescription}
        handlePrint={handlePrint}
        handleDownloadPdf={handleDownloadPdf}
        handleLoadActivePrescription={handleLoadActivePrescription}
        handleLoadActiveReferral={handleLoadActiveReferral}
        handleLoadActiveCertificate={handleLoadActiveCertificate}
        handleStartNewDocument={handleStartNewDocument}
        handleSaveModelDirectly={handleSaveModelDirectly}
        setNewModelTitle={setNewModelTitle}
        setIsSaveModelModalOpen={setIsSaveModelModalOpen}
        setIsModelsDrawerOpen={setIsModelsDrawerOpen}
      />

      <EditorTextFormattingToolbar
        editor={editor}
        baseFontSize={baseFontSize}
        setBaseFontSize={setBaseFontSize}
        regimesNaConsulta={regimesNaConsulta}
        activeLoadedRecipeType={activeLoadedRecipeType}
        itensPorRegime={itensPorRegime}
        handleLoadActivePrescription={handleLoadActivePrescription}
        viaLayout={viaLayout}
        isSheetConfigOpen={isSheetConfigOpen}
        onToggleSheetConfig={() => setIsSheetConfigOpen((prev) => !prev)}
      />

      {isSheetConfigOpen && (
        <EditorSheetConfigBar
          customStyles={customStyles}
          handleApplyStyle={handleApplyStyle}
          setIsSaveStyleModalOpen={setIsSaveStyleModalOpen}
          fontFamilyId={fontFamilyId}
          onChangeFontFamily={(id) => {
            setFontFamilyId(id);
            if (editor) triggerAutoSave(editor);
          }}
          pageOrientation={pageOrientation}
          setPageOrientation={setPageOrientation}
          viaLayout={viaLayout}
          setViaLayout={setViaLayout}
          showToast={showToast}
          headerConfig={headerConfig}
          handleHeaderFieldChange={handleHeaderFieldChange}
          handleLoadActivePrescription={handleLoadActivePrescription}
          prescriptionItems={prescriptionItems}
          logoConfig={logoConfig}
          isLogoMenuOpen={isLogoMenuOpen}
          setIsLogoMenuOpen={setIsLogoMenuOpen}
          activeLogoTab={activeLogoTab}
          setActiveLogoTab={setActiveLogoTab}
          handleChangeLogoPosition={handleChangeLogoPosition}
          handleChangeLogoSize={handleChangeLogoSize}
          fileInputRef={fileInputRef}
          handleLogoUpload={handleLogoUpload}
          logoUploading={logoUploading}
          setIsLogoGeneratorOpen={setIsLogoGeneratorOpen}
          handleApplyPresetLogo={handleApplyPresetLogo}
          handleRemoveLogo={handleRemoveLogo}
          handleChangeSecondaryLogoSize={handleChangeSecondaryLogoSize}
          secondaryFileInputRef={secondaryFileInputRef}
          handleSecondaryLogoUpload={handleSecondaryLogoUpload}
          secondaryLogoUploading={secondaryLogoUploading}
          handleApplySecondaryPresetLogo={handleApplySecondaryPresetLogo}
          handleRemoveSecondaryLogo={handleRemoveSecondaryLogo}
          docWatermark={docWatermark}
          handleWatermarkChange={handleWatermarkChange}
          onClose={() => setIsSheetConfigOpen(false)}
        />
      )}

      <EditorSheetViewport
        sheetRef={sheetRef}
        editor={editor}
        pageOrientation={pageOrientation}
        viaLayout={viaLayout}
        selectedFont={selectedFont}
        baseFontSize={baseFontSize}
        docWatermark={docWatermark}
        watermarkOpacity={activeContext?.watermarkOpacity}
        headerConfig={headerConfig}
        logoConfig={logoConfig}
        logoSelected={logoSelected}
        setLogoSelected={setLogoSelected}
        patient={patient}
        editorDomHtml={editorDomHtml}
        editorHtml={editorHtml}
        activeLoadedRecipeType={activeLoadedRecipeType}
        handleLogoPointerDown={handleLogoPointerDown}
        handleLogoPointerMove={handleLogoPointerMove}
        handleLogoPointerUp={handleLogoPointerUp}
        handleChangeLogoPosition={handleChangeLogoPosition}
        handleChangeLogoSize={handleChangeLogoSize}
        handleChangeSecondaryLogoSize={handleChangeSecondaryLogoSize}
        handleHeaderFieldChange={handleHeaderFieldChange}
        handleResetHeaderFromProfile={handleResetHeaderFromProfile}
      />

      <EditorModelsAndStylesDrawer
        isModelsDrawerOpen={isModelsDrawerOpen}
        setIsModelsDrawerOpen={setIsModelsDrawerOpen}
        drawerTab={drawerTab}
        setDrawerTab={setDrawerTab}
        savedTemplates={savedTemplates}
        filteredSavedTemplates={filteredSavedTemplates}
        customStyles={customStyles}
        templateSearch={templateSearch}
        setTemplateSearch={setTemplateSearch}
        applyPresetTemplate={applyPresetTemplate}
        currentModel={currentModel}
        setNewModelTitle={setNewModelTitle}
        setIsSaveModelModalOpen={setIsSaveModelModalOpen}
        editingTemplateId={editingTemplateId}
        setEditingTemplateId={setEditingTemplateId}
        editingTemplateTitle={editingTemplateTitle}
        setEditingTemplateTitle={setEditingTemplateTitle}
        handleSaveRename={handleSaveRename}
        handleStartRename={handleStartRename}
        handleDeleteTemplate={handleDeleteTemplate}
        handleApplyTemplate={handleApplyTemplate}
        setIsSaveStyleModalOpen={setIsSaveStyleModalOpen}
        handleDeleteCustomStyle={handleDeleteCustomStyle}
        handleApplyStyle={handleApplyStyle}
        isSaveModelModalOpen={isSaveModelModalOpen}
        handleSaveAsTemplate={handleSaveAsTemplate}
        newModelTitle={newModelTitle}
        activeContext={activeContext}
        saveAsGlobal={saveAsGlobal}
        setSaveAsGlobal={setSaveAsGlobal}
        isSaveStyleModalOpen={isSaveStyleModalOpen}
        handleSaveCustomStyle={handleSaveCustomStyle}
        newStyleTitle={newStyleTitle}
        setNewStyleTitle={setNewStyleTitle}
        fontFamilyId={fontFamilyId}
        baseFontSize={baseFontSize}
        pageOrientation={pageOrientation}
        viaLayout={viaLayout}
        headerConfig={headerConfig}
      />

      {isLogoGeneratorOpen && (
        <LogoGeneratorModal
          isOpen={isLogoGeneratorOpen}
          onClose={() => setIsLogoGeneratorOpen(false)}
          activeContext={activeContext}
          doctor={doctor}
          onApplyLogo={async (dataUrl) => {
            const updatedLogo: DocumentLogoConfig = { ...logoConfig, dataUrl, visible: true };
            setLogoConfig(updatedLogo);
            if (activeContext && onSaveContext) {
              await onSaveContext({ ...activeContext, logoDataUrl: dataUrl });
            }
            if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
            showToast('Logotipo vetorial SVG aplicado com sucesso!');
          }}
        />
      )}

      {confirmDialog && (
        <ConfirmationModal
          isOpen={true}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant || 'danger'}
          darkMode={darkMode}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default DocumentEditorView;
