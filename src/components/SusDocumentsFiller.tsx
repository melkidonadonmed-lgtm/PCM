import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  FileText, 
  FlaskConical, 
  Check, 
  Search, 
  ArrowLeft, 
  Download, 
  Printer, 
  Copy, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { 
  DoctorProfile, 
  Patient, 
  WorkContext, 
  SusDocumentItem, 
  SusDocumentId, 
  SusFilledFormData 
} from '../types';
import { 
  SUS_DOCUMENTS_CATALOG, 
  buildSusDocumentMarkdown,
  buildSusDocumentHtml,
  timbreDoDocumentoSus
} from '../data/susDocumentsCatalog';
import { camposSemEspaco, formularioOficialDe } from '../data/formulariosOficiaisSus';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { exportarFolhaPdf } from '../utils/folhaA4';
import { FolhaA4 } from './documento/FolhaA4';
import { FormularioOficialSus } from './documento/FormularioOficialSus';

const MESES_DA_LME = ['1º', '2º', '3º', '4º', '5º', '6º'];
const linhaVaziaDaLme = () => ({ name: '', quantities: MESES_DA_LME.map(() => '') });

/** Campos próprios de cada documento. Dado clínico abre em branco: quem informa é o médico. */
const camposIniciaisDoDocumento = (doc: SusDocumentItem): Partial<SusFilledFormData> => ({
  // No impresso oficial o procedimento é do caso: abre em branco, nunca com o exemplo do catálogo
  sigtapCode: formularioOficialDe(doc.id) ? '' : doc.defaultSigtap || '',
  procedureName: formularioOficialDe(doc.id) ? '' : doc.defaultProcedure || '',
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
  lmeResponsibleName: ''
});

const CAMPO_SUS = 'w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500';
const ROTULO_SUS = 'text-[11px] font-semibold text-[var(--text-muted)] block mb-1';

