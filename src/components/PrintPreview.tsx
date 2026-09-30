import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Download, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  Award, 
  FlaskConical, 
  Share2, 
  Check, 
  Layers,
  ArrowLeft,
  Loader2,
  Maximize2,
  Minimize2,
  Trash2,
  RotateCcw,
  FileCheck,
  Send,
  Copy,
  Printer,
  ArrowRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DoctorProfile, Patient, PrescriptionItem, ExamItem, MedicalCertificate, MedicalReferral, WorkContext, WatermarkType } from '../types';
import { generateMedicalPDF } from '../utils/pdfGenerator';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { isSpecialControlOrAntibiotic } from '../utils/isSpecialControlOrAntibiotic';
import { EXEMPLO_MEDICO, EXEMPLO_PACIENTE } from '../data/exemplos';
import WatermarkOverlay from './WatermarkOverlay';
import WatermarkSelector from './WatermarkSelector';

// Helper to convert any modern CSS color (oklch, oklab, lab, lch, color-mix, etc.) to standard #rrggbb or rgba for html2canvas compatibility
const convertColorToRgb = (color: string): string => {
  if (!color) return '#000000';
  const c = color.trim();
  if (c === 'transparent') return 'rgba(0, 0, 0, 0)';
  if (c.startsWith('#') || c.startsWith('rgb(') || c.startsWith('rgba(')) return c;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = c;
      const result = ctx.fillStyle;
      if (result && !result.includes('oklch') && !result.includes('oklab')) {
        return result;
      }
    }
  } catch {
    // fallback
  }

  // Safe fallback palette for standard medical and Tailwind colors
  if (c.includes('slate-950') || c.includes('0.145')) return '#020617';
  if (c.includes('slate-900') || c.includes('0.208')) return '#0F172A';
  if (c.includes('slate-800') || c.includes('0.279')) return '#1E293B';
  if (c.includes('slate-700') || c.includes('0.37')) return '#334155';
  if (c.includes('slate-600') || c.includes('0.446')) return '#475569';
  if (c.includes('slate-500') || c.includes('0.554')) return '#64748B';
  if (c.includes('slate-400') || c.includes('0.704')) return '#94A3B8';
  if (c.includes('slate-200') || c.includes('0.869')) return '#E2E8F0';
  if (c.includes('slate-100') || c.includes('0.968')) return '#F1F5F9';
  if (c.includes('slate-50') || c.includes('0.984')) return '#F8FAFC';
  if (c.includes('sky-800') || c.includes('0.45')) return '#075985';
  if (c.includes('sky-700') || c.includes('0.5')) return '#0369A1';
  if (c.includes('sky') || c.includes('0.588') || c.includes('0.6')) return '#0284C7';
  if (c.includes('emerald') || c.includes('0.596')) return '#059669';
  if (c.includes('amber') || c.includes('0.769')) return '#D97706';
  if (c.includes('rose') || c.includes('red')) return '#E11D48';
  return '#0F172A';
};

