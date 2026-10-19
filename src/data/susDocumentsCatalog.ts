import { SusDocumentItem, SusFilledFormData } from '../types';
import { medicamentosDaLme } from './formulariosOficiaisSus';
import { LOGO_DO_ESTADO, LOGO_DO_SUS } from './presetAssets';
import { escapeHtml } from '../utils/sanitizeHtml';

export const SUS_DOCUMENTS_CATALOG: SusDocumentItem[] = [
  {
    id: 'apac_principal',
    title: 'APAC — Laudo de Solicitação de Procedimento Ambulatorial (Laudo Principal)',
    shortTitle: 'APAC Laudo Principal',
    system: 'SIA/SUS e SISREG',
    complexity: 'Alta Complexidade',
    category: 'apac',
    description: 'Procedimentos e exames de alto custo (Tomografia, Ressonância, Cintilografia, Cateterismo, Cirurgias Eletivas).',
    badge: 'Alta Complexidade',
    defaultSigtap: '02.07.01.006-4',
    defaultProcedure: 'Ressonância Magnética / Tomografia Computadorizada de Alta Resolução',
    defaultJustification: 'História clínica com tempo de evolução superior a 6 meses. Sintomas persistentes refratários a tratamento conservador prévio com falha documentada de analgesia escalonada e fisioterapia motora. Exames prévios de menor complexidade (RX/USG) inconclusivos para esclarecimento etiológico.',
    defaultCid10: 'M54.5'
  },
  {
    id: 'apac_complementar',
    title: 'APAC — Laudo Complementar (Justificativa de Contraste e Função Renal)',
    shortTitle: 'APAC Laudo Complementar',
    system: 'SIA/SUS e SISREG',
    complexity: 'Alta Complexidade',
    category: 'apac',
    description: 'Justificativa técnica de contraste endovenoso (Iodo/Gadolínio), Creatinina, eTFG e triagem de segurança em campo magnético (RM).',
    badge: 'Contraste & RM',
    defaultSigtap: '02.07.01.006-4',
    defaultProcedure: 'Exame de Imagem com Meio de Contraste Endovenoso',
    defaultJustification: 'O uso de contraste endovenoso é indispensável para diferenciação de lesão tecidual, delimitação de planos profundos e pesquisa de processo inflamatório/infeccioso ativo que não podem ser elucidados no exame simples. Função renal preservada e ausência de implantes ferromagnéticos.',
    defaultCid10: 'M54.5'
  },
  {
    id: 'sisreg_guia',
    title: 'Guia de Encaminhamento SISREG (Média Complexidade)',
    shortTitle: 'Guia SISREG',
    system: 'SISREG e BPA',
    complexity: 'Média Complexidade',
    category: 'sisreg',
    description: 'Referência da Atenção Primária para consultas especializadas e exames complementares (Ecocardiograma, USG com Doppler, RX especializado).',
    badge: 'Regulação SISREG',
    defaultSigtap: '03.01.01.007-2',
    defaultProcedure: 'Consulta Médica em Atenção Especializada',
    defaultJustification: 'Paciente em acompanhamento regular na UBS com diagnóstico sindrômico sem resposta satisfatória aos recursos da Atenção Básica. Encaminhado para avaliação e conduta diagnóstica/terapêutica especializada.',
    defaultCid10: 'I10'
  },
  {
    id: 'lme_medicamentos',
    title: 'LME — Medicamentos Especializados (Alto Custo / CEAF)',
    shortTitle: 'LME Farmácia Alto Custo',
    system: 'Hórus, SIA/SUS e CEAF',
    complexity: 'Alta Complexidade',
    category: 'lme',
    description: 'Solicitação, avaliação e dispensação de medicamentos do Componente Especializado da Assistência Farmacêutica sob PCDT/MS.',
    badge: 'CEAF / Alto Custo',
    defaultSigtap: '06.04.01.001-0',
    defaultProcedure: 'Componente Especializado da Assistência Farmacêutica',
    defaultJustification: 'Paciente preenche integralmente os critérios de inclusão do Protocolo Clínico e Diretrizes Terapêuticas (PCDT) do Ministério da Saúde. Apresenta refratariedade ou intolerância às linhas terapêuticas básicas do SUS.',
    defaultCid10: 'M05.8'
  },
  {
    id: 'siscan_citopatologico',
    title: 'Requisição de Exame Citopatológico do Colo do Útero (SISCAN / Preventivo)',
    shortTitle: 'SISCAN Citopatológico',
    system: 'SISCAN e Atenção Primária',
    complexity: 'Atenção Básica',
    category: 'siscan',
    description: 'Coleta de preventivo do colo uterino (Papanicolau) para rastreamento de lesões precursoras na população-alvo de 25 a 64 anos.',
    badge: 'Saúde da Mulher',
    defaultSigtap: '02.03.01.001-9',
    defaultProcedure: 'Exame Citopatológico Cérvico-Vaginal / Microflora',
    defaultJustification: 'Rastreamento citopatológico de rotina do colo do útero em mulher assintomática na faixa etária prioritária, conforme diretrizes do Ministério da Saúde / INCA.',
    defaultCid10: 'Z12.4'
  },
  {
    id: 'gal_lacen_geral',
    title: 'Requisição Geral de Exames Laboratoriais (GAL / LACEN)',
    shortTitle: 'GAL LACEN Geral',
    system: 'GAL, SINAN e Vigilância',
    complexity: 'Vigilância Laboratorial',
    category: 'gal',
    description: 'Amostras biológicas para o LACEN: Arboviroses (Dengue, Chikungunya, Zika), Hepatites virais, HIV, Sífilis, Meningites, Vírus respiratórios.',
    badge: 'Vigilância Epidemiológica',
    defaultSigtap: '02.02.03.030-9',
    defaultProcedure: 'Pesquisa Laboratorial de Agravos de Notificação Compulsória',
    defaultJustification: 'Caso suspeito de agravo sob vigilância epidemiológica com notificação preenchida no SINAN. Coleta de amostra em fase oportuna para diagnóstico confirmatório no LACEN.',
    defaultCid10: 'A90'
  },
  {
    id: 'siscan_histopatologico',
    title: 'Requisição de Exame Histopatológico (SISCAN / Biópsia)',
    shortTitle: 'SISCAN Histopatológico',
    system: 'SISCAN e SIA/SUS',
    complexity: 'Alta Complexidade',
    category: 'siscan',
    description: 'Exame anátomo-patológico de fragmentos e biópsias mamárias (core-biopsy, mamotomia) e ginecológicas (colo uterino, CAF/LEEP, conização).',
    badge: 'Biópsia & Patologia',
    defaultSigtap: '02.03.02.003-0',
    defaultProcedure: 'Exame Histopatológico de Biópsia',
    defaultJustification: 'Material biológico obtido por biópsia dirigida para elucidação diagnóstica de lesão nodular/tecidual suspeita identificada em exame clínico ou por método de imagem prévio.',
    defaultCid10: 'N87.2'
  },
  {
    id: 'siscan_mamografia',
    title: 'Requisição de Mamografia (SISCAN / Rastreamento e Diagnóstica)',
    shortTitle: 'SISCAN Mamografia',
    system: 'SISCAN e SIA/SUS',
    complexity: 'Média Complexidade',
    category: 'siscan',
    description: 'Mamografia de rastreamento bienal na faixa de 50 a 69 anos ou diagnóstica com indicação clínica e nódulo palpável.',
    badge: 'Saúde da Mulher',
    defaultSigtap: '02.04.03.018-8',
    defaultProcedure: 'Mamografia Bilateral de Rastreamento',
    defaultJustification: 'Mulher assintomática na faixa etária prioritária de 50 a 69 anos para rastreamento bienal do câncer de mama conforme protocolo INCA/MS.',
    defaultCid10: 'Z12.3'
  },
  {
    id: 'gal_trm_tb',
    title: 'Requisição de TRM-TB / Tuberculose (GAL / GeneXpert e BAAR)',
    shortTitle: 'GAL TRM-TB Tuberculose',
    system: 'GAL, SINAN e SVSA',
    complexity: 'Vigilância Laboratorial',
    category: 'gal',
    description: 'Diagnóstico molecular rápido da tuberculose (GeneXpert MTB/RIF) e resistência à Rifampicina, além de Baciloscopia (BAAR) e Cultura.',
    badge: 'Vigilância TB',
    defaultSigtap: '02.02.08.016-0',
    defaultProcedure: 'Teste Rápido Molecular para Tuberculose (TRM-TB)',
    defaultJustification: 'Sintomático respiratório com tosse produtiva há mais de 3 semanas, febre vespertina e perda ponderal. Indicação de diagnóstico rápido com pesquisa de mutação de resistência à rifampicina.',
    defaultCid10: 'A15.0'
  }
];

