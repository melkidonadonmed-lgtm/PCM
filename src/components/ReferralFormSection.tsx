import React from 'react';
import {
  Share2,
  Download,
  FileText,
  Sparkles,
  Send,
} from './Icon';
import { MedicalReferral, Patient, DoctorProfile } from '../types';
import { CidSearchBar } from './CidSearchBar';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { escapeHtml } from '../utils/sanitizeHtml';
import { formatarEncaminhamentoWhatsAppTexto } from '../utils/compartilhamentoTexto';

export const SPECIALTIES_LIST = [
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
  'Nefrologia / Urologia',
];

export const SPECIALTY_CID_SUGGESTIONS: Record<string, { code: string; label: string }[]> = {
  'Cardiologia': [
    { code: 'I10', label: 'Hipertensão Arterial (HAS)' },
    { code: 'I20.9', label: 'Angina Pectoris' },
    { code: 'I50.9', label: 'Insuficiência Cardíaca' },
    { code: 'R07.4', label: 'Dor Torácica a Esclarecer' },
  ],
  'Pediatria Especializada / Alergologia': [
    { code: 'J45.9', label: 'Asma / Broncoespasmo' },
    { code: 'J30.4', label: 'Rinite Alérgica' },
    { code: 'L20.9', label: 'Dermatite Atópica' },
    { code: 'B08.4', label: 'Mão-Pé-Boca' },
  ],
  'Otorrinolaringologia': [
    { code: 'J01.9', label: 'Sinusite Aguda / Crônica' },
    { code: 'H66.9', label: 'Otite Média' },
    { code: 'H93.1', label: 'Tinnitus (Zumbido)' },
    { code: 'J30.4', label: 'Rinite Vasomotora/Alérgica' },
  ],
  'Ortopedia & Traumatologia': [
    { code: 'M54.5', label: 'Lombalgia' },
    { code: 'M54.2', label: 'Cervicalgia' },
    { code: 'S93.4', label: 'Entorse de Tornozelo' },
    { code: 'M75.1', label: 'Manguito Rotador (Ombro)' },
    { code: 'M65.9', label: 'Tendinopatia / Sinovite' },
  ],
  'Neurologia / Neuropediatria': [
    { code: 'G43.9', label: 'Enxaqueca / Migrânea' },
    { code: 'G44.2', label: 'Cefaleia Tensional' },
    { code: 'G40.9', label: 'Epilepsia / Convulsão' },
    { code: 'H81.1', label: 'VPPB / Vertigem' },
  ],
  'Endocrinologia & Metabologia': [
    { code: 'E11.9', label: 'Diabetes Mellitus tipo 2' },
    { code: 'E03.9', label: 'Hipotireoidismo' },
    { code: 'E66.9', label: 'Obesidade' },
    { code: 'E78.0', label: 'Dislipidemia' },
  ],
  'Dermatologia': [
    { code: 'L20.9', label: 'Dermatite Atópica' },
    { code: 'L50.9', label: 'Urticária' },
    { code: 'L70.0', label: 'Acne Vulgar' },
    { code: 'L40.0', label: 'Psoríase' },
  ],
  'Gastroenterologia': [
    { code: 'K21.9', label: 'DRGE / Refluxo' },
    { code: 'K29.7', label: 'Gastrite' },
    { code: 'K58.9', label: 'Intestino Irritável' },
    { code: 'K80.2', label: 'Colelitíase (Pedra Vesícula)' },
  ],
  'Pneumologia': [
    { code: 'J45.9', label: 'Asma / Crise Asmática' },
    { code: 'J44.9', label: 'DPOC / Enfisema' },
    { code: 'J18.9', label: 'Pneumonia' },
    { code: 'J20.9', label: 'Bronquite Aguda' },
  ],
  'Psiquiatria / Psicologia': [
    { code: 'F41.1', label: 'Ansiedade Generalizada (TAG)' },
    { code: 'F32.9', label: 'Episódio Depressivo' },
    { code: 'F41.0', label: 'Transtorno do Pânico' },
    { code: 'Z73.0', label: 'Burnout / Esgotamento' },
  ],
  'Nefrologia / Urologia': [
    { code: 'N39.0', label: 'ITU Recorrente' },
    { code: 'N20.1', label: 'Cálculo Renal / Ureteral' },
    { code: 'N40', label: 'Hiperplasia Prostática (HPB)' },
    { code: 'N10', label: 'Pielonefrite' },
  ],
};

/**
 * Gera o HTML sanitizado (escapeHtml) da Guia de Encaminhamento para carregamento no Editor Livre A4.
 */