interface SusDocumentsFillerProps {
  darkMode: boolean;
  patient: Patient;
  onUpdatePatient?: (patient: Patient) => void;
  doctor: DoctorProfile;
  activeContext?: WorkContext | null;
  onNavigateToEditorWithHtml?: (html: string, title: string, type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom') => void;
  onNavigateToPrint?: () => void;
}

export const SusDocumentsFiller: React.FC<SusDocumentsFillerProps> = ({
  darkMode,
  patient,
  onUpdatePatient,
  doctor,
  activeContext,
  onNavigateToEditorWithHtml,
  onNavigateToPrint
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
  const [docsSpecificData, setDocsSpecificData] = useState<Record<string, Partial<SusFilledFormData>>>(() => {
    const map: Record<string, Partial<SusFilledFormData>> = {};
    SUS_DOCUMENTS_CATALOG.forEach(d => {
      map[d.id] = camposIniciaisDoDocumento(d);
    });
    return map;
  });

  // Dados comuns compartilhados (Médico e Paciente) — sem cidades ou UFs inventadas
  const [commonData, setCommonData] = useState(() => ({
    doctorName: doctor?.name?.trim() || '',
    doctorCrm: doctor?.crm?.trim() || '',
    doctorCrmState: doctor?.crmState || 'SP',
    doctorSpecialty: doctor?.specialty?.trim() || 'Clínica Médica',
    doctorCnes: doctor?.cnes || activeContext?.cnes || '',
    doctorClinicName: activeContext?.clinicName || doctor?.clinicName?.trim() || 'Unidade Básica de Saúde',
    doctorCpf: doctor?.cpf || '',
    doctorCns: doctor?.cns || '',

    // Só para os impressos oficiais; sexo e raça/cor abrem em branco (o cadastro traz um sexo padrão, não informado)
    patientSex: '' as SusFilledFormData['patientSex'],
    patientRaceColor: '' as SusFilledFormData['patientRaceColor'],
    patientEthnicity: '',
    patientWeightKg: patient?.weightKg > 0 ? String(patient.weightKg) : '',
    patientHeightCm: '',
    patientEmail: '',

    patientName: patient?.name?.trim() || '',
    patientCns: (patient as any)?.cns?.trim() || '',
    patientCpf: patient?.documentNumber?.trim() || '',
    patientBirthDate: patient?.birthDate?.trim() || '',
    patientAge: patient?.ageText?.trim() || '',
    patientGender: patient?.gender || 'female',
    patientMotherName: patient?.motherName?.trim() || '',
    patientPhone: patient?.phone?.trim() || '',
    patientAddress: (patient as any)?.address?.trim() || '',
    patientNeighborhood: (patient as any)?.neighborhood?.trim() || '',
    patientCity: (patient as any)?.city?.trim() || '',
    patientState: (patient as any)?.state || '',
    patientCep: (patient as any)?.cep?.trim() || ''
  }));

  // Sincroniza dados comuns se alterados externamente
  useEffect(() => {
    setCommonData(prev => ({
      ...prev,
      doctorName: doctor?.name?.trim() || prev.doctorName,
      doctorCrm: doctor?.crm?.trim() || prev.doctorCrm,
      doctorCrmState: doctor?.crmState || prev.doctorCrmState,
      doctorSpecialty: doctor?.specialty?.trim() || prev.doctorSpecialty,
      doctorCnes: doctor?.cnes || activeContext?.cnes || prev.doctorCnes,
      doctorClinicName: activeContext?.clinicName || doctor?.clinicName?.trim() || prev.doctorClinicName,
      doctorCpf: doctor?.cpf || prev.doctorCpf,
      doctorCns: doctor?.cns || prev.doctorCns,
      patientWeightKg: patient?.weightKg > 0 ? String(patient.weightKg) : prev.patientWeightKg,

      patientName: patient?.name?.trim() || prev.patientName,
      patientCns: (patient as any)?.cns?.trim() || prev.patientCns,
      patientCpf: patient?.documentNumber?.trim() || prev.patientCpf,
      patientBirthDate: patient?.birthDate?.trim() || prev.patientBirthDate,
      patientAge: patient?.ageText?.trim() || prev.patientAge,
      patientGender: patient?.gender || prev.patientGender,
      patientMotherName: patient?.motherName?.trim() || prev.patientMotherName,
      patientPhone: patient?.phone?.trim() || prev.patientPhone,
      patientAddress: (patient as any)?.address?.trim() || prev.patientAddress,
      patientNeighborhood: (patient as any)?.neighborhood?.trim() || prev.patientNeighborhood,
      patientCity: (patient as any)?.city?.trim() || prev.patientCity,
      patientState: (patient as any)?.state || prev.patientState,
      patientCep: (patient as any)?.cep?.trim() || prev.patientCep
    }));
  }, [doctor, patient, activeContext]);

  // Documento atualmente selecionado para edição dos dados específicos
  const currentDocItem = useMemo(() => {
    return SUS_DOCUMENTS_CATALOG.find(d => d.id === activeFormDocId) || SUS_DOCUMENTS_CATALOG[0];
  }, [activeFormDocId]);

  // Monta objeto completo para o documento ativo
  const formData: SusFilledFormData = useMemo(() => {
    const specific = docsSpecificData[activeFormDocId] || getDocDefaultFields(currentDocItem);
    return {
      ...commonData,
      ...specific
    } as SusFilledFormData;
  }, [commonData, docsSpecificData, activeFormDocId, currentDocItem, getDocDefaultFields]);

  // Função utilitária para obter os dados completos de qualquer documento
  const getFilledDataForDoc = useCallback((docId: SusDocumentId): SusFilledFormData => {
    const docItem = SUS_DOCUMENTS_CATALOG.find(d => d.id === docId) || currentDocItem;
    const specific = docsSpecificData[docId] || getDocDefaultFields(docItem);
    return {
      ...commonData,
      ...specific
    } as SusFilledFormData;
  }, [commonData, docsSpecificData, currentDocItem, getDocDefaultFields]);

  // Filtro de catálogo
  const filteredCatalog = useMemo(() => {
    return SUS_DOCUMENTS_CATALOG.filter(doc => {
      const matchCategory = selectedCategory === 'todos' || doc.category === selectedCategory;
      const q = searchTerm.toLowerCase();
      const matchSearch = doc.title.toLowerCase().includes(q) ||
                          doc.shortTitle.toLowerCase().includes(q) ||
                          doc.system.toLowerCase().includes(q) ||
                          doc.description.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Alternar seleção de documento
  const toggleDocSelection = (id: SusDocumentId) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
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
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Atualização dos campos do formulário (comum vs específico do documento ativo)
  const handleFieldChange = (field: keyof SusFilledFormData, value: any) => {
    const commonFieldKeys: (keyof typeof commonData)[] = [
      'doctorName', 'doctorCrm', 'doctorCrmState', 'doctorSpecialty', 'doctorCnes', 'doctorClinicName', 'doctorCpf', 'doctorCns',
      'patientSex', 'patientRaceColor', 'patientEthnicity', 'patientWeightKg', 'patientHeightCm', 'patientEmail',
      'patientName', 'patientCns', 'patientCpf', 'patientBirthDate', 'patientAge', 'patientGender',
      'patientMotherName', 'patientPhone', 'patientAddress', 'patientNeighborhood', 'patientCity', 'patientState', 'patientCep'
    ];

    if (commonFieldKeys.includes(field as any)) {
      setCommonData(prev => ({ ...prev, [field]: value }));

      // Se for dado do paciente, propaga para onUpdatePatient para persistir na consulta
      if (onUpdatePatient && patient) {
        if (field === 'patientName' || field === 'patientCpf' || field === 'patientCns' || 
            field === 'patientMotherName' || field === 'patientPhone' || field === 'patientAddress' || 
            field === 'patientNeighborhood' || field === 'patientCity' || field === 'patientState' || 
            field === 'patientCep' || field === 'patientBirthDate') {
          onUpdatePatient({
            ...patient,
            name: field === 'patientName' ? value : patient.name,
            documentNumber: field === 'patientCpf' ? value : patient.documentNumber,
            cns: field === 'patientCns' ? value : (patient as any).cns,
            motherName: field === 'patientMotherName' ? value : patient.motherName,
            phone: field === 'patientPhone' ? value : patient.phone,
            address: field === 'patientAddress' ? value : (patient as any).address,
            neighborhood: field === 'patientNeighborhood' ? value : (patient as any).neighborhood,
            city: field === 'patientCity' ? value : (patient as any).city,
            state: field === 'patientState' ? value : (patient as any).state,
            cep: field === 'patientCep' ? value : (patient as any).cep,
            birthDate: field === 'patientBirthDate' ? value : patient.birthDate
          });
        }
      }
    } else {
      setDocsSpecificData(prev => ({
        ...prev,
        [activeFormDocId]: {
          ...(prev[activeFormDocId] || {}),
          [field]: value
        }
      }));
    }
  };

  // Ação: Copiar Markdown / Laudo Estruturado
  const handleCopyMarkdown = () => {
    const md = buildSusDocumentMarkdown(currentDocItem, formData);
    navigator.clipboard.writeText(md);
    showToast('Laudo do documento copiado para a área de transferência!');
  };

  // Ação: Abrir documento ativo no Editor A4 / Timbrados
  const handleOpenInEditor = () => {
    const html = buildSusDocumentHtml(currentDocItem, formData);
    if (onNavigateToEditorWithHtml) {
      onNavigateToEditorWithHtml(html, currentDocItem.shortTitle, 'sus');
    } else {
      showToast('Navegando para o Editor A4...');
    }
  };

  // Ação: Abrir todos os documentos selecionados no Editor A4 com quebra de página
  const handleOpenAllInEditor = () => {
    const docsToOpen = selectedDocIds.length > 0 ? selectedDocIds : [activeFormDocId];
    const combinedHtml = docsToOpen.map((id, index) => {
      const doc = SUS_DOCUMENTS_CATALOG.find(d => d.id === id);
      if (!doc) return '';
      const docHtml = buildSusDocumentHtml(doc, getFilledDataForDoc(id));
      const pageBreak = index < docsToOpen.length - 1
        ? '<div class="page-break" style="page-break-after: always; break-after: page; margin-bottom: 24px;"></div>'
        : '';
      return `${docHtml}${pageBreak}`;
    }).join('');

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
    currentDocItem.id === 'apac_principal' && !(formData.sigtapCode?.trim() && formData.procedureName?.trim()) && 'procedimento (código e nome)',
    currentDocItem.id === 'lme_medicamentos' && !formData.lmeMedications?.some((m) => m.name?.trim()) && 'medicamento',
    !formData.cid10Code?.trim() && 'CID-10',
    !formData.clinicalJustification?.trim() && 'justificativa clínica',
    currentDocItem.id === 'apac_complementar' && !(formData.renalCreatinine?.trim() && formData.renalEtfg?.trim()) && 'função renal'
  ].filter(Boolean) as string[];

  // Impresso oficial do órgão (APAC, LME): a folha é o próprio formulário, com os dados por cima
  const formularioOficial = formularioOficialDe(currentDocItem.id);
  const camposCortados = formularioOficial ? camposSemEspaco(formularioOficial, formData) : [];
  // Documentos sem impresso nacional: logo do SUS + logo do órgão (o do estado na APAC, o do posto de trabalho nos demais)
  const timbreDe = (doc: SusDocumentItem) => timbreDoDocumentoSus(doc, activeContext?.logoDataUrl || undefined);
  const classeDaFolha = (oficial: boolean) =>
    `select-text ${oficial ? 'folha-a4--formulario' : ''} ${medicoConfigurado(doctor) ? '' : 'no-print'}`;

  const linhasDaLme = formData.lmeMedications?.length ? formData.lmeMedications : [linhaVaziaDaLme()];
  const alterarLinhaDaLme = (indice: number, alterar: (linha: ReturnType<typeof linhaVaziaDaLme>) => ReturnType<typeof linhaVaziaDaLme>) => {
    handleFieldChange('lmeMedications', linhasDaLme.map((linha, i) => (i === indice ? alterar(linha) : linha)));
  };

  // Ação: Baixar PDF — fotografia fiel da folha exibida na prévia (mesmo caminho da receita)
  const folhaSusRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const nomeArquivo = (prefixo: string) =>
    `${prefixo}_${(formData.patientName || 'Paciente').trim().replace(/\s+/g, '_')}.pdf`;

  const handleDownloadPdf = async (downloadAll = false) => {
    if (!medicoConfigurado(doctor)) {
      showToast('Configure nome e CRM do médico para emitir documentos.');
      return;
    }
    const folhaAtual = folhaSusRef.current;
    if (!folhaAtual) return;

    // Vários documentos: monta uma folha fora da tela para cada um, com a mesma
    // classe e largura da prévia, e exporta todas em um único arquivo.
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
        const docItem = SUS_DOCUMENTS_CATALOG.find(d => d.id === docId);
        if (!docItem) return [];
        const oficial = formularioOficialDe(docId);
        const folha = document.createElement('div');
        folha.className = `folha-a4 ${classeDaFolha(Boolean(oficial))}`;
        folha.style.width = `${folhaAtual.offsetWidth}px`;
        folha.innerHTML = oficial
          ? renderToStaticMarkup(<FormularioOficialSus formulario={oficial} dados={getFilledDataForDoc(docId)} />)
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
    <div id="sus-documents-filler-hub" className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2 animate-bounce-short">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VISÃO 1: LISTA / CATÁLOGO DOS EXAMES E DOCUMENTOS OFICIAIS DO SUS */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Header Card com Status e Ação Rápida */}
          <div 
            className="tactile-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white bg-blue-600 border border-blue-400/30 shadow-tactile-sm shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                    Documentos & Requisições Oficiais do SUS
                  </h2>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    9 Documentos
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                  Selecione um ou vários exames da lista para preenchimento com autofill do médico e paciente.
                </p>
              </div>
            </div>

            {selectedDocIds.length > 0 && (
              <button
                type="button"
                onClick={handleStartFillingMultiple}
                className="btn-tactile-primary text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Layers className="w-4 h-4" />
                <span>Preencher Selecionados ({selectedDocIds.length})</span>
              </button>
            )}
          </div>

          {/* Filtros e Barra de Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Categorias em Pílulas */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {[
                { id: 'todos', label: 'Todos (9)' },
                { id: 'apac', label: 'APAC Alta Complexidade (2)' },
                { id: 'sisreg', label: 'SISREG Regulação (1)' },
                { id: 'lme', label: 'LME Alto Custo (1)' },
                { id: 'siscan', label: 'SISCAN Mulher (3)' },
                { id: 'gal', label: 'GAL / LACEN (2)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm'
                      : 'bg-[var(--surface-inset)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Campo de Busca */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar exame ou documento SUS..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder:text-[var(--text-placeholder)] focus:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Grid de Documentos Oficiais do SUS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCatalog.map(doc => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  className={`tactile-card-interactive rounded-2xl p-4 flex flex-col justify-between border relative group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/5 shadow-tactile-sm'
                      : 'hover:border-blue-400/40'
                  }`}
                  style={{
                    backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF'
                  }}
                  onClick={() => handleStartFillingSingle(doc.id)}
                >
                  <div>
                    {/* Header do Card com Checkbox e Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        {doc.badge}
                      </span>

                      {/* Checkbox de Seleção Múltipla */}
                      <button
                        type="button"
                        aria-label={`Selecionar ${doc.shortTitle}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDocSelection(doc.id);
                        }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-tactile-sm'
                            : 'border-slate-300 dark:border-slate-600 bg-[var(--surface-inset)] hover:border-blue-400 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-main)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      Sistema: <span className="text-[var(--text-main)]">{doc.system}</span>
                    </p>
                    <p className={`text-[11px] font-bold mt-1 ${formularioOficialDe(doc.id) ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {formularioOficialDe(doc.id) ? 'Sai no impresso oficial' : 'Modelo do app, com os logos do SUS e do órgão'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-3 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  {/* Rodapé com SIGTAP e Ação */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      SIGTAP: {doc.defaultSigtap || 'Diversos'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartFillingSingle(doc.id);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Preencher</span>
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISÃO 2: FORMULÁRIO UNIFICADO DE PREENCHIMENTO */}
      {viewMode === 'form' && (
        <div className="space-y-5 animate-tab-fade">
          {/* Barra Superior do Formulário */}
          <div 
            className="tactile-card p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  {formularioOficial ? 'Impresso oficial do Ministério da Saúde' : 'Modelo do PresCMed (sem impresso nacional único)'} • {currentDocItem.system}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate max-w-lg">
                  {currentDocItem.title}
                </h2>
              </div>
            </div>

            {/* Alternador de Documentos caso múltiplos estejam selecionados */}
            {selectedDocIds.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">
                  Documento:
                </span>
                {selectedDocIds.map(id => {
                  const doc = SUS_DOCUMENTS_CATALOG.find(d => d.id === id);
                  const isActive = activeFormDocId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveFormDocId(id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm'
                          : 'bg-[var(--surface-inset)] text-[var(--text-muted)] border-[var(--border-subtle)]'
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
              
              {/* CARD 1: DADOS DO MÉDICO / ESTABELECIMENTO (AUTOFILLED) */}
              <div 
                className="tactile-card p-4 rounded-2xl border"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                }}
              >
                <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      1. Identificação do Médico & Unidade Solicitante
                    </h3>
                  </div>
                  {medicoConfigurado(doctor) ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Importado do Perfil
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Complete os dados
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      Nome do Médico(a)
                    </label>
                    <input
                      type="text"
                      value={formData.doctorName}
                      onChange={e => handleFieldChange('doctorName', e.target.value)}
                      placeholder="Dr(a). Médico(a)"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        CRM
                      </label>
                      <input
                        type="text"
                        value={formData.doctorCrm}
                        onChange={e => handleFieldChange('doctorCrm', e.target.value)}
                        placeholder="000000"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        UF CRM
                      </label>
                      <input
                        type="text"
                        value={formData.doctorCrmState}
                        onChange={e => handleFieldChange('doctorCrmState', e.target.value)}
                        placeholder="SP"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      Especialidade
                    </label>
                    <input
                      type="text"
                      value={formData.doctorSpecialty}
                      onChange={e => handleFieldChange('doctorSpecialty', e.target.value)}
                      placeholder="Clínica Médica"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        CNES Unidade
                      </label>
                      <input
                        type="text"
                        value={formData.doctorCnes}
                        onChange={e => handleFieldChange('doctorCnes', e.target.value)}
                        placeholder="CNES (7 dígitos)"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        CPF do Médico (LME)
                      </label>
                      <input
                        type="text"
                        value={formData.doctorCpf || ''}
                        onChange={e => handleFieldChange('doctorCpf', e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      Nome da Unidade / Estabelecimento Solicitante
                    </label>
                    <input
                      type="text"
                      value={formData.doctorClinicName}
                      onChange={e => handleFieldChange('doctorClinicName', e.target.value)}
                      placeholder="Unidade Básica de Saúde / Policlínica"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: DADOS DO PACIENTE COM DESTIQUE EM CAMPOS FALTANTES (AUTOFILLED) */}
              <div 
                className="tactile-card p-4 rounded-2xl border"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                }}
              >
                <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      2. Identificação do Paciente
                    </h3>
                  </div>
                  {formData.patientAddress && formData.patientCns && formData.patientCity ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Dados do Paciente Completos
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Faltante: {[!formData.patientAddress && 'Endereço', !formData.patientCns && 'Cartão SUS (CNS)', !formData.patientCity && 'Cidade'].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      Nome Completo do Paciente
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={e => handleFieldChange('patientName', e.target.value)}
                      placeholder="Nome completo do paciente"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center justify-between mb-1">
                      <span>Cartão SUS (CNS)</span>
                      {!formData.patientCns && <span className="text-[9px] text-amber-500 font-bold uppercase">Faltante</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.patientCns}
                      onChange={e => handleFieldChange('patientCns', e.target.value)}
                      placeholder="000 0000 0000 0000 (15 dígitos)"
                      className={`w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border outline-none focus:border-blue-500 font-mono ${
                        !formData.patientCns ? 'border-amber-400/50 bg-amber-500/5' : 'border-[var(--border-subtle)] text-[var(--text-main)]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      CPF / Documento
                    </label>
                    <input
                      type="text"
                      value={formData.patientCpf}
                      onChange={e => handleFieldChange('patientCpf', e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Nascimento
                      </label>
                      <input
                        type="text"
                        value={formData.patientBirthDate}
                        onChange={e => handleFieldChange('patientBirthDate', e.target.value)}
                        placeholder="DD/MM/AAAA"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Idade
                      </label>
                      <input
                        type="text"
                        value={formData.patientAge}
                        onChange={e => handleFieldChange('patientAge', e.target.value)}
                        placeholder="Ex: 45 anos"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      Nome da Mãe
                    </label>
                    <input
                      type="text"
                      value={formData.patientMotherName}
                      onChange={e => handleFieldChange('patientMotherName', e.target.value)}
                      placeholder="Nome da mãe do paciente"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      Telefone de Contato
                    </label>
                    <input
                      type="text"
                      value={formData.patientPhone}
                      onChange={e => handleFieldChange('patientPhone', e.target.value)}
                      placeholder="(69) 90000-0000"
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Sexo e raça/cor: campos dos impressos oficiais; só saem marcados se escolhidos aqui */}
                  {formularioOficial && (
                    <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                      <div>
                        <label htmlFor="sus-sexo" className={ROTULO_SUS}>Sexo (campo do impresso)</label>
                        <select
                          id="sus-sexo"
                          value={formData.patientSex || ''}
                          onChange={e => handleFieldChange('patientSex', e.target.value)}
                          className={CAMPO_SUS}
                        >
                          <option value="">Deixar em branco</option>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="sus-raca-cor" className={ROTULO_SUS}>Raça/cor informada pelo paciente</label>
                        <select
                          id="sus-raca-cor"
                          value={formData.patientRaceColor || ''}
                          onChange={e => handleFieldChange('patientRaceColor', e.target.value)}
                          className={CAMPO_SUS}
                        >
                          <option value="">Deixar em branco</option>
                          <option value="branca">Branca</option>
                          <option value="preta">Preta</option>
                          <option value="parda">Parda</option>
                          <option value="amarela">Amarela</option>
                          <option value="indigena">Indígena</option>
                        </select>
                      </div>
                      {formData.patientRaceColor === 'indigena' && currentDocItem.id === 'lme_medicamentos' && (
                        <div className="col-span-2">
                          <label htmlFor="sus-etnia" className={ROTULO_SUS}>Etnia</label>
                          <input
                            id="sus-etnia"
                            type="text"
                            value={formData.patientEthnicity || ''}
                            onChange={e => handleFieldChange('patientEthnicity', e.target.value)}
                            className={CAMPO_SUS}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* CAMPOS DE ENDEREÇO RESIDENCIAL (MANDATÓRIO NO SUS) */}
                  <div className="sm:col-span-2 pt-2 border-t border-[var(--border-subtle)]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                      Endereço Residencial do Paciente (Obrigatório para SISREG / APAC / GAL):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center justify-between mb-0.5">
                          <span>Logradouro e Número</span>
                          {!formData.patientAddress && <span className="text-[9px] text-amber-500 font-bold uppercase">Faltante</span>}
                        </label>
                        <input
                          type="text"
                          value={formData.patientAddress}
                          onChange={e => handleFieldChange('patientAddress', e.target.value)}
                          placeholder="Rua / Avenida, Número e Complemento"
                          className={`w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border outline-none focus:border-blue-500 ${
                            !formData.patientAddress ? 'border-amber-400/50 bg-amber-500/5' : 'border-[var(--border-subtle)] text-[var(--text-main)]'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-0.5">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={formData.patientNeighborhood}
                          onChange={e => handleFieldChange('patientNeighborhood', e.target.value)}
                          placeholder="Bairro"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center justify-between mb-0.5">
                          <span>Município</span>
                          {!formData.patientCity && <span className="text-[9px] text-amber-500 font-bold uppercase">Faltante</span>}
                        </label>
                        <input
                          type="text"
                          value={formData.patientCity}
                          onChange={e => handleFieldChange('patientCity', e.target.value)}
                          placeholder="Cidade do paciente"
                          className={`w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border outline-none focus:border-blue-500 ${
                            !formData.patientCity ? 'border-amber-400/50 bg-amber-500/5' : 'border-[var(--border-subtle)] text-[var(--text-main)]'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-0.5">
                          UF
                        </label>
                        <input
                          type="text"
                          value={formData.patientState}
                          onChange={e => handleFieldChange('patientState', e.target.value)}
                          placeholder="UF"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-0.5">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={formData.patientCep}
                          onChange={e => handleFieldChange('patientCep', e.target.value)}
                          placeholder="00000-000"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: DADOS REGULATÓRIOS DO EXAME / DOCUMENTO ESPECÍFICO */}
              <div 
                className="tactile-card p-4 rounded-2xl border"
                style={{
                  backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                }}
              >
                <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                      3. Dados Regulatórios • {currentDocItem.shortTitle}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-inset)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    {currentDocItem.complexity}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* A LME não tem campo de procedimento SIGTAP */}
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 ${currentDocItem.id === 'lme_medicamentos' ? 'hidden' : ''}`}>
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Código SIGTAP
                      </label>
                      <input
                        type="text"
                        value={formData.sigtapCode}
                        onChange={e => handleFieldChange('sigtapCode', e.target.value)}
                        placeholder="00.00.00.000-0"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Descrição do Procedimento SIGTAP
                      </label>
                      <input
                        type="text"
                        value={formData.procedureName}
                        onChange={e => handleFieldChange('procedureName', e.target.value)}
                        placeholder="Nome do procedimento oficial"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        CID-10 Principal
                      </label>
                      <input
                        type="text"
                        value={formData.cid10Code}
                        onChange={e => handleFieldChange('cid10Code', e.target.value)}
                        placeholder="Código"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 uppercase font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                        Descrição do Diagnóstico (CID-10)
                      </label>
                      <input
                        type="text"
                        value={formData.cid10Description || ''}
                        onChange={e => handleFieldChange('cid10Description', e.target.value)}
                        placeholder="Descrição diagnóstica"
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {!formData.cid10Code?.trim() && currentDocItem.defaultCid10 && (
                    <p className="text-[11px] text-[var(--text-muted)]">
                      CID-10 em branco.{' '}
                      <button
                        type="button"
                        onClick={() => handleFieldChange('cid10Code', currentDocItem.defaultCid10 || '')}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Usar o código habitual deste documento ({currentDocItem.defaultCid10})
                      </button>
                    </p>
                  )}

                  {/* Campos Específicos para GAL / LACEN */}
                  {(currentDocItem.category === 'gal') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Nº da Notificação SINAN (Obrigatório GAL)
                        </label>
                        <input
                          type="text"
                          value={formData.sinanNumber || ''}
                          onChange={e => handleFieldChange('sinanNumber', e.target.value)}
                          placeholder="Número SINAN (7 dígitos)"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Início dos Primeiros Sintomas (D1)
                        </label>
                        <input
                          type="text"
                          value={formData.symptomsStartDate || ''}
                          onChange={e => handleFieldChange('symptomsStartDate', e.target.value)}
                          placeholder="DD/MM/AAAA"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Campos Específicos para APAC Complementar */}
                  {(currentDocItem.id === 'apac_complementar') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Creatinina Sérica (mg/dL)
                        </label>
                        <input
                          type="text"
                          value={formData.renalCreatinine || ''}
                          onChange={e => handleFieldChange('renalCreatinine', e.target.value)}
                          placeholder="Resultado do exame (ex.: 0,9)"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Taxa de Filtração Glomerular (eTFG)
                        </label>
                        <input
                          type="text"
                          value={formData.renalEtfg || ''}
                          onChange={e => handleFieldChange('renalEtfg', e.target.value)}
                          placeholder="Resultado em mL/min/1,73m²"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Campo 20 da APAC: quantidade do procedimento principal */}
                  {(currentDocItem.id === 'apac_principal') && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="sus-qtde" className={ROTULO_SUS}>Quantidade (campo 20)</label>
                        <input
                          id="sus-qtde"
                          type="text"
                          inputMode="numeric"
                          value={formData.procedureQuantity || ''}
                          onChange={e => handleFieldChange('procedureQuantity', e.target.value)}
                          placeholder="Ex.: 01"
                          className={CAMPO_SUS}
                        />
                      </div>
                    </div>
                  )}

                  {/* Campos Específicos para LME Farmácia de Alto Custo (numeração do impresso oficial) */}
                  {(currentDocItem.id === 'lme_medicamentos') && (
                    <div className="space-y-3 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <div className="space-y-2">
                        <span className={ROTULO_SUS}>7 e 8 — Medicamento(s) e quantidade solicitada por mês</span>
                        {linhasDaLme.map((linha, indice) => (
                          <div key={indice} className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 text-[11px] font-bold text-[var(--text-muted)]">{indice + 1}</span>
                              <input
                                type="text"
                                aria-label={`Medicamento ${indice + 1}`}
                                value={linha.name}
                                onChange={e => alterarLinhaDaLme(indice, (l) => ({ ...l, name: e.target.value }))}
                                placeholder="Medicamento, concentração e forma (como no PCDT)"
                                className={`${CAMPO_SUS} font-semibold`}
                              />
                              {linhasDaLme.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleFieldChange('lmeMedications', linhasDaLme.filter((_, i) => i !== indice))}
                                  className="h-8 px-2 rounded-lg border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)] hover:text-rose-600 cursor-pointer"
                                  aria-label={`Remover medicamento ${indice + 1}`}
                                >
                                  Remover
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-6 gap-1 pl-5">
                              {MESES_DA_LME.map((mes, m) => (
                                <input
                                  key={mes}
                                  type="text"
                                  inputMode="numeric"
                                  aria-label={`Quantidade do ${mes} mês, medicamento ${indice + 1}`}
                                  value={linha.quantities[m] || ''}
                                  onChange={e => alterarLinhaDaLme(indice, (l) => ({
                                    ...l,
                                    quantities: MESES_DA_LME.map((_, i) => (i === m ? e.target.value : l.quantities[i] || ''))
                                  }))}
                                  placeholder={`${mes} mês`}
                                  className="w-full px-1.5 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-center outline-none focus:border-blue-500"
                                />
                              ))}
                            </div>
                            {linha.quantities[0]?.trim() && (
                              <button
                                type="button"
                                onClick={() => alterarLinhaDaLme(indice, (l) => ({ ...l, quantities: MESES_DA_LME.map(() => l.quantities[0]) }))}
                                className="ml-5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                Repetir a quantidade do 1º mês nos 6 meses
                              </button>
                            )}
                          </div>
                        ))}
                        {linhasDaLme.length < 6 && (
                          <button
                            type="button"
                            onClick={() => handleFieldChange('lmeMedications', [...linhasDaLme, linhaVaziaDaLme()])}
                            className="h-8 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs font-semibold text-[var(--text-main)] cursor-pointer"
                          >
                            Adicionar medicamento
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label htmlFor="lme-peso" className={ROTULO_SUS}>5 — Peso (kg)</label>
                          <input id="lme-peso" type="text" inputMode="decimal" value={formData.patientWeightKg || ''} onChange={e => handleFieldChange('patientWeightKg', e.target.value)} className={CAMPO_SUS} />
                        </div>
                        <div>
                          <label htmlFor="lme-altura" className={ROTULO_SUS}>6 — Altura (cm)</label>
                          <input id="lme-altura" type="text" inputMode="numeric" value={formData.patientHeightCm || ''} onChange={e => handleFieldChange('patientHeightCm', e.target.value)} className={CAMPO_SUS} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="lme-cns-medico" className={ROTULO_SUS}>15 — CNS do médico solicitante</label>
                          <input id="lme-cns-medico" type="text" inputMode="numeric" value={formData.doctorCns || ''} onChange={e => handleFieldChange('doctorCns', e.target.value)} placeholder="15 dígitos" className={`${CAMPO_SUS} font-mono`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label htmlFor="lme-tratamento" className={ROTULO_SUS}>12 — Tratamento prévio?</label>
                          <select id="lme-tratamento" value={formData.lmePreviousTreatment || ''} onChange={e => handleFieldChange('lmePreviousTreatment', e.target.value)} className={CAMPO_SUS}>
                            <option value="">Deixar em branco</option>
                            <option value="nao">Não</option>
                            <option value="sim">Sim (relatar)</option>
                          </select>
                        </div>
                        {formData.lmePreviousTreatment === 'sim' && (
                          <div className="sm:col-span-2">
                            <label htmlFor="lme-tratamento-relato" className={ROTULO_SUS}>Relato do tratamento prévio</label>
                            <input id="lme-tratamento-relato" type="text" value={formData.lmePreviousTreatmentReport || ''} onChange={e => handleFieldChange('lmePreviousTreatmentReport', e.target.value)} className={CAMPO_SUS} />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label htmlFor="lme-incapaz" className={ROTULO_SUS}>13 — Paciente incapaz?</label>
                          <select id="lme-incapaz" value={formData.lmeIncapable || ''} onChange={e => handleFieldChange('lmeIncapable', e.target.value)} className={CAMPO_SUS}>
                            <option value="">Deixar em branco</option>
                            <option value="nao">Não</option>
                            <option value="sim">Sim (indicar responsável)</option>
                          </select>
                        </div>
                        {formData.lmeIncapable === 'sim' && (
                          <div className="sm:col-span-2">
                            <label htmlFor="lme-responsavel" className={ROTULO_SUS}>Nome do responsável</label>
                            <input id="lme-responsavel" type="text" value={formData.lmeResponsibleName || ''} onChange={e => handleFieldChange('lmeResponsibleName', e.target.value)} className={CAMPO_SUS} />
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lme-email" className={ROTULO_SUS}>22 — Correio eletrônico do paciente (opcional)</label>
                        <input id="lme-email" type="email" value={formData.patientEmail || ''} onChange={e => handleFieldChange('patientEmail', e.target.value)} className={CAMPO_SUS} />
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)]">
                        Os campos 18 e 23 (quem preencheu os dados complementares e assinatura) ficam em branco para preenchimento à mão. A LME não tem campo de posologia: ela vai na receita que acompanha o laudo.
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="sus-justificativa" className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                      Justificativa clínica e indicação técnica
                    </label>
                    <textarea
                      id="sus-justificativa"
                      rows={4}
                      value={formData.clinicalJustification}
                      onChange={e => handleFieldChange('clinicalJustification', e.target.value)}
                      placeholder="Descreva o quadro do paciente: história, exame físico e o que já foi tentado."
                      className="w-full p-3 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 leading-relaxed font-sans"
                    />
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('clinicalJustification', currentDocItem.defaultJustification || '')}
                        className="h-8 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-main)] cursor-pointer transition active:scale-95"
                        title="Preenche o campo com um texto-modelo deste documento, para você adaptar ao caso"
                      >
                        {formData.clinicalJustification?.trim() ? 'Substituir pelo texto-modelo' : 'Inserir texto-modelo'}
                      </button>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        O modelo é um ponto de partida: ajuste ao caso antes de emitir.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna da Direita: Pré-visualização da Folha Oficial SUS e Ações de Emissão (5 Colunas) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Barra de Ações de Emissão */}
              <div 
                className="tactile-card p-3 rounded-2xl border flex flex-col gap-2.5"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                }}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] px-1">
                  Ações de Emissão & Protocolo
                </span>

                {pendenciasClinicas.length > 0 && (
                  <p role="status" className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/25">
                    Em branco neste documento: {pendenciasClinicas.join(', ')}.
                  </p>
                )}

                {camposCortados.length > 0 && (
                  <p role="alert" className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-500/10 text-rose-900 dark:text-rose-200 border border-rose-500/30">
                    O texto não coube {camposCortados.length > 1 ? 'nos campos' : 'no campo'} {camposCortados.join(', ')} do impresso e saiu cortado, com a marca […]. Resuma o texto ou anexe um relatório.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {/* Baixar PDF (Individual ou Todos) */}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(false)}
                    disabled={isExportingPdf}
                    className="btn-tactile-primary h-10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Baixar PDF do documento atual"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingPdf ? 'Gerando...' : (selectedDocIds.length > 1 ? 'Baixar Este' : 'Baixar PDF')}</span>
                  </button>

                  {selectedDocIds.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(true)}
                      disabled={isExportingPdf}
                      className="btn-tactile-clinical h-10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      title={`Baixar todos os ${selectedDocIds.length} documentos selecionados em um único arquivo PDF`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>{isExportingPdf ? 'Gerando...' : `Baixar Todos (${selectedDocIds.length})`}</span>
                    </button>
                  ) : (
                    /* Imprimir Folha A4 */
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="btn-tactile-clinical h-10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir A4</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Abrir no Editor A4 */}
                  <button
                    type="button"
                    onClick={handleOpenInEditor}
                    className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
                    title="Editar texto deste documento no Editor A4"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{selectedDocIds.length > 1 ? 'Editar Este no A4' : 'Abrir no Editor A4'}</span>
                  </button>

                  {selectedDocIds.length > 1 ? (
                    <button
                      type="button"
                      onClick={handleOpenAllInEditor}
                      className="h-9 px-3 rounded-xl border border-blue-400/40 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
                      title={`Abrir todos os ${selectedDocIds.length} documentos selecionados no Editor A4 com quebra de página`}
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Editar Todos ({selectedDocIds.length})</span>
                    </button>
                  ) : (
                    /* Copiar Texto Markdown */
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
                      title="Copiar texto estruturado para colar no PEP / e-SUS APS"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar Laudo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Folha Física A4 Prévia (Papel Branco com Tipografia Grafite) */}
              <div className="space-y-2">
                <p className="px-1 text-[11px] font-semibold text-[var(--text-muted)]">
                  Prévia da folha A4 — o PDF e a impressão saem exatamente assim.
                </p>
                <div className="p-2 rounded-2xl bg-slate-900/5 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50">
                  <FolhaA4
                    ref={folhaSusRef}
                    id="sus-document-print-sheet"
                    imprimivel
                    className={classeDaFolha(Boolean(formularioOficial))}
                  >
                    {formularioOficial ? (
                      <FormularioOficialSus formulario={formularioOficial} dados={formData} />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: buildSusDocumentHtml(currentDocItem, formData, timbreDe(currentDocItem)) }} />
                    )}
                  </FolhaA4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