/**
 * Regra dos documentos SUS: a folha só traz o que está no formulário. Campo
 * vazio sai como "—" / "não informado" — nunca um código, exame, data ou
 * achado clínico padrão que o médico não digitou.
 */
const VAZIO = '—';

/** Função renal como informada; cada valor ausente é dito como ausente (nunca um "normal" presumido). */
function funcaoRenal(data: SusFilledFormData): string {
  const creatinina = data.renalCreatinine?.trim();
  const etfg = data.renalEtfg?.trim();
  return `Creatinina: ${creatinina ? `${creatinina} mg/dL` : 'não informada'} | eTFG: ${etfg ? `${etfg} mL/min/1,73m²` : 'não informada'}`;
}

export function buildSusDocumentMarkdown(item: SusDocumentItem, data: SusFilledFormData): string {
  const today = new Date().toLocaleDateString('pt-BR');
  const fullAddress = [
    data.patientAddress,
    data.patientNeighborhood ? `Bairro: ${data.patientNeighborhood}` : '',
    data.patientCity ? `${data.patientCity} - ${data.patientState || 'SP'}` : '',
    data.patientCep ? `CEP: ${data.patientCep}` : ''
  ].filter(Boolean).join(', ') || 'Endereço não informado';

  let specificDetails = '';

  if (item.id === 'apac_principal' || item.id === 'apac_complementar') {
    specificDetails = `
### Procedimento SIGTAP & Justificativa de Alta Complexidade
- **Código SIGTAP**: ${data.sigtapCode || VAZIO}
- **Procedimento**: ${data.procedureName || VAZIO}
- **CID-10 Principal**: ${data.cid10Code || VAZIO}${data.cid10Description ? ' — ' + data.cid10Description : ''}
${item.id === 'apac_complementar' ? `
- **Função Renal**: ${funcaoRenal(data)}
- **Meio de Contraste**: ${data.isContrastNeeded ? 'Indicado e indispensável para delimitação tecidual' : 'Sem indicação de contraste'}
` : ''}
- **Justificativa Clínica Anti-Glosa**:
${data.clinicalJustification || VAZIO}
`;
  } else if (item.id === 'lme_medicamentos') {
    const medicamentos = medicamentosDaLme(data);
    const linhasDeMedicamento = medicamentos.length > 0
      ? medicamentos.map((m, i) => {
          const quantidades = (m.quantities || []).map((q) => q?.trim() || VAZIO);
          const porMes = quantidades.some((q) => q !== VAZIO) ? ` | quantidade do 1º ao 6º mês: ${quantidades.join(' / ')}` : '';
          return `- **Medicamento ${i + 1}**: ${m.name?.trim() || VAZIO}${porMes}`;
        }).join('\n')
      : `- **Medicamento**: ${VAZIO}`;
    specificDetails = `
### Medicamento(s) do Componente Especializado Solicitado(s)
${linhasDeMedicamento}
- **CID-10**: ${data.cid10Code || VAZIO}${data.cid10Description ? ' — ' + data.cid10Description : ''}
- **Justificativa conforme PCDT**:
${data.clinicalJustification || VAZIO}
`;
  } else if (item.id === 'siscan_citopatologico' || item.id === 'siscan_mamografia' || item.id === 'siscan_histopatologico') {
    specificDetails = `
### Parâmetros SISCAN & Saúde da Mulher
- **Procedimento**: ${data.procedureName || VAZIO} (SIGTAP: ${data.sigtapCode || VAZIO})
- **CID-10**: ${data.cid10Code || VAZIO}
${data.gynecologyDum ? `- **Data da Última Menstruação (DUM)**: ${data.gynecologyDum}` : ''}
${data.gynecologyPreviousExam ? `- **Exame Preventivo Anterior**: ${data.gynecologyPreviousExam}` : ''}
${data.specimenType ? `- **Topografia / Espécime da Amostra**: ${data.specimenType}` : ''}
- **Indicação Clínica / Achados**:
${data.clinicalJustification || VAZIO}
`;
  } else if (item.id === 'gal_lacen_geral' || item.id === 'gal_trm_tb') {
    specificDetails = `
### Vigilância Epidemiológica & LACEN
- **Nº Notificação SINAN**: ${data.sinanNumber || 'Preenchimento obrigatório na unidade'}
- **Data de Início dos Primeiros Sintomas (D1)**: ${data.symptomsStartDate || 'não informada'}
${data.tuberculosisSymptomsDuration ? `- **Duração dos Sintomas Respiratórios**: ${data.tuberculosisSymptomsDuration}` : ''}
- **Amostra / Metodologia**: ${data.specimenType || 'não informada'} — ${data.procedureName || VAZIO} (SIGTAP: ${data.sigtapCode || VAZIO})
- **Hipótese Diagnóstica (CID-10)**: ${data.cid10Code || VAZIO}
- **Justificativa Clínica**:
${data.clinicalJustification || VAZIO}
`;
  } else {
    // Guia SISREG
    specificDetails = `
### Dados da Regulação SISREG
- **Especialidade / Procedimento**: ${data.procedureName || VAZIO}
- **Código SIGTAP**: ${data.sigtapCode || VAZIO}
- **Hipótese Diagnóstica (CID-10)**: ${data.cid10Code || VAZIO}${data.cid10Description ? ' — ' + data.cid10Description : ''}
- **Resumo Clínico & Justificativa**:
${data.clinicalJustification || VAZIO}
`;
  }

  return `# ${item.title}
*Documento Regulatório Oficial — ${item.system}*

---

## 1. Identificação da Unidade e do Médico Solicitante
- **Unidade de Saúde**: ${data.doctorClinicName || 'Unidade Básica de Saúde'} | **CNES**: ${data.doctorCnes || '—'}
- **Médico(a) Solicitante**: ${data.doctorName || 'Dr(a). Médico(a)'}
- **CRM / UF**: ${data.doctorCrm}-${data.doctorCrmState || 'SP'} | **Especialidade**: ${data.doctorSpecialty || 'Clínica Médica'}${data.doctorCpf ? ` | **CPF Médico**: ${data.doctorCpf}` : ''}
- **Data da Solicitação**: ${today}

---

## 2. Identificação do Paciente
- **Nome Completo**: ${data.patientName || 'Não identificado'}
- **Cartão Nacional de Saúde (CNS)**: ${data.patientCns || 'Não informado'} | **CPF**: ${data.patientCpf || 'Não informado'}
- **Data de Nascimento**: ${data.patientBirthDate || 'Não informada'} (${data.patientAge || '—'} anos) | **Sexo**: ${data.patientGender === 'female' ? 'Feminino' : data.patientGender === 'male' ? 'Masculino' : 'Outro'}
- **Nome da Mãe**: ${data.patientMotherName || 'Não informado'}
- **Telefone**: ${data.patientPhone || 'Não informado'}
- **Endereço Completo**: ${fullAddress}

---

## 3. Dados Clínicos e Regulatórios
${specificDetails}

---

## 4. Assinatura e Carimbo
____________________________________________________  
**${data.doctorName || 'Dr(a). Médico(a)'}**  
CRM-${data.doctorCrmState || 'SP'} ${data.doctorCrm} • ${data.doctorSpecialty || 'Médico(a)'}  
${data.doctorClinicName || 'Rede de Atenção à Saúde'}  
`;
}

