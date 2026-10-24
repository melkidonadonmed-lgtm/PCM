import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Icon } from './Icon';
import {
  alturaFolhaPx,
  exportarFolhaPdf,
  larguraFolhaPx,
  limparRaizDeImpressao,
  prepararRaizDeImpressao,
} from '../utils/folhaA4';
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
  DocumentOrientation,
  DocumentViaLayout,
} from '../types';
import { db } from '../services/db';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { separarPorRegime } from '../utils/documentoClinico';
import { ConfirmationModal } from './ConfirmationModal';
import LogoGeneratorModal from './LogoGeneratorModal';
import WatermarkOverlay from './WatermarkOverlay';
import {
  PresetQuickTemplateType,
  DEFAULT_PRESCRIPTION_STYLES,
  CustomUnderline,
  htmlDoEditorMontado,
  REGIMES_RECEITA,
  FontOption,
  FONT_OPTIONS,
  getLogoSizeClass,
  buildDefaultHeaderConfig,
} from './editor/editorConfigAndFormatters';
import { useDocumentLogoManager, EditorConfirmDialogState } from '../hooks/useDocumentLogoManager';
import { useDocumentTemplatesAndStyles } from '../hooks/useDocumentTemplatesAndStyles';
import { EditorTopActionsBar } from './editor/EditorTopActionsBar';
import { EditorSheetConfigBar } from './editor/EditorSheetConfigBar';
import { EditorTextFormattingToolbar } from './editor/EditorTextFormattingToolbar';
import { EditorSingleViaCanvas } from './editor/EditorSingleViaCanvas';
import { EditorTwoViasCanvas } from './editor/EditorTwoViasCanvas';
import { EditorModelsAndStylesDrawer } from './editor/EditorModelsAndStylesDrawer';

