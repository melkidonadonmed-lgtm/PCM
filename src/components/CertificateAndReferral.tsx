import React, { useState } from 'react';
import {
  Award,
  Share2,
  Download,
  AlertCircle,
  FileText,
  Send,
} from './Icon';
import { MedicalCertificate, MedicalReferral, Patient, DoctorProfile } from '../types';
import { CidSearchBar } from './CidSearchBar';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { dataLocalISO } from '../utils/documentoClinico';
import { escapeHtml } from '../utils/sanitizeHtml';
import { formatarAtestadoWhatsAppTexto } from '../utils/compartilhamentoTexto';
import { ReferralFormSection } from './ReferralFormSection';

/**
 * Gera o HTML sanitizado (escapeHtml) do Atestado Médico para carregamento no Editor Livre A4,
 * respeitando estritamente o consentimento de CID-10 (Res. CFM 1.658/2002).
 */
export function buildCertificateEditorHtml(
  patient: Patient,
  certificate: MedicalCertificate
): string {
  const pName = escapeHtml(
    certificate.patientName?.trim() || patient?.name?.trim() || '______________________________'
  );
  const pDoc = escapeHtml(
    certificate.documentNumber || patient?.documentNumber || '____________________'
  );
  const days = certificate.daysOff || 1;
  const daysText = escapeHtml(days === 1 ? '1 (um) dia' : `${days} dias`);
  const period = escapeHtml(
    certificate.periodText || 'por motivo de doença e necessidade de repouso'
  );
  const today = escapeHtml(
    certificate.date ||
      new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
  );
  const cidText =
    certificate.includeCID && certificate.cid10Code
      ? `<p><strong>Diagnóstico (CID-10):</strong> ${escapeHtml(certificate.cid10Code)}${
          certificate.cid10Description ? ` - ${escapeHtml(certificate.cid10Description)}` : ''
        } <em>(Expressamente autorizado pelo paciente)</em></p><p></p>`
      : '';
  const obsText = certificate.observations
    ? `<p><strong>Observações:</strong> ${escapeHtml(certificate.observations)}</p><p></p>`
    : '';

  return `
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
}

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
  onNavigateToEditorWithHtml?: (
    html: string,
    title: string,
    type?: 'referral' | 'certificate'
  ) => void;
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
  hideSubNav = false,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'certificate' | 'referral'>(
    initialSubTab || activeSubTab || 'certificate'
  );
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

  const handleSelectCidForCertificate = (cid: { code: string; description: string }) => {
    onUpdateCertificate({
      ...certificate,
      includeCID: true,
      cid10Code: cid.code,
      cid10Description: cid.description,
    });
  };

  const handleClearCidCertificate = () => {
    onUpdateCertificate({
      ...certificate,
      cid10Code: '',
      cid10Description: '',
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
      endDate: dataLocalISO(end),
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
      endDate: dataLocalISO(end),
    });
  };

  const handleSendCertificateWhatsApp = () => {
    if (!medicoConfigurado(doctor)) return;
    const msg = formatarAtestadoWhatsAppTexto(doctor, patient, certificate);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenCertificateInEditor = () => {
    if (!onNavigateToEditorWithHtml) return;
    const certHtml = buildCertificateEditorHtml(patient, certificate);
    onNavigateToEditorWithHtml(certHtml, 'Atestado Médico', 'certificate');
  };

  return (
    <div data-state="idle" aria-busy={false} id="certificate-and-referral-section" className="space-y-3">
      {/* Subtabs Switcher (apenas quando não estiver sob o ClinicalDocumentsHub) */}
      {!hideSubNav && (
        <div
          className="tactile-card p-1.5 rounded-2xl flex items-center gap-1.5 max-w-sm mx-auto"
          style={{
            backgroundColor: darkMode ? 'var(--surface-card)' : 'var(--surface-card)',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(11, 19, 43, 0.08)',
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
        <div className="flex flex-col gap-3">
          <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col gap-3">
            {/* Header Enxuto */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-subtle dark:border-strong pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Award className="w-4.5 h-4.5 text-sky-600 dark:text-sky-400 shrink-0" strokeWidth={1.75} />
                <h3 className="text-sm font-semibold text-[var(--text-main)] truncate">
                  Emissão de Atestado Médico
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:shrink-0">
                <button
                  type="button"
                  onClick={handleSendCertificateWhatsApp}
                  disabled={!medicoConfigurado(doctor)}
                  className="btn-tactile-secondary text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
                  title={
                    medicoConfigurado(doctor)
                      ? 'Enviar o atestado médico diretamente pelo WhatsApp'
                      : 'Configure nome e CRM do médico para emitir documentos'
                  }
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
            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-2.5">
              <div className="col-span-2 sm:col-span-5 min-w-0">
                <label
                  htmlFor="certificate-patient-name"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
                >
                  Nome do paciente
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

              <div className="col-span-1 sm:col-span-3 min-w-0">
                <label
                  htmlFor="certificate-patient-doc"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
                >
                  Documento (RG / CPF)
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

              <div className="col-span-1 sm:col-span-4 min-w-0">
                <label
                  htmlFor="certificate-period-select"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
                >
                  Finalidade / motivo
                </label>
                <select
                  id="certificate-period-select"
                  aria-label="Finalidade ou motivo do atestado"
                  value={certificate.periodText}
                  onChange={(e) =>
                    onUpdateCertificate({ ...certificate, periodText: e.target.value })
                  }
                  className="w-full h-9 px-2.5 rounded-xl text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input cursor-pointer"
                >
                  <option value="por motivo de doença e necessidade de repouso">
                    Afastamento por motivo de doença / Repouso
                  </option>
                  <option value="para fins de comparecimento a consulta médica e realização de exames">
                    Comparecimento a consulta e exames
                  </option>
                  <option value="para fins de acompanhamento de dependente menor de idade">
                    Acompanhamento de dependente menor
                  </option>
                  <option value="para fins de aptidão física e práticas desportivas">
                    Aptidão para atividades físicas
                  </option>
                  <option value="por motivo de pós-operatório e recuperação cirúrgica">
                    Recuperação pós-cirúrgica
                  </option>
                  <option value="para fins de perícia médica e avaliação previdenciária">
                    Avaliação pericial / Previdência
                  </option>
                </select>
              </div>
            </div>

            {/* Days off and dates — Lado a Lado e Enxuto (sem corte em telas mobile) */}
            <div className="grid grid-cols-12 gap-2 sm:gap-2.5">
              <div className="col-span-4 sm:col-span-3 min-w-0">
                <label
                  htmlFor="certificate-days-off"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
                >
                  Dias de repouso
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

              <div className="col-span-4 sm:col-span-4 min-w-0">
                <label
                  htmlFor="certificate-start-date"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
                >
                  Data de início
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

              <div className="col-span-4 sm:col-span-5 min-w-0">
                <label
                  htmlFor="certificate-end-date"
                  className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
                >
                  Data de retorno previsto
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
            <div className="surface-inset p-3 sm:p-3.5 rounded-xl border border-subtle dark:border-strong flex flex-col gap-2.5">
              {/* Checkbox toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-subtle dark:border-strong">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="toggle-include-cid"
                    checked={certificate.includeCID}
                    onChange={(e) =>
                      onUpdateCertificate({ ...certificate, includeCID: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-sky-700 focus:ring-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none cursor-pointer"
                  />
                  <label
                    htmlFor="toggle-include-cid"
                    className="text-xs font-semibold text-[var(--text-main)] cursor-pointer select-none"
                  >
                    Incluir Código CID-10 no Atestado
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Exige autorização expressa do paciente (Res. CFM 1.658/2002)</span>
                </div>
              </div>

              {certificate.includeCID ? (
                <div className="flex flex-col gap-2.5">
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
                  <div className="grid grid-cols-12 gap-2 sm:gap-2.5">
                    <div className="col-span-4 sm:col-span-3 min-w-0">
                      <label
                        htmlFor="certificate-cid-code"
                        className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
                      >
                        Código CID-10
                      </label>
                      <input
                        id="certificate-cid-code"
                        aria-label="Código CID-10"
                        type="text"
                        value={certificate.cid10Code || ''}
                        onChange={(e) =>
                          onUpdateCertificate({
                            ...certificate,
                            cid10Code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="Ex.: J00"
                        className="w-full h-9 px-2.5 rounded-xl border border-subtle dark:border-strong bg-[var(--surface-card)] text-sky-700 dark:text-sky-400 text-xs font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input text-center clinical-tabular-nums"
                      />
                    </div>

                    <div className="col-span-8 sm:col-span-9 min-w-0">
                      <label
                        htmlFor="certificate-cid-desc"
                        className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
                      >
                        Descrição do diagnóstico (edição livre)
                      </label>
                      <input
                        id="certificate-cid-desc"
                        aria-label="Descrição do diagnóstico CID-10"
                        type="text"
                        value={certificate.cid10Description || ''}
                        onChange={(e) =>
                          onUpdateCertificate({
                            ...certificate,
                            cid10Description: e.target.value,
                          })
                        }
                        placeholder="Ex.: Nasofaringite aguda (resfriado comum)..."
                        className="w-full h-9 px-3 rounded-xl border border-subtle dark:border-strong bg-[var(--surface-card)] text-[var(--text-main)] text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-strong text-center text-xs text-[var(--text-muted)]">
                  <span>
                    Inclusão de CID desativada. O atestado será gerado sem a informação codificada
                    da doença.
                  </span>
                </div>
              )}
            </div>

            {/* Observations */}
            <div>
              <label
                htmlFor="certificate-observations"
                className="block text-xs font-medium text-[var(--text-muted)] mb-1"
              >
                Observações complementares / recomendações (opcional)
              </label>
              <textarea
                id="certificate-observations"
                aria-label="Observações complementares"
                rows={2}
                value={certificate.observations}
                onChange={(e) =>
                  onUpdateCertificate({ ...certificate, observations: e.target.value })
                }
                placeholder="Ex.: Paciente esteve sob cuidados médicos das 08h às 11h. Recomenda-se repouso domiciliar e hidratação oral..."
                className="w-full p-2.5 rounded-xl text-xs font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ENCAMINHAMENTO MÉDICO FORM */}
      {currentSubTab === 'referral' && (
        <ReferralFormSection
          darkMode={darkMode}
          patient={patient}
          doctor={doctor}
          referral={referral}
          onUpdateReferral={onUpdateReferral}
          onPatientNameChange={handlePatientNameChange}
          onPatientDocChange={handlePatientDocChange}
          onNavigateToPrint={onNavigateToPrint}
          onNavigateToEditorWithHtml={onNavigateToEditorWithHtml}
        />
      )}
    </div>
  );
};
