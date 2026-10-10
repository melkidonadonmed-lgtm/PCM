import { SusDocumentItem, SusFilledFormData } from '../types';

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
- **Código SIGTAP**: ${data.sigtapCode || item.defaultSigtap || '02.07.01.006-4'}
- **Procedimento**: ${data.procedureName || item.defaultProcedure || 'Ressonância Magnética / Tomografia'}
- **CID-10 Principal**: ${data.cid10Code || item.defaultCid10 || 'M54.5'}${data.cid10Description ? ' — ' + data.cid10Description : ''}
${item.id === 'apac_complementar' ? `
- **Função Renal**: Creatinina: ${data.renalCreatinine || '1,0'} mg/dL | eTFG: ${data.renalEtfg || '> 60'} mL/min/1,73m²
- **Meio de Contraste**: ${data.isContrastNeeded ? 'Indicado e indispensável para delimitação tecidual' : 'Sem indicação de contraste'}
- **Triagem de Segurança para RM**: Sem marca-passo, clipes vasculares ferromagnéticos ou corpos estranhos metálicos intraoculares.
` : ''}
- **Justificativa Clínica Anti-Glosa**:
${data.clinicalJustification || item.defaultJustification}
`;
  } else if (item.id === 'lme_medicamentos') {
    specificDetails = `
### Medicamento(s) do Componente Especializado Solicitado(s)
- **Fármaco / Apresentação**: ${data.lmeMedicationName || 'Medicamento sob PCDT/MS'}
- **Posologia Diária**: ${data.lmeMedicationPosology || 'Conforme protocolo clínico'}
- **Quantidade Mensal**: ${data.lmeMedicationQuantityMonthly || '1 mês de tratamento'} (Previsão para até 6 meses)
- **CID-10**: ${data.cid10Code || item.defaultCid10 || 'M05.8'}${data.cid10Description ? ' — ' + data.cid10Description : ''}
- **Justificativa conforme PCDT**:
${data.clinicalJustification || item.defaultJustification}
`;
  } else if (item.id === 'siscan_citopatologico' || item.id === 'siscan_mamografia' || item.id === 'siscan_histopatologico') {
    specificDetails = `
### Parâmetros SISCAN & Saúde da Mulher
- **Procedimento**: ${data.procedureName || item.defaultProcedure} (SIGTAP: ${data.sigtapCode || item.defaultSigtap})
- **CID-10**: ${data.cid10Code || item.defaultCid10 || 'Z12.4'}
${data.gynecologyDum ? `- **Data da Última Menstruação (DUM)**: ${data.gynecologyDum}` : ''}
${data.gynecologyPreviousExam ? `- **Exame Preventivo Anterior**: ${data.gynecologyPreviousExam}` : ''}
${data.specimenType ? `- **Topografia / Espécime da Amostra**: ${data.specimenType}` : ''}
- **Indicação Clínica / Achados**:
${data.clinicalJustification || item.defaultJustification}
`;
  } else if (item.id === 'gal_lacen_geral' || item.id === 'gal_trm_tb') {
    specificDetails = `
### Vigilância Epidemiológica & LACEN
- **Nº Notificação SINAN**: ${data.sinanNumber || 'Preenchimento obrigatório na unidade'}
- **Data de Início dos Primeiros Sintomas (D1)**: ${data.symptomsStartDate || today}
${data.tuberculosisSymptomsDuration ? `- **Duração dos Sintomas Respiratórios**: ${data.tuberculosisSymptomsDuration}` : ''}
- **Amostra / Metodologia**: ${data.specimenType || 'Soro / Amostra Biológica padrão'} — ${data.procedureName || item.defaultProcedure} (SIGTAP: ${data.sigtapCode || item.defaultSigtap})
- **Hipótese Diagnóstica (CID-10)**: ${data.cid10Code || item.defaultCid10 || 'A90'}
- **Justificativa Clínica**:
${data.clinicalJustification || item.defaultJustification}
`;
  } else {
    // Guia SISREG
    specificDetails = `
### Dados da Regulação SISREG
- **Especialidade / Procedimento**: ${data.procedureName || item.defaultProcedure}
- **Código SIGTAP**: ${data.sigtapCode || item.defaultSigtap}
- **Hipótese Diagnóstica (CID-10)**: ${data.cid10Code || item.defaultCid10 || 'I10'}${data.cid10Description ? ' — ' + data.cid10Description : ''}
- **Resumo Clínico & Justificativa**:
${data.clinicalJustification || item.defaultJustification}
`;
  }

  return `# ${item.title}
*Documento Regulatório Oficial — ${item.system}*

---

## 1. Identificação da Unidade e do Médico Solicitante
- **Unidade de Saúde**: ${data.doctorClinicName || 'Unidade Básica de Saúde'} | **CNES**: ${data.doctorCnes || '2678942'}
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

