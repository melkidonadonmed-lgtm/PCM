import React from 'react';
import { SusDocumentItem, SusFilledFormData } from '../../types';

export interface TimbreSus {
  logoLocal?: string;
  logoSus?: string;
}

export interface SusInteractiveVectorSheetProps {
  docItem: SusDocumentItem;
  formData: SusFilledFormData;
  timbre?: TimbreSus;
  onFieldChange: (key: keyof SusFilledFormData, value: string | boolean) => void;
}

interface VectorCellProps {
  colSpan: number;
  label: string;
  fieldKey: keyof SusFilledFormData;
  value: string;
  placeholder?: string;
  mono?: boolean;
  multiline?: boolean;
  rows?: number;
  onFieldChange: (key: keyof SusFilledFormData, value: string | boolean) => void;
}

const VectorCell: React.FC<VectorCellProps> = ({
  colSpan,
  label,
  fieldKey,
  value,
  placeholder = '',
  mono = false,
  multiline = false,
  rows = 3,
  onFieldChange,
}) => {
  const colClass =
    colSpan === 12 ? 'col-span-12' :
    colSpan === 9 ? 'col-span-9' :
    colSpan === 8 ? 'col-span-8' :
    colSpan === 7 ? 'col-span-7' :
    colSpan === 6 ? 'col-span-6' :
    colSpan === 5 ? 'col-span-5' :
    colSpan === 4 ? 'col-span-4' :
    colSpan === 3 ? 'col-span-3' :
    colSpan === 2 ? 'col-span-2' : 'col-span-1';

  return (
    <div
      className={`${colClass} relative group/suscell border-r border-b border-black p-1.5 flex flex-col justify-between bg-white focus-within:bg-sky-50/70 transition-colors`}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-[0.5rem] font-bold uppercase tracking-tight text-slate-800 leading-none select-none">
          {label}
        </span>
        {value && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onFieldChange(fieldKey, '')}
            title={`Limpar ${label}`}
            aria-label={`Limpar ${label}`}
            className="no-print opacity-0 group-hover/suscell:opacity-100 focus:opacity-100 w-3.5 h-3.5 rounded flex items-center justify-center text-[0.625rem] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-opacity cursor-pointer leading-none"
          >
            ×
          </button>
        )}
      </div>

      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onFieldChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`w-full resize-none border-0 bg-transparent p-0 text-[11px] font-semibold text-slate-950 leading-snug focus:outline-none ${
            mono ? 'font-mono clinical-tabular-nums' : 'font-sans'
          }`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onFieldChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`w-full border-0 bg-transparent p-0 text-[11.5px] font-semibold text-slate-950 leading-tight focus:outline-none ${
            mono ? 'font-mono clinical-tabular-nums tracking-tight' : 'font-sans'
          }`}
        />
      )}
    </div>
  );
};

/**
 * Grade Vetorial SIA/SUS 12 Colunas Interativa (.sus-grid).
 * Permite edição direta na própria folha A4 com sincronização bidirecional
 * imediata com o painel lateral e conversão limpa para texto na impressão/PDF.
 */