export function buildReferralEditorHtml(
  patient: Patient,
  referral: MedicalReferral
): { referralHtml: string; title: string } {
  const pName = escapeHtml(
    referral.patientName?.trim() || patient?.name?.trim() || '______________________________'
  );
  const pDoc = escapeHtml(
    referral.documentNumber || patient?.documentNumber || '____________________'
  );
  const pAge = escapeHtml(patient?.ageText || (patient?.birthDate ? patient.birthDate : ''));
  const priorityLabel = escapeHtml((referral.priority || 'eletivo').toUpperCase());
  const rawSpecialty = referral.destinationSpecialty || 'Especialidade Médica';
  const specialty = escapeHtml(rawSpecialty);
  const institution = escapeHtml(
    referral.destinationInstitution || 'Serviço de Referência / Atenção Especializada'
  );
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

  return {
    referralHtml,
    title: `Encaminhamento - ${rawSpecialty}`,
  };
}

interface ReferralFormSectionProps {
  darkMode: boolean;
  patient: Patient;
  doctor: DoctorProfile;
  referral: MedicalReferral;
  onUpdateReferral: (ref: MedicalReferral) => void;
  onPatientNameChange: (newName: string) => void;
  onPatientDocChange: (newDoc: string) => void;
  onNavigateToPrint: (docType?: 'certificate' | 'referral') => void;
  onNavigateToEditorWithHtml?: (
    html: string,
    title: string,
    type?: 'referral' | 'certificate'
  ) => void;
}