export {
  DEFAULT_PRESCRIPTION_STYLES,
  FONT_OPTIONS,
};
export type {
  PresetQuickTemplateType,
  FontOption,
};

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
  onOpenDoctorModal,
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

  const selectedFont = useMemo(() => {
    return FONT_OPTIONS.find(f => f.id === fontFamilyId) || FONT_OPTIONS[0];
  }, [fontFamilyId]);

  const molduraEditorRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetZoom, setSheetZoom] = useState<number>(1);

  const larguraFolhaEditor = larguraFolhaPx(pageOrientation);
  const alturaFolhaEditor = alturaFolhaPx(pageOrientation);

  useEffect(() => {
    const moldura = molduraEditorRef.current;
    if (!moldura) {
      setSheetZoom(1);
      return;
    }
    const medir = () => {
      const disponivel = moldura.clientWidth;
      if (disponivel > 0) {
        setSheetZoom(Math.min(1, disponivel / larguraFolhaEditor));
      }
    };
    medir();
    if (typeof ResizeObserver !== 'undefined') {
      const obs = new ResizeObserver(medir);
      obs.observe(moldura);
      return () => obs.disconnect();
    }
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [larguraFolhaEditor]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const isDraftRestoredRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeContextRef = useRef(activeContext);
  activeContextRef.current = activeContext;

  const buildDefaultHeader = useCallback((): DocumentHeaderConfig => {
    return buildDefaultHeaderConfig(doctor, activeContext);
  }, [doctor, activeContext]);

  const [headerConfig, setHeaderConfig] = useState<DocumentHeaderConfig>(buildDefaultHeader);

  useEffect(() => {
    const fresh = buildDefaultHeader();
    setHeaderConfig((prev) => {
      const medicoEraPadrao =
        !prev.doctorName ||
        prev.doctorName === 'Dr(a). Médico(a)' ||
        !prev.doctorCrm ||
        prev.doctorCrm.includes('------');
      const rodapeEraPadrao =
        !prev.footerDocName ||
        prev.footerDocName === 'Dr(a). Médico(a)' ||
        !prev.footerCrm ||
        prev.footerCrm.includes('------');
      const clinicaEraPadrao =
        !prev.clinicName || prev.clinicName === 'Dr(a). Médico(a)';

      if (!medicoEraPadrao && !rodapeEraPadrao && !clinicaEraPadrao) {
        return prev;
      }

      return {
        ...prev,
        doctorName: medicoEraPadrao ? fresh.doctorName : prev.doctorName,
        doctorCrm: medicoEraPadrao ? fresh.doctorCrm : prev.doctorCrm,
        doctorSpecialty: medicoEraPadrao ? fresh.doctorSpecialty : prev.doctorSpecialty,
        footerDocName: rodapeEraPadrao ? fresh.footerDocName : prev.footerDocName,
        footerCrm: rodapeEraPadrao ? fresh.footerCrm : prev.footerCrm,
        footerSpecialty: rodapeEraPadrao ? fresh.footerSpecialty : prev.footerSpecialty,
        clinicName: clinicaEraPadrao ? fresh.clinicName : prev.clinicName,
        clinicAddress: clinicaEraPadrao ? fresh.clinicAddress : prev.clinicAddress,
      };
    });
  }, [buildDefaultHeader]);

  useEffect(() => {
    const orientacao = pageOrientation === 'landscape' ? 'landscape' : 'portrait';
    const preparar = () => prepararRaizDeImpressao(sheetRef.current, orientacao);
    const limpar = () => limparRaizDeImpressao();

    window.addEventListener('beforeprint', preparar);
    window.addEventListener('afterprint', limpar);
    return () => {
      window.removeEventListener('beforeprint', preparar);
      window.removeEventListener('afterprint', limpar);
      limpar();
    };
  }, [pageOrientation]);

  const [isLogoGeneratorOpen, setIsLogoGeneratorOpen] = useState(false);
  const [isModelsDrawerOpen, setIsModelsDrawerOpen] = useState(false);
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<EditorConfirmDialogState | null>(null);

  const [docWatermark, setDocWatermark] = useState<WatermarkType>(
    activeContext?.watermarkType || 'none'
  );

  useEffect(() => {
    if (activeContext?.watermarkType !== undefined) {
      setDocWatermark(activeContext.watermarkType);
    }
  }, [activeContext?.watermarkType]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const handleWatermarkChange = async (newType: WatermarkType) => {
    setDocWatermark(newType);
    if (activeContext && onSaveContext) {
      await onSaveContext({
        ...activeContext,
        watermarkType: newType,
      });
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

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

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
        const meta = draftMetaRef.current;
        const json = editorInstance?.getJSON?.() || null;
        const html = editorInstance?.getHTML?.() || '';
        const now = Date.now();
        await db.savedDocuments.put({
          id: 'draft-current',
          title: meta.title || 'Rascunho Automático',
          contentJson: json,
          contentHtml: html,
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
        setLastSavedTime(
          new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
      } catch (err) {
        console.error('Falha no auto-save do rascunho:', err);
        setSaveStatus('idle');
      }
    }, 600);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomUnderline,
      Placeholder.configure({
        placeholder: 'Digite ou cole o texto da receita médica, laudo ou parecer clínico livre aqui...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-48 leading-relaxed text-inherit selection:bg-sky-200 dark:selection:bg-sky-800',
      },
    },
    onCreate: ({ editor: ed }) => {
      const html = htmlDoEditorMontado(ed);
      if (html !== null) setEditorDomHtml(html);
    },
    onUpdate: ({ editor: ed }) => {
      setEditorHtml(ed.getHTML());
      const html = htmlDoEditorMontado(ed);
      if (html !== null) setEditorDomHtml(html);
      triggerAutoSave(ed);
    },
  });

  const {
    logoConfig,
    setLogoConfig,
    activeLogoTab,
    setActiveLogoTab,
    logoUploading,
    secondaryLogoUploading,
    isLogoMenuOpen,
    setIsLogoMenuOpen,
    logoSelected,
    setLogoSelected,
    fileInputRef,
    secondaryFileInputRef,
    handleLogoUpload,
    handleApplyPresetLogo,
    handleChangeLogoPosition,
    handleChangeLogoSize,
    handleRemoveLogo,
    handleSecondaryLogoUpload,
    handleApplySecondaryPresetLogo,
    handleChangeSecondaryLogoSize,
    handleRemoveSecondaryLogo,
    handleLogoPointerDown,
    handleLogoPointerMove,
    handleLogoPointerUp,
  } = useDocumentLogoManager({
    activeContext,
    onSaveContext,
    headerConfig,
    sheetRef,
    editor,
    triggerAutoSave,
    showToast,
    setConfirmDialog,
  });

  const {
    currentModel,
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
  } = useDocumentTemplatesAndStyles({
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
  });

  draftMetaRef.current = {
    headerConfig,
    logoConfig,
    fontFamilyId,
    baseFontSize,
    pageOrientation,
    viaLayout,
    title: currentModel.title,
  };

  useEffect(() => {
    const html = htmlDoEditorMontado(editor);
    if (html !== null) setEditorDomHtml(html);
  }, [editorHtml, editor]);

  const itensPorRegime = useMemo(() => separarPorRegime(prescriptionItems || []), [prescriptionItems]);
  const regimesNaConsulta = REGIMES_RECEITA.filter((regime) => itensPorRegime[regime].length > 0);

  const viasDeAntimicrobiano = /antimicrobiano/i.test(headerConfig.badgeText || '');
  const viasDeControleEspecial = /controle especial/i.test(headerConfig.badgeText || '') || activeLoadedRecipeType === 'controle_especial';
  const rotuloVia1 = viasDeAntimicrobiano ? '1ª via — Paciente' : '1ª via — Farmácia (retenção)';
  const rotuloVia2 = viasDeAntimicrobiano ? '2ª via — Farmácia (retenção)' : '2ª via — Paciente (orientação)';

  const handleHeaderFieldChange = <K extends keyof DocumentHeaderConfig>(field: K, value: DocumentHeaderConfig[K]) => {
    setHeaderConfig(prev => {
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
    if (!medicoConfigurado(doctor)) {
      if (onOpenDoctorModal) {
        onOpenDoctorModal();
      }
      showToast('Configure o nome e CRM do médico emitente para imprimir ou gerar PDF.');
      return;
    }
    const orientacao = pageOrientation === 'landscape' ? 'landscape' : 'portrait';
    prepararRaizDeImpressao(sheetRef.current, orientacao);
    window.print();
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    if (!medicoConfigurado(doctor)) {
      if (onOpenDoctorModal) {
        onOpenDoctorModal();
      }
      showToast('Configure o nome e CRM do médico emitente para gerar PDF.');
      return;
    }

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
    <div className={`flex flex-col gap-2.5 mx-auto w-full pb-16 transition ${pageOrientation === 'landscape' ? 'max-w-7xl' : 'max-w-5xl'}`} onClick={() => setLogoSelected(false)}>
      {/* Toast Feedback */}
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

      {/* ÁREA DA FOLHA A4 TÁTIL MILIMÉTRICA (210mm x 297mm) */}
      <div ref={molduraEditorRef} className="w-full overflow-hidden py-2">
        <div
          ref={sheetRef}
          id="printable-a4-sheet"
          className={`a4-editor-canvas shrink-0 bg-white text-slate-900 rounded-lg shadow-2xl relative transition duration-200 ${
            pageOrientation === 'landscape' ? 'canvas-landscape' : 'canvas-portrait'
          } ${viaLayout === '2-vias' ? 'vias-2' : ''}`}
          style={{
            width: `${larguraFolhaEditor}px`,
            minHeight: `${alturaFolhaEditor}px`,
            zoom: sheetZoom,
            marginInline: 'auto',
            padding: pageOrientation === 'landscape' ? '10mm 14mm' : '20mm',
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            fontFamily: selectedFont.family,
            fontSize: `${baseFontSize}pt`,
          }}
        >
          <WatermarkOverlay
            type={docWatermark}
            opacity={activeContext?.watermarkOpacity}
          />

          {/* LOGOTIPO NO MODO LIVRE (Arrastável / Drag & Drop em qualquer coordenada) */}
          {logoConfig.dataUrl && logoConfig.visible && logoConfig.position === 'free' && (
            <div
              onPointerDown={handleLogoPointerDown}
              onPointerMove={handleLogoPointerMove}
              onPointerUp={handleLogoPointerUp}
              onClick={e => {
                e.stopPropagation();
                setLogoSelected(true);
              }}
              className={`absolute select-none z-30 group touch-none cursor-move transition-shadow ${
                logoSelected ? 'ring-2 ring-sky-500 rounded p-1' : ''
              }`}
              style={{
                left: `${logoConfig.x ?? 4}%`,
                top: `${logoConfig.y ?? 3}%`,
              }}
            >
              <img
                src={logoConfig.dataUrl}
                alt="Logotipo Institucional"
                className={`${getLogoSizeClass(logoConfig.size)} object-contain pointer-events-none drop-shadow-xs`}
              />

              <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-0 bg-slate-900 text-white rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-tactile-lg text-xs whitespace-nowrap">
                <Icon name="move" size={12} className="text-sky-400" />
                <span>Arraste para onde quiser</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeLogoPosition('top-center');
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs cursor-pointer"
                  title="Alinhar ao centro do topo"
                >
                  Centralizar
                </button>
              </div>
            </div>
          )}

          {/* AVISO E RESTAURAÇÃO DE CABEÇALHO OCULTADO (no-print) */}
          {!headerConfig.showHeader && (
            <div className="no-print mb-4 p-2.5 rounded-xl border border-dashed border-warning bg-amber-50/70 text-amber-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="visibility_off" size={16} className="text-amber-600 shrink-0" />
                <span><strong>Cabeçalho Ocultado:</strong> A folha será impressa sem cabeçalho (ideal para papel timbrado físico).</span>
              </div>
              <button
                type="button"
                onClick={() => handleHeaderFieldChange('showHeader', true)}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Icon name="visibility" size={14} />
                <span>Restaurar Cabeçalho</span>
              </button>
            </div>
          )}

          {viaLayout === '1-via' && (
            <EditorSingleViaCanvas
              editor={editor}
              pageOrientation={pageOrientation}
              headerConfig={headerConfig}
              logoConfig={logoConfig}
              patient={patient}
              handleHeaderFieldChange={handleHeaderFieldChange}
              handleResetHeaderFromProfile={handleResetHeaderFromProfile}
              handleChangeLogoPosition={handleChangeLogoPosition}
              handleChangeLogoSize={handleChangeLogoSize}
              handleChangeSecondaryLogoSize={handleChangeSecondaryLogoSize}
            />
          )}

          {viaLayout === '2-vias' && (
            <EditorTwoViasCanvas
              editor={editor}
              pageOrientation={pageOrientation}
              headerConfig={headerConfig}
              logoConfig={logoConfig}
              patient={patient}
              editorDomHtml={editorDomHtml}
              editorHtml={editorHtml}
              rotuloVia1={rotuloVia1}
              rotuloVia2={rotuloVia2}
              viasDeControleEspecial={viasDeControleEspecial}
              handleHeaderFieldChange={handleHeaderFieldChange}
            />
          )}

          {/* AVISO E RESTAURAÇÃO DE RODAPÉ OCULTADO (no-print) */}
          {!headerConfig.showFooter && (
            <div className="no-print mt-4 p-2 rounded-xl border border-dashed border-medium bg-slate-50 text-slate-600 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="visibility_off" size={14} className="text-slate-500 shrink-0" />
                <span><strong>Rodapé Ocultado:</strong> Carimbo e assinatura não serão impressos.</span>
              </div>
              <button
                type="button"
                onClick={() => handleHeaderFieldChange('showFooter', true)}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Icon name="visibility" size={14} />
                <span>Restaurar Rodapé</span>
              </button>
            </div>
          )}
        </div>
      </div>

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
            const updatedLogo: DocumentLogoConfig = {
              ...logoConfig,
              dataUrl,
              visible: true,
            };
            setLogoConfig(updatedLogo);
            if (activeContext && onSaveContext) {
              await onSaveContext({
                ...activeContext,
                logoDataUrl: dataUrl,
              });
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
