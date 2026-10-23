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
import { camposSemEspaco, formularioOficialDe } from '../data/formulariosOficiaisSus';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { exportarFolhaPdf } from '../utils/folhaA4';
import { DOMPurify } from '../utils/sanitizeHtml';
import { FolhaA4 } from './documento/FolhaA4';
import { FormularioOficialSus } from './documento/FormularioOficialSus';
import { SusCatalogListView } from './sus/SusCatalogListView';
import { SusCommonIdentityFields } from './sus/SusCommonIdentityFields';
import {
  SusRegulatorySpecificFields,
  linhaVaziaDaLme,
} from './sus/SusRegulatorySpecificFields';
import { SusInteractiveVectorSheet } from './sus/SusInteractiveVectorSheet';

const makeIcon = (name: IconName) => ({ className = '', size }: { className?: string; size?: number }) => (
  <Icon name={name} size={size} className={className} />
);

const Check = makeIcon('check');
const ArrowLeft = makeIcon('arrow_back');
const Download = makeIcon('download');
const Printer = makeIcon('print');
const Copy = makeIcon('content_copy');
const Layers = makeIcon('layers');
const Edit3 = makeIcon('edit_document');

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
  // Diagnóstico e justificativa são do caso: abrem em branco (o modelo é oferecido por botão)
  cid10Code: '',
  cid10Description: '',
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
  onNavigateToEditorWithHtml,
}) => {
  // Estados de Navegação Interna: 'list' (catálogo) ou 'form' (preenchimento)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Seleção múltipla de documentos
  const [selectedDocIds, setSelectedDocIds] = useState<SusDocumentId[]>([]);
  const [activeFormDocId, setActiveFormDocId] = useState<SusDocumentId>('apac_principal');

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

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modoFolhaSus, setModoFolhaSus] = useState<'padrao' | 'vetorial_interativo'>('vetorial_interativo');
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

  // Documentos sem impresso nacional: logo do SUS + logo do órgão (o do estado na APAC, o do posto de trabalho nos demais)
  const timbreDe = (doc: SusDocumentItem) =>
    timbreDoDocumentoSus(doc, activeContext?.logoDataUrl || undefined);

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

  // Campos clínicos do documento ativo que ainda estão em branco (saem como "—" na folha)
  const pendenciasClinicas = [
    currentDocItem.id !== 'lme_medicamentos' &&
      !(formData.sigtapCode?.trim() && formData.procedureName?.trim()) &&
      'procedimento (código e nome)',
    currentDocItem.id === 'lme_medicamentos' &&
      !formData.lmeMedications?.some((m) => m.name?.trim()) &&
      'medicamento',
    !formData.cid10Code?.trim() && 'CID-10',
    !formData.clinicalJustification?.trim() && 'justificativa clínica',
    currentDocItem.id === 'apac_complementar' &&
      !(formData.renalCreatinine?.trim() && formData.renalEtfg?.trim()) &&
      'função renal',
  ].filter(Boolean) as string[];

  // Impresso oficial do órgão (APAC, LME): a folha é o próprio formulário, com os dados por cima
  const formularioOficial = formularioOficialDe(currentDocItem.id);
  const camposCortados = formularioOficial ? camposSemEspaco(formularioOficial, formData) : [];
  const classeDaFolha = (oficial: boolean) =>
    `select-text ${oficial ? 'folha-a4--formulario' : ''} ${medicoConfigurado(doctor) ? '' : 'no-print'}`;

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

  // Ação: Baixar PDF — fotografia fiel da folha exibida na prévia (mesmo caminho da receita)
  const folhaSusRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const nomeArquivo = (prefixo: string) =>
    `${prefixo}_${(formData.patientName || 'Paciente').trim().replace(/\s+/g, '_')}.pdf`;

  const handlePrintSheet = () => {
    if (!medicoConfigurado(doctor)) {
      showToast('Configure nome e CRM do médico para emitir documentos.');
      return;
    }
    window.print();
  };

  const handleDownloadPdf = async (downloadAll = false) => {
    if (!medicoConfigurado(doctor)) {
      showToast('Configure nome e CRM do médico para emitir documentos.');
      return;
    }
    const folhaAtual = folhaSusRef.current;
    if (!folhaAtual) return;

    let bancadaOculta: HTMLDivElement | null = null;
    try {
      setIsExportingPdf(true);

      if (!downloadAll || selectedDocIds.length <= 1) {
        await exportarFolhaPdf(folhaAtual, nomeArquivo(currentDocItem.shortTitle.replace(/\s+/g, '_')));
        showToast('PDF do documento gerado.');
        return;
      }

      bancadaOculta = document.createElement('div');
      bancadaOculta.style.cssText = 'position:fixed;left:-10000px;top:0;';
      const { renderToStaticMarkup } = await import('react-dom/server');
      const folhas = selectedDocIds.flatMap((docId) => {
        const docItem = SUS_DOCUMENTS_CATALOG.find((d) => d.id === docId);
        if (!docItem) return [];
        const oficial = formularioOficialDe(docId);
        const folha = document.createElement('div');
        folha.className = `folha-a4 ${classeDaFolha(Boolean(oficial))}`;
        folha.style.width = `${folhaAtual.offsetWidth}px`;
        folha.innerHTML = oficial
          ? renderToStaticMarkup(
              <FormularioOficialSus formulario={oficial} dados={getFilledDataForDoc(docId)} />
            )
          : buildSusDocumentHtml(docItem, getFilledDataForDoc(docId), timbreDe(docItem));
        bancadaOculta!.appendChild(folha);
        return [folha];
      });
      document.body.appendChild(bancadaOculta);

      await exportarFolhaPdf(folhas, nomeArquivo('Documentos_SUS'));
      showToast(`PDF com ${folhas.length} documentos gerado.`);
    } catch (err) {
      console.error('Erro ao gerar PDF do documento SUS:', err);
      showToast('Não foi possível gerar o PDF. Tente novamente ou use Imprimir.');
    } finally {
      bancadaOculta?.remove();
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      data-state={isExportingPdf ? 'loading' : 'idle'}
      aria-busy={isExportingPdf}
      id="sus-documents-filler-hub"
      className="space-y-4"
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
        <div className="space-y-5 animate-tab-fade">
          {/* Barra Superior do Formulário */}
          <div
            className="tactile-card p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
            }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] transition cursor-pointer"
                title="Voltar para a lista de exames SUS"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  {formularioOficial
                    ? 'Impresso oficial do Ministério da Saúde'
                    : 'Modelo do PresCMed (sem impresso nacional único)'}{' '}
                  • {currentDocItem.system}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate max-w-lg">
                  {currentDocItem.title}
                </h2>
              </div>
            </div>

            {/* Alternador de Documentos caso múltiplos estejam selecionados */}
            {selectedDocIds.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1">
                  Documento:
                </span>
                {selectedDocIds.map((id) => {
                  const doc = SUS_DOCUMENTS_CATALOG.find((d) => d.id === id);
                  const isActive = activeFormDocId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveFormDocId(id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-navy-900 dark:bg-[#0369A1] text-white border-navy-900 dark:border-sky-500/30 shadow-tactile-sm'
                          : 'bg-slate-100 dark:bg-[#27354A] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-white/10'
                      }`}
                    >
                      {doc?.shortTitle || id}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Coluna da Esquerda: Formulário de Preenchimento (7 Colunas) */}
            <div className="lg:col-span-7 space-y-4">
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
            <div className="lg:col-span-5 space-y-3">
              {/* Barra de Ações Enxuta */}
              <div
                className="tactile-card p-2.5 rounded-2xl border flex flex-col gap-2"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                }}
              >
                {pendenciasClinicas.length > 0 && (
                  <p
                    role="status"
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#27354A] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10"
                  >
                    Em branco: {pendenciasClinicas.join(', ')}.
                  </p>
                )}

                {camposCortados.length > 0 && (
                  <p
                    role="alert"
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#27354A] text-rose-700 dark:text-rose-300 border border-slate-300 dark:border-white/10"
                  >
                    Texto cortado com […] {camposCortados.length > 1 ? 'nos campos' : 'no campo'}{' '}
                    {camposCortados.join(', ')}.
                  </p>
                )}

                <div className="flex items-center gap-2">
                  {/* Imprimir Folha A4 (Com rótulo explícito Imprimir) */}
                  <button
                    type="button"
                    onClick={handlePrintSheet}
                    aria-label="Imprimir folha A4"
                    title="Imprimir folha A4 (Ctrl+P)"
                    className="btn-tactile-primary h-11 min-h-[44px] px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    <span>Imprimir</span>
                  </button>

                  {/* Baixar PDF (Individual) */}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(false)}
                    disabled={isExportingPdf}
                    aria-label="Baixar PDF do documento atual"
                    title="Baixar PDF do documento atual"
                    className="btn-tactile-secondary h-11 min-h-[44px] px-3 text-xs font-bold flex-1 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingPdf ? 'Gerando...' : 'PDF'}</span>
                  </button>

                  {selectedDocIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(true)}
                      disabled={isExportingPdf}
                      aria-label={`Baixar todos os ${selectedDocIds.length} documentos em PDF`}
                      title={`Baixar todos os ${selectedDocIds.length} documentos selecionados em um único arquivo PDF`}
                      className="btn-tactile-clinical h-11 min-h-[44px] px-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      <Layers className="w-4 h-4" />
                      <span>{isExportingPdf ? '...' : `Todos (${selectedDocIds.length})`}</span>
                    </button>
                  )}

                  {/* Abrir no Editor A4 (Ícone compacto) */}
                  <button
                    type="button"
                    onClick={
                      selectedDocIds.length > 1 ? handleOpenAllInEditor : handleOpenInEditor
                    }
                    aria-label="Abrir no Editor A4"
                    title={
                      selectedDocIds.length > 1
                        ? `Abrir todos (${selectedDocIds.length}) no Editor A4`
                        : 'Abrir no Editor A4'
                    }
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] flex items-center justify-center cursor-pointer transition active:scale-95 shrink-0"
                  >
                    <Edit3 className="w-4 h-4 text-sky-500" />
                  </button>

                  {/* Copiar Texto Markdown (Ícone compacto) */}
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    aria-label="Copiar laudo"
                    title="Copiar laudo estruturado para colar no PEP / e-SUS APS"
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] flex items-center justify-center cursor-pointer transition active:scale-95 shrink-0"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Folha Física A4 Prévia (Papel Branco com Tipografia Grafite) */}
              <div className="p-2 rounded-2xl bg-slate-900/5 dark:bg-slate-950/40 border border-subtle dark:border-strong space-y-2">
                <div className="no-print flex items-center justify-between gap-2 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Icon name="layers" size={14} className="text-sky-600 dark:text-sky-400" />
                    <span>Padrão de Folha SUS</span>
                  </span>
                  <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setModoFolhaSus('vetorial_interativo')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        modoFolhaSus === 'vetorial_interativo'
                          ? 'bg-white dark:bg-[#1E293B] text-sky-700 dark:text-sky-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Grade Vetorial SIA/SUS 12 colunas com edição direta clicando na folha A4"
                    >
                      Grade Vetorial Interativa
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoFolhaSus('padrao')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        modoFolhaSus === 'padrao'
                          ? 'bg-white dark:bg-[#1E293B] text-sky-700 dark:text-sky-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={
                        formularioOficial
                          ? 'Impresso oficial escaneado do Ministério da Saúde'
                          : 'Laudo técnico estruturado clássico'
                      }
                    >
                      {formularioOficial ? 'Impresso Oficial MS' : 'Laudo Clássico'}
                    </button>
                  </div>
                </div>

                <FolhaA4
                  ref={folhaSusRef}
                  id="sus-document-print-sheet"
                  imprimivel
                  className={classeDaFolha(Boolean(formularioOficial && modoFolhaSus === 'padrao'))}
                >
                  {modoFolhaSus === 'vetorial_interativo' ? (
                    <SusInteractiveVectorSheet
                      docItem={currentDocItem}
                      formData={formData}
                      timbre={timbreDe(currentDocItem)}
                      onFieldChange={(key, val) => handleFieldChange(key, val as never)}
                    />
                  ) : formularioOficial ? (
                    <FormularioOficialSus formulario={formularioOficial} dados={formData} />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          buildSusDocumentHtml(currentDocItem, formData, timbreDe(currentDocItem))
                        ),
                      }}
                    />
                  )}
                </FolhaA4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
