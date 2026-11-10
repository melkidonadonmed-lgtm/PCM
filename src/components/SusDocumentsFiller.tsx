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
import { formularioOficialDe } from '../data/formulariosOficiaisSus';
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

/**
 * Sub-ilha de Preenchimento e Emissão dos 9 Documentos SUS.
 * Estados de UI cobertos: empty (campos clínicos em branco por padrão), loading (carregando PDF A4),
 * success (documento copiado/exportado com sucesso) e error (alerta de truncamento ou médico ausente).
 */

/** Campos próprios de cada documento. Dado clínico abre em branco: quem informa é o médico. */
const camposIniciaisDoDocumento = (_doc: SusDocumentItem): Partial<SusFilledFormData> => ({
  // Procedimento (código SIGTAP e descrição) é dado clínico do caso: abre sempre em branco (o padrão do catálogo é oferecido por botão)
  sigtapCode: '',
  procedureName: '',
  procedureQuantity: '',
  patientChartNumber: '',
  apacResponsibleName: '',
  apacResponsiblePhone: '',
  patientCityIbgeCode: '',
  apacSecondaryProcedures: [],
  // Diagnóstico e justificativa são do caso: abrem em branco (o modelo é oferecido por botão)
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
  activeContext?: WorkContext | null;
  initialDocId?: SusDocumentId | null;
  catalogResetTrigger?: number;
  onNavigateToEditorWithHtml?: (
    html: string,
    title: string,
    type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom'
  ) => void;
  onNavigateToPrint?: () => void;
}

export const SusDocumentsFiller: React.FC<SusDocumentsFillerProps> = ({
  darkMode,
  patient,
  onUpdatePatient,
  doctor,
  activeContext,
  initialDocId = null,
  catalogResetTrigger = 0,
  onNavigateToEditorWithHtml,
}) => {
  // Estados de Navegação Interna: 'list' (catálogo) ou 'form' (preenchimento)
  const [viewMode, setViewMode] = useState<'list' | 'form'>(() =>
    initialDocId ? 'form' : 'list'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Seleção múltipla de documentos
  const [selectedDocIds, setSelectedDocIds] = useState<SusDocumentId[]>(() =>
    initialDocId ? [initialDocId] : []
  );
  const [activeFormDocId, setActiveFormDocId] = useState<SusDocumentId>(
    () => initialDocId || 'apac_principal'
  );

  // Volta para a visão de catálogo ao clicar novamente na aba/atalho de Guias SUS
  const lastResetTriggerRef = useRef(catalogResetTrigger);
  useEffect(() => {
    if (catalogResetTrigger !== lastResetTriggerRef.current) {
      lastResetTriggerRef.current = catalogResetTrigger;
      setViewMode('list');
    }
  }, [catalogResetTrigger]);

  // Abre diretamente o documento quando acionado via Command Palette (Ctrl+K)
  useEffect(() => {
    if (initialDocId) {
      setSelectedDocIds((prev) => (prev.includes(initialDocId) ? prev : [initialDocId]));
      setActiveFormDocId(initialDocId);
      setViewMode('form');
    }
  }, [initialDocId]);

  // Helper para dados padrão específicos de um documento
  const getDocDefaultFields = useCallback(camposIniciaisDoDocumento, []);

  // Dados específicos isolados por documento para evitar contaminação na seleção múltipla
  const [docsSpecificData, setDocsSpecificData] = useState<
    Record<string, Partial<SusFilledFormData>>
  >(() => {
    const map: Record<string, Partial<SusFilledFormData>> = {};
    SUS_DOCUMENTS_CATALOG.forEach((d) => {
      map[d.id] = camposIniciaisDoDocumento(d);
    });
    return map;
  });

  // Rastreia atualizações internas do paciente para não sobrescrever espaços durante a digitação
  const isInternalPatientUpdateRef = useRef(false);
  const lastPatientIdRef = useRef(patient?.id || '');

  // Dados comuns compartilhados (Médico e Paciente) — preserva espaços durante a digitação
  const [commonData, setCommonData] = useState(() => ({
    doctorName: doctor?.name ?? '',
    doctorCrm: doctor?.crm ?? '',
    doctorCrmState: doctor?.crmState || 'SP',
    doctorSpecialty: doctor?.specialty || 'Clínica Médica',
    doctorCnes: doctor?.cnes || activeContext?.cnes || '',
    doctorClinicName:
      activeContext?.clinicName || doctor?.clinicName || 'Unidade Básica de Saúde',
    doctorCpf: doctor?.cpf || '',
    doctorCns: doctor?.cns || '',

    // Só para os impressos oficiais; sexo e raça/cor abrem em branco se o médico não informou explicitamente
    patientSex: (patient?.sex || '') as SusFilledFormData['patientSex'],
    patientRaceColor: '' as SusFilledFormData['patientRaceColor'],
    patientEthnicity: '',
    patientWeightKg: patient?.weightKg > 0 ? String(patient.weightKg) : '',
    patientHeightCm: '',
    patientEmail: '',

    patientName: patient?.name ?? '',
    patientCns: patient?.cns ?? '',
    patientCpf: patient?.documentNumber ?? '',
    patientBirthDate: patient?.birthDate ?? '',
    patientAge: patient?.ageText ?? '',
    patientGender: patient?.gender || 'female',
    patientMotherName: patient?.motherName ?? '',
    patientPhone: patient?.phone ?? '',
    patientAddress: patient?.address ?? '',
    patientNeighborhood: patient?.neighborhood ?? '',
    patientCity: patient?.city ?? '',
    patientState: patient?.state ?? '',
    patientCep: patient?.cep ?? '',
  }));

  // Sincroniza dados do médico/unidade apenas quando alterados externamente (Perfil ou Posto de Trabalho)
  useEffect(() => {
    setCommonData((prev) => ({
      ...prev,
      doctorName: doctor?.name ?? prev.doctorName,
      doctorCrm: doctor?.crm ?? prev.doctorCrm,
      doctorCrmState: doctor?.crmState || prev.doctorCrmState,
      doctorSpecialty: doctor?.specialty || prev.doctorSpecialty,
      doctorCnes: doctor?.cnes || activeContext?.cnes || prev.doctorCnes,
      doctorClinicName:
        activeContext?.clinicName || doctor?.clinicName || prev.doctorClinicName,
      doctorCpf: doctor?.cpf ?? prev.doctorCpf,
      doctorCns: doctor?.cns ?? prev.doctorCns,
    }));
  }, [doctor, activeContext]);

  // Sincroniza dados do paciente apenas quando alterados externamente (ex.: Modal do Paciente ou Nova Consulta)
  useEffect(() => {
    if (isInternalPatientUpdateRef.current) {
      isInternalPatientUpdateRef.current = false;
      lastPatientIdRef.current = patient?.id || '';
      return;
    }

    const isNewConsultationReset =
      patient?.id !== lastPatientIdRef.current && !patient?.name && !patient?.documentNumber;
    lastPatientIdRef.current = patient?.id || '';

    setCommonData((prev) => ({
      ...prev,
      patientSex: (patient?.sex || '') as SusFilledFormData['patientSex'],
      patientRaceColor: isNewConsultationReset ? '' : prev.patientRaceColor,
      patientEthnicity: isNewConsultationReset ? '' : prev.patientEthnicity,
      patientWeightKg: patient?.weightKg > 0 ? String(patient.weightKg) : '',
      patientHeightCm: isNewConsultationReset ? '' : prev.patientHeightCm,
      patientEmail: isNewConsultationReset ? '' : prev.patientEmail,

      patientName: patient?.name ?? '',
      patientCns: patient?.cns ?? '',
      patientCpf: patient?.documentNumber ?? '',
      patientBirthDate: patient?.birthDate ?? '',
      patientAge: patient?.ageText ?? '',
      patientGender: patient?.gender || 'female',
      patientMotherName: patient?.motherName ?? '',
      patientPhone: patient?.phone ?? '',
      patientAddress: patient?.address ?? '',
      patientNeighborhood: patient?.neighborhood ?? '',
      patientCity: patient?.city ?? '',
      patientState: patient?.state ?? '',
      patientCep: patient?.cep ?? '',
    }));

    if (isNewConsultationReset) {
      const cleanMap: Record<string, Partial<SusFilledFormData>> = {};
      SUS_DOCUMENTS_CATALOG.forEach((d) => {
        cleanMap[d.id] = camposIniciaisDoDocumento(d);
      });
      setDocsSpecificData(cleanMap);
    }
  }, [patient]);

  // Documento atualmente selecionado para edição dos dados específicos
  const currentDocItem = useMemo(() => {
    return SUS_DOCUMENTS_CATALOG.find((d) => d.id === activeFormDocId) || SUS_DOCUMENTS_CATALOG[0];
  }, [activeFormDocId]);

  // Monta objeto completo para o documento ativo
  const formData: SusFilledFormData = useMemo(() => {
    const specific = docsSpecificData[activeFormDocId] || getDocDefaultFields(currentDocItem);
    return {
      ...commonData,
      ...specific,
    } as SusFilledFormData;
  }, [commonData, docsSpecificData, activeFormDocId, currentDocItem, getDocDefaultFields]);

  // Função utilitária para obter os dados completos de qualquer documento
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

  // Filtro de catálogo
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

  // Alternar seleção de documento
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

  // Feedback Toast e estado de exportação PDF
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Atualização dos campos do formulário (comum vs específico do documento ativo)
  const handleFieldChange = <K extends keyof SusFilledFormData>(
    field: K,
    value: SusFilledFormData[K] | string
  ) => {
    const commonFieldKeys: (keyof typeof commonData)[] = [
      'doctorName',
      'doctorCrm',
      'doctorCrmState',
      'doctorSpecialty',
      'doctorCnes',
      'doctorClinicName',
      'doctorCpf',
      'doctorCns',
      'patientSex',
      'patientRaceColor',
      'patientEthnicity',
      'patientWeightKg',
      'patientHeightCm',
      'patientEmail',
      'patientName',
      'patientCns',
      'patientCpf',
      'patientBirthDate',
      'patientAge',
      'patientGender',
      'patientMotherName',
      'patientPhone',
      'patientAddress',
      'patientNeighborhood',
      'patientCity',
      'patientState',
      'patientCep',
    ];

    if ((commonFieldKeys as Array<keyof SusFilledFormData>).includes(field)) {
      setCommonData((prev) => ({ ...prev, [field]: value }));

      // Se for dado do paciente, propaga para onUpdatePatient para persistir na consulta
      if (onUpdatePatient && patient) {
        if (
          field === 'patientName' ||
          field === 'patientCpf' ||
          field === 'patientCns' ||
          field === 'patientMotherName' ||
          field === 'patientPhone' ||
          field === 'patientAddress' ||
          field === 'patientNeighborhood' ||
          field === 'patientCity' ||
          field === 'patientState' ||
          field === 'patientCep' ||
          field === 'patientBirthDate' ||
          field === 'patientAge' ||
          field === 'patientSex' ||
          field === 'patientWeightKg'
        ) {
          const strVal: string = typeof value === 'string' ? value : '';
          isInternalPatientUpdateRef.current = true;
          onUpdatePatient({
            ...patient,
            name: field === 'patientName' ? strVal : patient.name,
            documentNumber: field === 'patientCpf' ? strVal : patient.documentNumber,
            cns: field === 'patientCns' ? strVal : patient.cns,
            motherName: field === 'patientMotherName' ? strVal : patient.motherName,
            phone: field === 'patientPhone' ? strVal : patient.phone,
            address: field === 'patientAddress' ? strVal : patient.address,
            neighborhood: field === 'patientNeighborhood' ? strVal : patient.neighborhood,
            city: field === 'patientCity' ? strVal : patient.city,
            state: field === 'patientState' ? strVal : patient.state,
            cep: field === 'patientCep' ? strVal : patient.cep,
            birthDate: field === 'patientBirthDate' ? strVal : patient.birthDate,
            ageText: field === 'patientAge' ? strVal : patient.ageText,
            sex: field === 'patientSex' ? (strVal === 'M' || strVal === 'F' ? strVal : '') : patient.sex,
            weightKg:
              field === 'patientWeightKg'
                ? parseFloat(strVal.replace(',', '.')) || 0
                : patient.weightKg,
          });
        }
      }
    } else {
      setDocsSpecificData((prev) => ({
        ...prev,
        [activeFormDocId]: {
          ...(prev[activeFormDocId] || {}),
          [field]: value,
        },
      }));
    }
  };

  // Ação: Limpar campos clínicos apenas do documento ativo
  const handleResetActiveDoc = () => {
    setDocsSpecificData((prev) => ({
      ...prev,
      [activeFormDocId]: camposIniciaisDoDocumento(currentDocItem),
    }));
    showToast('Campos clínicos do documento limpos.');
  };

  // Ação: Copiar Markdown / Laudo Estruturado
  const handleCopyMarkdown = () => {
    const md = buildSusDocumentMarkdown(currentDocItem, formData);
    navigator.clipboard.writeText(md);
    showToast('Laudo do documento copiado para a área de transferência!');
  };

  // Documentos sem impresso nacional: logo do SUS + logo do órgão
  const timbreDe = useCallback(
    (doc: SusDocumentItem) =>
      timbreDoDocumentoSus(doc, activeContext?.logoDataUrl || undefined),
    [activeContext?.logoDataUrl]
  );

  // Ação: Abrir documento ativo no Editor A4 / Timbrados
  const handleOpenInEditor = () => {
    const html = buildSusDocumentHtml(currentDocItem, formData, timbreDe(currentDocItem));
    if (onNavigateToEditorWithHtml) {
      onNavigateToEditorWithHtml(html, currentDocItem.shortTitle, 'sus');
    } else {
      showToast('Navegando para o Editor A4...');
    }
  };

  // Ação: Abrir todos os documentos selecionados no Editor A4 com quebra de página
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

  const formularioOficial = formularioOficialDe(currentDocItem.id);

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
      {/* Toast Notification */}
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

      {/* VISÃO 1: LISTA / CATÁLOGO DOS EXAMES E DOCUMENTOS OFICIAIS DO SUS */}
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

      {/* VISÃO 2: FORMULÁRIO UNIFICADO DE PREENCHIMENTO */}
      {viewMode === 'form' && (
        <div className="flex flex-col gap-3 animate-tab-fade">
          <SusFormHeaderBar
            currentDocItem={currentDocItem}
            hasOfficialForm={Boolean(formularioOficial)}
            selectedDocIds={selectedDocIds}
            activeFormDocId={activeFormDocId}
            onBackToList={() => setViewMode('list')}
            onSelectActiveDocId={setActiveFormDocId}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            {/* Coluna da Esquerda: Formulário de Preenchimento (7 Colunas) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <SusCommonIdentityFields
                darkMode={darkMode}
                doctor={doctor}
                currentDocItem={currentDocItem}
                formData={formData}
                hasOfficialForm={Boolean(formularioOficial)}
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

            {/* Coluna da Direita: Pré-visualização da Folha Oficial SUS e Ações de Emissão (5 Colunas) */}
            <SusSheetPreviewAndActionsColumn
              currentDocItem={currentDocItem}
              formData={formData}
              selectedDocIds={selectedDocIds}
              isExportingPdf={isExportingPdf}
              setIsExportingPdf={setIsExportingPdf}
              getFilledDataForDoc={getFilledDataForDoc}
              timbreDe={timbreDe}
              onFieldChange={handleFieldChange}
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