export function buildSusDocumentHtml(item: SusDocumentItem, data: SusFilledFormData): string {
  const md = buildSusDocumentMarkdown(item, data);
  // Converte Markdown básico em HTML elegante para visualização ou TipTap
  const today = new Date().toLocaleDateString('pt-BR');
  const fullAddress = [
    data.patientAddress,
    data.patientNeighborhood ? `Bairro: ${data.patientNeighborhood}` : '',
    data.patientCity ? `${data.patientCity} - ${data.patientState || 'SP'}` : '',
    data.patientCep ? `CEP: ${data.patientCep}` : ''
  ].filter(Boolean).join(', ') || 'Endereço não informado';

  return `
    <div class="sus-document-rendered" style="font-family: inherit; line-height: 1.5; color: #0F172A;">
      <div style="border-bottom: 2px solid #0F172A; padding-bottom: 8px; margin-bottom: 12px; text-align: center;">
        <h2 style="font-size: 15px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${item.title}</h2>
        <p style="font-size: 11px; margin: 3px 0 0 0; color: #475569; font-weight: bold;">SISTEMA ÚNICO DE SAÚDE — ${item.system} &nbsp;|&nbsp; ${item.complexity}</p>
      </div>

      <div style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span><strong>Unidade Solicitante:</strong> ${data.doctorClinicName || 'Unidade de Saúde'}</span>
          <span><strong>CNES:</strong> ${data.doctorCnes || '2678942'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span><strong>Profissional:</strong> ${data.doctorName || 'Dr(a). Médico(a)'} &nbsp;|&nbsp; <strong>CRM:</strong> ${data.doctorCrm}-${data.doctorCrmState || 'SP'}</span>
          <span><strong>Data:</strong> ${today}</span>
        </div>
      </div>

      <div style="border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 11px;">
        <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 12px; color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px;">
          IDENTIFICAÇÃO DO PACIENTE
        </p>
        <p style="margin: 3px 0;"><strong>Paciente:</strong> ${data.patientName || 'Não identificado'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>CNS (Cartão SUS):</strong> ${data.patientCns || '—'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>CPF:</strong> ${data.patientCpf || '—'}</p>
        <p style="margin: 3px 0;"><strong>Nascimento:</strong> ${data.patientBirthDate || '—'} (${data.patientAge || '—'} anos) &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Mãe:</strong> ${data.patientMotherName || '—'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Tel:</strong> ${data.patientPhone || '—'}</p>
        <p style="margin: 3px 0;"><strong>Endereço:</strong> ${fullAddress}</p>
      </div>

      <div style="border: 1px solid #94A3B8; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; font-size: 11px;">
        <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 12px; color: #0369A1; text-transform: uppercase;">
          PROCEDIMENTO & DADOS CLÍNICOS REGULATÓRIOS
        </p>
        <p style="margin: 3px 0;"><strong>Procedimento SIGTAP:</strong> ${data.sigtapCode || item.defaultSigtap || '—'} — ${data.procedureName || item.defaultProcedure || '—'}</p>
        <p style="margin: 3px 0;"><strong>Diagnóstico / CID-10:</strong> ${data.cid10Code || item.defaultCid10 || '—'} ${data.cid10Description ? `(${data.cid10Description})` : ''}</p>
        ${data.sinanNumber ? `<p style="margin: 3px 0;"><strong>Nº Notificação SINAN:</strong> ${data.sinanNumber} &nbsp;|&nbsp; <strong>Início dos Sintomas (D1):</strong> ${data.symptomsStartDate || today}</p>` : ''}
        ${data.renalCreatinine ? `<p style="margin: 3px 0;"><strong>Função Renal:</strong> Creatinina ${data.renalCreatinine} mg/dL &nbsp;|&nbsp; eTFG: ${data.renalEtfg || '> 60'} mL/min</p>` : ''}
        
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #CBD5E1;">
          <p style="margin: 0 0 3px 0; font-weight: bold; color: #334155;">Justificativa Técnica (Anti-Glosa):</p>
          <p style="margin: 0; text-align: justify; color: #1E293B;">${data.clinicalJustification || item.defaultJustification}</p>
        </div>
      </div>

      <div style="margin-top: 32px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px;">
        <div>
          <p style="margin: 0;">${data.patientCity || 'Local'}, ${today}</p>
          <p style="margin: 2px 0 0 0; font-size: 9px; color: #64748B;">Documento emitido eletronicamente em conformidade com o SUS / CFM</p>
        </div>
        <div style="text-align: center; min-width: 240px;">
          <div style="border-top: 1px solid #0F172A; padding-top: 4px;">
            <p style="font-size: 11px; font-weight: bold; margin: 0; text-transform: uppercase;">${data.doctorName || 'Dr(a). Médico(a)'}</p>
            <p style="font-size: 10px; color: #475569; margin: 0;">CRM-${data.doctorCrmState || 'SP'} ${data.doctorCrm} • ${data.doctorSpecialty || 'Médico(a)'}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
