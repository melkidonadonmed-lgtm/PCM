import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Icon, type IconName } from './Icon';
import {
  DoctorProfile,
  Patient,
  WorkContext,
  SusDocumentItem,
  SusDocumentId,
  SusFilledFormData,
} from '../types';
import {
  SUS_DOCUMENTS_CATALOG,
  buildSusDocumentMarkdown,
  buildSusDocumentHtml,
  timbreDoDocumentoSus,
} from '../data/susDocumentsCatalog';
import {
  SusClinicOverride,
  SusPatientExtras,
  resolveSusCommonData,
  routeSusFieldUpdate,
} from '../utils/susFormSync';
import { SusCatalogListView } from './sus/SusCatalogListView';
import { SusCommonIdentityFields } from './sus/SusCommonIdentityFields';
import {
  SusRegulatorySpecificFields,
  linhaVaziaDaLme,
} from './sus/SusRegulatorySpecificFields';
import {
  SusFormHeaderBar,
  SusSheetPreviewAndActionsColumn,
} from './sus/SusSheetPreviewAndActionsColumn';

const makeIcon = (name: IconName) => ({ className = '', size }: { className?: string; size?: number }) => (
  <Icon name={name} size={size} className={className} />
);

const Check = makeIcon('check');

/** Campos próprios de cada documento. Dado clínico abre em branco: quem informa é o médico. */
const camposIniciaisDoDocumento = (_doc: SusDocumentItem): Partial<SusFilledFormData> => ({
  sigtapCode: '',
  procedureName: '',
  procedureQuantity: '',
  patientChartNumber: '',
  apacResponsibleName: '',
  apacResponsiblePhone: '',
  patientCityIbgeCode: '',
  apacSecondaryProcedures: [],
  cid10Code: '',
  cid10Description: '',
  cid10Secondary: '',
  cid10AssociatedCauses: '',
  clinicalJustification: '',
  sinanNumber: '',
  symptomsStartDate: '',
  renalCreatinine: '',
  renalEtfg: '',
  isContrastNeeded: true,
  gynecologyDum: '',
  gynecologyPreviousExam: '',
  specimenType: '',
  tuberculosisSymptomsDuration: '',
  lmeMedicationName: '',
  lmeMedicationPosology: '',
  lmeMedicationQuantityMonthly: '',
  lmeMedications: [linhaVaziaDaLme()],
  lmePreviousTreatment: '',
  lmePreviousTreatmentReport: '',
  lmeIncapable: '',
  lmeResponsibleName: '',
});

interface SusDocumentsFillerProps {
  darkMode: boolean;
  patient: Patient;
  onUpdatePatient?: (patient: Patient) => void;
  doctor: DoctorProfile;
  onUpdateDoctor?: (doctor: DoctorProfile) => void;
  activeContext?: WorkContext | null;
  initialDocId?: SusDocumentId | null;
  catalogResetTrigger?: number;
  onNavigateToEditorWithHtml?: (
    html: string,
    title: string,
    type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom'
  ) => void;
}

