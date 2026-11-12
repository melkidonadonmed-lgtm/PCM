import { Mark } from '@tiptap/react';
import {
  DoctorProfile,
  Patient,
  WorkContext,
  PrescriptionItem,
  DocumentHeaderConfig,
  DocumentLogoConfig,
  DocumentOrientation,
  DocumentViaLayout,
  PrescriptionStyle,
} from '../../types';
import {
  resolverIdentidade,
  rotuloApresentacao,
  separarPorRegime,
} from '../../utils/documentoClinico';
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
  const rawCrm = (doctor?.crm || activeContext?.doctorCredentials?.crm || '').trim();
  const docCrmState = (doctor?.crmState || activeContext?.doctorCredentials?.uf || 'SP').trim();
  const docRqe = (doctor?.rqe || activeContext?.doctorCredentials?.rqe || '').trim();
  const docSpecialty = (
    doctor?.specialty ||
    activeContext?.doctorCredentials?.specialty ||
    ''
  ).trim();
  const docName = doctor?.name?.trim() || '';
  const crmFormatted = rawCrm ? `CRM-${docCrmState} ${rawCrm}${docRqe ? ` • RQE ${docRqe}` : ''}` : '';
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return {
    doctorName: docName,
    doctorCrm: crmFormatted,
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
    footerCrm: crmFormatted ? `Médico(a) — ${crmFormatted}` : 'Assinatura e carimbo do(a) médico(a) — CRM',
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
      const pres = rotuloApresentacao(item);
      const presLabel = pres ? ` (${escapeHtml(pres)})` : '';
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
            const pres = rotuloApresentacao(item);
            const presentation = pres ? ` (${escapeHtml(pres)})` : '';
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

export {
  buildActiveReferralPayload,
  buildActiveCertificatePayload,
  buildPresetQuickTemplatePayload,
} from './editorDocumentPayloads';