/**
 * Logos do cabeçalho dos documentos SUS sem impresso nacional (guia SISREG,
 * GAL/LACEN, SISCAN, TRM-TB): o do SUS e o do órgão do local de atendimento
 * (ex.: SEMUSA), que vem do posto de trabalho ativo — nunca fixo no código.
 */
export interface TimbreSus {
  logoSus?: string;
  logoLocal?: string;
}

/**
 * Logos de um documento SUS. A regulação da APAC é estadual, então o cabeçalho
 * leva o logo do estado; nos demais, o do órgão do posto de trabalho ativo.
 */
export function timbreDoDocumentoSus(item: SusDocumentItem, logoDoLocal?: string): TimbreSus {
  return { logoSus: LOGO_DO_SUS, logoLocal: item.category === 'apac' ? LOGO_DO_ESTADO : logoDoLocal };
}

/** Largura reservada de cada lado do título; cabe o logo largo do estado sem apertar o do SUS. */
const LARGURA_DO_LOGO_PX = 130;

function cabecalhoSus(item: SusDocumentItem, timbre?: TimbreSus): string {
  const titulo = `
        <h2 style="font-size: 15px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(item.title)}</h2>
        <p style="font-size: 11px; margin: 3px 0 0 0; color: #475569; font-weight: bold;">SISTEMA ÚNICO DE SAÚDE — ${escapeHtml(item.system)} &nbsp;|&nbsp; ${escapeHtml(item.complexity)}</p>`;

  const logoLocal = timbre?.logoLocal && timbre.logoLocal !== timbre.logoSus ? timbre.logoLocal : '';
  const logoSus = timbre?.logoSus || '';
  if (!logoLocal && !logoSus) {
    return `
      <div style="border-bottom: 2px solid #0F172A; padding-bottom: 8px; margin-bottom: 12px; text-align: center;">${titulo}
      </div>`;
  }

  // Cada lado ocupa a mesma largura (com ou sem logo), para o título ficar centralizado na folha.
  const lado = (src: string, alt: string, larguraMaxima: number) => `
        <div style="width: ${LARGURA_DO_LOGO_PX}px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          ${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="max-width: ${larguraMaxima}px; max-height: 78px; object-fit: contain;" />` : ''}
        </div>`;

  return `
      <div style="display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #0F172A; padding-bottom: 8px; margin-bottom: 12px;">${lado(logoLocal, 'Logotipo do órgão do local de atendimento', LARGURA_DO_LOGO_PX)}
        <div style="flex: 1; min-width: 0; text-align: center;">${titulo}
        </div>${lado(logoSus, 'Logotipo do SUS', 100)}
      </div>`;
}

function gradeTecnicaComplementarSus(item: SusDocumentItem, data: SusFilledFormData): string {
  const caixaEstilo = 'border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; font-size: 10.5px; background-color: #FFFFFF; page-break-inside: avoid; break-inside: avoid;';
  const tituloSecaoEstilo = 'margin: 0 0 5px 0; font-weight: bold; font-size: 11px; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; text-transform: uppercase;';

  switch (item.id) {
    case 'apac_complementar':
      return `
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 3 — MODALIDADE DE IMAGEM, HISTÓRIA CLÍNICA E TRATAMENTOS PRÉVIOS</p>
        <p style="margin: 3px 0;"><strong>Modalidade:</strong> [ ] TC &nbsp;&nbsp; [ ] RM &nbsp;&nbsp; [ ] Cintilografia &nbsp;&nbsp; [ ] Angio-TC / Angio-RM</p>
        <p style="margin: 3px 0;"><strong>Tratamentos Prévios Realizados:</strong> [ ] Analgesia Escalonada / AINEs &nbsp;&nbsp; [ ] Fisioterapia Motora &nbsp;&nbsp; [ ] Outros</p>
        <p style="margin: 3px 0;"><strong>Exames de Menor Complexidade Prévios:</strong> [ ] Radiografia Simples &nbsp;&nbsp; [ ] Ultrassonografia &nbsp;&nbsp; [ ] Tomografia Sem Contraste</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 4 — JUSTIFICATIVA DE MEIO DE CONTRASTE, FUNÇÃO RENAL E FATORES DE RISCO</p>
        <p style="margin: 3px 0;"><strong>Uso de Contraste Endovenoso:</strong> ${data.isContrastNeeded ? '[X] Sim (Indicado para delimitação tecidual/vascular) &nbsp;&nbsp; [ ] Não' : '[ ] Sim &nbsp;&nbsp; [X] Não'}</p>
        <p style="margin: 3px 0;"><strong>Função Renal:</strong> ${escapeHtml(funcaoRenal(data))}</p>
        <p style="margin: 3px 0;"><strong>Fatores de Risco Renal / Alergia:</strong> [ ] DRC &nbsp;&nbsp; [ ] Diabetes &nbsp;&nbsp; [ ] HAS &nbsp;&nbsp; [ ] Mieloma &nbsp;&nbsp; [ ] ICC &nbsp;&nbsp; [ ] Asma &nbsp;&nbsp; [ ] Uso de Metformina &nbsp;&nbsp; [ ] Alergia prévia ao contraste</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 5 — TRIAGEM DE SEGURANÇA EM CAMPO MAGNÉTICO (RM) E CIÊNCIA</p>
        <p style="margin: 3px 0;">[ ] Dispositivo cardíaco eletrônico implantável (DCEI / CDI) &nbsp;&nbsp; [ ] Clipe de aneurisma cerebral ferromagnético &nbsp;&nbsp; [ ] Prótese valvar metálica</p>
        <p style="margin: 3px 0;">[ ] Implante coclear / Neuroestimulador &nbsp;&nbsp; [ ] Fragmento metálico intraocular &nbsp;&nbsp; [ ] Ausência de implantes restritivos</p>
      </div>`;

    case 'sisreg_guia':
      return `
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 3 — CLASSIFICAÇÃO DE RISCO REGULATÓRIO E MODALIDADE (SISREG III)</p>
        <p style="margin: 3px 0;"><strong>Prioridade Clínica:</strong> [ ] Vermelho (Emergência / Alta Suspeita Oncológica) &nbsp;&nbsp; [ ] Amarelo (Prioritário) &nbsp;&nbsp; [ ] Verde (Moderada) &nbsp;&nbsp; [ ] Azul (Eletivo)</p>
        <p style="margin: 3px 0;"><strong>Modalidade:</strong> [ ] 1ª Consulta Especializada &nbsp;&nbsp; [ ] Retorno / Seguimento &nbsp;&nbsp; [ ] Ecocardiograma / USG / RX Especializado &nbsp;&nbsp; [ ] Outro Exame</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 4 — REAVALIAÇÃO NA ATENÇÃO PRIMÁRIA E EXAMES BÁSICOS PRÉVIOS</p>
        <p style="margin: 3px 0;"><strong>Recursos da APS já otimizados:</strong> [ ] Manejo farmacológico escalonado &nbsp;&nbsp; [ ] Exames laboratoriais / imagem de triagem anexados</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 5 — CAMPO DA CENTRAL DE REGULAÇÃO (SISREG) E CONTRARREFERÊNCIA</p>
        <p style="margin: 3px 0;"><strong>Nº da Solicitação SISREG:</strong> ______________________ &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Status:</strong> [ ] Aprovado &nbsp; [ ] Pendente &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Agendamento:</strong> ___/___/_____ às ___:___ h</p>
        <p style="margin: 3px 0;"><strong>Contrarreferência (Especialista &rarr; APS):</strong> Conduta e plano de seguimento na UBS: ____________________________________________________</p>
      </div>`;

    case 'siscan_citopatologico':
      return `
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 3 — MOTIVO DO EXAME E ANAMNESE GINECOLÓGICA (SISCAN)</p>
        <p style="margin: 3px 0;"><strong>Motivo do Exame:</strong> [ ] Rastreamento (25 a 64 anos) &nbsp;&nbsp; [ ] Repetição (ASC-US / Baixo Grau) &nbsp;&nbsp; [ ] Seguimento Pós-Tratamento</p>
        <p style="margin: 3px 0;"><strong>DUM (Última Menstruação):</strong> ${escapeHtml(data.gynecologyDum || VAZIO)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Exame Citopatológico Anterior:</strong> ${escapeHtml(data.gynecologyPreviousExam || VAZIO)}</p>
        <p style="margin: 3px 0;"><strong>Condições:</strong> Usa DIU: [ ] Sim [ ] Não &nbsp;|&nbsp; Gestante: [ ] Sim [ ] Não &nbsp;|&nbsp; Menopausa / TRH: [ ] Sim [ ] Não &nbsp;|&nbsp; Vacina HPV: [ ] Sim [ ] Não &nbsp;|&nbsp; Sangramento pós-coito: [ ] Sim [ ] Não</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 4 — INSPEÇÃO CLÍNICA DO COLO UTERINO, COLETA E LAUDO BETHESDA</p>
        <p style="margin: 3px 0;"><strong>Inspeção do Colo:</strong> [ ] Normal &nbsp;&nbsp; [ ] Ausente (Histerectomia) &nbsp;&nbsp; [ ] Ectopia / Erosão &nbsp;&nbsp; [ ] Atrofia &nbsp;&nbsp; [ ] Pólipo &nbsp;&nbsp; [ ] Lesão Suspeita</p>
        <p style="margin: 3px 0;"><strong>Sinais de IST:</strong> [ ] Não [ ] Sim &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Adequabilidade / Bethesda (Laboratório):</strong> [ ] Satisfatória [ ] Insatisfatória &nbsp;|&nbsp; [ ] Normal [ ] Benigno [ ] ASC-US [ ] LSIL [ ] HSIL</p>
      </div>`;

    case 'gal_lacen_geral':
      return `
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 3 — VIGILÂNCIA EPIDEMIOLÓGICA, AGRAVO SUSPEITO E NOTIFICAÇÃO SINAN</p>
        <p style="margin: 3px 0;"><strong>Nº da Notificação SINAN:</strong> ${escapeHtml(data.sinanNumber || VAZIO)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Início dos Sintomas (D1):</strong> ${escapeHtml(data.symptomsStartDate || 'não informada')}</p>
        <p style="margin: 3px 0;"><strong>Agravo Suspeito:</strong> [ ] Dengue &nbsp; [ ] Chikungunya &nbsp; [ ] Zika &nbsp; [ ] Oropouche/Mayaro &nbsp; [ ] Febre Amarela &nbsp; [ ] Malária &nbsp; [ ] Hepatite A/B/C &nbsp; [ ] HIV/Sífilis &nbsp; [ ] Leptospirose &nbsp; [ ] Vírus Respiratórios</p>
        <p style="margin: 3px 0;"><strong>Sintomas:</strong> [ ] Febre &nbsp; [ ] Cefaleia &nbsp; [ ] Mialgia &nbsp; [ ] Artralgia &nbsp; [ ] Exantema &nbsp; [ ] Icterícia &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Finalidade:</strong> [ ] Caso Suspeito &nbsp; [ ] Surto &nbsp; [ ] Controle</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 4 — AMOSTRA BIOLÓGICA, METODOLOGIA E TRANSPORTE (GAL / LACEN)</p>
        <p style="margin: 3px 0;"><strong>Material Biológico Coletado:</strong> ${escapeHtml(data.specimenType || 'não informado')} &nbsp;&nbsp; ([ ] Soro &nbsp; [ ] Sangue Total &nbsp; [ ] Plasma &nbsp; [ ] LCR &nbsp; [ ] Swab &nbsp; [ ] Urina)</p>
        <p style="margin: 3px 0;"><strong>Metodologia:</strong> [ ] RT-PCR / Biologia Molecular &nbsp;&nbsp; [ ] Sorologia (ELISA / IgM / IgG) &nbsp;&nbsp; [ ] Isolamento / Cultura &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Transporte:</strong> [ ] Refrigerada (2–8 °C) &nbsp; [ ] Congelada (-20 °C)</p>
      </div>`;

    case 'siscan_histopatologico':
      return `
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 3 — TOPOGRAFIA DO MATERIAL, PROCEDIMENTO E FIXAÇÃO (SISCAN)</p>
        <p style="margin: 3px 0;"><strong>Sítio / Origem:</strong> [ ] Colo do Útero — Biópsia &nbsp;&nbsp; [ ] Colo do Útero — CAF / LEEP / Conização &nbsp;&nbsp; [ ] Endométrio &nbsp;&nbsp; [ ] Mama — Core Biopsy (PAG) &nbsp;&nbsp; [ ] Mama — Peça Cirúrgica</p>
        <p style="margin: 3px 0;"><strong>Topografia / Lateralidade da Amostra:</strong> ${escapeHtml(data.specimenType || VAZIO)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Conservação:</strong> [ ] Formol Tamponado 10% &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Nº de Frascos:</strong> _____</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 4 — CORRELAÇÃO COLPOSCÓPICA OU RADIOLÓGICA PRÉVIA (BI-RADS)</p>
        <p style="margin: 3px 0;"><strong>Mama (BI-RADS):</strong> [ ] 0 &nbsp; [ ] 3 &nbsp; [ ] 4A &nbsp; [ ] 4B &nbsp; [ ] 4C &nbsp; [ ] 5 &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Colo (Citologia/Colposcopia):</strong> [ ] Normal &nbsp; [ ] LSIL &nbsp; [ ] HSIL &nbsp; [ ] Lesão vegetante/ulcerada</p>
      </div>`;

    case 'siscan_mamografia':
      return `
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 3 — MODALIDADE DA MAMOGRAFIA, RAÇA/COR E RISCO FAMILIAR (SISCAN)</p>
        <p style="margin: 3px 0;"><strong>Modalidade:</strong> [ ] Mamografia de Rastreamento (50 a 69 anos) &nbsp;&nbsp; [ ] Mamografia Diagnóstica (Lesão palpável / Controle radiológico)</p>
        <p style="margin: 3px 0;"><strong>Raça/Cor:</strong> [ ] Branca &nbsp; [ ] Preta &nbsp; [ ] Parda &nbsp; [ ] Amarela &nbsp; [ ] Indígena &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Risco Elevado (1º Grau):</strong> [ ] Sim [ ] Não &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Mamografia Anterior:</strong> ${escapeHtml(data.gynecologyPreviousExam || VAZIO)}</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 4 — EXAME CLÍNICO DAS MAMAS (ECM) E LAUDO RADIOLÓGICO (BI-RADS)</p>
        <p style="margin: 3px 0;"><strong>Mama Direita:</strong> [ ] Sem achados palpáveis &nbsp;&nbsp; [ ] Nódulo &nbsp;&nbsp; [ ] Espessamento &nbsp;&nbsp; [ ] Descarga papilar &nbsp;&nbsp; [ ] Linfonodo axilar</p>
        <p style="margin: 3px 0;"><strong>Mama Esquerda:</strong> [ ] Sem achados palpáveis &nbsp;&nbsp; [ ] Nódulo &nbsp;&nbsp; [ ] Espessamento &nbsp;&nbsp; [ ] Descarga papilar &nbsp;&nbsp; [ ] Linfonodo axilar</p>
        <p style="margin: 3px 0;"><strong>BI-RADS (Prestador):</strong> Mama D: [ ] 0 [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5 [ ] 6 &nbsp;&nbsp;|&nbsp;&nbsp; Mama E: [ ] 0 [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5 [ ] 6</p>
      </div>`;

    case 'gal_trm_tb':
      return `
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 3 — PERFIL CLÍNICO-EPIDEMIOLÓGICO E POPULAÇÕES ESPECIAIS (SVSA / GAL)</p>
        <p style="margin: 3px 0;"><strong>Tipo de Entrada:</strong> [ ] Sintomático Respiratório / Caso Novo &nbsp;&nbsp; [ ] Retratamento após Interrupção &nbsp;&nbsp; [ ] Recidiva &nbsp;&nbsp; [ ] Falência ao Esquema Básico</p>
        <p style="margin: 3px 0;"><strong>População Vulnerável:</strong> [ ] População Geral &nbsp;&nbsp; [ ] PVHIV &nbsp;&nbsp; [ ] Privado de Liberdade (PPL) &nbsp;&nbsp; [ ] Situação de Rua &nbsp;&nbsp; [ ] Profissional de Saúde &nbsp;&nbsp; [ ] Indígena</p>
        <p style="margin: 3px 0;"><strong>Comorbidades / Forma:</strong> [ ] HIV &nbsp; [ ] Diabetes &nbsp; [ ] Tabagismo &nbsp; [ ] Álcool/Drogas &nbsp;&nbsp;|&nbsp;&nbsp; [ ] Pulmonar &nbsp; [ ] Extrapulmonar &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Tosse:</strong> ${escapeHtml(data.tuberculosisSymptomsDuration || 'não informada')} &nbsp;|&nbsp; <strong>SINAN:</strong> ${escapeHtml(data.sinanNumber || VAZIO)}</p>
      </div>
      <div style="${caixaEstilo}">
        <p style="${tituloSecaoEstilo}">SEÇÃO 4 — AMOSTRA E ENSAIOS SOLICITADOS (TRM-TB / BAAR / CULTURA)</p>
        <p style="margin: 3px 0;"><strong>Amostra:</strong> ${escapeHtml(data.specimenType || 'não informada')} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Coleta:</strong> [ ] 1ª Amostra (ato) &nbsp;&nbsp; [ ] 2ª Amostra (jejum) &nbsp;&nbsp; [ ] LBA / Líquido Pleural</p>
        <p style="margin: 3px 0;"><strong>Exames:</strong> [ ] TRM-TB (GeneXpert MTB/RIF) &nbsp;&nbsp; [ ] Baciloscopia Direta (BAAR) &nbsp;&nbsp; [ ] Cultura para Micobactérias + TSA</p>
      </div>`;

    default:
      return '';
  }
}

export function buildSusDocumentHtml(item: SusDocumentItem, data: SusFilledFormData, timbre?: TimbreSus): string {
  const today = new Date().toLocaleDateString('pt-BR');
  const fullAddress = [
    data.patientAddress,
    data.patientNeighborhood ? `Bairro: ${data.patientNeighborhood}` : '',
    data.patientCity ? `${data.patientCity} - ${data.patientState || 'SP'}` : '',
    data.patientCep ? `CEP: ${data.patientCep}` : ''
  ].filter(Boolean).join(', ') || 'Endereço não informado';
  // Nascimento em dd/mm/aaaa e idade sem repetir a unidade ("36 anos", nunca "36 anos anos")
  const nascimento = /^\d{4}-\d{2}-\d{2}$/.test(data.patientBirthDate || '')
    ? data.patientBirthDate.split('-').reverse().join('/')
    : (data.patientBirthDate || '—');
  const idadeBruta = (data.patientAge || '').trim();
  const idade = idadeBruta && !/[a-zA-Z]/.test(idadeBruta) ? `${idadeBruta} anos` : idadeBruta;

  return `
    <div class="sus-document-rendered" style="font-family: inherit; line-height: 1.5; color: #0F172A;">${cabecalhoSus(item, timbre)}

      <div style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; font-size: 11px; page-break-inside: avoid; break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span><strong>Unidade Solicitante:</strong> ${escapeHtml(data.doctorClinicName || 'Unidade de Saúde')}</span>
          <span><strong>CNES:</strong> ${escapeHtml(data.doctorCnes || '—')}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span><strong>Profissional:</strong> ${escapeHtml(data.doctorName || 'Dr(a). Médico(a)')} &nbsp;|&nbsp; <strong>CRM:</strong> ${escapeHtml(data.doctorCrm)}-${escapeHtml(data.doctorCrmState || 'SP')}</span>
          <span><strong>Data:</strong> ${escapeHtml(today)}</span>
        </div>
      </div>

      <div style="border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; font-size: 11px; page-break-inside: avoid; break-inside: avoid;">
        <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 12px; color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px;">
          SEÇÃO 1 — IDENTIFICAÇÃO DO PACIENTE
        </p>
        <p style="margin: 3px 0;"><strong>Paciente:</strong> ${escapeHtml(data.patientName || 'Não identificado')} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>CNS (Cartão SUS):</strong> ${escapeHtml(data.patientCns || '—')} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>CPF:</strong> ${escapeHtml(data.patientCpf || '—')}</p>
        <p style="margin: 3px 0;"><strong>Nascimento:</strong> ${escapeHtml(nascimento)}${idade ? ` (${escapeHtml(idade)})` : ''} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Mãe:</strong> ${escapeHtml(data.patientMotherName || '—')} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Tel:</strong> ${escapeHtml(data.patientPhone || '—')}</p>
        <p style="margin: 3px 0;"><strong>Endereço:</strong> ${escapeHtml(fullAddress)}</p>
      </div>

      <div style="border: 1px solid #94A3B8; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; font-size: 11px; page-break-inside: avoid; break-inside: avoid;">
        <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 12px; color: #0369A1; text-transform: uppercase;">
          SEÇÃO 2 — PROCEDIMENTO &amp; DADOS CLÍNICOS REGULATÓRIOS
        </p>
        <p style="margin: 3px 0;"><strong>Procedimento SIGTAP:</strong> ${escapeHtml(data.sigtapCode || VAZIO)} — ${escapeHtml(data.procedureName || VAZIO)}</p>
        <p style="margin: 3px 0;"><strong>Diagnóstico / CID-10:</strong> ${escapeHtml(data.cid10Code || VAZIO)} ${data.cid10Description ? `(${escapeHtml(data.cid10Description)})` : ''}</p>
        ${data.sinanNumber ? `<p style="margin: 3px 0;"><strong>Nº Notificação SINAN:</strong> ${escapeHtml(data.sinanNumber)} &nbsp;|&nbsp; <strong>Início dos Sintomas (D1):</strong> ${escapeHtml(data.symptomsStartDate || 'não informado')}</p>` : ''}
        ${item.id === 'apac_complementar' || data.renalCreatinine || data.renalEtfg ? `<p style="margin: 3px 0;"><strong>Função Renal:</strong> ${escapeHtml(funcaoRenal(data))}</p>` : ''}
        
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #CBD5E1;">
          <p style="margin: 0 0 3px 0; font-weight: bold; color: #334155;">Justificativa Técnica (Anti-Glosa):</p>
          <p style="margin: 0; text-align: justify; color: #1E293B;">${escapeHtml(data.clinicalJustification || VAZIO)}</p>
        </div>
      </div>${gradeTecnicaComplementarSus(item, data)}

      <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px;">
        <div>
          <p style="margin: 0;">${data.patientCity ? `${escapeHtml(data.patientCity)}, ` : ''}${escapeHtml(today)}</p>
        </div>
        <div style="text-align: center; min-width: 240px;">
          <div style="border-top: 1px solid #0F172A; padding-top: 4px;">
            <p style="font-size: 11px; font-weight: bold; margin: 0; text-transform: uppercase;">${escapeHtml(data.doctorName || 'Dr(a). Médico(a)')}</p>
            <p style="font-size: 10px; color: #475569; margin: 0;">CRM-${escapeHtml(data.doctorCrmState || 'SP')} ${escapeHtml(data.doctorCrm)} • ${escapeHtml(data.doctorSpecialty || 'Médico(a)')}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

