import { Mark } from '@tiptap/react';
import {
  DoctorProfile,
  Patient,
  WorkContext,
  PrescriptionItem,
  MedicalCertificate,
  MedicalReferral,
  DocumentHeaderConfig,
  DocumentLogoConfig,
  DocumentOrientation,
  DocumentViaLayout,
  PrescriptionStyle,
} from '../../types';
import { resolverIdentidade, separarPorRegime } from '../../utils/documentoClinico';
import { escapeHtml } from '../../utils/sanitizeHtml';
import type { RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';

export type PresetQuickTemplateType =
  | 'laudo'
  | 'receita'
  | 'receita_especial'
  | 'parecer'
  | 'risco'
  | 'atestado'
  | 'laudo_com_receita'
  | 'relatorio_circunstanciado'
  | 'declaracao_comparecimento';

export const DEFAULT_PRESCRIPTION_STYLES: PrescriptionStyle[] = [
  {
    id: 'padrao_simples',
    name: 'Receita Simples Ambulatorial (1 Via • Retrato)',
    fontFamilyId: 'jakarta',
    baseFontSize: 11,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: true,
    showFooter: true,
    watermarkType: 'none',
  },
  {
    id: 'especial_2vias',
    name: 'Controle Especial 2 Vias (Portaria 344/98 • Paisagem)',
    fontFamilyId: 'jakarta',
    baseFontSize: 10,
    pageOrientation: 'landscape',
    viaLayout: '2-vias',
    showHeader: true,
    showFooter: true,
    watermarkType: 'none',
  },
  {
    id: 'sus',
    name: 'Receita SUS / Atenção Básica (1 Via • Retrato)',
    fontFamilyId: 'inter',
    baseFontSize: 11,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: true,
    showFooter: true,
    watermarkType: 'sus_double',
  },
  {
    id: 'classico',
    name: 'Receita Clássica Nobre (Cormorant 12pt • Retrato)',
    fontFamilyId: 'cormorant',
    baseFontSize: 12,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: true,
    showFooter: true,
    watermarkType: 'none',
  },
  {
    id: 'hospitalar',
    name: 'Receita Hospitalar / Clínica (Jakarta 11pt • Retrato)',
    fontFamilyId: 'jakarta',
    baseFontSize: 11,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: true,
    showFooter: true,
    watermarkType: 'none',
  },
  {
    id: 'pre_timbrado',
    name: 'Papel Pré-Timbrado da Gráfica (Sem Cabeçalho/Rodapé)',
    fontFamilyId: 'inter',
    baseFontSize: 11,
    pageOrientation: 'portrait',
    viaLayout: '1-via',
    showHeader: false,
    showFooter: false,
    watermarkType: 'none',
  },
];

// Extensão Tiptap Customizada para Sublinhado (Ctrl+U)
export const CustomUnderline = Mark.create({
  name: 'underline',
  parseHTML() {
    return [
      { tag: 'u' },
      {
        style: 'text-decoration',
        consuming: false,
        getAttrs: (style: string | HTMLElement) =>
          typeof style === 'string' && style.includes('underline') ? {} : false,
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['u', HTMLAttributes, 0];
  },
  addKeyboardShortcuts() {
    return {
      'Mod-u': () => this.editor.commands.toggleMark(this.name),
    };
  },
});

/**
 * HTML renderizado pelo TipTap, ou null se o editor ainda não foi montado.
 * No TipTap 3, `editor.view` lança exceção quando acessado antes da montagem
 * (o `?.` não protege), o que derrubava a tela do Editor ao abrir.
 */
export function htmlDoEditorMontado(
  ed: { isDestroyed: boolean; view: { dom: Element } } | null | undefined
): string | null {
  if (!ed || ed.isDestroyed) return null;
  try {
    return ed.view.dom.innerHTML;
  } catch {
    return null;
  }
}

export const REGIMES_RECEITA: RegimeReceita[] = ['simples', 'antimicrobiano', 'controle_especial'];

/** Como cada tipo de receita é montado no editor. */
export const RECEITA_NO_EDITOR: Record<
  RegimeReceita,
  { botao: string; titulo: string; selo: string; modelo: string; aviso: string }
> = {
  simples: {
    botao: 'Receita simples',
    titulo: 'RECEITUÁRIO MÉDICO',
    selo: 'RECEITUÁRIO MÉDICO',
    modelo: 'Receita Médica (Consulta)',
    aviso: 'Receita simples (1 via) carregada no editor.',
  },
  antimicrobiano: {
    botao: 'Antimicrobiano',
    titulo: 'RECEITUÁRIO MÉDICO',
    selo: 'RECEITUÁRIO MÉDICO — ANTIMICROBIANO',
    modelo: 'Receita de Antimicrobiano (Consulta)',
    aviso: 'Receita de antimicrobiano (2 vias) carregada no editor.',
  },
  controle_especial: {
    botao: 'Controle especial',
    titulo: 'RECEITUÁRIO DE CONTROLE ESPECIAL',
    selo: 'RECEITUÁRIO DE CONTROLE ESPECIAL',
    modelo: 'Receita de Controle Especial (Consulta)',
    aviso: 'Receita de controle especial (2 vias) carregada no editor.',
  },
};

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'Serif' | 'Sans' | 'Mono';
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'cormorant', name: 'Cormorant Garamond (Clássica)', family: "'Cormorant Garamond', Georgia, serif", category: 'Serif' },
  { id: 'jakarta', name: 'Plus Jakarta Sans (Hospitalar)', family: "'Plus Jakarta Sans', sans-serif", category: 'Sans' },
  { id: 'roboto', name: 'Roboto (Google Docs)', family: "'Roboto', sans-serif", category: 'Sans' },
  { id: 'inter', name: 'Inter (Técnica / Neutra)', family: "'Inter', sans-serif", category: 'Sans' },
  { id: 'open-sans', name: 'Open Sans (Ambulatorial)', family: "'Open Sans', sans-serif", category: 'Sans' },
  { id: 'merriweather', name: 'Merriweather (Editorial / Serif)', family: "'Merriweather', Georgia, serif", category: 'Serif' },
  { id: 'lora', name: 'Lora (Elegante / Pericial)', family: "'Lora', Georgia, serif", category: 'Serif' },
  { id: 'montserrat', name: 'Montserrat (Moderna)', family: "'Montserrat', sans-serif", category: 'Sans' },
  { id: 'playfair', name: 'Playfair Display (Nobiliar)', family: "'Playfair Display', serif", category: 'Serif' },
  { id: 'arial', name: 'Arial (Padrão Universal)', family: 'Arial, Helvetica, sans-serif', category: 'Sans' },
  { id: 'times', name: 'Times New Roman (Pericial)', family: "'Times New Roman', Times, serif", category: 'Serif' },
  { id: 'courier', name: 'Courier Prime (Máquina)', family: "'Courier Prime', 'Courier New', monospace", category: 'Mono' },
];

export const INITIAL_EDITOR_CONTENT = `
  <p style="text-align: center;"><strong>RECEITUÁRIO MÉDICO</strong></p>
  <p></p>
  <p><strong>1. Amoxicilina 500mg</strong> (Uso Oral) &nbsp;—&nbsp; <strong>1 caixa</strong></p>
  <p style="margin-left: 20px; color: #334155;">Tomar 1 cápsula por via oral a cada 8 horas durante 7 dias.</p>
  <p></p>
  <p><strong>2. Dipirona 500mg/mL (Gotas)</strong> (Uso Oral) &nbsp;—&nbsp; <strong>1 frasco</strong></p>
  <p style="margin-left: 20px; color: #334155;">Tomar 30 a 40 gotas por via oral até de 6 em 6 horas se febre ou dor.</p>
  <p></p>
  <p><strong>Recomendações Clínicas:</strong> Repouso, hidratação oral vigorosa (mínimo 2 litros de água/dia) e retorno imediato ao serviço se sinais de alarme ou piora respiratória.</p>
`;

export function getLogoSizeClass(size: DocumentLogoConfig['size']): string {
  switch (size) {
    case 'sm':
      return 'max-h-12 max-w-[128px]';
    case 'md':
      return 'max-h-16 max-w-44';
    case 'lg':
      return 'max-h-24 max-w-[240px]';
    case 'xl':
      return 'max-h-32 max-w-[280px]';
    default:
      return 'max-h-16 max-w-44';
  }
}

export function buildDefaultHeaderConfig(
  doctor: DoctorProfile,
  activeContext: WorkContext | null
): DocumentHeaderConfig {
  const { cabecalho } = resolverIdentidade(doctor, activeContext);
  const docCrm = activeContext?.doctorCredentials?.crm || doctor?.crm || '------';
  const docCrmState = activeContext?.doctorCredentials?.uf || doctor?.crmState || 'SP';
  const docRqe = activeContext?.doctorCredentials?.rqe || doctor?.rqe;
  const docSpecialty =
    activeContext?.doctorCredentials?.specialty || doctor?.specialty || 'Clínica Médica';
  const docName = doctor?.name || 'Dr(a). Médico(a)';
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return {
    doctorName: docName,
    doctorCrm: `CRM-${docCrmState} ${docCrm}${docRqe ? ` • RQE ${docRqe}` : ''}`,
    doctorSpecialty: docSpecialty,
    clinicName: cabecalho.titulo,
    clinicAddress: cabecalho.linhas.join(' • '),
    badgeText: 'DOCUMENTO CLÍNICO LIVRE',
    dateText: today,
    showHeader: true,
    showFooter: true,
    showPatientBanner: true,
    patientCustomText: '',
    footerDocName: docName,
    footerCrm: `Médico(a) — CRM-${docCrmState} ${docCrm}${docRqe ? ` • RQE ${docRqe}` : ''}`,
    footerSpecialty: docSpecialty,
    footerSubtext: '',
  };
}

export function formatPrescriptionItemsList(items: PrescriptionItem[]): string {
  if (!items || items.length === 0) {
    return '<p><em>(Nenhum medicamento registrado na aba de prescrição)</em></p>';
  }
  return items
    .map((item, idx) => {
      const presLower = (item.presentation || '').toLowerCase();
      const qtdLower = (item.quantity || '').toLowerCase();
      const showPres =
        item.presentation &&
        presLower !== qtdLower &&
        !presLower.includes('caixa') &&
        presLower !== 'uso oral' &&
        !qtdLower.includes(presLower);
      const presLabel = showPres ? ` (${escapeHtml(item.presentation)})` : '';
      const routeLabel = item.route ? ` (${escapeHtml(item.route)})` : '';
      const qtyLabel = item.quantity ? ` &nbsp;—&nbsp; <strong>${escapeHtml(item.quantity)}</strong>` : '';
      const instructions = escapeHtml(item.instructions || 'Conforme orientação médica.');
      const times =
        item.scheduleTimes && item.scheduleTimes.length > 0
          ? `<br><span style="font-size: 0.9em; color: #475569;">Horários recomendados: ${escapeHtml(item.scheduleTimes.join(' — '))}</span>`
          : '';
      return `
        <p><strong>${idx + 1}. ${escapeHtml(item.name)}${presLabel}</strong>${routeLabel}${qtyLabel}</p>
        <p style="margin-left: 20px; color: #334155;">${instructions}${times}</p>
      `;
    })
    .join('<p><br></p>');
}

export function interpolateMedicalTags(
  rawHtml: string,
  patient: Patient,
  prescriptionItems: PrescriptionItem[],
  doctor: DoctorProfile,
  activeContext: WorkContext | null
): string {
  const today = escapeHtml(
    new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  );
  const pName = escapeHtml(patient?.name?.trim() || '______________________________');
  const pAge = escapeHtml(patient?.ageText || (patient?.birthDate ? patient.birthDate : '____ anos'));
  const pDoc = escapeHtml(patient?.documentNumber?.trim() || '____________________');
  const pCns = escapeHtml(patient?.cns?.trim() || '____________________');
  const pAddressParts = [
    patient?.address,
    patient?.neighborhood,
    patient?.city ? `${patient.city}${patient.state ? `/${patient.state}` : ''}` : '',
  ].filter(Boolean);
  const pAddress = escapeHtml(pAddressParts.join(', ') || '______________________________');
  const pWeight = escapeHtml(patient?.weightKg ? `${patient.weightKg} kg` : '');
  const meds = formatPrescriptionItemsList(prescriptionItems);

  const rawDocName = doctor?.name
    ? doctor.name.startsWith('Dr')
      ? doctor.name
      : `Dr(a). ${doctor.name}`
    : 'Dr(a). ____________________';
  const docName = escapeHtml(rawDocName);
  const docCrm = escapeHtml(
    doctor?.crm
      ? `CRM ${doctor.crm}${doctor.crmState ? `/${doctor.crmState}` : ''}`
      : 'CRM: ____________'
  );
  const docSpec = escapeHtml(
    doctor?.specialty?.trim() || activeContext?.doctorCredentials?.specialty || 'Medicina Geral'
  );
  const clinicName = escapeHtml(activeContext?.clinicName || doctor?.clinicName || 'Clínica Médica');
  const clinicAddress = escapeHtml(activeContext?.clinicAddress || doctor?.address || '');
  const clinicPhone = escapeHtml(doctor?.phone || '');
  const clinicCnes = escapeHtml(activeContext?.cnes || doctor?.cnes || '');

  return rawHtml
    .replace(/\{\{paciente_nome\}\}/g, () => pName)
    .replace(/\{\{paciente_idade\}\}/g, () => pAge)
    .replace(/\{\{paciente_documento\}\}/g, () => pDoc)
    .replace(/\{\{paciente_cns\}\}/g, () => pCns)
    .replace(/\{\{paciente_endereco\}\}/g, () => pAddress)
    .replace(/\{\{paciente_peso\}\}/g, () => pWeight)
    .replace(/\{\{medicamentos_prescritos\}\}/g, () => meds)
    .replace(/\{\{data_atendimento\}\}/g, () => today)
    .replace(/\{\{medico_nome\}\}/g, () => docName)
    .replace(/\{\{medico_crm\}\}/g, () => docCrm)
    .replace(/\{\{medico_especialidade\}\}/g, () => docSpec)
    .replace(/\{\{clinica_nome\}\}/g, () => clinicName)
    .replace(/\{\{clinica_endereco\}\}/g, () => clinicAddress)
    .replace(/\{\{clinica_telefone\}\}/g, () => clinicPhone)
    .replace(/\{\{clinica_cnes\}\}/g, () => clinicCnes);
}

export function buildActivePrescriptionPayload(
  prescriptionItems: PrescriptionItem[],
  patient: Patient,
  currentHeader: DocumentHeaderConfig,
  targetMode: 'auto' | RegimeReceita = 'auto'
) {
  const allItems = prescriptionItems || [];
  const grupos = separarPorRegime(allItems);
  const comItens = REGIMES_RECEITA.filter((regime) => grupos[regime].length > 0);

  const regime: RegimeReceita =
    targetMode !== 'auto'
      ? targetMode
      : comItens.length > 0
      ? comItens[comItens.length - 1]
      : 'simples';
  const isSpecial = regime !== 'simples';
  const receita = RECEITA_NO_EDITOR[regime];
  const itemsToLoad = grupos[regime];

  const pName = escapeHtml(patient?.name?.trim() || '______________________________');
  const pDoc = patient?.documentNumber ? ` • Doc: ${escapeHtml(patient.documentNumber)}` : '';
  const pAge =
    patient?.ageText
      ? escapeHtml(patient.ageText)
      : patient?.birthDate
      ? ` • Idade: ${escapeHtml(patient.ageText || patient.birthDate)}`
      : '';
  const pWeight = patient?.weightKg > 0 ? ` • Peso: ${escapeHtml(patient.weightKg)} kg` : '';
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const nextViaLayout: DocumentViaLayout = isSpecial ? '2-vias' : '1-via';
  const nextOrientation: DocumentOrientation = 'landscape';
  const nextFontSize = 10;

  const itemsHtml =
    itemsToLoad && itemsToLoad.length > 0
      ? itemsToLoad
          .map((item, idx) => {
            const route = item.route ? `(${escapeHtml(item.route)})` : '';
            const presLower = (item.presentation || '').toLowerCase();
            const qtdLower = (item.quantity || '').toLowerCase();
            const showPres =
              item.presentation &&
              presLower !== qtdLower &&
              !presLower.includes('caixa') &&
              presLower !== 'uso oral' &&
              !qtdLower.includes(presLower);
            const presentation = showPres ? ` (${escapeHtml(item.presentation)})` : '';
            const quantity = item.quantity ? ` &nbsp;—&nbsp; <strong>${escapeHtml(item.quantity)}</strong>` : '';
            const instructions = escapeHtml(item.instructions || '');
            const times =
              item.scheduleTimes && item.scheduleTimes.length > 0
                ? `<br><span style="font-size: 0.9em; color: #475569;">Horários recomendados: ${escapeHtml(item.scheduleTimes.join(' — '))}</span>`
                : '';

            return `
            <p><strong>${idx + 1}. ${escapeHtml(item.name)}${presentation}</strong> ${route}${quantity}</p>
            <p style="margin-left: 20px; color: #334155;">${instructions}${times}</p>
            <p></p>
          `;
          })
          .join('')
      : `
          <p><strong>1. </strong></p>
          <p style="margin-left: 20px; color: #64748b;"><em>(Digite a posologia ou adicione medicamentos na consulta)</em></p>
          <p></p>
        `;

  const patientLineHtml = currentHeader.showPatientBanner
    ? ''
    : `<p><strong>Paciente:</strong> ${pName}${pDoc}${pAge}${pWeight}</p><p></p>`;

  const tituloCorpoHtml = currentHeader.showHeader
    ? ''
    : `<p style="text-align: center;"><strong>${escapeHtml(receita.titulo)}</strong></p>`;

  const newHtml = `
    ${tituloCorpoHtml}
    ${regime === 'antimicrobiano' ? '<p style="text-align: center; font-size: 0.85em; color: #475569;">Antimicrobiano — receita válida por 10 dias a contar da data de emissão (RDC Anvisa nº 471/2021).</p>' : ''}
    ${patientLineHtml}
    <p><strong>PRESCRIÇÃO:</strong></p>
    <p></p>
    ${itemsHtml}
  `;

  const nextHeader: DocumentHeaderConfig = {
    ...currentHeader,
    showHeader: true,
    showFooter: true,
    showPatientBanner: true,
    badgeText: receita.selo,
    dateText: today,
  };

  return {
    regime,
    receita,
    newHtml,
    nextHeader,
    nextViaLayout,
    nextOrientation,
    nextFontSize,
  };
}

export function buildActiveReferralPayload(
  patient: Patient,
  referral: MedicalReferral | undefined,
  currentHeader: DocumentHeaderConfig
) {
  const pName = escapeHtml(
    patient?.name?.trim() || referral?.patientName?.trim() || '______________________________'
  );
  const pDoc = escapeHtml(patient?.documentNumber || referral?.documentNumber || '____________________');
  const pAge = escapeHtml(patient?.ageText || (patient?.birthDate ? patient.birthDate : ''));
  const today =
    referral?.date ||
    new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const priorityLabel = escapeHtml((referral?.priority || 'eletivo').toUpperCase());
  const rawSpecialty = referral?.destinationSpecialty || 'Especialidade Médica';
  const specialty = escapeHtml(rawSpecialty);
  const institution = escapeHtml(
    referral?.destinationInstitution || 'Serviço de Referência / Atenção Especializada'
  );
  const reason = escapeHtml(referral?.reason || 'Avaliação e conduta especializada.');
  const summary = escapeHtml(referral?.clinicalSummary || 'Quadro clínico em investigação.');
  const exams = escapeHtml(referral?.relevantExams || 'Sem exames complementares anexados.');
  const cid = escapeHtml(referral?.hypothesisCID || 'A esclarecer.');

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
    <p><strong>2. História Clínica & Exame Físico Relevante:</strong></p>
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

  const nextHeader: DocumentHeaderConfig = {
    ...currentHeader,
    showHeader: true,
    showFooter: true,
    showPatientBanner: false,
    badgeText: `ENCAMINHAMENTO • ${rawSpecialty.toUpperCase()}`,
    dateText: today,
  };

  return {
    specialty: rawSpecialty,
    referralHtml,
    nextHeader,
  };
}

export function buildActiveCertificatePayload(
  patient: Patient,
  certificate: MedicalCertificate | undefined,
  currentHeader: DocumentHeaderConfig
) {
  const pName = escapeHtml(
    patient?.name?.trim() || certificate?.patientName?.trim() || '______________________________'
  );
  const pDoc = escapeHtml(patient?.documentNumber || certificate?.documentNumber || '____________________');
  const days = certificate?.daysOff || 1;
  const daysText = escapeHtml(days === 1 ? '1 (um) dia' : `${days} dias`);
  const period = escapeHtml(certificate?.periodText || 'por motivo de doença e necessidade de repouso');
  const today =
    certificate?.date ||
    new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const cidText =
    certificate?.includeCID && certificate?.cid10Code
      ? `<p><strong>Diagnóstico (CID-10):</strong> ${escapeHtml(certificate.cid10Code)}${certificate.cid10Description ? ` - ${escapeHtml(certificate.cid10Description)}` : ''} <em>(Expressamente autorizado pelo paciente)</em></p><p></p>`
      : '';
  const obsText = certificate?.observations
    ? `<p><strong>Observações:</strong> ${escapeHtml(certificate.observations)}</p><p></p>`
    : '';
  const addr = currentHeader.clinicAddress;

  const certHtml = `
    <p style="text-align: center;"><strong>ATESTADO MÉDICO</strong></p>
    <p></p>
    <p style="text-align: justify; line-height: 1.8;">
      Atesto para os devidos fins que o(a) paciente <strong>${pName}</strong>, inscrito(a) no documento nº <strong>${pDoc}</strong>, foi submetido(a) a atendimento médico nesta data e deve permanecer afastado(a) de suas atividades laborais e habituais pelo período de <strong>${daysText}</strong>, a contar desta data, ${period}.
    </p>
    <p></p>
    ${cidText}
    ${obsText}
    <p style="text-align: right; margin-top: 24px;">${addr ? `${escapeHtml(addr.split('-')[0].trim())}, ` : ''}${escapeHtml(today)}.</p>
  `;

  const nextHeader: DocumentHeaderConfig = {
    ...currentHeader,
    showHeader: true,
    showFooter: true,
    badgeText: 'ATESTADO MÉDICO',
    dateText: today,
  };

  return {
    certHtml,
    nextHeader,
  };
}

export function buildPresetQuickTemplatePayload(
  type: PresetQuickTemplateType,
  patient: Patient,
  prescriptionItems: PrescriptionItem[]
): {
  templateHtml: string;
  presetTitle: string;
  badge: string;
  viaLayout?: DocumentViaLayout;
  pageOrientation?: DocumentOrientation;
  baseFontSize?: number;
} {
  const patientName = escapeHtml(patient?.name || '__________________________');
  const patientDoc = escapeHtml(patient?.documentNumber || '________________');
  const today = escapeHtml(
    new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  );
  const medsList = formatPrescriptionItemsList(prescriptionItems);

  if (type === 'receita_especial') {
    return {
      presetTitle: 'Receituário de Controle Especial (Portaria 344/98)',
      badge: 'RECEITUÁRIO DE CONTROLE ESPECIAL',
      viaLayout: '2-vias',
      pageOrientation: 'landscape',
      baseFontSize: 10,
      templateHtml: `
        <p style="text-align: center;"><strong>RECEITUÁRIO DE CONTROLE ESPECIAL</strong></p>
        <p><br></p>
        <p><strong>Paciente:</strong> ${patientName} | <strong>Documento:</strong> ${patientDoc}</p>
        <p><br></p>
        <p><strong>PRESCRIÇÃO MEDICAMENTOSA (PORTARIA SVS/MS 344/98):</strong></p>
        <p><strong>1. Clonazepam 2,5 mg/mL (Gotas)</strong> (Uso Oral) ---------------- 01 frasco (vinte mL)</p>
        <p style="margin-left: 20px;">Pingar 05 (cinco) gotas por via oral às 21:00 horas se insônia severa.</p>
        <p><br></p>
        <p><strong>2. Sertralina 50 mg (Comprimidos)</strong> (Uso Oral) ------------ 60 comprimidos (sessenta)</p>
        <p style="margin-left: 20px;">Tomar 01 (um) comprimido por via oral pela manhã, após o café, diariamente durante 60 dias.</p>
        <p><br></p>
        <p><strong>Orientações:</strong> Validade de 30 dias a contar da emissão. 1ª via retida na farmácia e 2ª via devolvida ao paciente orientada.</p>
      `,
    };
  }
  if (type === 'laudo_com_receita') {
    return {
      presetTitle: 'Laudo Médico com Prescrição Terapêutica',
      badge: 'LAUDO COM RECEITA',
      templateHtml: `
        <p style="text-align: center;"><strong>LAUDO MÉDICO COM PRESCRIÇÃO TERAPÊUTICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, encontra-se sob acompanhamento ambulatorial neste serviço para investigação propedêutica e manejo clínico integral.</p>
        <p><br></p>
        <p><strong>Quadro Clínico & Parecer:</strong> Paciente hemodinamicamente estável, em bom estado geral, orientado(a) quanto aos cuidados clínicos, medidas higienodietéticas e aderência farmacológica estrita.</p>
        <p><br></p>
        <p><strong>PLANO FARMACOLÓGICO INSTITUÍDO:</strong></p>
        ${medsList}
        <p><br></p>
        <p><strong>Recomendações Clínicas:</strong> Manter a posologia prescrita com rigor de horários. Retorno ambulatorial programado para reavaliação de conduta e seguimento terapêutico.</p>
      `,
    };
  }
  if (type === 'relatorio_circunstanciado') {
    return {
      presetTitle: 'Relatório Médico Circunstanciado',
      badge: 'RELATÓRIO CIRCUNSTANCIADO',
      templateHtml: `
        <p style="text-align: center;"><strong>RELATÓRIO MÉDICO CIRCUNSTANCIADO</strong></p>
        <p><br></p>
        <p><strong>Identificação do Paciente:</strong> ${patientName} | <strong>Documento:</strong> ${patientDoc} | <strong>Data:</strong> ${today}</p>
        <p><br></p>
        <p><strong>1. Histórico da Moléstia Atual:</strong> Paciente em acompanhamento regular neste serviço de saúde apresentando quadro clínico compatível com a hipótese diagnóstica em investigação, demandando suporte clínico contínuo e plano farmacológico diário.</p>
        <p><br></p>
        <p><strong>2. Exame Físico / Sinais Vitais:</strong> Bom estado geral, consciente e orientado(a) no tempo e espaço, eupneico(a) em ar ambiente, acianótico(a). Aparelho cardiovascular com ritmo regular em 2 tempos, bulhas normofonéticas sem sopros. Ausculta pulmonar com murmúrio vesicular universalmente audível sem ruídos adventícios.</p>
        <p><br></p>
        <p><strong>3. Terapêutica Farmacológica em Curso:</strong></p>
        ${medsList}
        <p><br></p>
        <p><strong>4. Conclusão & Conduta:</strong> Paciente com benefício clínico comprovado ao esquema medicamentoso instituído, necessitando de continuidade do tratamento e reavaliações periódicas neste serviço.</p>
      `,
    };
  }
  if (type === 'declaracao_comparecimento') {
    return {
      presetTitle: 'Declaração de Comparecimento com Receita',
      badge: 'DECLARAÇÃO DE COMPARECIMENTO',
      templateHtml: `
        <p style="text-align: center;"><strong>DECLARAÇÃO DE COMPARECIMENTO E RECEITA MÉDICA</strong></p>
        <p><br></p>
        <p>Declaro para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, compareceu a esta unidade de saúde na data de <strong>${today}</strong> para consulta médica ambulatorial.</p>
        <p><br></p>
        <p><strong>PRESCRIÇÃO FARMACOLÓGICA EMITIDA:</strong></p>
        ${medsList}
        <p><br></p>
        <p>Apto(a) a retornar às suas atividades habituais após o atendimento, respeitadas as orientações posológicas e de repouso prescritas.</p>
      `,
    };
  }
  if (type === 'laudo') {
    return {
      presetTitle: 'Laudo de Avaliação Clínica',
      badge: 'LAUDO CLÍNICO',
      templateHtml: `
        <p style="text-align: center;"><strong>LAUDO MÉDICO DE AVALIAÇÃO CLÍNICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, foi submetido(a) a exame clínico nesta data, encontrando-se sob acompanhamento ambulatorial para investigação e manejo terapêutico.</p>
        <p><br></p>
        <p><strong>Hipótese Diagnóstica / Quadro Clínico:</strong> Paciente lúcido(a), orientado(a), eupneico(a), hemodinamicamente estável, sem queixas agudas de urgência no momento da avaliação.</p>
        <p><br></p>
        <p><strong>Conduta:</strong> Mantido plano terapêutico previamente instituído. Retorno programado com resultados de exames complementares.</p>
      `,
    };
  }
  if (type === 'risco') {
    return {
      presetTitle: 'Parecer de Risco Cirúrgico Pré-Operatório',
      badge: 'RISCO CIRÚRGICO',
      templateHtml: `
        <p style="text-align: center;"><strong>PARECER DE RISCO CIRÚRGICO PRÉ-OPERATÓRIO</strong></p>
        <p><br></p>
        <p>Paciente: <strong>${patientName}</strong> | Documento: ${patientDoc}</p>
        <p><br></p>
        <p>Avaliado(a) para liberação de procedimento cirúrgico eletivo. Nega precordialgia típica, dispneia paroxística noturna ou síncope aos esforços. Capacidade funcional estimada > 4 METs.</p>
        <p><br></p>
        <p><strong>Exame Físico:</strong> Ritmo cardíaco regular em 2 tempos, bulhas normofonéticas sem sopros audíveis. PA dentro dos limites de tolerância. Murmúrio vesicular presente bilateralmente, sem ruídos adventícios.</p>
        <p><br></p>
        <p><strong>Classificação de Risco:</strong> ASA II / Baixo Risco Cardiovascular para o procedimento proposto.</p>
        <p><br></p>
        <p><strong>Recomendações:</strong> Manter medicação anti-hipertensiva habitual com mínimo gole de água pela manhã no dia da cirurgia. Monitorização hemodinâmica intraoperatória padrão.</p>
      `,
    };
  }
  if (type === 'parecer') {
    return {
      presetTitle: 'Parecer Médico Especializado',
      badge: 'PARECER ESPECIALIZADO',
      templateHtml: `
        <p style="text-align: center;"><strong>PARECER MÉDICO ESPECIALIZADO / CONTRA-REFERÊNCIA</strong></p>
        <p><br></p>
        <p>Ao Médico(a) Assistente da Unidade de Origem,</p>
        <p>Encaminhamos avaliação especializada referente ao(à) paciente <strong>${patientName}</strong>.</p>
        <p><br></p>
        <p><strong>Sumário da Avaliação:</strong> Exame físico sem alterações significativas para a queixa principal. Exames complementares revisados e discutidos com o paciente.</p>
        <p><br></p>
        <p><strong>Recomendações e Ajustes Farmacológicos:</strong> Seguir acompanhamento regular na Atenção Primária com as orientações anexas. Programado novo retorno especializado caso haja refratariedade sintomática.</p>
      `,
    };
  }
  if (type === 'atestado') {
    return {
      presetTitle: 'Atestado Médico de Aptidão Física',
      badge: 'ATESTADO DE APTIDÃO',
      templateHtml: `
        <p style="text-align: center;"><strong>ATESTADO MÉDICO DE APTIDÃO FÍSICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, foi submetido(a) a exame clínico e anamnese dirigida nesta data, encontrando-se <strong>APTO(A)</strong> para a prática de atividades físicas esportivas e laborativas que não exijam esforço físico extenuante desmedido.</p>
        <p><br></p>
        <p>Válido pelo período regulamentar a contar da presente data.</p>
      `,
    };
  }
  return {
    presetTitle: 'Receita Ambulatorial Livre',
    badge: 'RECEITA MÉDICA',
    viaLayout: '1-via',
    pageOrientation: 'portrait',
    baseFontSize: 12,
    templateHtml: INITIAL_EDITOR_CONTENT,
  };
}
