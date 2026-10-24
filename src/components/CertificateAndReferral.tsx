import React, { useState } from 'react';
import { 
  Award, 
  Share2, 
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Stethoscope,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Hash,
  Send
} from './Icon';
import { MedicalCertificate, MedicalReferral, Patient, DoctorProfile } from '../types';
import { CidSearchBar } from './CidSearchBar';
import { COMMON_CID10, CIDItem } from '../data/cidCatalog';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { dataLocalISO } from '../utils/documentoClinico';
import { escapeHtml } from '../utils/sanitizeHtml';
import {
  formatarAtestadoWhatsAppTexto,
  formatarEncaminhamentoWhatsAppTexto
} from '../utils/compartilhamentoTexto';

/**
 * Sub-ilhas de Atestado Médico e Encaminhamento.
 * Estados de UI cobertos: empty (vazio sem CID), loading (carregando modelo),
 * success (sucesso ao copiar/emitir) e error (erro de validação/consentimento).
 */
interface CertificateAndReferralProps {
  darkMode: boolean;
  patient: Patient;
  onUpdatePatient?: (patient: Patient) => void;
  doctor: DoctorProfile;
  certificate: MedicalCertificate;
  onUpdateCertificate: (cert: MedicalCertificate) => void;
  referral: MedicalReferral;
  onUpdateReferral: (ref: MedicalReferral) => void;
  activeSubTab?: 'certificate' | 'referral';
  initialSubTab?: 'certificate' | 'referral';
  onSelectSubTab?: (tab: 'certificate' | 'referral') => void;
  onNavigateToPrint: (docType?: 'certificate' | 'referral') => void;
  onNavigateToEditorWithHtml?: (html: string, title: string, type?: 'referral' | 'certificate') => void;
  hideSubNav?: boolean;
}