export const ReferralFormSection: React.FC<ReferralFormSectionProps> = ({
  darkMode,
  patient,
  doctor,
  referral,
  onUpdateReferral,
  onPatientNameChange,
  onPatientDocChange,
  onNavigateToPrint,
  onNavigateToEditorWithHtml,
}) => {
  const currentSpecialtySuggestions =
    SPECIALTY_CID_SUGGESTIONS[referral.destinationSpecialty] || [];

  const handleSelectCidForReferral = (cid: { code: string; description: string }) => {
    const formatted = `${cid.code} - ${cid.description}`;
    onUpdateReferral({
      ...referral,
      hypothesisCID: formatted,
    });
  };

  const handleAppendCidForReferral = (cid: { code: string; description: string }) => {
    const formatted = `${cid.code} - ${cid.description}`;
    const current = referral.hypothesisCID ? referral.hypothesisCID.trim() : '';
    const updated = current ? `${current} / ${formatted}` : formatted;
    onUpdateReferral({
      ...referral,
      hypothesisCID: updated,
    });
  };

  const handleSendReferralWhatsApp = () => {
    if (!medicoConfigurado(doctor)) return;
    const msg = formatarEncaminhamentoWhatsAppTexto(doctor, patient, referral);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenReferralInEditor = () => {
    if (!onNavigateToEditorWithHtml) return;
    const { referralHtml, title } = buildReferralEditorHtml(patient, referral);
    onNavigateToEditorWithHtml(referralHtml, title, 'referral');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="cq-card card-surface surface-card-minimal p-3.5 sm:p-4 rounded-2xl border border-subtle dark:border-strong flex flex-col gap-3">
        {/* Header Enxuto */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-subtle dark:border-strong pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Share2 className="w-4.5 h-4.5 text-sky-600 dark:text-sky-400 shrink-0" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-[var(--text-main)] truncate">
              Guia de Encaminhamento & Referência Especializada
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:shrink-0">
            <button
              type="button"
              onClick={handleSendReferralWhatsApp}
              disabled={!medicoConfigurado(doctor)}
              className="btn-tactile-secondary text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              title={
                medicoConfigurado(doctor)
                  ? 'Enviar a guia de encaminhamento diretamente pelo WhatsApp'
                  : 'Configure nome e CRM do médico para emitir documentos'
              }
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

        {/* Patient data for Referral (Lado a Lado na mesma linha) */}
        <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-center">
          <div className="col-span-7 sm:col-span-8 min-w-0">
            <label
              htmlFor="referral-patient-name"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
            >
              Nome do paciente
            </label>
            <input
              id="referral-patient-name"
              type="text"
              value={patient?.name ?? referral.patientName ?? ''}
              onChange={(e) => onPatientNameChange(e.target.value)}
              placeholder="Ex.: Maria de Oliveira Santos"
              className="w-full h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
            />
          </div>

          <div className="col-span-5 sm:col-span-4 min-w-0">
            <label
              htmlFor="referral-patient-doc"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
            >
              Documento (RG / CPF)
            </label>
            <input
              id="referral-patient-doc"
              type="text"
              value={patient?.documentNumber ?? referral.documentNumber ?? ''}
              onChange={(e) => onPatientDocChange(e.target.value)}
              placeholder="Ex.: 000.000.000-00"
              className="w-full h-9 px-3 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input clinical-tabular-nums"
            />
          </div>
        </div>

        {/* Specialty & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          <div className="min-w-0">
            <label
              htmlFor="referral-destination-specialty"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
            >
              Especialidade de destino
            </label>
            <select
              id="referral-destination-specialty"
              aria-label="Especialidade de destino"
              value={referral.destinationSpecialty}
              onChange={(e) =>
                onUpdateReferral({ ...referral, destinationSpecialty: e.target.value })
              }
              className="w-full h-9 px-2.5 rounded-xl text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input cursor-pointer"
            >
              {SPECIALTIES_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label
              htmlFor="referral-destination-institution"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate"
            >
              Serviço / hospital de destino
            </label>
            <input
              id="referral-destination-institution"
              type="text"
              value={referral.destinationInstitution || ''}
              onChange={(e) =>
                onUpdateReferral({ ...referral, destinationInstitution: e.target.value })
              }
              placeholder="Ex.: Ambulatório de Especialidades / HU..."
              className="w-full h-9 px-3 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1 truncate">
              Grau de prioridade
            </label>
            <div className="flex items-center gap-1.5">
              {(['eletivo', 'prioritario', 'urgente'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onUpdateReferral({ ...referral, priority: p })}
                  className={`flex-1 h-9 rounded-xl text-xs font-bold capitalize border transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
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
          <label
            htmlFor="referral-reason"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1"
          >
            Motivo do encaminhamento
          </label>
          <input
            id="referral-reason"
            type="text"
            value={referral.reason}
            onChange={(e) => onUpdateReferral({ ...referral, reason: e.target.value })}
            placeholder="Ex.: Avaliação especializada e conduta terapêutica..."
            className="w-full h-9 px-3 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input"
          />
        </div>

        <div>
          <label
            htmlFor="referral-clinical-summary"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1"
          >
            Resumo da história clínica & exame físico
          </label>
          <textarea
            id="referral-clinical-summary"
            rows={2}
            value={referral.clinicalSummary}
            onChange={(e) => onUpdateReferral({ ...referral, clinicalSummary: e.target.value })}
            placeholder="Ex.: Paciente com história de episódios recorrentes de broncoespasmo..."
            className="w-full p-2.5 rounded-xl text-xs font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label
              htmlFor="referral-relevant-exams"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1"
            >
              Exames relevantes realizados
            </label>
            <textarea
              id="referral-relevant-exams"
              rows={2}
              value={referral.relevantExams}
              onChange={(e) => onUpdateReferral({ ...referral, relevantExams: e.target.value })}
              placeholder="Ex.: Hemograma completo sem alterações, RX de tórax com hiperinsuflação discreta..."
              className="w-full p-2.5 rounded-xl text-xs font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input leading-relaxed"
            />
          </div>

          <div>
            <label
              htmlFor="referral-hypothesis-cid"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1"
            >
              Texto da hipótese diagnóstica (CID-10)
            </label>
            <textarea
              id="referral-hypothesis-cid"
              rows={2}
              value={referral.hypothesisCID}
              onChange={(e) => onUpdateReferral({ ...referral, hypothesisCID: e.target.value })}
              placeholder="Ex.: J45.9 - Asma não especificada / J30.4 - Rinite alérgica..."
              className="w-full p-2.5 rounded-xl text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Integrated CID-10 Finder for Referral / Encaminhamento */}
        <div className="surface-inset p-3 sm:p-3.5 rounded-xl border border-subtle dark:border-strong flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-subtle dark:border-strong pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <h4 className="text-xs font-semibold text-[var(--text-main)]">
                Buscador de CID-10 para Encaminhamento
              </h4>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Clique no diagnóstico para preencher ou adicionar à hipótese
            </span>
          </div>

          {/* Specialty suggestions in compact select list */}
          {currentSpecialtySuggestions.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="referral-specialty-cid-select"
                className="text-xs font-medium text-[var(--text-muted)] shrink-0"
              >
                Sugestões ({referral.destinationSpecialty}):
              </label>
              <select
                id="referral-specialty-cid-select"
                aria-label={`Sugestões de CID-10 para ${referral.destinationSpecialty}`}
                value=""
                onChange={(e) => {
                  const found = currentSpecialtySuggestions.find(
                    (item) => item.code === e.target.value
                  );
                  if (found) {
                    handleAppendCidForReferral({ code: found.code, description: found.label });
                  }
                }}
                className="w-full sm:flex-1 h-9 px-2.5 rounded-xl text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 tactile-input cursor-pointer"
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
  );
};