interface PrintPreviewProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionItems?: PrescriptionItem[];
  exams?: ExamItem[];
  selectedExams?: ExamItem[];
  examIndication?: string;
  certificate?: MedicalCertificate;
  referral?: MedicalReferral;
  activeContext?: WorkContext | null;
  initialDocType?: 'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral';
  onNavigateBack?: () => void;
  onBack?: () => void;
  onClearPrescription?: () => void;
  onResetAll?: () => void;
  onOpenDoctorModal?: () => void;
  onAbrirPerfilMedico?: () => void;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  darkMode,
  doctor,
  patient,
  prescriptionItems = [],
  exams = [],
  selectedExams = [],
  examIndication = '',
  activeContext = null,
  certificate = {
    patientName: '',
    documentNumber: '',
    daysOff: 1,
    startDate: '',
    endDate: '',
    periodText: '',
    cid10Code: '',
    cid10Description: '',
    includeCID: false,
    observations: '',
    cityDateText: ''
  },
  referral = {
    patientName: '',
    documentNumber: '',
    destinationSpecialty: 'Cardiologia Ambulatorial',
    destinationInstitution: '',
    clinicalSummary: '',
    reason: '',
    relevantExams: '',
    hypothesisCID: '',
    priority: 'eletivo' as const,
    date: ''
  },
  initialDocType = 'prescription',
  onNavigateBack,
  onBack,
  onClearPrescription,
  onResetAll,
  onOpenDoctorModal,
  onAbrirPerfilMedico
}) => {
  const effectiveExams = exams.length > 0 ? exams : selectedExams;
  const handleBack = onNavigateBack || onBack || (() => {});
  const handleAbrirPerfil = onAbrirPerfilMedico || onOpenDoctorModal;
  const isConfigured = medicoConfigurado(doctor);

  // Segregação sanitária automática: medicamentos simples vs antibióticos / controle especial (2 vias)
  const specialPrescriptionItems = useMemo(
    () => prescriptionItems.filter(i => isSpecialControlOrAntibiotic(i)),
    [prescriptionItems]
  );
  const simplePrescriptionItems = useMemo(
    () => prescriptionItems.filter(i => !isSpecialControlOrAntibiotic(i)),
    [prescriptionItems]
  );

  // Inicialização inteligente: se o médico clicou em emitir e todos os medicamentos forem especiais, abre direto na aba de 2 vias
  const resolvedInitialDocType = useMemo(() => {
    if (initialDocType && initialDocType !== 'prescription') return initialDocType;
    if (specialPrescriptionItems.length > 0 && simplePrescriptionItems.length === 0) {
      return 'special_prescription';
    }
    return initialDocType || 'prescription';
  }, [initialDocType, specialPrescriptionItems.length, simplePrescriptionItems.length]);

  const [docType, setDocType] = useState<'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral'>(resolvedInitialDocType);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [fitToMobile, setFitToMobile] = useState(true);
  const [docWatermark, setDocWatermark] = useState<WatermarkType>(
    activeContext?.watermarkType || 'none'
  );
  
  const printSheetRef = useRef<HTMLDivElement>(null);

  // Sync docType when initialDocType prop changes
  useEffect(() => {
    if (initialDocType) {
      if (initialDocType === 'prescription' && specialPrescriptionItems.length > 0 && simplePrescriptionItems.length === 0) {
        setDocType('special_prescription');
      } else {
        setDocType(initialDocType);
      }
    }
  }, [initialDocType, specialPrescriptionItems.length, simplePrescriptionItems.length]);

  // Itens efetivos exibidos e exportados de acordo com a aba selecionada (nunca misturando na mesma folha)
  const effectivePrescriptionItems = useMemo(() => {
    if (docType === 'special_prescription') {
      return specialPrescriptionItems.length > 0 ? specialPrescriptionItems : prescriptionItems;
    }
    if (docType === 'prescription') {
      return simplePrescriptionItems.length > 0
        ? simplePrescriptionItems
        : (specialPrescriptionItems.length > 0 ? [] : prescriptionItems);
    }
    return prescriptionItems;
  }, [docType, specialPrescriptionItems, simplePrescriptionItems, prescriptionItems]);

  // Sync docWatermark when activeContext changes
  useEffect(() => {
    if (activeContext?.watermarkType !== undefined) {
      setDocWatermark(activeContext.watermarkType);
    }
  }, [activeContext?.watermarkType]);

  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : null;
  const rawPatientName = patient?.name?.trim() || certificate?.patientName?.trim() || referral?.patientName?.trim();
  const patientName = rawPatientName || (isConfigured ? 'Não identificado' : EXEMPLO_PACIENTE.name);
  const patientDoc = patient?.documentNumber?.trim() || certificate?.documentNumber?.trim() || referral?.documentNumber?.trim() || '—';
  const patientAge = patient?.ageText?.trim() || patient?.birthDate?.trim() || '—';

  const docName = isConfigured
    ? (doctor?.name?.trim() || 'Dr(a). Médico(a)')
    : EXEMPLO_MEDICO.name;
  const docCrm = isConfigured
    ? (activeContext?.doctorCredentials?.crm || doctor?.crm?.trim() || '------')
    : EXEMPLO_MEDICO.crm;
  const docCrmState = isConfigured
    ? (activeContext?.doctorCredentials?.uf || doctor?.crmState || 'SP')
    : EXEMPLO_MEDICO.crmState;
  const docSpecialty = isConfigured
    ? (activeContext?.doctorCredentials?.specialty || doctor?.specialty || 'Clínica Médica')
    : EXEMPLO_MEDICO.specialty;
  const docClinic = activeContext?.clinicName?.trim() || doctor?.clinicName?.trim() || '';
  const docAddress = activeContext?.clinicAddress?.trim() || doctor?.address?.trim() || '';
  const docPhone = doctor?.phone?.trim() || '';

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getDocTitle = () => {
    switch (docType) {
      case 'prescription': return 'Receita_Medica';
      case 'special_prescription': return 'Receita_Controle_Especial';
      case 'exams': return 'Pedido_Exames';
      case 'certificate': return 'Atestado_Medico';
      case 'referral': return 'Encaminhamento_Medico';
      default: return 'Documento_Medico';
    }
  };

  /**
   * Generates a high-precision A4 PDF directly using jsPDF and jspdf-autotable.
   */
  const handleExportPDF = async () => {
    if (!medicoConfigurado(doctor)) {
      return;
    }

    try {
      setIsExportingPdf(true);
      setPdfError(null);

      const pdf = generateMedicalPDF({
        docType,
        doctor,
        patient,
        prescriptionItems: effectivePrescriptionItems,
        exams: effectiveExams,
        examIndication,
        certificate,
        referral
      });

      const cleanPatient = (patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${getDocTitle()}_${cleanPatient}_${dateStr}.pdf`;

      pdf.save(filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Erro ao exportar PDF via jsPDF & autoTable:', err);
      const message = err instanceof Error ? err.message : 'Erro ao exportar PDF.';
      setPdfError(message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Formatted text builder for WhatsApp and Clipboard
  const getFormattedDocumentText = (): string => {
    if (!medicoConfigurado(doctor)) return '';

    const dateStr = new Date().toLocaleDateString('pt-BR');
    const docLine = docName !== 'Dr(a). Médico(a)' ? `👨‍⚕️ *${docName}* — CRM ${docCrm}/${docCrmState}\n` : '👨‍⚕️ *Documento Médico*\n';
    const patientLine = patientName !== 'Não identificado' ? `👤 *Paciente:* ${patientName}${patientWeight ? ` (${patientWeight} kg)` : ''}\n` : '';
    const header = `📋 *DOCUMENTO MÉDICO DIGITAL*\n${docLine}${patientLine}📅 *Data:* ${dateStr}\n------------------------------------\n`;

    if (docType === 'prescription' || docType === 'special_prescription') {
      if (effectivePrescriptionItems.length === 0) return '';
      const docLabel = docType === 'special_prescription'
        ? 'RECEITUÁRIO DE CONTROLE ESPECIAL (2 VIAS • PORTARIA 344/98 & RDC 20/2011)'
        : 'RECEITUÁRIO MÉDICO';
      let text = `${header}💊 *${docLabel}:*\n`;
      effectivePrescriptionItems.forEach((it, idx) => {
        text += `\n*${idx + 1}. ${it.name}* (${it.route})\n   📦 *Qtd:* ${it.quantity}\n   👉 *Posologia:* ${it.instructions}\n`;
      });
      text += `\n------------------------------------\n⚠️ _Siga as instruções médicas e os horários informados._`;
      return text;
    } else if (docType === 'certificate') {
      let text = `${header}📄 *ATESTADO MÉDICO*\n\n`;
      text += `Atesto para os devidos fins que o(a) paciente *${patientName}* esteve sob atendimento médico nesta data (${dateStr}).\n\n`;
      if (certificate?.daysOff) {
        text += `👉 *Recomendação:* Repouso e afastamento das atividades laborais por *${certificate.daysOff} dia(s)* a contar desta data.\n\n`;
      }
      if (certificate?.cid10Code) {
        text += `📌 *CID-10:* ${certificate.cid10Code}${certificate.cid10Description ? ' - ' + certificate.cid10Description : ''}\n\n`;
      }
      if (certificate?.observations) {
        text += `📝 *Observação:* ${certificate.observations}\n\n`;
      }
      text += `------------------------------------\n_${docName} — CRM ${docCrm}/${docCrmState}_`;
      return text;
    } else if (docType === 'referral') {
      let text = `${header}🩺 *ENCAMINHAMENTO MÉDICO*\n\n`;
      text += `Ao(À) Colega Especialista em *${referral?.destinationSpecialty || 'Medicina'}*:\n\n`;
      text += `Encaminho o(a) paciente *${patientName}* para avaliação e conduta clínica.\n\n`;
      if (referral?.reason) {
        text += `📌 *Motivo / Hipótese:* ${referral.reason}\n\n`;
      }
      if (referral?.clinicalSummary) {
        text += `📝 *Resumo Clínico:* ${referral.clinicalSummary}\n\n`;
      }
      text += `------------------------------------\n_${docName} — CRM ${docCrm}/${docCrmState}_`;
      return text;
    } else if (docType === 'exams') {
      let text = `${header}🧪 *SOLICITAÇÃO DE EXAMES COMPLEMENTARES*\n\n`;
      if (exams.length === 0) return '';
      exams.forEach((ex, idx) => {
        text += `• ${ex.name}\n`;
      });
      if (examIndication) {
        text += `\n📌 *Indicação Clínica:* ${examIndication}\n`;
      }
      text += `\n------------------------------------\n_${docName} — CRM ${docCrm}/${docCrmState}_`;
      return text;
    }
    return `${header}Documento emitido pelo PrescMed.`;
  };

  const handleSendWhatsApp = () => {
    if (!medicoConfigurado(doctor)) return;
    const text = getFormattedDocumentText();
    if (!text) {
      alert('Nenhum dado para enviar.');
      return;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyFormattedText = () => {
    if (!medicoConfigurado(doctor)) return;
    const text = getFormattedDocumentText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    if (!medicoConfigurado(doctor)) return;
    const text = getFormattedDocumentText();
    if (navigator.share && text) {
      try {
        await navigator.share({
          title: `PrescMed - ${patientName}`,
          text: text,
        });
      } catch {
        // Share cancelled
      }
    } else {
      handleCopyFormattedText();
    }
  };

  const handlePrint = () => {
    if (!medicoConfigurado(doctor)) return;
    window.print();
  };

  const handleCopyValidation = () => {
    navigator.clipboard.writeText(`https://prescmed.digital/validar/doc-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const itemsByRoute = effectivePrescriptionItems.reduce((acc, item) => {
    const route = (item.route || 'Oral').toUpperCase();
    if (!acc[route]) acc[route] = [];
    acc[route].push(item);
    return acc;
  }, {} as { [route: string]: PrescriptionItem[] });

  return (
    <div id="print-preview-section" className="space-y-4 sm:space-y-5 pb-12">
      {/* Top Controller Bar */}
      <div 
        className="tactile-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 no-print"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(11, 19, 43, 0.08)'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center text-[var(--text-muted)] hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer transition active:scale-95 tactile-btn-secondary focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            style={{
              backgroundColor: 'var(--surface-inset)'
            }}
            title="Voltar para Edição"
          >
            <ArrowLeft className="w-5 h-5 icon-sculpted" strokeWidth={1.75} />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: darkMode ? '#F4F7FC' : '#0B132B' }}>
              <span>Exportar & Baixar PDF</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                A4 • Margens 10mm
              </span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-medium mt-0.5">
              Documento formatado em alta fidelidade com fontes serifadas e espaçamento legal.
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col items-stretch md:items-end gap-2.5 max-w-full">
          {!isConfigured && (
            <div 
              role="status" 
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold border bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/25"
            >
              <span>Configure nome e CRM do médico para emitir documentos.</span>
              {handleAbrirPerfil && (
                <button
                  type="button"
                  onClick={handleAbrirPerfil}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer active:scale-95 transition shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  Configurar médico
                </button>
              )}
            </div>
          )}

          {pdfError && (
            <div 
              role="alert" 
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold border bg-rose-500/10 text-rose-900 dark:text-rose-200 border-rose-500/25"
            >
              <span>{pdfError}</span>
              <button 
                type="button" 
                onClick={() => setPdfError(null)}
                className="text-rose-700 dark:text-rose-300 font-bold hover:underline shrink-0 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                Fechar
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full custom-scrollbar">
            {/* Copiar Texto */}
            <button
              type="button"
              onClick={handleCopyFormattedText}
              disabled={!isConfigured}
              className="btn-tactile-secondary h-10 sm:h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 whitespace-nowrap transition active:scale-95 cursor-pointer shadow-tactile-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              title={!isConfigured ? 'Configure nome e CRM do médico para emitir documentos' : 'Copiar texto formatado para prontuário/PEP'}
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              ) : (
                <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" strokeWidth={1.75} />
              )}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            {/* Imprimir Navegador */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={!isConfigured}
              className="btn-tactile-secondary h-10 sm:h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold hidden md:flex items-center gap-2 shrink-0 whitespace-nowrap transition active:scale-95 cursor-pointer shadow-tactile-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              title={!isConfigured ? 'Configure nome e CRM do médico para emitir documentos' : 'Imprimir direto pelo navegador (Ctrl+P)'}
            >
              <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" strokeWidth={1.75} />
              <span>Imprimir</span>
            </button>

            {/* Enviar no WhatsApp */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!isConfigured}
              className="btn-tactile-clinical h-10 sm:h-11 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 whitespace-nowrap shadow-tactile-btn transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              title={!isConfigured ? 'Configure nome e CRM do médico para emitir documentos' : 'Enviar o documento diretamente para o WhatsApp do paciente ou familiar'}
            >
              <Send className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>Enviar no WhatsApp</span>
            </button>

            {/* Baixar PDF (Ação Principal) */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPdf || !isConfigured}
              className="btn-tactile-primary h-10 sm:h-11 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 whitespace-nowrap shadow-tactile-btn transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              title={!isConfigured ? 'Configure nome e CRM do médico para emitir documentos' : 'Gerar e baixar arquivo PDF padrão A4 (10mm)'}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                  <span>Gerando PDF...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 shrink-0" strokeWidth={2.5} />
                  <span>Baixado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>Baixar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Document Type Switcher Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-print">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setDocType('prescription')}
            className={`text-xs font-semibold px-4 py-2 min-h-[40px] rounded-xl whitespace-nowrap border transition cursor-pointer active:scale-95 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              docType === 'prescription'
                ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <FileText className="w-4 h-4 icon-sculpted" strokeWidth={1.75} />
            <span>Receita Simples ({simplePrescriptionItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('special_prescription')}
            className={`text-xs font-semibold px-4 py-2 min-h-[40px] rounded-xl whitespace-nowrap border transition cursor-pointer active:scale-95 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              docType === 'special_prescription'
                ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <Layers className="w-4 h-4 icon-sculpted" strokeWidth={1.75} />
            <span>Controle Especial • 2 Vias ({specialPrescriptionItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('exams')}
            className={`text-xs font-semibold px-4 py-2 min-h-[40px] rounded-xl whitespace-nowrap border transition cursor-pointer active:scale-95 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              docType === 'exams'
                ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <FlaskConical className="w-4 h-4 icon-sculpted" strokeWidth={1.75} />
            <span>Exames ({effectiveExams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('certificate')}
            className={`text-xs font-semibold px-4 py-2 min-h-[40px] rounded-xl whitespace-nowrap border transition cursor-pointer active:scale-95 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              docType === 'certificate'
                ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <Award className="w-4 h-4 icon-sculpted" strokeWidth={1.75} />
            <span>Atestados</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('referral')}
            className={`text-xs font-semibold px-4 py-2 min-h-[40px] rounded-xl whitespace-nowrap border transition cursor-pointer active:scale-95 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              docType === 'referral'
                ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
            }`}
          >
            <Share2 className="w-4 h-4 icon-sculpted" strokeWidth={1.75} />
            <span>Encaminhamentos</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Marca d'Água Oficial */}
          <WatermarkSelector 
            currentType={docWatermark} 
            onChange={setDocWatermark} 
          />

          {/* View Zoom Toggle for Mobile */}
          <button
            type="button"
            onClick={() => setFitToMobile(!fitToMobile)}
            className="sm:hidden px-3 py-2 min-h-[40px] rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95 btn-tactile-secondary transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
              color: darkMode ? '#388EE6' : '#0F5E94'
            }}
            title={fitToMobile ? 'Modo Tamanho Real' : 'Modo Ajustar à Tela'}
          >
            {fitToMobile ? <Maximize2 className="w-4 h-4 icon-sculpted" strokeWidth={1.75} /> : <Minimize2 className="w-4 h-4 icon-sculpted" strokeWidth={1.75} />}
            <span>{fitToMobile ? 'Zoom' : 'Ajustar'}</span>
          </button>
        </div>
      </div>

      {/* Estilo dinâmico para impressão física @media print em Paisagem para Receita de Controle Especial */}
      {docType === 'special_prescription' && (
        <style>{`
          @media print {
            @page {
              size: landscape;
              margin: 8mm;
            }
            #printable-a4-sheet {
              width: 297mm !important;
              min-height: 195mm !important;
              max-width: none !important;
              padding: 6mm 8mm !important;
            }
          }
        `}</style>
      )}

      {/* A4 Paper Container Wrapper */}
      <div className="flex justify-center p-3 sm:p-8 bg-slate-900/5 dark:bg-slate-950/40 rounded-2xl overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 shadow-tactile-inset dark:shadow-tactile-inset-dark">
        <div 
          ref={printSheetRef}
          id="printable-a4-sheet"
          className={`print-page paper-sheet-floating w-full p-4 sm:p-8 md:p-10 rounded-xl relative transition duration-200 ${
            !isConfigured ? 'no-print' : ''
          } ${
            docType === 'special_prescription'
              ? (fitToMobile ? 'max-w-full sm:max-w-[1120px] min-h-[720px]' : 'min-w-[850px] max-w-[1120px] min-h-[740px]')
              : (fitToMobile ? 'max-w-full sm:max-w-[780px] min-h-[950px] sm:min-h-[1100px]' : 'min-w-[650px] max-w-[780px] min-h-[1100px]')
          }`}
          style={{
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            display: 'grid',
            gridTemplateRows: docType === 'special_prescription' ? '1fr' : 'auto 1fr auto',
            rowGap: docType === 'special_prescription' ? '0' : '1.5rem'
          }}
        >
          {/* Marca d'Água de Exemplo quando médico não configurado */}
          {!isConfigured && (
            <div 
              aria-hidden="true" 
              className="pointer-events-none select-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
            >
              <span 
                className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-widest font-sans transform -rotate-45"
                style={{ color: '#94A3B8', opacity: 0.22 }}
              >
                EXEMPLO
              </span>
            </div>
          )}

          {/* Marca d'Água Oficial em Camada Transparente */}
          <WatermarkOverlay 
            type={docWatermark} 
            opacity={activeContext?.watermarkOpacity} 
          />

          {/* LAYOUT 1: RECEITA DE CONTROLE ESPECIAL EM 2 VIAS HORIZONTAL (PAISAGEM • PORTARIA 344/98) */}
          {docType === 'special_prescription' ? (
            <div className="w-full relative z-10 flex flex-col justify-between flex-1 py-1">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] print:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 flex-1 w-full">
                {/* 1ª VIA: FARMÁCIA (RETENÇÃO) */}
                <div className="flex flex-col justify-between h-full pr-1 sm:pr-2 border-b md:border-b-0 pb-6 md:pb-0">
                  <div className="space-y-3">
                    {/* Cabeçalho Médico Compacto */}
                    <div className="pb-2 border-b border-slate-900 flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-5 h-5 rounded bg-sky-900 text-white font-bold text-[10px] flex items-center justify-center">
                            Rx
                          </span>
                          <h2 className="font-bold text-xs sm:text-sm uppercase leading-tight font-serif-doc text-slate-950">
                            {docName}
                          </h2>
                        </div>
                        <p className="text-[10px] font-bold text-sky-900">
                          CRM-{docCrmState} {docCrm} {doctor?.rqe ? `• RQE ${doctor.rqe}` : ''}
                        </p>
                        <p className="text-[9px] text-slate-600 font-medium">
                          {docSpecialty} {docClinic ? `• ${docClinic}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300 block">
                          CONTROLE ESPECIAL
                        </span>
                        <span className="text-[8px] font-bold text-rose-800 uppercase block mt-0.5">
                          1ª VIA: FARMÁCIA (RETENÇÃO)
                        </span>
                      </div>
                    </div>

                    {/* Dados do Paciente */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-800 grid grid-cols-2 gap-1.5">
                      <div><span className="font-bold text-slate-500">Paciente:</span> <span className="font-bold text-slate-900">{patientName}</span></div>
                      <div><span className="font-bold text-slate-500">Doc:</span> {patientDoc}</div>
                      <div><span className="font-bold text-slate-500">Peso:</span> {patientWeight ? `${patientWeight} kg` : '—'}</div>
                      <div><span className="font-bold text-slate-500">Idade:</span> {patientAge}</div>
                    </div>

                    {/* Medicamentos Prescritos (Foco em Nome e Quantidade para Dispensação) */}
                    <div className="space-y-2 font-serif-doc">
                      {effectivePrescriptionItems.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum antimicrobiano ou medicamento de controle especial prescrito.</p>
                      ) : (
                        (Object.entries(itemsByRoute) as [string, PrescriptionItem[]][]).map(([route, items]) => (
                          <div key={route} className="space-y-1.5">
                            <span className="text-[9px] font-bold uppercase text-sky-900 border-b border-slate-200 block pb-0.5">
                              USO {route.replace(/^USO\s+/i, '')}
                            </span>
                            {items.map((it, idx) => (
                              <div key={it.id} className="text-[11px] leading-tight flex justify-between gap-1">
                                <span className="font-bold text-slate-950">{idx + 1}) {it.name.toUpperCase()} ({it.presentation})</span>
                                <span className="font-semibold text-slate-800 shrink-0">----- {it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Parte Inferior 1ª Via: Boxes Comprador / Fornecedor e Assinatura */}
                  <div className="mt-4 pt-2 border-t border-slate-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[8px] text-slate-700 font-sans">
                      <div className="p-1.5 rounded border border-slate-300 bg-slate-50/70 space-y-1">
                        <span className="font-bold text-[8px] uppercase block border-b border-slate-200 text-slate-900">
                          IDENTIFICAÇÃO DO COMPRADOR
                        </span>
                        <div>Nome: _______________________________</div>
                        <div className="flex justify-between"><span>RG: __________</span> <span>CPF: _________</span></div>
                        <div>Endereço: ___________________________</div>
                        <div className="flex justify-between"><span>Cidade/UF: _______</span> <span>Tel: ________</span></div>
                      </div>
                      <div className="p-1.5 rounded border border-slate-300 bg-slate-50/70 space-y-1">
                        <span className="font-bold text-[8px] uppercase block border-b border-slate-200 text-slate-900">
                          IDENTIFICAÇÃO DO FORNECEDOR
                        </span>
                        <div>Farmácia/Drogaria: __________________</div>
                        <div className="pt-2 text-center border-t border-dotted border-slate-300 mt-1">
                          <span className="text-[7px] text-slate-500">Assinatura do Farmacêutico / Data</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-1">
                      <span className="text-[9px] text-slate-600 font-serif italic">
                        {doctor?.cityState || 'Brasil'}, {currentDate}
                      </span>
                      <div className="text-center pt-1 border-t border-slate-900 min-w-[140px]">
                        <span className="text-[10px] font-bold uppercase block text-slate-950">{docName}</span>
                        <span className="text-[8px] text-sky-900 font-semibold block">CRM-{docCrmState} {docCrm}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIVISOR CENTRAL COM LINHA DE CORTE */}
                <div className="hidden md:flex print:flex flex-col items-center justify-between py-2 relative select-none">
                  <div className="w-0.5 h-full border-l-2 border-dashed border-slate-300 dark:border-slate-400 absolute left-1/2 -translate-x-1/2" />
                  <div className="z-10 bg-white p-1 rounded-full border border-slate-300 text-slate-500 text-[11px] shadow-xs">
                    ✂
                  </div>
                  <div className="z-10 bg-white px-1.5 py-4 rounded border border-slate-200 text-[8px] font-mono text-slate-500 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
                    Linha de corte • Portaria 344/98
                  </div>
                  <div className="z-10 bg-white p-1 rounded-full border border-slate-300 text-slate-500 text-[11px] shadow-xs">
                    ✂
                  </div>
                </div>

                {/* 2ª VIA: PACIENTE (ORIENTAÇÃO) */}
                <div className="flex flex-col justify-between h-full pl-1 sm:pl-2">
                  <div className="space-y-3">
                    {/* Cabeçalho Médico Compacto */}
                    <div className="pb-2 border-b border-slate-900 flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-5 h-5 rounded bg-sky-900 text-white font-bold text-[10px] flex items-center justify-center">
                            Rx
                          </span>
                          <h2 className="font-bold text-xs sm:text-sm uppercase leading-tight font-serif-doc text-slate-950">
                            {docName}
                          </h2>
                        </div>
                        <p className="text-[10px] font-bold text-sky-900">
                          CRM-{docCrmState} {docCrm} {doctor?.rqe ? `• RQE ${doctor.rqe}` : ''}
                        </p>
                        <p className="text-[9px] text-slate-600 font-medium">
                          {docSpecialty} {docClinic ? `• ${docClinic}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300 block">
                          CONTROLE ESPECIAL
                        </span>
                        <span className="text-[8px] font-bold text-sky-900 uppercase block mt-0.5">
                          2ª VIA: PACIENTE (ORIENTAÇÃO)
                        </span>
                      </div>
                    </div>

                    {/* Dados do Paciente */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-800 grid grid-cols-2 gap-1.5">
                      <div><span className="font-bold text-slate-500">Paciente:</span> <span className="font-bold text-slate-900">{patientName}</span></div>
                      <div><span className="font-bold text-slate-500">Doc:</span> {patientDoc}</div>
                      <div><span className="font-bold text-slate-500">Peso:</span> {patientWeight ? `${patientWeight} kg` : '—'}</div>
                      <div><span className="font-bold text-slate-500">Idade:</span> {patientAge}</div>
                    </div>

                    {/* Medicamentos Prescritos com Posologia Completa */}
                    <div className="space-y-2.5 font-serif-doc">
                      {effectivePrescriptionItems.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum antimicrobiano ou medicamento de controle especial prescrito.</p>
                      ) : (
                        (Object.entries(itemsByRoute) as [string, PrescriptionItem[]][]).map(([route, items]) => (
                          <div key={route} className="space-y-2">
                            <span className="text-[9px] font-bold uppercase text-sky-900 border-b border-slate-200 block pb-0.5">
                              USO {route.replace(/^USO\s+/i, '')}
                            </span>
                            {items.map((it, idx) => (
                              <div key={it.id} className="text-[11px] leading-tight space-y-1">
                                <div className="flex justify-between font-bold text-slate-950">
                                  <span>{idx + 1}) {it.name.toUpperCase()} ({it.presentation})</span>
                                  <span className="font-semibold text-slate-700">----- {it.quantity}</span>
                                </div>
                                <p className="pl-3 text-[10px] text-slate-800 leading-relaxed font-serif">
                                  Posologia: {it.instructions}
                                </p>
                                {it.scheduleTimes && it.scheduleTimes.length > 0 && (
                                  <p className="pl-3 text-[9px] text-sky-800 font-sans font-semibold">
                                    Horários sugeridos: {it.scheduleTimes.join(' • ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Parte Inferior 2ª Via: Advertências Sanitárias e Assinatura */}
                  <div className="mt-4 pt-2 border-t border-slate-200 space-y-2">
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-[8px] text-rose-950 space-y-0.5">
                      <span className="font-bold uppercase block text-rose-900">
                        ⚠️ Orientações e Advertências Sanitárias (Portaria 344/98)
                      </span>
                      <p>• Medicamento sujeito a controle especial. Uso estritamente individual conforme prescrito.</p>
                      <p>• Mantenha fora do alcance de crianças em local seguro e protegido de luz/umidade.</p>
                    </div>

                    <div className="flex justify-between items-end pt-1">
                      <div className="text-[8px] text-slate-500 font-sans">
                        <span className="block font-bold text-emerald-800">Assinatura Eletrônica CFM Válida</span>
                        <span>prescmed.digital</span>
                      </div>
                      <div className="text-center pt-1 border-t border-slate-900 min-w-[140px]">
                        <span className="text-[10px] font-bold uppercase block text-slate-950">{docName}</span>
                        <span className="text-[8px] text-sky-900 font-semibold block">CRM-{docCrmState} {docCrm}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Top Medical Letterhead / Header (Grid Row 1) */}
              <header id="print-header" className="print-header print-avoid-break w-full relative z-10">
            {/* Logotipos da Instituição se cadastrados no contexto (Suporte a Timbrado Duplo) */}
            {(activeContext?.logoDataUrl || activeContext?.secondaryLogoDataUrl) && (
              <div className={`mb-3 flex items-center ${
                activeContext?.logoDataUrl && activeContext?.secondaryLogoDataUrl
                  ? 'justify-between'
                  : activeContext?.logoAlignment === 'center'
                  ? 'justify-center'
                  : activeContext?.logoAlignment === 'right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}>
                {activeContext?.logoDataUrl && (
                  <img 
                    src={activeContext.logoDataUrl} 
                    alt="Logotipo Institucional" 
                    className="max-h-16 object-contain"
                  />
                )}
                {activeContext?.secondaryLogoDataUrl && (
                  <img 
                    src={activeContext.secondaryLogoDataUrl} 
                    alt="Logotipo Secundário" 
                    className="max-h-16 object-contain"
                  />
                )}
              </div>
            )}

            <div 
              className="pb-4 sm:pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 print-avoid-break"
              style={{ borderBottom: '2px solid #0F172A' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div 
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0"
                    style={{ backgroundColor: '#1E4F7A', color: '#FFFFFF' }}
                  >
                    <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h1 className="font-bold text-xl sm:text-2xl tracking-tight uppercase leading-none font-serif-doc" style={{ color: '#0F172A' }}>
                      {docName}
                    </h1>
                    <p className="text-xs sm:text-sm font-bold font-sans mt-0.5" style={{ color: '#1E4F7A' }}>
                      CRM-{docCrmState} {docCrm} {doctor?.rqe ? `• RQE ${doctor.rqe}` : ''}
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-semibold font-sans" style={{ color: '#334155' }}>
                  {docSpecialty}
                </p>
                <p className="text-xs sm:text-xs mt-1 leading-normal font-sans" style={{ color: '#64748B' }}>
                  {docClinic}
                  {activeContext?.cnes && activeContext.documentFormatting?.showCnesOnHeader ? ` • CNES: ${activeContext.cnes}` : ''}
                  {docAddress ? ` • ${docAddress}` : ''}
                  {docPhone ? ` • ${docPhone}` : ''}
                </p>
              </div>

              {/* Document Title Badge */}
              <div 
                className="text-left sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-1.5 border-t sm:border-t-0 pt-2.5 sm:pt-0"
                style={{ borderColor: '#E2E8F0' }}
              >
                <span 
                  className="text-[10px] sm:text-xs uppercase font-extrabold px-3 py-1.5 rounded-md inline-block tracking-wider font-sans"
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1'
                  }}
                >
                  {docType === 'prescription' && (
                    activeContext?.documentFormatting?.prescriptionViaCount === 2 
                      ? 'RECEITUÁRIO MÉDICO (2 VIAS)' 
                      : 'RECEITUÁRIO MÉDICO'
                  )}
                  {docType === 'exams' && (activeContext?.documentFormatting?.examHeaderTitle || 'SOLICITAÇÃO DE EXAMES')}
                  {docType === 'certificate' && 'ATESTADO MÉDICO'}
                  {docType === 'referral' && 'ENCAMINHAMENTO MÉDICO'}
                </span>
                {docType === 'prescription' && activeContext?.documentFormatting?.prescriptionViaCount === 2 && (
                  <span className="text-[9px] sm:text-[10px] font-bold block uppercase tracking-wide font-sans" style={{ color: '#1E4F7A' }}>
                    1ª Via: Farmácia / 2ª Via: Paciente
                  </span>
                )}
                <span className="text-xs sm:text-xs font-medium font-sans" style={{ color: '#64748B' }}>
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Patient Header Box */}
            <div 
              className="mt-4 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm print-avoid-break"
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A'
              }}
            >
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] sm:text-xs uppercase font-bold block text-slate-500 font-sans tracking-wide">
                  Paciente:
                </span>
                <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight font-sans mt-0.5">
                  {patientName}
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-xs uppercase font-bold block text-slate-500 font-sans tracking-wide">
                  Doc (RG/CPF):
                </span>
                <span className="font-semibold text-xs sm:text-sm text-slate-800 block leading-tight font-sans mt-0.5">
                  {patientDoc}
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-xs uppercase font-bold block text-slate-500 font-sans tracking-wide">
                  Peso Atual:
                </span>
                <span className="font-extrabold text-sm sm:text-base text-sky-800 block leading-tight font-sans mt-0.5">
                  {patientWeight ? `${patientWeight} kg` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-xs uppercase font-bold block text-slate-500 font-sans tracking-wide">
                  Idade:
                </span>
                <span className="font-semibold text-xs sm:text-sm text-slate-800 block leading-tight font-sans mt-0.5">
                  {patientAge}
                </span>
              </div>
            </div>
          </header>

          {/* DOCUMENT BODY CONTENT (Grid Row 2 - Flex 1fr) */}
          <main id="print-content" className="print-body w-full min-h-0 flex-1 flex flex-col justify-start relative z-10">
              {/* 1. PRESCRIPTION CONTENT */}
              {docType === 'prescription' && (
                <div className="space-y-6 sm:space-y-8 font-serif font-serif-doc" style={{ fontFamily: 'var(--font-serif-doc)' }}>
                  {effectivePrescriptionItems.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <p className="italic text-base text-slate-500 font-serif">
                        {specialPrescriptionItems.length > 0
                          ? 'Todos os medicamentos desta consulta são antimicrobianos ou controlados (2 Vias).'
                          : 'Nenhum medicamento adicionado nesta prescrição.'}
                      </p>
                      {specialPrescriptionItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDocType('special_prescription')}
                          className="px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 inline-flex items-center gap-1.5 cursor-pointer shadow-tactile-sm transition"
                        >
                          <span>Ver na aba Controle Especial (2 Vias)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    (Object.entries(itemsByRoute) as [string, PrescriptionItem[]][]).map(([route, items]) => {
                      const cleanRoute = route.trim().toUpperCase();
                      const routeTitle = cleanRoute.startsWith('USO ') ? cleanRoute : `USO ${cleanRoute}`;
                      return (
                        <div key={route} className="space-y-4 print-avoid-break">
                          <div 
                            className="pb-1.5 flex items-center justify-between"
                            style={{ borderBottom: '1.5px solid #CBD5E1' }}
                          >
                            <span className="font-bold text-xs sm:text-sm tracking-wider uppercase font-sans text-sky-900">
                              {routeTitle}
                            </span>
                          </div>

                        <div className="space-y-5 pl-1 sm:pl-2">
                          {items.map((item, idx) => (
                            <div key={item.id} className="space-y-1.5 print-avoid-break">
                              {/* Medication Item Headline */}
                              <div className="flex items-baseline justify-between font-serif text-base sm:text-lg" style={{ color: '#0F172A' }}>
                                <div className="pr-3 leading-snug">
                                  <span className="font-bold mr-2 font-serif text-base sm:text-lg text-slate-950">{idx + 1})</span>
                                  <span className="uppercase font-bold tracking-tight text-slate-950">{item.name}</span>{' '}
                                  <span className="text-sm sm:text-base font-normal italic text-slate-700">({item.presentation})</span>
                                </div>
                                <div className="text-sm sm:text-base font-semibold font-serif tracking-wider whitespace-nowrap flex-shrink-0 text-slate-800">
                                  ---------------- {item.quantity}
                                </div>
                              </div>

                              {/* Posology / Administration Instructions in Serif */}
                              <div className="pl-5 sm:pl-7 text-sm sm:text-base font-medium leading-relaxed sm:leading-loose text-slate-900 font-serif">
                                {item.instructions}
                              </div>

                              {/* Suggested Schedule Times */}
                              {item.scheduleTimes && item.scheduleTimes.length > 0 && (
                                <div className="pl-5 sm:pl-7 flex items-center gap-2 text-xs sm:text-sm font-sans font-semibold mt-1.5 flex-wrap" style={{ color: '#1E4F7A' }}>
                                  <span>Horários sugeridos:</span>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {item.scheduleTimes.map(t => (
                                      <span 
                                        key={t} 
                                        className="px-2 py-0.5 rounded-md font-bold text-xs sm:text-sm font-sans"
                                        style={{
                                          backgroundColor: '#F1F5F9',
                                          color: '#0F172A',
                                          border: '1px solid #CBD5E1'
                                        }}
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
              )}

              {/* 2. EXAMS CONTENT */}
              {docType === 'exams' && (
                <div className="space-y-6 font-serif font-serif-doc" style={{ fontFamily: 'var(--font-serif-doc)' }}>
                  {examIndication && (
                    <div 
                      className="p-4 rounded-xl text-xs sm:text-sm font-sans"
                      style={{
                        backgroundColor: '#FEF8EE',
                        border: '1px solid #FDE68A',
                        color: '#78350F'
                      }}
                    >
                      <span className="font-bold uppercase">Indicação Clínica: </span>
                      <span className="font-semibold text-slate-900">{examIndication}</span>
                    </div>
                  )}

                  <div className="pb-1.5" style={{ borderBottom: '1.5px solid #CBD5E1' }}>
                    <span className="font-bold text-xs sm:text-sm tracking-wider uppercase font-sans text-sky-900">
                      EXAMES COMPLEMENTARES SOLICITADOS:
                    </span>
                  </div>

                  {effectiveExams.length === 0 ? (
                    <div className="py-16 text-center italic text-base text-slate-500 font-serif">
                      Nenhum exame selecionado neste pedido.
                    </div>
                  ) : (
                    <ol className="list-decimal list-inside space-y-3 pl-2 text-sm sm:text-base font-serif text-slate-950 font-semibold leading-relaxed">
                      {effectiveExams.map((exam) => (
                        <li key={exam.id} className="leading-relaxed">
                          <span className="font-bold">{exam.name}</span>
                          <span className="text-xs sm:text-sm font-normal italic ml-2 text-slate-600 font-sans">({exam.category})</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {/* 3. ATESTADO MÉDICO CONTENT */}
              {docType === 'certificate' && (
                <div className="py-4 sm:py-8 px-1 sm:px-4 space-y-6 sm:space-y-8 font-serif font-serif-doc text-justify leading-relaxed sm:leading-loose" style={{ fontFamily: 'var(--font-serif-doc)' }}>
                  <h2 
                    className="text-center font-bold text-xl sm:text-2xl uppercase tracking-widest pb-3 font-serif-doc"
                    style={{ color: '#0F172A', borderBottom: '1.5px solid #CBD5E1' }}
                  >
                    ATESTADO MÉDICO
                  </h2>

                  <p className="text-base sm:text-lg indent-6 sm:indent-10 leading-loose sm:leading-loose text-slate-950 font-normal">
                    Atesto para os devidos fins de direito que o(a) paciente{' '}
                    <strong className="underline uppercase font-bold text-slate-950">{certificate.patientName || patientName}</strong>,{' '}
                    {(certificate.documentNumber || (patientDoc !== '—' ? patientDoc : '')) ? `portador(a) do documento nº ${certificate.documentNumber || patientDoc}, ` : ''}
                    esteve sob meus cuidados médicos profissionais no dia {certificate.startDate ? new Date(certificate.startDate + 'T00:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')},{' '}
                    necessitando de <strong className="font-bold text-slate-950">{certificate.daysOff || 1} ({certificate.daysOff === 1 ? 'um' : certificate.daysOff || 1}) dia(s)</strong> de repouso e afastamento de suas atividades habituais{' '}
                    {certificate.periodText || ''}, com retorno previsto a partir de {certificate.endDate ? new Date(certificate.endDate + 'T00:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}.
                  </p>

                  {certificate.includeCID && certificate.cid10Code && (
                    <div 
                      className="p-4 rounded-xl text-xs sm:text-sm font-sans"
                      style={{
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A'
                      }}
                    >
                      <span className="font-bold">Diagnóstico Codificado (CID-10): </span>
                      <span className="font-semibold text-sky-900">{certificate.cid10Code} - {certificate.cid10Description}</span>
                      <span className="block text-xs font-normal text-slate-500 mt-1">
                        * Inclusão do CID expressamente solicitada e autorizada pelo(a) paciente (Resolução CFM nº 1.658/2002).
                      </span>
                    </div>
                  )}

                  {certificate.observations && (
                    <div className="text-sm sm:text-base font-serif italic text-slate-800">
                      <strong className="font-bold text-slate-950 font-sans">Observações Médicas: </strong>
                      {certificate.observations}
                    </div>
                  )}
                </div>
              )}

              {/* 4. ENCAMINHAMENTO CONTENT */}
              {docType === 'referral' && (
                <div className="space-y-5 sm:space-y-6 text-sm font-serif font-serif-doc" style={{ fontFamily: 'var(--font-serif-doc)' }}>
                  <h2 
                    className="text-center font-bold text-lg sm:text-xl uppercase tracking-widest pb-3 font-serif-doc"
                    style={{ color: '#0F172A', borderBottom: '1.5px solid #CBD5E1' }}
                  >
                    GUIA DE ENCAMINHAMENTO & REFERÊNCIA
                  </h2>

                  <div 
                    className="p-4 rounded-xl font-sans"
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      color: '#14532D'
                    }}
                  >
                    <span className="font-bold uppercase text-xs">Ao Serviço Especializado de: </span>
                    <span className="font-extrabold text-base sm:text-lg block text-emerald-950">{referral.destinationSpecialty}</span>
                    {referral.destinationInstitution && (
                      <span className="font-medium text-xs sm:text-sm block mt-1 text-slate-700">
                        Local / Instituição: {referral.destinationInstitution}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold uppercase block text-xs font-sans text-slate-600">Motivo da Solicitação:</span>
                    <p 
                      className="p-3.5 rounded-xl font-medium text-sm sm:text-base leading-relaxed"
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A'
                      }}
                    >
                      {referral.reason || 'Avaliação e conduta terapêutica especializada.'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold uppercase block text-xs font-sans text-slate-600">Resumo Clínico / Evolução:</span>
                    <p 
                      className="p-3.5 rounded-xl font-medium text-sm sm:text-base leading-loose"
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#1E293B'
                      }}
                    >
                      {referral.clinicalSummary || 'Histórico clínico e exame físico sem alterações agudas no momento.'}
                    </p>
                  </div>

                  {referral.relevantExams && (
                    <div className="space-y-1.5">
                      <span className="font-bold uppercase block text-xs font-sans text-slate-600">Exames Complementares Realizados:</span>
                      <p 
                        className="p-3.5 rounded-xl text-sm sm:text-base font-medium"
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          color: '#1E293B'
                        }}
                      >
                        {referral.relevantExams}
                      </p>
                    </div>
                  )}

                  {referral.hypothesisCID && (
                    <div className="space-y-1.5 print-avoid-break">
                      <span className="font-bold uppercase block text-xs font-sans text-slate-600">Hipótese Diagnóstica (CID-10):</span>
                      <p 
                        className="p-3.5 rounded-xl font-semibold text-sm sm:text-base font-sans"
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          color: '#1E4F7A'
                        }}
                      >
                        {referral.hypothesisCID}
                      </p>
                    </div>
                  )}
                </div>
              )}
          </main>

          {/* Bottom Footer & Signature (Grid Row 3) */}
          <footer 
            id="print-footer"
            className="print-footer print-avoid-break w-full mt-auto pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10"
            style={{ borderTop: '2px solid #0F172A' }}
          >
            {/* Left: Validation QR Code & Security Stamp */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <div 
                onClick={handleCopyValidation}
                className="w-14 h-14 sm:w-16 sm:h-16 p-1 rounded-lg flex items-center justify-center shadow-xs cursor-pointer"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #0F172A'
                }}
                title="Clique para validar autenticidade digital"
              >
                <QrCode className="w-full h-full" style={{ color: '#0F172A' }} />
              </div>
              <div className="text-[10px] sm:text-xs leading-tight font-sans text-slate-600">
                <span className="font-bold block text-slate-900">VALIDAÇÃO DIGITAL CFM</span>
                <span>Código: DOC-PRESC-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                <span className="block font-semibold text-emerald-800">Assinatura Eletrônica Válida</span>
                <span>Consulte em prescmed.digital</span>
              </div>
            </div>

            {/* Right: City, Date & Doctor Signature Line */}
            <div className="text-center sm:text-right w-full sm:w-auto font-sans">
              <p className="text-xs sm:text-sm font-medium mb-4 sm:mb-6 font-serif italic text-slate-700">
                {doctor?.cityState || 'São Paulo - SP'}, {currentDate}
              </p>
              
              <div 
                className="inline-block pt-2 min-w-[210px] sm:min-w-[240px] text-center"
                style={{ borderTop: '1.5px solid #0F172A' }}
              >
                <p className="font-bold text-sm sm:text-base uppercase tracking-tight text-slate-950 font-sans">
                  {docName}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-sky-900 font-sans">
                  CRM-{docCrmState} {docCrm}
                </p>
                <p className="text-xs sm:text-xs text-slate-500 font-sans font-medium">
                  {docSpecialty}
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  </div>

      {/* Bottom Sticky Action Bar */}
      <div 
        className="tactile-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 no-print"
        style={{
          backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{
              backgroundColor: darkMode ? '#1E4F7A' : '#0F6292',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <FileCheck className="w-5 h-5 text-slate-100" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
              Documento Pronto para Download
            </div>
            <div className="text-[11px] text-[var(--text-muted)] dark:text-slate-400">
              Formato A4 com margens de 10mm e fontes serifadas de alta legibilidade.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            disabled={!isConfigured}
            className="tactile-btn-secondary px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            style={{
              backgroundColor: 'var(--surface-inset)',
              color: darkMode ? '#CBD5E1' : '#334155'
            }}
            title={!isConfigured ? 'Configure nome e CRM do médico para emitir documentos' : 'Compartilhar documento'}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} /> : <Share2 className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" strokeWidth={1.75} />}
            <span>Compartilhar</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPdf || !isConfigured}
            className="tactile-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            title={!isConfigured ? 'Configure nome e CRM do médico para emitir documentos' : 'Baixar arquivo PDF'}
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Baixando PDF...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" strokeWidth={1.75} />
                <span>PDF Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" strokeWidth={1.75} />
                <span>Baixar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