export const CertificateAndReferral: React.FC<CertificateAndReferralProps> = ({
  darkMode,
  patient,
  onUpdatePatient,
  doctor,
  certificate,
  onUpdateCertificate,
  referral,
  onUpdateReferral,
  activeSubTab,
  initialSubTab,
  onSelectSubTab,
  onNavigateToPrint,
  onNavigateToEditorWithHtml,
  hideSubNav = false
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'certificate' | 'referral'>(initialSubTab || activeSubTab || 'certificate');
  const currentSubTab = activeSubTab || internalSubTab;

  const handlePatientNameChange = (newName: string) => {
    onUpdateCertificate({ ...certificate, patientName: newName });
    onUpdateReferral({ ...referral, patientName: newName });
    if (onUpdatePatient) {
      onUpdatePatient({ ...patient, name: newName });
    }
  };

  const handlePatientDocChange = (newDoc: string) => {
    onUpdateCertificate({ ...certificate, documentNumber: newDoc });
    onUpdateReferral({ ...referral, documentNumber: newDoc });
    if (onUpdatePatient) {
      onUpdatePatient({ ...patient, documentNumber: newDoc });
    }
  };

  const handleSwitchTab = (tab: 'certificate' | 'referral') => {
    setInternalSubTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };
  const specialtiesList = [
    'Cardiologia',
    'Pediatria Especializada / Alergologia',
    'Otorrinolaringologia',
    'Ortopedia & Traumatologia',
    'Neurologia / Neuropediatria',
    'Endocrinologia & Metabologia',
    'Dermatologia',
    'Gastroenterologia',
    'Pneumologia',
    'Psiquiatria / Psicologia',
    'Cirurgia Geral / Pediátrica',
    'Oftalmologia',
    'Nefrologia / Urologia'
  ];

  // Specialty quick CIDs mapping for fast 1-click inclusion in referral
  const specialtyCidSuggestions: Record<string, { code: string; label: string }[]> = {
    'Cardiologia': [
      { code: 'I10', label: 'Hipertensão Arterial (HAS)' },
      { code: 'I20.9', label: 'Angina Pectoris' },
      { code: 'I50.9', label: 'Insuficiência Cardíaca' },
      { code: 'R07.4', label: 'Dor Torácica a Esclarecer' }
    ],
    'Pediatria Especializada / Alergologia': [
      { code: 'J45.9', label: 'Asma / Broncoespasmo' },
      { code: 'J30.4', label: 'Rinite Alérgica' },
      { code: 'L20.9', label: 'Dermatite Atópica' },
      { code: 'B08.4', label: 'Mão-Pé-Boca' }
    ],
    'Otorrinolaringologia': [
      { code: 'J01.9', label: 'Sinusite Aguda / Crônica' },
      { code: 'H66.9', label: 'Otite Média' },
      { code: 'H93.1', label: 'Tinnitus (Zumbido)' },
      { code: 'J30.4', label: 'Rinite Vasomotora/Alérgica' }
    ],
    'Ortopedia & Traumatologia': [
      { code: 'M54.5', label: 'Lombalgia' },
      { code: 'M54.2', label: 'Cervicalgia' },
      { code: 'S93.4', label: 'Entorse de Tornozelo' },
      { code: 'M75.1', label: 'Manguito Rotador (Ombro)' },
      { code: 'M65.9', label: 'Tendinopatia / Sinovite' }
    ],
    'Neurologia / Neuropediatria': [
      { code: 'G43.9', label: 'Enxaqueca / Migrânea' },
      { code: 'G44.2', label: 'Cefaleia Tensional' },
      { code: 'G40.9', label: 'Epilepsia / Convulsão' },
      { code: 'H81.1', label: 'VPPB / Vertigem' }
    ],
    'Endocrinologia & Metabologia': [
      { code: 'E11.9', label: 'Diabetes Mellitus tipo 2' },
      { code: 'E03.9', label: 'Hipotireoidismo' },
      { code: 'E66.9', label: 'Obesidade' },
      { code: 'E78.0', label: 'Dislipidemia' }
    ],
    'Dermatologia': [
      { code: 'L20.9', label: 'Dermatite Atópica' },
      { code: 'L50.9', label: 'Urticária' },
      { code: 'L70.0', label: 'Acne Vulgar' },
      { code: 'L40.0', label: 'Psoríase' }
    ],
    'Gastroenterologia': [
      { code: 'K21.9', label: 'DRGE / Refluxo' },
      { code: 'K29.7', label: 'Gastrite' },
      { code: 'K58.9', label: 'Intestino Irritável' },
      { code: 'K80.2', label: 'Colelitíase (Pedra Vesícula)' }
    ],
    'Pneumologia': [
      { code: 'J45.9', label: 'Asma / Crise Asmática' },
      { code: 'J44.9', label: 'DPOC / Enfisema' },
      { code: 'J18.9', label: 'Pneumonia' },
      { code: 'J20.9', label: 'Bronquite Aguda' }
    ],
    'Psiquiatria / Psicologia': [
      { code: 'F41.1', label: 'Ansiedade Generalizada (TAG)' },
      { code: 'F32.9', label: 'Episódio Depressivo' },
      { code: 'F41.0', label: 'Transtorno do Pânico' },
      { code: 'Z73.0', label: 'Burnout / Esgotamento' }
    ],
    'Nefrologia / Urologia': [
      { code: 'N39.0', label: 'ITU Recorrente' },
      { code: 'N20.1', label: 'Cálculo Renal / Ureteral' },
      { code: 'N40', label: 'Hiperplasia Prostática (HPB)' },
      { code: 'N10', label: 'Pielonefrite' }
    ]
  };

  const handleSelectCidForCertificate = (cid: { code: string; description: string }) => {
    onUpdateCertificate({
      ...certificate,
      includeCID: true,
      cid10Code: cid.code,
      cid10Description: cid.description
    });
  };

  const handleClearCidCertificate = () => {
    onUpdateCertificate({
      ...certificate,
      cid10Code: '',
      cid10Description: ''
    });
  };

  const handleSelectCidForReferral = (cid: { code: string; description: string }) => {
    const formatted = `${cid.code} - ${cid.description}`;
    onUpdateReferral({
      ...referral,
      hypothesisCID: formatted
    });
  };

  const handleAppendCidForReferral = (cid: { code: string; description: string }) => {
    const formatted = `${cid.code} - ${cid.description}`;
    const current = referral.hypothesisCID ? referral.hypothesisCID.trim() : '';
    const updated = current ? `${current} / ${formatted}` : formatted;
    onUpdateReferral({
      ...referral,
      hypothesisCID: updated
    });
  };

  const handleDaysChange = (days: number) => {
    const validDays = Math.max(0, isNaN(days) ? 0 : days);
    const startBase = certificate.startDate ? certificate.startDate + 'T12:00:00' : undefined;
    const start = startBase ? new Date(startBase) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + (validDays > 0 ? validDays - 1 : 0));

    onUpdateCertificate({
      ...certificate,
      daysOff: validDays,
      endDate: dataLocalISO(end)
    });
  };

  const handleStartDateChange = (newStartDate: string) => {
    if (!newStartDate) {
      onUpdateCertificate({ ...certificate, startDate: newStartDate });
      return;
    }
    const validDays = Math.max(0, Number(certificate.daysOff) || 0);
    const start = new Date(newStartDate + 'T12:00:00');
    const end = new Date(start);
    end.setDate(start.getDate() + (validDays > 0 ? validDays - 1 : 0));

    onUpdateCertificate({
      ...certificate,
      startDate: newStartDate,
      endDate: dataLocalISO(end)
    });
  };

  const handleSendCertificateWhatsApp = () => {
    if (!medicoConfigurado(doctor)) return;
    const msg = formatarAtestadoWhatsAppTexto(doctor, patient, certificate);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSendReferralWhatsApp = () => {
    if (!medicoConfigurado(doctor)) return;
    const msg = formatarEncaminhamentoWhatsAppTexto(doctor, patient, referral);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenCertificateInEditor = () => {
    const pName = escapeHtml(certificate.patientName?.trim() || patient?.name?.trim() || '______________________________');
    const pDoc = escapeHtml(certificate.documentNumber || patient?.documentNumber || '____________________');
    const days = certificate.daysOff || 1;
    const daysText = escapeHtml(days === 1 ? '1 (um) dia' : `${days} dias`);
    const period = escapeHtml(certificate.periodText || 'por motivo de doença e necessidade de repouso');
    const today = escapeHtml(certificate.date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }));
    const cidText = certificate.includeCID && certificate.cid10Code 
      ? `<p><strong>Diagnóstico (CID-10):</strong> ${escapeHtml(certificate.cid10Code)}${certificate.cid10Description ? ` - ${escapeHtml(certificate.cid10Description)}` : ''} <em>(Expressamente autorizado pelo paciente)</em></p><p></p>`
      : '';
    const obsText = certificate.observations ? `<p><strong>Observações:</strong> ${escapeHtml(certificate.observations)}</p><p></p>` : '';

    const certHtml = `
      <p style="text-align: center;"><strong>ATESTADO MÉDICO</strong></p>
      <p></p>
      <p style="text-align: justify; line-height: 1.8;">
        Atesto para os devidos fins que o(a) paciente <strong>${pName}</strong>, inscrito(a) no documento nº <strong>${pDoc}</strong>, foi submetido(a) a atendimento médico nesta data e deve permanecer afastado(a) de suas atividades laborais e habituais pelo período de <strong>${daysText}</strong>, a contar desta data, ${period}.
      </p>
      <p></p>
      ${cidText}
      ${obsText}
      <p style="text-align: right; margin-top: 24px;">${today}.</p>
    `;

    if (onNavigateToEditorWithHtml) {
      onNavigateToEditorWithHtml(certHtml, 'Atestado Médico', 'certificate');
    }
  };

  const handleOpenReferralInEditor = () => {
    const pName = escapeHtml(referral.patientName?.trim() || patient?.name?.trim() || '______________________________');
    const pDoc = escapeHtml(referral.documentNumber || patient?.documentNumber || '____________________');
    const pAge = escapeHtml(patient?.ageText || (patient?.birthDate ? patient.birthDate : ''));
    const priorityLabel = escapeHtml((referral.priority || 'eletivo').toUpperCase());
    const rawSpecialty = referral.destinationSpecialty || 'Especialidade Médica';
    const specialty = escapeHtml(rawSpecialty);
    const institution = escapeHtml(referral.destinationInstitution || 'Serviço de Referência / Atenção Especializada');
    const reason = escapeHtml(referral.reason || 'Avaliação e conduta especializada.');
    const summary = escapeHtml(referral.clinicalSummary || 'Quadro clínico em investigação.');
    const exams = escapeHtml(referral.relevantExams || 'Sem exames complementares anexados.');
    const cid = escapeHtml(referral.hypothesisCID || 'A esclarecer.');

    const referralHtml = `
      <p style="text-align: center;"><strong>GUIA DE ENCAMINHAMENTO MÉDICO</strong></p>
      <p style="text-align: center; font-size: 0.9em; color: #475569;"><strong>PRIORIDADE: [ ${priorityLabel} ]</strong></p>
      <p></p>
      <p><strong>Ao Serviço / Colega:</strong> ${specialty}</p>
      <p><strong>Instituição de Destino:</strong> ${institution}</p>
      <p></p>
      <p><strong>Paciente:</strong> ${pName} &nbsp;|&nbsp; <strong>Doc:</strong> ${pDoc}${pAge ? ` &nbsp;|&nbsp; <strong>Idade:</strong> ${pAge}` : ''}</p>
      <p></p>
      <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 12px 0;" />
      <p><strong>1. Motivo do Encaminhamento:</strong></p>
      <p style="margin-left: 16px; color: #1e293b;">${reason}</p>
      <p></p>
      <p><strong>2. História Clínica &amp; Exame Físico Relevante:</strong></p>
      <p style="margin-left: 16px; color: #1e293b;">${summary}</p>
      <p></p>
      <p><strong>3. Exames Complementares Realizados:</strong></p>
      <p style="margin-left: 16px; color: #1e293b;">${exams}</p>
      <p></p>
      <p><strong>4. Hipótese Diagnóstica (CID-10):</strong></p>
      <p style="margin-left: 16px; color: #1e293b;">${cid}</p>
      <p></p>
      <p>Agradeço a atenção e coloco-me à disposição para discussão do caso.</p>
    `;

    if (onNavigateToEditorWithHtml) {
      onNavigateToEditorWithHtml(referralHtml, `Encaminhamento - ${rawSpecialty}`, 'referral');
    }
  };

  const currentSpecialtySuggestions = specialtyCidSuggestions[referral.destinationSpecialty] || [];

  return (
    <div data-state="idle" aria-busy={false} id="certificate-and-referral-section" className="space-y-4 sm:space-y-5">
      {/* Subtabs Switcher (apenas quando não estiver sob o ClinicalDocumentsHub) */}
      {!hideSubNav && (
        <div 
          className="tactile-card p-1.5 rounded-2xl flex items-center gap-1.5 max-w-sm mx-auto"
          style={{
            backgroundColor: darkMode ? 'var(--surface-card)' : 'var(--surface-card)',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(11, 19, 43, 0.08)'
          }}
        >
          <button
            type="button"
            onClick={() => handleSwitchTab('certificate')}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              currentSubTab === 'certificate'
                ? 'bg-navy-900 text-white dark:bg-sky-600 dark:text-white border border-navy-800 dark:border-info shadow-tactile-navy dark:shadow-tactile-blue'
                : darkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 icon-sculpted" strokeWidth={1.75} />
            <span>Atestado Médico</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('referral')}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              currentSubTab === 'referral'
                ? 'bg-navy-900 text-white dark:bg-sky-600 dark:text-white border border-navy-800 dark:border-info shadow-tactile-navy dark:shadow-tactile-blue'
                : darkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4 icon-sculpted" strokeWidth={1.75} />
            <span>Encaminhamento</span>
          </button>
        </div>
      )}

      {/* ATESTADO MÉDICO FORM */}
      {currentSubTab === 'certificate' && (
        <div className="space-y-4">
          <div 
            className="tactile-card p-4 sm:p-5 md:p-6 rounded-2xl space-y-5"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-navy-900 dark:bg-sky-600 border border-white/12"
                >
                  <Award className="w-5 h-5 text-slate-100" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                    Emissão de Atestado Médico
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:shrink-0">
                <button
                  type="button"
                  onClick={handleSendCertificateWhatsApp}
                  disabled={!medicoConfigurado(doctor)}
                  className="btn-tactile-secondary text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                  title={medicoConfigurado(doctor) ? 'Enviar o atestado médico diretamente pelo WhatsApp' : 'Configure nome e CRM do médico para emitir documentos'}
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                  <span>Enviar no WhatsApp</span>
                </button>

                {onNavigateToEditorWithHtml && (
                  <button
                    type="button"
                    onClick={handleOpenCertificateInEditor}
                    className="btn-tactile-secondary text-xs flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                    title="Editar e personalizar o atestado no Editor de Folha A4"
                  >
                    <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>Editar no Editor A4</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigateToPrint('certificate')}
                  className="btn-tactile-primary text-xs flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                >
                  <Download className="w-4 h-4" strokeWidth={1.75} />
                  <span>Visualizar & Baixar PDF</span>
                </button>
              </div>
            </div>

            {/* Patient data for Certificate */}
            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5">
              <div className="col-span-2 sm:col-span-5">
                <label htmlFor="certificate-patient-name" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1 truncate">
                  <User className="w-3.5 h-3.5 text-[var(--text-muted)] dark:text-slate-400 shrink-0" />
                  <span>Nome do Paciente</span>
                </label>
                <input
                  id="certificate-patient-name"
                  type="text"
                  value={patient?.name ?? certificate.patientName ?? ''}
                  onChange={(e) => handlePatientNameChange(e.target.value)}
                  placeholder="Ex.: Maria de Oliveira Santos"
                  className="w-full h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
                />
              </div>

              <div className="col-span-1 sm:col-span-3">
                <label htmlFor="certificate-patient-doc" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1 truncate">
                  <Hash className="w-3.5 h-3.5 text-[var(--text-muted)] dark:text-slate-400 shrink-0" />
                  <span>Documento (RG / CPF)</span>
                </label>
                <input
                  id="certificate-patient-doc"
                  type="text"
                  value={patient?.documentNumber ?? certificate.documentNumber ?? ''}
                  onChange={(e) => handlePatientDocChange(e.target.value)}
                  placeholder="Ex.: 000.000.000-00"
                  className="w-full h-9 px-2.5 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input clinical-tabular-nums"
                />
              </div>

              <div className="col-span-1 sm:col-span-4">
                <label htmlFor="certificate-period-select" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1 truncate">
                  <FileText className="w-3.5 h-3.5 text-[var(--text-muted)] dark:text-slate-400 shrink-0" />
                  <span>Finalidade / Motivo</span>
                </label>
                <select
                  id="certificate-period-select"
                  aria-label="Finalidade ou motivo do atestado"
                  value={certificate.periodText}
                  onChange={(e) => onUpdateCertificate({ ...certificate, periodText: e.target.value })}
                  className="w-full h-9 px-2.5 rounded-xl text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input cursor-pointer"
                >
                  <option value="por motivo de doença e necessidade de repouso">Afastamento por motivo de doença / Repouso</option>
                  <option value="para fins de comparecimento a consulta médica e realização de exames">Comparecimento a consulta e exames</option>
                  <option value="para fins de acompanhamento de dependente menor de idade">Acompanhamento de dependente menor</option>
                  <option value="para fins de aptidão física e práticas desportivas">Aptidão para atividades físicas</option>
                  <option value="por motivo de pós-operatório e recuperação cirúrgica">Recuperação pós-cirúrgica</option>
                  <option value="para fins de perícia médica e avaliação previdenciária">Avaliação pericial / Previdência</option>
                </select>
              </div>
            </div>

            {/* Days off and dates — Lado a Lado e Enxuto (sem corte em telas mobile) */}
            <div className="grid grid-cols-12 gap-2 sm:gap-2.5">
              <div className="col-span-12 sm:col-span-3">
                <label htmlFor="certificate-days-off" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1 truncate">
                  <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>Dias de Repouso</span>
                </label>
                <input
                  id="certificate-days-off"
                  aria-label="Dias de repouso manual"
                  type="number"
                  min="0"
                  max="180"
                  value={certificate.daysOff}
                  onChange={(e) => handleDaysChange(parseInt(e.target.value) || 0)}
                  className="w-full h-9 px-2.5 rounded-xl font-bold text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input text-center clinical-tabular-nums"
                />
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="certificate-start-date" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1 truncate">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] dark:text-slate-400 shrink-0" />
                  <span>Data de Início</span>
                </label>
                <input
                  id="certificate-start-date"
                  aria-label="Data de início do atestado"
                  type="date"
                  value={certificate.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl font-medium text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input clinical-tabular-nums"
                />
              </div>

              <div className="col-span-6 sm:col-span-5">
                <label htmlFor="certificate-end-date" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1 truncate">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] dark:text-slate-400 shrink-0" />
                  <span>Data de Retorno Previsto</span>
                </label>
                <input
                  id="certificate-end-date"
                  aria-label="Data de retorno previsto"
                  type="date"
                  value={certificate.endDate}
                  onChange={(e) => onUpdateCertificate({ ...certificate, endDate: e.target.value })}
                  className="w-full h-9 px-2.5 rounded-xl font-medium text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input clinical-tabular-nums"
                />
              </div>
            </div>

            {/* CID-10 Section with Search Autocomplete Integration */}
            <div 
              className="p-4 sm:p-5 rounded-2xl border space-y-4 bg-slate-50/70 dark:bg-[var(--surface-inset)] border-subtle dark:border-white/10"
            >
              {/* Checkbox toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="toggle-include-cid"
                    checked={certificate.includeCID}
                    onChange={(e) => onUpdateCertificate({ ...certificate, includeCID: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-700 focus:ring-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer"
                  />
                  <label htmlFor="toggle-include-cid" className="text-xs sm:text-sm font-bold cursor-pointer select-none" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                    Incluir Código CID-10 no Atestado
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] dark:text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Exige autorização expressa do paciente (Res. CFM 1.658/2002)</span>
                </div>
              </div>

              {certificate.includeCID ? (
                <div className="space-y-4">
                  {/* Intelligent CID Search & Auto-Fill Component */}
                  <CidSearchBar
                    darkMode={darkMode}
                    selectedCode={certificate.cid10Code}
                    selectedDescription={certificate.cid10Description}
                    onSelectCid={handleSelectCidForCertificate}
                    onClearCid={handleClearCidCertificate}
                    label="Buscador Inteligente de CID-10 (Preenchimento Automático)"
                    placeholder="Ex.: J00, Asma, Lombalgia, Dengue, A09, Ansiedade, R50..."
                    showQuickChips={true}
                    variant="certificate"
                  />

                  {/* Direct Code & Description manual inputs for fine-tuning */}
                  <div className="pt-1 grid grid-cols-12 gap-2.5 sm:gap-3">
                    <div className="col-span-4 sm:col-span-3">
                      <label htmlFor="certificate-cid-code" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 truncate">Código CID-10</label>
                      <input
                        id="certificate-cid-code"
                        aria-label="Código CID-10"
                        type="text"
                        value={certificate.cid10Code || ''}
                        onChange={(e) => onUpdateCertificate({ ...certificate, cid10Code: e.target.value.toUpperCase() })}
                        placeholder="Ex.: J00"
                        className="w-full p-2.5 rounded-xl border text-xs sm:text-sm font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input text-center clinical-tabular-nums"
                        style={{
                          backgroundColor: 'var(--surface-card)',
                          borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                          color: darkMode ? '#388EE6' : '#0369A1'
                        }}
                      />
                    </div>

                    <div className="col-span-8 sm:col-span-9">
                      <label htmlFor="certificate-cid-desc" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 truncate">Descrição do Diagnóstico (Edição Livre)</label>
                      <input
                        id="certificate-cid-desc"
                        aria-label="Descrição do diagnóstico CID-10"
                        type="text"
                        value={certificate.cid10Description || ''}
                        onChange={(e) => onUpdateCertificate({ ...certificate, cid10Description: e.target.value })}
                        placeholder="Ex.: Nasofaringite aguda (resfriado comum)..."
                        className="w-full p-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
                        style={{
                          backgroundColor: 'var(--surface-card)',
                          borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                          color: darkMode ? '#F1F5F9' : '#0F172A'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-strong text-center text-xs text-[var(--text-muted)] dark:text-slate-400">
                  <span>Inclusão de CID desativada. O atestado será gerado sem a informação codificada da doença.</span>
                </div>
              )}
            </div>

            {/* Observations */}
            <div>
              <label htmlFor="certificate-observations" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1">
                Observações Complementares / Recomendações (Opcional)
              </label>
              <textarea
                id="certificate-observations"
                aria-label="Observações complementares"
                rows={2}
                value={certificate.observations}
                onChange={(e) => onUpdateCertificate({ ...certificate, observations: e.target.value })}
                placeholder="Ex.: Paciente esteve sob cuidados médicos das 08h às 11h. Recomenda-se repouso domiciliar e hidratação oral..."
                className="w-full p-3 rounded-xl text-xs sm:text-sm font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ENCAMINHAMENTO MÉDICO FORM */}
      {currentSubTab === 'referral' && (
        <div className="space-y-4">
          <div 
            className="tactile-card p-4 sm:p-5 md:p-6 rounded-2xl space-y-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-emerald-700 dark:bg-emerald-800 border border-white/12"
                >
                  <Share2 className="w-5 h-5 text-slate-100" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                    Guia de Encaminhamento & Referência Especializada
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:shrink-0">
                <button
                  type="button"
                  onClick={handleSendReferralWhatsApp}
                  disabled={!medicoConfigurado(doctor)}
                  className="btn-tactile-secondary text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                  title={medicoConfigurado(doctor) ? 'Enviar a guia de encaminhamento diretamente pelo WhatsApp' : 'Configure nome e CRM do médico para emitir documentos'}
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                  <span>Enviar no WhatsApp</span>
                </button>

                {onNavigateToEditorWithHtml && (
                  <button
                    type="button"
                    onClick={handleOpenReferralInEditor}
                    className="btn-tactile-secondary text-xs flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                    title="Editar e personalizar o encaminhamento no Editor de Folha A4"
                  >
                    <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>Editar no Editor A4</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigateToPrint('referral')}
                  className="btn-tactile-primary text-xs flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                >
                  <Download className="w-4 h-4" strokeWidth={1.75} />
                  <span>Visualizar & Baixar PDF</span>
                </button>
              </div>
            </div>

            {/* Patient data for Referral */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="referral-patient-name" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[var(--text-muted)] dark:text-slate-400" />
                  <span>Nome do Paciente</span>
                </label>
                <input
                  id="referral-patient-name"
                  type="text"
                  value={patient?.name ?? referral.patientName ?? ''}
                  onChange={(e) => handlePatientNameChange(e.target.value)}
                  placeholder="Ex.: Maria de Oliveira Santos"
                  className="w-full p-3 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
                />
              </div>

              <div>
                <label htmlFor="referral-patient-doc" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[var(--text-muted)] dark:text-slate-400" />
                  <span>Documento (RG / CPF)</span>
                </label>
                <input
                  id="referral-patient-doc"
                  type="text"
                  value={patient?.documentNumber ?? referral.documentNumber ?? ''}
                  onChange={(e) => handlePatientDocChange(e.target.value)}
                  placeholder="Ex.: 000.000.000-00"
                  className="w-full p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input clinical-tabular-nums"
                />
              </div>
            </div>

            {/* Specialty & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label htmlFor="referral-destination-specialty" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Especialidade de Destino</span>
                </label>
                <select
                  id="referral-destination-specialty"
                  aria-label="Especialidade de destino"
                  value={referral.destinationSpecialty}
                  onChange={(e) => onUpdateReferral({ ...referral, destinationSpecialty: e.target.value })}
                  className="w-full p-3 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input cursor-pointer"
                >
                  {specialtiesList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="referral-destination-institution" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)] dark:text-slate-400" />
                  <span>Serviço / Hospital de Destino</span>
                </label>
                <input
                  id="referral-destination-institution"
                  type="text"
                  value={referral.destinationInstitution || ''}
                  onChange={(e) => onUpdateReferral({ ...referral, destinationInstitution: e.target.value })}
                  placeholder="Ex.: Ambulatório de Especialidades / HU..."
                  className="w-full p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1">Grau de Prioridade</label>
                <div className="flex items-center gap-1.5">
                  {(['eletivo', 'prioritario', 'urgente'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onUpdateReferral({ ...referral, priority: p })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize border transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                        referral.priority === p
                          ? 'bg-navy-900 dark:bg-[#0369A1] text-white border-transparent shadow-sm'
                          : 'bg-slate-100 dark:bg-[#27354A] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-[#334155]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Motivo & Resumo Clínico */}
            <div>
              <label htmlFor="referral-reason" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1">Motivo do Encaminhamento</label>
              <input
                id="referral-reason"
                type="text"
                value={referral.reason}
                onChange={(e) => onUpdateReferral({ ...referral, reason: e.target.value })}
                placeholder="Ex.: Avaliação especializada e conduta terapêutica..."
                className="w-full p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
              />
            </div>

            <div>
              <label htmlFor="referral-clinical-summary" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1">Resumo da História Clínica & Exame Físico</label>
              <textarea
                id="referral-clinical-summary"
                rows={3}
                value={referral.clinicalSummary}
                onChange={(e) => onUpdateReferral({ ...referral, clinicalSummary: e.target.value })}
                placeholder="Ex.: Paciente com história de episódios recorrentes de broncoespasmo..."
                className="w-full p-3 rounded-xl text-xs sm:text-sm font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="referral-relevant-exams" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1">Exames Relevantes Realizados</label>
                <textarea
                  id="referral-relevant-exams"
                  rows={3}
                  value={referral.relevantExams}
                  onChange={(e) => onUpdateReferral({ ...referral, relevantExams: e.target.value })}
                  placeholder="Ex.: Hemograma completo sem alterações, RX de tórax com hiperinsuflação discreta..."
                  className="w-full p-3 rounded-xl text-xs sm:text-sm font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="referral-hypothesis-cid" className="block text-xs font-bold uppercase text-[var(--text-muted)] dark:text-slate-400 mb-1">
                  Texto da Hipótese Diagnóstica (CID-10)
                </label>
                <textarea
                  id="referral-hypothesis-cid"
                  rows={3}
                  value={referral.hypothesisCID}
                  onChange={(e) => onUpdateReferral({ ...referral, hypothesisCID: e.target.value })}
                  placeholder="Ex.: J45.9 - Asma não especificada / J30.4 - Rinite alérgica..."
                  className="w-full p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Integrated CID-10 Finder for Referral / Encaminhamento */}
            <div 
              className="p-4 sm:p-5 rounded-2xl border space-y-3.5 bg-slate-50/70 dark:bg-[var(--surface-inset)] border-subtle dark:border-white/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b pb-2.5" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs sm:text-sm font-bold" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                    Buscador de CID-10 para Encaminhamento
                  </h4>
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Clique no diagnóstico para preencher ou adicionar à hipótese
                </span>
              </div>

              {/* Specialty suggestions in compact select list */}
              {currentSpecialtySuggestions.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label htmlFor="referral-specialty-cid-select" className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0">
                    Sugestões ({referral.destinationSpecialty}):
                  </label>
                  <select
                    id="referral-specialty-cid-select"
                    aria-label={`Sugestões de CID-10 para ${referral.destinationSpecialty}`}
                    value=""
                    onChange={(e) => {
                      const found = currentSpecialtySuggestions.find((item) => item.code === e.target.value);
                      if (found) {
                        handleAppendCidForReferral({ code: found.code, description: found.label });
                      }
                    }}
                    className="w-full sm:flex-1 h-9 px-2.5 rounded-xl text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 tactile-input cursor-pointer"
                  >
                    <option value="">Selecionar diagnóstico frequente da especialidade...</option>
                    {currentSpecialtySuggestions.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} — {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* General CID Search Bar for Referral */}
              <CidSearchBar
                darkMode={darkMode}
                selectedCode=""
                selectedDescription=""
                onSelectCid={handleSelectCidForReferral}
                onAppendCid={handleAppendCidForReferral}
                label="Pesquisar Qualquer Diagnóstico CID-10"
                placeholder="Ex.: Pneumonia, Asma, Enxaqueca, Fibromialgia, G43, J45..."
                showQuickChips={false}
                variant="referral"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