export const SusDocumentsFiller: React.FC<SusDocumentsFillerProps> = ({
  darkMode,
  patient,
  onUpdatePatient,
  doctor,
  onUpdateDoctor,
  activeContext,
  initialDocId = null,
  catalogResetTrigger = 0,
  onNavigateToEditorWithHtml,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>(() =>
    initialDocId ? 'form' : 'list'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedDocIds, setSelectedDocIds] = useState<SusDocumentId[]>(() =>
    initialDocId ? [initialDocId] : []
  );
  const [activeFormDocId, setActiveFormDocId] = useState<SusDocumentId>(
    () => initialDocId || 'apac_principal'
  );

  const [localDoctor, setLocalDoctor] = useState<DoctorProfile>(doctor);
  const [localPatient, setLocalPatient] = useState<Patient>(patient);

  useEffect(() => {
    setLocalDoctor(doctor);
  }, [doctor]);

  useEffect(() => {
    setLocalPatient(patient);
  }, [patient]);

  const effectiveDoctor = onUpdateDoctor ? doctor : localDoctor;
  const effectivePatient = onUpdatePatient ? patient : localPatient;

  const doctorRef = useRef<DoctorProfile>(effectiveDoctor);
  const patientRef = useRef<Patient>(effectivePatient);
  doctorRef.current = effectiveDoctor;
  patientRef.current = effectivePatient;

  const [susPatientExtras, setSusPatientExtras] = useState<SusPatientExtras>({
    patientRaceColor: '',
    patientEthnicity: '',
    patientHeightCm: '',
    patientEmail: '',
  });
  const [weightDraft, setWeightDraft] = useState<string | null>(null);
  const [clinicOverride, setClinicOverride] = useState<SusClinicOverride>({});

  useEffect(() => {
    setClinicOverride({});
  }, [
    activeContext?.id,
    activeContext?.clinicName,
    activeContext?.cnes,
    doctor?.clinicName,
    doctor?.cnes,
  ]);

  const lastResetTriggerRef = useRef(catalogResetTrigger);
  useEffect(() => {
    if (catalogResetTrigger !== lastResetTriggerRef.current) {
      lastResetTriggerRef.current = catalogResetTrigger;
      setViewMode('list');
    }
  }, [catalogResetTrigger]);

  useEffect(() => {
    if (initialDocId) {
      setSelectedDocIds((prev) => (prev.includes(initialDocId) ? prev : [initialDocId]));
      setActiveFormDocId(initialDocId);
      setViewMode('form');
    }
  }, [initialDocId]);

  const getDocDefaultFields = useCallback(camposIniciaisDoDocumento, []);

  const [docsSpecificData, setDocsSpecificData] = useState<
    Record<string, Partial<SusFilledFormData>>
  >(() => {
    const map: Record<string, Partial<SusFilledFormData>> = {};
    SUS_DOCUMENTS_CATALOG.forEach((d) => {
      map[d.id] = camposIniciaisDoDocumento(d);
    });
    return map;
  });

  const lastPatientIdRef = useRef(effectivePatient?.id || '');
  useEffect(() => {
    const currentId = effectivePatient?.id || '';
    const isNewConsultationReset =
      currentId !== lastPatientIdRef.current &&
      !effectivePatient?.name &&
      !effectivePatient?.documentNumber;
    lastPatientIdRef.current = currentId;

    if (isNewConsultationReset) {
      setSusPatientExtras({
        patientRaceColor: '',
        patientEthnicity: '',
        patientHeightCm: '',
        patientEmail: '',
      });
      setWeightDraft(null);
      const cleanMap: Record<string, Partial<SusFilledFormData>> = {};
      SUS_DOCUMENTS_CATALOG.forEach((d) => {
        cleanMap[d.id] = camposIniciaisDoDocumento(d);
      });
      setDocsSpecificData(cleanMap);
    }
  }, [effectivePatient?.id, effectivePatient?.name, effectivePatient?.documentNumber]);

  const commonData = useMemo(
    () =>
      resolveSusCommonData(
        effectiveDoctor,
        effectivePatient,
        activeContext,
        clinicOverride,
        susPatientExtras,
        weightDraft
      ),
    [effectiveDoctor, effectivePatient, activeContext, clinicOverride, susPatientExtras, weightDraft]
  );

  const currentDocItem = useMemo(() => {
    return SUS_DOCUMENTS_CATALOG.find((d) => d.id === activeFormDocId) || SUS_DOCUMENTS_CATALOG[0];
  }, [activeFormDocId]);

  const formData: SusFilledFormData = useMemo(() => {
    const specific = docsSpecificData[activeFormDocId] || getDocDefaultFields(currentDocItem);
    return {
      ...commonData,
      ...specific,
    } as SusFilledFormData;
  }, [commonData, docsSpecificData, activeFormDocId, currentDocItem, getDocDefaultFields]);

  const getFilledDataForDoc = useCallback(
    (docId: SusDocumentId): SusFilledFormData => {
      const docItem = SUS_DOCUMENTS_CATALOG.find((d) => d.id === docId) || currentDocItem;
      const specific = docsSpecificData[docId] || getDocDefaultFields(docItem);
      return {
        ...commonData,
        ...specific,
      } as SusFilledFormData;
    },
    [commonData, docsSpecificData, currentDocItem, getDocDefaultFields]
  );

  const filteredCatalog = useMemo(() => {
    return SUS_DOCUMENTS_CATALOG.filter((doc) => {
      const matchCategory = selectedCategory === 'todos' || doc.category === selectedCategory;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        doc.title.toLowerCase().includes(q) ||
        doc.shortTitle.toLowerCase().includes(q) ||
        doc.system.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  const toggleDocSelection = (id: SusDocumentId) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleStartFillingSingle = (id: SusDocumentId) => {
    if (!selectedDocIds.includes(id)) {
      setSelectedDocIds([id]);
    }
    setActiveFormDocId(id);
    setViewMode('form');
  };

  const handleStartFillingMultiple = () => {
    if (selectedDocIds.length === 0) return;
    setActiveFormDocId(selectedDocIds[0]);
    setViewMode('form');
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleFieldChange = <K extends keyof SusFilledFormData>(
    field: K,
    value: SusFilledFormData[K] | string
  ) => {
    const routed = routeSusFieldUpdate(field, value);

    if (routed.kind === 'doctor') {
      if (routed.clinicOverride) {
        setClinicOverride((prev) => ({ ...prev, ...routed.clinicOverride }));
      }
      const nextDoctor: DoctorProfile = { ...doctorRef.current, ...routed.patch };
      doctorRef.current = nextDoctor;
      if (onUpdateDoctor) {
        onUpdateDoctor(nextDoctor);
      } else {
        setLocalDoctor(nextDoctor);
      }
      return;
    }

    if (routed.kind === 'susExtra') {
      setSusPatientExtras((prev) => ({
        ...prev,
        [routed.key]: routed.value,
      }));
      return;
    }

    if (routed.kind === 'patient') {
      if (routed.weightDraft !== undefined) {
        setWeightDraft(routed.weightDraft);
      }
      const nextPatient: Patient = { ...patientRef.current, ...routed.patch };
      patientRef.current = nextPatient;
      if (onUpdatePatient) {
        onUpdatePatient(nextPatient);
      } else {
        setLocalPatient(nextPatient);
      }
      return;
    }

    setDocsSpecificData((prev) => ({
      ...prev,
      [activeFormDocId]: { ...(prev[activeFormDocId] || {}), [field]: value },
    }));
  };

  const handleResetActiveDoc = () => {
    setDocsSpecificData((prev) => ({
      ...prev,
      [activeFormDocId]: camposIniciaisDoDocumento(currentDocItem),
    }));
    showToast('Campos clínicos do documento limpos.');
  };

  const handleCopyMarkdown = () => {
    const md = buildSusDocumentMarkdown(currentDocItem, formData);
    navigator.clipboard.writeText(md);
    showToast('Laudo do documento copiado para a área de transferência!');
  };

  const timbreDe = useCallback(
    (doc: SusDocumentItem) =>
      timbreDoDocumentoSus(doc, activeContext?.logoDataUrl || undefined),
    [activeContext?.logoDataUrl]
  );

  const handleOpenInEditor = () => {
    const html = buildSusDocumentHtml(currentDocItem, formData, timbreDe(currentDocItem));
    if (onNavigateToEditorWithHtml) {
      onNavigateToEditorWithHtml(html, currentDocItem.shortTitle, 'sus');
    } else {
      showToast('Navegando para o Editor A4...');
    }
  };

  const handleOpenAllInEditor = () => {
    const docsToOpen = selectedDocIds.length > 0 ? selectedDocIds : [activeFormDocId];
    const combinedHtml = docsToOpen
      .map((id, index) => {
        const doc = SUS_DOCUMENTS_CATALOG.find((d) => d.id === id);
        if (!doc) return '';
        const docHtml = buildSusDocumentHtml(doc, getFilledDataForDoc(id), timbreDe(doc));
        const pageBreak =
          index < docsToOpen.length - 1
            ? '<div class="page-break" style="page-break-after: always; break-after: page; margin-bottom: 24px;"></div>'
            : '';
        return `${docHtml}${pageBreak}`;
      })
      .join('');

    if (onNavigateToEditorWithHtml) {
      onNavigateToEditorWithHtml(
        combinedHtml,
        docsToOpen.length === 1
          ? currentDocItem.shortTitle
          : `Documentos SUS (${docsToOpen.length} documentos)`,
        'sus'
      );
    } else {
      showToast('Navegando para o Editor A4...');
    }
  };

  const linhasDaLme = formData.lmeMedications?.length
    ? formData.lmeMedications
    : [linhaVaziaDaLme()];
  const alterarLinhaDaLme = (
    indice: number,
    alterar: (linha: ReturnType<typeof linhaVaziaDaLme>) => ReturnType<typeof linhaVaziaDaLme>
  ) => {
    handleFieldChange(
      'lmeMedications',
      linhasDaLme.map((linha, i) => (i === indice ? alterar(linha) : linha))
    );
  };

  return (
    <div
      data-state={isExportingPdf ? 'loading' : 'idle'}
      aria-busy={isExportingPdf}
      id="sus-documents-filler-hub"
      className="flex flex-col gap-3"
    >
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2 animate-tab-fade"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {viewMode === 'list' && (
        <SusCatalogListView
          darkMode={darkMode}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          selectedDocIds={selectedDocIds}
          filteredCatalog={filteredCatalog}
          onSelectCategory={setSelectedCategory}
          onSearchTermChange={setSearchTerm}
          onToggleDocSelection={toggleDocSelection}
          onStartFillingSingle={handleStartFillingSingle}
          onStartFillingMultiple={handleStartFillingMultiple}
        />
      )}

      {viewMode === 'form' && (
        <div className="flex flex-col gap-3 animate-tab-fade">
          <SusFormHeaderBar
            currentDocItem={currentDocItem}
            selectedDocIds={selectedDocIds}
            activeFormDocId={activeFormDocId}
            onBackToList={() => setViewMode('list')}
            onSelectActiveDocId={setActiveFormDocId}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            <div className="lg:col-span-7 flex flex-col gap-3">
              <SusCommonIdentityFields
                darkMode={darkMode}
                doctor={effectiveDoctor}
                currentDocItem={currentDocItem}
                formData={formData}
                onFieldChange={handleFieldChange}
              />

              <SusRegulatorySpecificFields
                darkMode={darkMode}
                currentDocItem={currentDocItem}
                formData={formData}
                linhasDaLme={linhasDaLme}
                onFieldChange={handleFieldChange}
                onAlterarLinhaDaLme={alterarLinhaDaLme}
                onResetDoc={handleResetActiveDoc}
              />
            </div>

            <SusSheetPreviewAndActionsColumn
              currentDocItem={currentDocItem}
              formData={formData}
              selectedDocIds={selectedDocIds}
              isExportingPdf={isExportingPdf}
              setIsExportingPdf={setIsExportingPdf}
              getFilledDataForDoc={getFilledDataForDoc}
              timbreDe={timbreDe}
              onFieldChange={handleFieldChange}
              onUpdateLmeRow={(idx, nextRow) => alterarLinhaDaLme(idx, () => nextRow)}
              onOpenInEditor={handleOpenInEditor}
              onOpenAllInEditor={handleOpenAllInEditor}
              onCopyMarkdown={handleCopyMarkdown}
              showToast={showToast}
            />
          </div>
        </div>
      )}
    </div>
  );
};
