import { SavedDocument } from '../types';

export const PRESET_CLINICAL_TEMPLATES: SavedDocument[] = [
  {
    id: 'tpl-receita-ubs-pvh',
    title: 'Receita Simples 2 Vias — UBS Osvaldo Piana (SEMUSA)',
    contextId: 'ctx-ubs',
    isTemplate: true,
    createdAt: 1727500000000,
    updatedAt: 1727500000000,
    contentJson: null,
    contentHtml: `
      <div style="font-family: inherit;">
        <div style="border-bottom: 2px solid #0F172A; padding-bottom: 8px; margin-bottom: 12px; text-align: center;">
          <h2 style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase;">UNIDADE DE SAÚDE DA FAMÍLIA — OSVALDO PIANA</h2>
          <p style="font-size: 11px; margin: 2px 0; color: #475569;">Av. Campos Sales, 858 - Areal, Porto Velho - RO, 76804-358</p>
          <p style="font-size: 11px; font-weight: bold; margin: 4px 0 0 0; letter-spacing: 1px;">RECEITA MÉDICA (1ª E 2ª VIA)</p>
        </div>

        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px;">
          <p style="margin: 0; font-size: 12px;"><strong>Paciente:</strong> {{paciente_nome}} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Idade:</strong> {{paciente_idade}}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <p style="font-weight: bold; font-size: 13px; margin-bottom: 8px; color: #0369A1;">PRESCRIÇÃO MEDICAMENTOSA:</p>
          {{medicamentos_prescritos}}
        </div>

        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px dashed #CBD5E1;">
          <p style="font-size: 11px; color: #64748B; margin: 0;"><strong>Orientações Gerais:</strong> Tomar as medicações conforme os horários prescritos. Retornar à Unidade de Saúde em caso de febre persistente, piora dos sintomas ou reações adversas.</p>
        </div>

        <div style="margin-top: 36px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="font-size: 11px; margin: 0;">Porto Velho - RO, {{data_atendimento}}</p>
          </div>
          <div style="text-align: center; min-width: 200px;">
            <div style="border-top: 1px solid #0F172A; padding-top: 4px;">
              <p style="font-size: 11px; font-weight: bold; margin: 0;">Assinatura e Carimbo do Médico</p>
              <p style="font-size: 10px; color: #475569; margin: 0;">USF Osvaldo Piana / SEMUSA</p>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'tpl-receita-poc-sesau',
    title: 'Receita Simples 2 Vias — Policlínica Oswaldo Cruz (SESAU)',
    contextId: 'ctx-policlinica',
    isTemplate: true,
    createdAt: 1727500000001,
    updatedAt: 1727500000001,
    contentJson: null,
    contentHtml: `
      <div style="font-family: inherit;">
        <div style="border-bottom: 2px solid #0369A1; padding-bottom: 8px; margin-bottom: 12px; text-align: center;">
          <h2 style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase; color: #0C4A6E;">POC — POLICLÍNICA OSWALDO CRUZ</h2>
          <p style="font-size: 11px; margin: 2px 0; color: #475569;">Av. Gov. Jorge Teixeira, 3862 - Industrial, Porto Velho - RO &nbsp;|&nbsp; Tel: (69) 3216-5462</p>
          <p style="font-size: 11px; font-weight: bold; margin: 4px 0 0 0; color: #0284C7; letter-spacing: 1px;">PRESCRIÇÃO AMBULATORIAL ESPECIALIZADA</p>
        </div>

        <div style="background-color: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px;">
          <p style="margin: 0; font-size: 12px;"><strong>Paciente:</strong> {{paciente_nome}} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Idade/Data:</strong> {{paciente_idade}}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <p style="font-weight: bold; font-size: 13px; margin-bottom: 8px; color: #0369A1;">CONDUTA TERAPÊUTICA:</p>
          {{medicamentos_prescritos}}
        </div>

        <div style="margin-top: 28px; padding: 8px; background: #FAF5FF; border-left: 3px solid #9333EA; font-size: 11px;">
          <strong>Acompanhamento Ambulatorial:</strong> Manter uso regular das medicações. Trazer esta receita e exames complementares na próxima consulta de retorno agendada.
        </div>

        <div style="margin-top: 36px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="font-size: 11px; margin: 0;">Porto Velho - RO, {{data_atendimento}}</p>
          </div>
          <div style="text-align: center; min-width: 220px;">
            <div style="border-top: 1px solid #0F172A; padding-top: 4px;">
              <p style="font-size: 11px; font-weight: bold; margin: 0;">Assinatura e Carimbo Médico</p>
              <p style="font-size: 10px; color: #475569; margin: 0;">SESAU / Policlínica Oswaldo Cruz</p>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'tpl-receituario-controle-especial',
    title: 'Receituário de Controle Especial (Portaria 344/98 — 2 Vias)',
    contextId: 'global',
    isTemplate: true,
    createdAt: 1727500000002,
    updatedAt: 1727500000002,
    contentJson: null,
    contentHtml: `
      <div style="font-family: inherit; font-size: 11px;">
        <div style="border: 2px solid #0F172A; padding: 8px; margin-bottom: 10px; text-align: center;">
          <h2 style="font-size: 13px; font-weight: bold; margin: 0; text-transform: uppercase;">RECEITUÁRIO DE CONTROLE ESPECIAL</h2>
          <p style="font-size: 10px; font-weight: bold; margin: 2px 0 0 0; color: #475569;">1ª VIA: FARMÁCIA &nbsp;|&nbsp; 2ª VIA: PACIENTE (PORTARIA SVS/MS 344/98)</p>
        </div>

        <div style="border: 1px solid #94A3B8; padding: 6px 10px; margin-bottom: 10px; background-color: #F8FAFC;">
          <p style="font-weight: bold; margin: 0 0 4px 0; font-size: 10px; text-transform: uppercase; color: #1E293B;">IDENTIFICAÇÃO DO EMITENTE</p>
          <p style="margin: 0;"><strong>Médico:</strong> Dra. Giseli Nobres S Freitas &nbsp;|&nbsp; <strong>CRM:</strong> 4493-RO &nbsp;|&nbsp; <strong>RQE:</strong> 1866</p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #475569;">Endereço: Av. Campos Sales, 858 - Areal, Porto Velho - RO &nbsp;|&nbsp; Telefone: (69) 3901-2822</p>
        </div>

        <div style="border: 1px solid #94A3B8; padding: 6px 10px; margin-bottom: 12px;">
          <p style="margin: 0;"><strong>PACIENTE:</strong> {{paciente_nome}} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>IDADE:</strong> {{paciente_idade}}</p>
          <p style="margin: 3px 0 0 0;"><strong>ENDEREÇO:</strong> Porto Velho - RO</p>
        </div>

        <div style="min-height: 140px; padding: 8px; border: 1px dashed #94A3B8; margin-bottom: 12px;">
          <p style="font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; color: #0F172A;">PRESCRIÇÃO MEDICAMENTOSA:</p>
          <p style="margin: 0 0 6px 0;"><strong>1. Clonazepam 2,5 mg/mL (Gotas)</strong> ---------------------------- 01 frasco (vinte mililitros)</p>
          <p style="margin: 0 0 10px 16px; color: #334155;">Pingar 05 (cinco) gotas por via oral às 21:00 horas se insônia grave ou ansiedade aguda.</p>
          <p style="margin: 0 0 6px 0;"><strong>2. Sertralina 50 mg (Comprimidos)</strong> ------------------------ 60 comprimidos (sessenta comprimidos)</p>
          <p style="margin: 0 0 4px 16px; color: #334155;">Tomar 01 (um) comprimido por via oral pela manhã, após o café, diariamente durante 60 dias.</p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 14px;">
          <p style="margin: 0; font-size: 10px;">Data de Emissão: {{data_atendimento}}</p>
          <div style="text-align: center; width: 220px; border-top: 1px solid #0F172A; padding-top: 2px;">
            <p style="font-size: 10px; font-weight: bold; margin: 0;">Assinatura e Carimbo do Médico</p>
          </div>
        </div>

        <!-- Campos Regulamentares da Portaria 344/98 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9px; border-top: 2px solid #0F172A; padding-top: 8px;">
          <div style="border: 1px solid #CBD5E1; padding: 6px; background-color: #F8FAFC;">
            <p style="font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase; color: #1E293B;">IDENTIFICAÇÃO DO COMPRADOR</p>
            <p style="margin: 2px 0;">Nome: ________________________________________________</p>
            <p style="margin: 2px 0;">RG/CPF: __________________ Órgão Emissor: _________</p>
            <p style="margin: 2px 0;">Endereço: _____________________________________________</p>
            <p style="margin: 2px 0;">Cidade: Porto Velho &nbsp;|&nbsp; UF: RO &nbsp;|&nbsp; Tel: (____) ____________</p>
          </div>

          <div style="border: 1px solid #CBD5E1; padding: 6px; background-color: #F8FAFC;">
            <p style="font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase; color: #1E293B;">IDENTIFICAÇÃO DO FORNECEDOR</p>
            <p style="margin: 2px 0;">Farmácia / Drogaria: ___________________________________</p>
            <p style="margin: 2px 0;">CNPJ / Razão: ________________________________________</p>
            <p style="margin: 2px 0;">Assinatura Farmacêutico: _______________________________</p>
            <p style="margin: 2px 0;">Data de Dispensação: _____ / _____ / 202___</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'tpl-exames-poc-tripla',
    title: 'Requisição de Exames Check-up 3 Vias — POC Policlínica',
    contextId: 'ctx-policlinica',
    isTemplate: true,
    createdAt: 1727500000003,
    updatedAt: 1727500000003,
    contentJson: null,
    contentHtml: `
      <div style="font-family: inherit; font-size: 11px;">
        <div style="border-bottom: 2px solid #0F172A; padding-bottom: 6px; margin-bottom: 8px; text-align: center;">
          <h2 style="font-size: 12px; font-weight: bold; margin: 0; text-transform: uppercase;">POC — POLICLÍNICA OSWALDO CRUZ (SESAU / RO)</h2>
          <p style="font-size: 10px; margin: 2px 0; color: #475569;">Av. Gov. Jorge Teixeira, 3862 - Industrial, Porto Velho - RO</p>
          <p style="font-size: 10px; font-weight: bold; margin: 2px 0 0 0; color: #0284C7;">SOLICITAÇÃO DE EXAMES LABORATORIAIS (PAINEL RÁPIDO)</p>
        </div>

        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 4px 8px; margin-bottom: 8px; font-size: 10px;">
          <strong>Paciente:</strong> {{paciente_nome}} &nbsp;|&nbsp; <strong>Idade:</strong> {{paciente_idade}} &nbsp;|&nbsp; <strong>Motivo:</strong> Rotina / Avaliação
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px; line-height: 1.4;">
          <div style="border-right: 1px solid #E2E8F0; padding-right: 6px;">
            <p style="margin: 2px 0;">[X] Hemograma completo</p>
            <p style="margin: 2px 0;">[X] Glicemia em Jejum &nbsp;|&nbsp; [X] HbA1c</p>
            <p style="margin: 2px 0;">[X] Colesterol Total &nbsp;|&nbsp; [X] HDL &nbsp;|&nbsp; [X] LDL</p>
            <p style="margin: 2px 0;">[X] Triglicerídeos</p>
            <p style="margin: 2px 0;">[X] Ureia &nbsp;|&nbsp; [X] Creatinina</p>
            <p style="margin: 2px 0;">[X] Ácido Úrico</p>
            <p style="margin: 2px 0;">[X] TGO &nbsp;|&nbsp; [X] TGP &nbsp;|&nbsp; [X] GGT</p>
            <p style="margin: 2px 0;">[X] TSH &nbsp;|&nbsp; [X] T4 Livre</p>
            <p style="margin: 2px 0;">[ ] Sódio (Na+) &nbsp;|&nbsp; [ ] Potássio (K+)</p>
            <p style="margin: 2px 0;">[ ] Cálcio Sérico &nbsp;|&nbsp; [ ] Magnésio</p>
            <p style="margin: 2px 0;">[ ] PCR &nbsp;|&nbsp; [ ] VHS &nbsp;|&nbsp; [ ] CPK</p>
          </div>
          <div>
            <p style="margin: 2px 0;">[X] EAS (Urina Tipo 1)</p>
            <p style="margin: 2px 0;">[ ] EPF (Parasitológico de Fezes)</p>
            <p style="margin: 2px 0;">[X] VDRL &nbsp;|&nbsp; [X] HBsAg &nbsp;|&nbsp; [X] Anti-HCV</p>
            <p style="margin: 2px 0;">[ ] Vitamina B12 &nbsp;|&nbsp; [ ] Vitamina D (25-OH)</p>
            <p style="margin: 2px 0;">[ ] Ferritina &nbsp;|&nbsp; [ ] Ferro Sérico</p>
            <p style="margin: 2px 0;">[ ] TAP c/ RNI &nbsp;|&nbsp; [ ] TTPA</p>
            <p style="margin: 2px 0;">[ ] PSA Total e Livre (Homens &gt; 45a)</p>
            <p style="margin: 2px 0;">[ ] Gota Espessa (Malária) &nbsp;|&nbsp; [ ] Dengue NS1</p>
            <p style="margin: 2px 0;">[ ] Tipagem Sanguínea e Fator Rh</p>
            <p style="margin: 2px 0;">[ ] Beta-hCG Quantitativo</p>
            <p style="margin: 2px 0;"><strong>Outros:</strong> ____________________________</p>
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: flex-end;">
          <p style="font-size: 9px; margin: 0;">Porto Velho - RO, {{data_atendimento}}</p>
          <div style="text-align: center; width: 180px; border-top: 1px solid #0F172A; padding-top: 2px;">
            <p style="font-size: 9px; font-weight: bold; margin: 0;">Assinatura / Carimbo Médico</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'tpl-exames-ubs-tripla',
    title: 'Requisição de Exames Check-up 3 Vias — UBS Osvaldo Piana',
    contextId: 'ctx-ubs',
    isTemplate: true,
    createdAt: 1727500000004,
    updatedAt: 1727500000004,
    contentJson: null,
    contentHtml: `
      <div style="font-family: inherit; font-size: 11px;">
        <div style="border-bottom: 2px solid #0F172A; padding-bottom: 6px; margin-bottom: 8px; text-align: center;">
          <h2 style="font-size: 12px; font-weight: bold; margin: 0; text-transform: uppercase;">UNIDADE DE SAÚDE DA FAMÍLIA — OSVALDO PIANA</h2>
          <p style="font-size: 10px; margin: 2px 0; color: #475569;">Av. Campos Sales, 858 - Areal, Porto Velho - RO, 76804-358</p>
          <p style="font-size: 10px; font-weight: bold; margin: 2px 0 0 0; color: #0369A1;">SOLICITAÇÃO DE EXAMES — REDE MUNICIPAL (SEMUSA)</p>
        </div>

        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 4px 8px; margin-bottom: 8px; font-size: 10px;">
          <strong>Paciente:</strong> {{paciente_nome}} &nbsp;|&nbsp; <strong>Idade:</strong> {{paciente_idade}} &nbsp;|&nbsp; <strong>Indicação:</strong> Avaliação Básica
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px; line-height: 1.4;">
          <div style="border-right: 1px solid #E2E8F0; padding-right: 6px;">
            <p style="margin: 2px 0;">[X] Hemograma completo</p>
            <p style="margin: 2px 0;">[X] Glicemia de Jejum</p>
            <p style="margin: 2px 0;">[X] Perfil Lipídico (CT, HDL, LDL, TG)</p>
            <p style="margin: 2px 0;">[X] Creatinina Sérica &nbsp;|&nbsp; [X] Ureia</p>
            <p style="margin: 2px 0;">[X] Ácido Úrico</p>
            <p style="margin: 2px 0;">[X] TGO &nbsp;|&nbsp; [X] TGP</p>
            <p style="margin: 2px 0;">[X] TSH</p>
          </div>
          <div>
            <p style="margin: 2px 0;">[X] EAS (Exame de Urina Tipo 1)</p>
            <p style="margin: 2px 0;">[X] EPF (Parasitológico de Fezes)</p>
            <p style="margin: 2px 0;">[X] VDRL (Triagem Sífilis)</p>
            <p style="margin: 2px 0;">[X] Testes Rápidos: HIV / HBV / HCV</p>
            <p style="margin: 2px 0;">[ ] Preventivo do Câncer de Colo (Papanicolau)</p>
            <p style="margin: 2px 0;"><strong>Outros:</strong> ____________________________</p>
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: flex-end;">
          <p style="font-size: 9px; margin: 0;">Porto Velho - RO, {{data_atendimento}}</p>
          <div style="text-align: center; width: 180px; border-top: 1px solid #0F172A; padding-top: 2px;">
            <p style="font-size: 9px; font-weight: bold; margin: 0;">Assinatura / Carimbo Médico</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'tpl-atestado-ubs-pvh',
    title: 'Atestado Médico — UBS Osvaldo Piana (com CID-10)',
    contextId: 'ctx-ubs',
    isTemplate: true,
    createdAt: 1727500000005,
    updatedAt: 1727500000005,
    contentJson: null,
    contentHtml: `
      <div style="font-family: inherit;">
        <div style="border-bottom: 2px solid #0F172A; padding-bottom: 8px; margin-bottom: 16px; text-align: center;">
          <h2 style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase;">UNIDADE DE SAÚDE DA FAMÍLIA — OSVALDO PIANA</h2>
          <p style="font-size: 11px; margin: 2px 0; color: #475569;">Av. Campos Sales, 858 - Areal, Porto Velho - RO, 76804-358</p>
        </div>

        <div style="text-align: center; margin: 24px 0 28px 0;">
          <h1 style="font-size: 18px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin: 0; color: #0F172A;">ATESTADO MÉDICO</h1>
        </div>

        <div style="line-height: 2; font-size: 14px; text-align: justify; margin-bottom: 28px;">
          <p style="margin: 0;">
            Atesto para os devidos fins de comprovação que o(a) paciente <strong>{{paciente_nome}}</strong>, inscrito(a) no documento competente, esteve sob meus cuidados profissionais nesta Unidade de Saúde e necessita de <strong>03 (três) dias</strong> de afastamento de suas atividades laborais e escolares, a contar desta data, por motivo de tratamento de saúde e recuperação clínica.
          </p>
          <p style="margin-top: 16px;">
            <strong>Diagnóstico / CID-10:</strong> T21.2 (Queimadura de segundo grau de tronco / lesão cutânea)
          </p>
        </div>

        <div style="background-color: #FEF8EE; border: 1px solid #FDE68A; border-radius: 6px; padding: 10px 14px; margin-bottom: 32px; font-size: 11px; color: #92400E;">
          <p style="margin: 0;">
            <strong>Autorização expressa do Paciente (Resolução CFM nº 1.658/2002 e 1.819/2007):</strong>
            <br>
            "Autorizo expressamente o(a) médico(a) assistente a registrar o diagnóstico e código da CID neste atestado."
          </p>
          <div style="margin-top: 20px; border-top: 1px solid #D97706; width: 260px; padding-top: 2px;">
            Assinatura do Paciente / Responsável Legal
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px;">
          <div>
            <p style="font-size: 12px; margin: 0;">Porto Velho - RO, {{data_atendimento}}</p>
          </div>
          <div style="text-align: center; width: 240px; border-top: 1px solid #0F172A; padding-top: 4px;">
            <p style="font-size: 12px; font-weight: bold; margin: 0;">Dra. Giseli Nobres S Freitas</p>
            <p style="font-size: 11px; color: #475569; margin: 0;">CRM/RO: 4493 &nbsp;|&nbsp; RQE: 1866</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'tpl-encaminhamento-ubs-pvh',
    title: 'Encaminhamento Especializado — UBS Osvaldo Piana',
    contextId: 'ctx-ubs',
    isTemplate: true,
    createdAt: 1727500000006,
    updatedAt: 1727500000006,
    contentJson: null,
    contentHtml: `
      <div style="font-family: inherit;">
        <div style="border-bottom: 2px solid #0F172A; padding-bottom: 8px; margin-bottom: 14px; text-align: center;">
          <h2 style="font-size: 13px; font-weight: bold; margin: 0; text-transform: uppercase;">UNIDADE DE SAÚDE DA FAMÍLIA — OSVALDO PIANA</h2>
          <p style="font-size: 11px; margin: 2px 0; color: #475569;">Av. Campos Sales, 858 - Areal, Porto Velho - RO, 76804-358</p>
          <h1 style="font-size: 15px; font-weight: bold; margin: 6px 0 0 0; color: #0369A1; letter-spacing: 1px;">ENCAMINHAMENTO MÉDICO / REGULAÇÃO AMBULATORIAL</h1>
        </div>

        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 12px;">
          <p style="margin: 0 0 4px 0;"><strong>Destino / Especialidade:</strong> Ambulatório Especializado de Endocrinologia / Obesidade</p>
          <p style="margin: 0 0 4px 0;"><strong>Paciente:</strong> {{paciente_nome}} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Idade:</strong> {{paciente_idade}}</p>
        </div>

        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 11px;">
          <p style="margin: 0 0 4px 0; font-weight: bold; color: #166534;">DADOS CLÍNICOS E ANTROPOMÉTRICOS:</p>
          <p style="margin: 2px 0;">• Peso: 146,7 kg &nbsp;|&nbsp; Altura: 1,78 m &nbsp;|&nbsp; IMC: 46,3 kg/m² (Obesidade Grau III / Grave)</p>
          <p style="margin: 2px 0;">• Pressão Arterial: 170/90 mmHg &nbsp;|&nbsp; FC: 87 bpm &nbsp;|&nbsp; Glicemia Capilar: 95 mg/dL</p>
        </div>

        <div style="font-size: 12px; line-height: 1.6; margin-bottom: 16px;">
          <p style="font-weight: bold; color: #0F172A; margin: 0 0 4px 0;">JUSTIFICATIVA CLÍNICA:</p>
          <p style="margin: 0 0 10px 0; text-align: justify;">
            Encaminho o(a) paciente acima para avaliação e seguimento em serviço especializado multiprofissional. Apresenta obesidade grave associada a níveis pressóricos elevados e alto risco cardiovascular, necessitando de abordagem intensiva, estratificação clínica e avaliação de elegibilidade para linha de cuidado especializada e bariátrica.
          </p>
          <p style="margin: 0;">
            <strong>Hipótese Diagnóstica / CID-10:</strong> E66.8 (Outra obesidade) / E66.9 (Obesidade não especificada)
            <br>
            <strong>CID-10 Secundário:</strong> I10 (Hipertensão essencial)
          </p>
        </div>

        <div style="border-top: 1px solid #E2E8F0; padding-top: 10px; margin-top: 24px; font-size: 10px; color: #64748B;">
          <p style="margin: 0 0 20px 0;">(Autorização de CID firmada conforme Res. CFM 1.658/2002)</p>
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <p style="font-size: 11px; margin: 0; color: #0F172A;">Porto Velho - RO, {{data_atendimento}}</p>
            <div style="text-align: center; width: 220px; border-top: 1px solid #0F172A; padding-top: 4px;">
              <p style="font-size: 11px; font-weight: bold; margin: 0; color: #0F172A;">Dra. Giseli Nobres S Freitas</p>
              <p style="font-size: 10px; color: #475569; margin: 0;">CRM/RO: 4493 &nbsp;|&nbsp; RQE: 1866</p>
            </div>
          </div>
        </div>
      </div>
    `
  }
];