export const SusInteractiveVectorSheet: React.FC<SusInteractiveVectorSheetProps> = ({
  docItem,
  formData,
  timbre,
  onFieldChange,
}) => {
  const logoLocal =
    timbre?.logoLocal && timbre.logoLocal !== timbre.logoSus ? timbre.logoLocal : undefined;
  const logoSus = timbre?.logoSus;
  const todayFormatted = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="sus-document-rendered w-full text-slate-950 font-sans select-text">
      {/* Cabeçalho Institucional SIA/SUS */}
      <div className="border-2 border-black mb-2 p-2.5 flex items-center justify-between gap-3 bg-white">
        {logoLocal ? (
          <img
            src={logoLocal}
            alt="Logotipo do órgão do local de atendimento"
            className="h-10 max-w-[128px] object-contain shrink-0"
          />
        ) : (
          <div className="px-2.5 py-1 border border-black font-black text-xs tracking-wider shrink-0">
            SUS
          </div>
        )}

        <div className="text-center flex-1 min-w-0">
          <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-slate-700">
            Ministério da Saúde • Sistema Único de Saúde • {docItem.system}
          </div>
          <div className="text-[13px] font-black uppercase tracking-tight text-black leading-tight mt-0.5">
            {docItem.title}
          </div>
          <div className="no-print text-[0.5625rem] font-semibold text-sky-700 mt-0.5">
            Folha Vetorial Interativa — Clique em qualquer célula abaixo para editar diretamente no documento
          </div>
        </div>

        {logoSus && (
          <img
            src={logoSus}
            alt="Logotipo do SUS"
            className="h-9 max-w-[96px] object-contain shrink-0"
          />
        )}
      </div>

      {/* Bloc-Grid Vetorial 12 Colunas Padrão SIA/SUS */}
      <div className="grid grid-cols-12 border-t-2 border-l-2 border-r border-b border-black bg-white">
        {/* BLOCO 1: ESTABELECIMENTO */}
        <div className="col-span-12 bg-black text-white text-[0.5625rem] font-extrabold uppercase tracking-wider px-2 py-1 border-r border-b border-black">
          1. Identificação do Estabelecimento de Saúde Solicitante
        </div>
        <VectorCell
          colSpan={9}
          label="1 - Nome do Estabelecimento de Saúde Solicitante"
          fieldKey="doctorClinicName"
          value={formData.doctorClinicName || ''}
          placeholder="Clique para preencher a unidade..."
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={3}
          label="2 - Código CNES"
          fieldKey="doctorCnes"
          value={formData.doctorCnes || ''}
          placeholder="0000000"
          mono
          onFieldChange={onFieldChange}
        />

        {/* BLOCO 2: PACIENTE */}
        <div className="col-span-12 bg-black text-white text-[0.5625rem] font-extrabold uppercase tracking-wider px-2 py-1 border-r border-b border-black">
          2. Identificação do Paciente / Usuário SUS
        </div>
        <VectorCell
          colSpan={7}
          label="3 - Nome Completo do Paciente"
          fieldKey="patientName"
          value={formData.patientName || ''}
          placeholder="Nome completo do usuário..."
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={3}
          label="4 - Cartão Nacional de Saúde (CNS)"
          fieldKey="patientCns"
          value={formData.patientCns || ''}
          placeholder="700.0000.0000.0000"
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={2}
          label="5 - Sexo"
          fieldKey="patientSex"
          value={formData.patientSex || ''}
          placeholder="M / F"
          mono
          onFieldChange={onFieldChange}
        />

        <VectorCell
          colSpan={3}
          label="6 - CPF do Paciente"
          fieldKey="patientCpf"
          value={formData.patientCpf || ''}
          placeholder="000.000.000-00"
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={3}
          label="7 - Data de Nascimento"
          fieldKey="patientBirthDate"
          value={formData.patientBirthDate || ''}
          placeholder="DD/MM/AAAA"
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={2}
          label="8 - Idade"
          fieldKey="patientAge"
          value={formData.patientAge || ''}
          placeholder="Anos"
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={4}
          label="9 - Telefone de Contato"
          fieldKey="patientPhone"
          value={formData.patientPhone || ''}
          placeholder="(00) 90000-0000"
          mono
          onFieldChange={onFieldChange}
        />

        <VectorCell
          colSpan={6}
          label="10 - Nome Completo da Mãe"
          fieldKey="patientMotherName"
          value={formData.patientMotherName || ''}
          placeholder="Nome da mãe..."
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={6}
          label="11 - Endereço Residencial (Logradouro e Número)"
          fieldKey="patientAddress"
          value={formData.patientAddress || ''}
          placeholder="Rua, número..."
          onFieldChange={onFieldChange}
        />

        <VectorCell
          colSpan={4}
          label="12 - Bairro"
          fieldKey="patientNeighborhood"
          value={formData.patientNeighborhood || ''}
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={5}
          label="13 - Município de Residência"
          fieldKey="patientCity"
          value={formData.patientCity || ''}
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={1}
          label="14 - UF"
          fieldKey="patientState"
          value={formData.patientState || ''}
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={2}
          label="15 - CEP"
          fieldKey="patientCep"
          value={formData.patientCep || ''}
          mono
          onFieldChange={onFieldChange}
        />

        {/* BLOCO 3: PROCEDIMENTO E CID */}
        <div className="col-span-12 bg-black text-white text-[0.5625rem] font-extrabold uppercase tracking-wider px-2 py-1 border-r border-b border-black">
          3. Procedimento Solicitado &amp; Codificação Diagnóstica (SIGTAP / CID-10)
        </div>
        <VectorCell
          colSpan={3}
          label="16 - Código SIGTAP"
          fieldKey="sigtapCode"
          value={formData.sigtapCode || ''}
          placeholder="00.00.00.000-0"
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={7}
          label="17 - Descrição do Procedimento / Exame / Especialidade"
          fieldKey="procedureName"
          value={formData.procedureName || ''}
          placeholder="Descrição do procedimento..."
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={2}
          label="18 - Qtde"
          fieldKey="procedureQuantity"
          value={formData.procedureQuantity || ''}
          placeholder="1"
          mono
          onFieldChange={onFieldChange}
        />

        <VectorCell
          colSpan={3}
          label="19 - CID-10 Principal"
          fieldKey="cid10Code"
          value={formData.cid10Code || ''}
          placeholder="Ex.: M54.5"
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={9}
          label="20 - Descrição da Hipótese Diagnóstica"
          fieldKey="cid10Description"
          value={formData.cid10Description || ''}
          placeholder="Descrição clínica do diagnóstico..."
          onFieldChange={onFieldChange}
        />

        {/* BLOCO 4: DADOS ESPECÍFICOS DO PROGRAMA (SINAN / FUNÇÃO RENAL / SISCAN) */}
        {(docItem.id === 'apac_complementar' ||
          docItem.id.startsWith('gal_') ||
          docItem.id.startsWith('siscan_')) && (
          <>
            <div className="col-span-12 bg-black text-white text-[0.5625rem] font-extrabold uppercase tracking-wider px-2 py-1 border-r border-b border-black">
              4. Parâmetros Técnicos e Vigilância do Programa ({docItem.system})
            </div>
            {docItem.id === 'apac_complementar' && (
              <>
                <VectorCell
                  colSpan={4}
                  label="21 - Creatinina Sérica (mg/dL)"
                  fieldKey="renalCreatinine"
                  value={formData.renalCreatinine || ''}
                  placeholder="Ex.: 0,9"
                  mono
                  onFieldChange={onFieldChange}
                />
                <VectorCell
                  colSpan={4}
                  label="22 - eTFG (CKD-EPI mL/min)"
                  fieldKey="renalEtfg"
                  value={formData.renalEtfg || ''}
                  placeholder="Ex.: > 60"
                  mono
                  onFieldChange={onFieldChange}
                />
                <div className="col-span-4 border-r border-b border-black p-1.5 flex flex-col justify-between bg-white">
                  <span className="text-[0.5rem] font-bold uppercase tracking-tight text-slate-800 leading-none">
                    23 - Contraste Endovenoso
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-950 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isContrastNeeded)}
                      onChange={(e) => onFieldChange('isContrastNeeded', e.target.checked)}
                      className="w-3.5 h-3.5 accent-black cursor-pointer"
                    />
                    <span>{formData.isContrastNeeded ? 'Com Contraste (Gadolínio/Iodo)' : 'Sem Contraste'}</span>
                  </label>
                </div>
              </>
            )}

            {docItem.id.startsWith('gal_') && (
              <>
                <VectorCell
                  colSpan={4}
                  label="21 - Nº Notificação SINAN"
                  fieldKey="sinanNumber"
                  value={formData.sinanNumber || ''}
                  placeholder="Nº da ficha..."
                  mono
                  onFieldChange={onFieldChange}
                />
                <VectorCell
                  colSpan={4}
                  label="22 - Data Início dos Sintomas (D1)"
                  fieldKey="symptomsStartDate"
                  value={formData.symptomsStartDate || ''}
                  placeholder="DD/MM/AAAA"
                  mono
                  onFieldChange={onFieldChange}
                />
                <VectorCell
                  colSpan={4}
                  label="23 - Material Biológico / Amostra"
                  fieldKey="specimenType"
                  value={formData.specimenType || ''}
                  placeholder="Soro, Escarro, Swab..."
                  onFieldChange={onFieldChange}
                />
              </>
            )}

            {docItem.id.startsWith('siscan_') && (
              <>
                <VectorCell
                  colSpan={6}
                  label="21 - Data da Última Menstruação (DUM)"
                  fieldKey="gynecologyDum"
                  value={formData.gynecologyDum || ''}
                  placeholder="DD/MM/AAAA ou Menopausa"
                  mono
                  onFieldChange={onFieldChange}
                />
                <VectorCell
                  colSpan={6}
                  label="22 - Exame Anterior / Achado Prévio"
                  fieldKey="gynecologyPreviousExam"
                  value={formData.gynecologyPreviousExam || ''}
                  placeholder="BI-RADS / Citologia anterior..."
                  onFieldChange={onFieldChange}
                />
              </>
            )}
          </>
        )}

        {/* BLOCO 5: JUSTIFICATIVA CLÍNICA */}
        <div className="col-span-12 bg-black text-white text-[0.5625rem] font-extrabold uppercase tracking-wider px-2 py-1 border-r border-b border-black">
          5. Justificativa Clínica, Anamnese, Exame Físico e Exames Complementares
        </div>
        <VectorCell
          colSpan={12}
          label="24 - Relato Clínico Detalhado e Justificativa do Procedimento / Exame"
          fieldKey="clinicalJustification"
          value={formData.clinicalJustification || ''}
          placeholder="Clique para redigir ou editar a justificativa clínica, tempo de evolução, sinais de alarme e exames prévios..."
          multiline
          rows={5}
          onFieldChange={onFieldChange}
        />

        {/* BLOCO 6: MÉDICO SOLICITANTE E ASSINATURA */}
        <div className="col-span-12 bg-black text-white text-[0.5625rem] font-extrabold uppercase tracking-wider px-2 py-1 border-r border-b border-black">
          6. Identificação do Profissional Solicitante e Assinatura
        </div>
        <VectorCell
          colSpan={5}
          label="25 - Nome do Profissional Solicitante"
          fieldKey="doctorName"
          value={formData.doctorName || ''}
          placeholder="Dr(a)..."
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={2}
          label="26 - CRM"
          fieldKey="doctorCrm"
          value={formData.doctorCrm || ''}
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={1}
          label="27 - UF"
          fieldKey="doctorCrmState"
          value={formData.doctorCrmState || ''}
          mono
          onFieldChange={onFieldChange}
        />
        <VectorCell
          colSpan={4}
          label="28 - CPF / CNS do Médico"
          fieldKey="doctorCpf"
          value={formData.doctorCpf || formData.doctorCns || ''}
          mono
          onFieldChange={onFieldChange}
        />

        <div className="col-span-4 border-r border-b border-black p-2 flex flex-col justify-between bg-white min-h-[64px]">
          <span className="text-[0.5rem] font-bold uppercase tracking-tight text-slate-800 leading-none">
            29 - Data da Solicitação
          </span>
          <span className="text-xs font-mono font-bold text-slate-950 clinical-tabular-nums">
            {todayFormatted}
          </span>
        </div>
        <div className="col-span-8 border-r border-b border-black p-2 flex flex-col justify-end items-center bg-white min-h-[64px]">
          <div className="w-64 border-t border-black pt-1 text-center">
            <div className="text-[0.625rem] font-bold text-slate-950 leading-tight">
              {formData.doctorName || 'Assinatura e Carimbo do Médico Solicitante'}
            </div>
            {formData.doctorCrm && (
              <div className="text-[0.5625rem] font-mono text-slate-700 clinical-tabular-nums">
                CRM-{formData.doctorCrmState || 'UF'} {formData.doctorCrm}
                {formData.doctorSpecialty ? ` • ${formData.doctorSpecialty}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
