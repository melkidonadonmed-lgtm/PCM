import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  buildSusDocumentHtml 
} from '../data/susDocumentsCatalog';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import jsPDF from 'jspdf';
import { downloadPdfDoc } from '../utils/downloadPdf';
import html2canvas from 'html2canvas';

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
  const getDocDefaultFields = useCallback((doc: SusDocumentItem): Partial<SusFilledFormData> => ({
    sigtapCode: doc.defaultSigtap || '',
    procedureName: doc.defaultProcedure || '',
    cid10Code: doc.defaultCid10 || '',
    cid10Description: '',
    clinicalJustification: doc.defaultJustification || '',
    sinanNumber: '',
    symptomsStartDate: '',
    renalCreatinine: '1,0',
    renalEtfg: '> 60',
    isContrastNeeded: true,
    gynecologyDum: '',
    gynecologyPreviousExam: 'Nunca realizou / Há mais de 3 anos',
    specimenType: '',
    tuberculosisSymptomsDuration: 'Mais de 3 semanas',
    lmeMedicationName: '',
    lmeMedicationPosology: '',
    lmeMedicationQuantityMonthly: '1 mês'
  }), []);

  // Dados específicos isolados por documento para evitar contaminação na seleção múltipla
  const [docsSpecificData, setDocsSpecificData] = useState<Record<string, Partial<SusFilledFormData>>>(() => {
    const map: Record<string, Partial<SusFilledFormData>> = {};
    SUS_DOCUMENTS_CATALOG.forEach(d => {
      map[d.id] = {
        sigtapCode: d.defaultSigtap || '',
        procedureName: d.defaultProcedure || '',
        cid10Code: d.defaultCid10 || '',
        cid10Description: '',
        clinicalJustification: d.defaultJustification || '',
        sinanNumber: '',
        symptomsStartDate: '',
        renalCreatinine: '1,0',
        renalEtfg: '> 60',
        isContrastNeeded: true,
        gynecologyDum: '',
        gynecologyPreviousExam: 'Nunca realizou / Há mais de 3 anos',
        specimenType: '',
        tuberculosisSymptomsDuration: 'Mais de 3 semanas',
        lmeMedicationName: '',
        lmeMedicationPosology: '',
        lmeMedicationQuantityMonthly: '1 mês'
      };
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
      'doctorName', 'doctorCrm', 'doctorCrmState', 'doctorSpecialty', 'doctorCnes', 'doctorClinicName', 'doctorCpf',
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

  // Ação: Baixar PDF Direto com fidelidade
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const handleDownloadPdf = async (downloadAll = false) => {
    const container = document.getElementById('sus-document-print-sheet');
    if (!container) {
      window.print();
      return;
    }

    try {
      setIsExportingPdf(true);
      showToast('Renderizando PDF com alta fidelidade...');
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }

      if (!downloadAll || selectedDocIds.length <= 1) {
        // Baixa o documento ativo
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#FFFFFF',
          logging: false
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
        await downloadPdfDoc(pdf, `${currentDocItem.shortTitle.replace(/\s+/g, '_')}_${(formData.patientName || 'Paciente').replace(/\s+/g, '_')}.pdf`);
        showToast('PDF do documento SUS gerado com sucesso!');
      } else {
        // Baixa todos os selecionados em páginas consecutivas
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '794px';
        tempContainer.style.backgroundColor = '#FFFFFF';
        tempContainer.style.padding = '24px';
        document.body.appendChild(tempContainer);

        for (let i = 0; i < selectedDocIds.length; i++) {
          const docId = selectedDocIds[i];
          const docItem = SUS_DOCUMENTS_CATALOG.find(d => d.id === docId);
          if (!docItem) continue;
          tempContainer.innerHTML = buildSusDocumentHtml(docItem, getFilledDataForDoc(docId));
          const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FFFFFF',
            logging: false
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
        }

        document.body.removeChild(tempContainer);
        await downloadPdfDoc(pdf, `Documentos_SUS_Multiplos_${(formData.patientName || 'Paciente').replace(/\s+/g, '_')}.pdf`);
        showToast(`PDF com ${selectedDocIds.length} documentos SUS gerado com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao gerar PDF do documento SUS:', err);
      window.print();
    } finally {
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
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
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
                  className={`tactile-card rounded-2xl p-4 flex flex-col justify-between transition cursor-pointer border relative group ${
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
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
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
                  Formulário Oficial SUS • {currentDocItem.system}
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                        placeholder="Ex: M54.5"
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
                          value={formData.renalCreatinine || '1,0'}
                          onChange={e => handleFieldChange('renalCreatinine', e.target.value)}
                          placeholder="1,0 mg/dL"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                          Taxa de Filtração Glomerular (eTFG)
                        </label>
                        <input
                          type="text"
                          value={formData.renalEtfg || '> 60'}
                          onChange={e => handleFieldChange('renalEtfg', e.target.value)}
                          placeholder="> 60 mL/min"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Campos Específicos para LME Farmácia de Alto Custo */}
                  {(currentDocItem.id === 'lme_medicamentos') && (
                    <div className="space-y-2 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                            Medicamento do Componente Especializado (DCB)
                          </label>
                          <input
                            type="text"
                            value={formData.lmeMedicationName || ''}
                            onChange={e => handleFieldChange('lmeMedicationName', e.target.value)}
                            placeholder="Fármaco conforme PCDT ministerial"
                            className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                            Posologia Diária Estruturada
                          </label>
                          <input
                            type="text"
                            value={formData.lmeMedicationPosology || ''}
                            onChange={e => handleFieldChange('lmeMedicationPosology', e.target.value)}
                            placeholder="Ex: 1 comp pela manhã por 180 dias"
                            className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center justify-between mb-1">
                      <span>Justificativa Clínica e Indicação Técnica (Anti-Glosa)</span>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('clinicalJustification', currentDocItem.defaultJustification)}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Restaurar Modelo Oficial
                      </button>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.clinicalJustification}
                      onChange={e => handleFieldChange('clinicalJustification', e.target.value)}
                      placeholder="Descreva a história cronológica, achados do exame físico e falhas terapêuticas prévias para evitar devolução no SISREG..."
                      className="w-full p-3 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-blue-500 leading-relaxed font-sans"
                    />
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
                  backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                }}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] px-1">
                  Ações de Emissão & Protocolo
                </span>

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
              <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-tactile-md bg-white">
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Prévia da Folha Oficial SUS</span>
                  <span className="text-[10px] font-mono text-slate-500">Padrão A4</span>
                </div>

                <div 
                  id="sus-document-print-sheet" 
                  className="p-6 bg-white text-slate-900 text-[11px] leading-relaxed select-text"
                  dangerouslySetInnerHTML={{
                    __html: buildSusDocumentHtml(currentDocItem, formData)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
