import { describe, it, expect } from 'vitest';
import { SUS_DOCUMENTS_CATALOG, buildSusDocumentHtml, buildSusDocumentMarkdown } from '../data/susDocumentsCatalog';
import type { SusFilledFormData } from '../types';

// Formulário com identificação preenchida e NENHUM dado clínico informado.
const semDadosClinicos: SusFilledFormData = {
  doctorName: 'Dra. Teste Ficticia',
  doctorCrm: '99999',
  doctorCrmState: 'RO',
  doctorSpecialty: 'Clínica Médica',
  doctorCnes: '',
  doctorClinicName: 'UBS Teste',
  patientName: 'Paciente Ficticio da Silva',
  patientCns: '',
  patientCpf: '',
  patientBirthDate: '',
  patientAge: '',
  patientGender: 'male',
  patientMotherName: '',
  patientPhone: '',
  patientAddress: '',
  patientNeighborhood: '',
  patientCity: '',
  patientState: '',
  patientCep: '',
  sigtapCode: '',
  procedureName: '',
  cid10Code: '',
  cid10Description: '',
  clinicalJustification: '',
  sinanNumber: '',
  symptomsStartDate: '',
  renalCreatinine: '',
  renalEtfg: '',
  isContrastNeeded: true,
  gynecologyDum: '',
  gynecologyPreviousExam: '',
  specimenType: '',
  tuberculosisSymptomsDuration: '',
  lmeMedicationName: '',
  lmeMedicationPosology: '',
  lmeMedicationQuantityMonthly: ''
};

const hoje = new Date().toLocaleDateString('pt-BR');

describe('Documentos SUS: a folha só traz o que o médico informou', () => {
  SUS_DOCUMENTS_CATALOG.forEach((doc) => {
    describe(doc.shortTitle, () => {
      const md = buildSusDocumentMarkdown(doc, semDadosClinicos);
      const html = buildSusDocumentHtml(doc, semDadosClinicos);
      const saidas = { markdown: md, html };

      it('não escreve justificativa, CID-10, procedimento ou SIGTAP do catálogo em campo vazio', () => {
        Object.entries(saidas).forEach(([formato, texto]) => {
          expect(texto, formato).not.toContain(doc.defaultJustification);
          if (doc.defaultCid10) expect(texto, formato).not.toContain(doc.defaultCid10);
          if (doc.defaultProcedure) expect(texto, formato).not.toContain(doc.defaultProcedure);
          if (doc.defaultSigtap) expect(texto, formato).not.toContain(doc.defaultSigtap);
        });
      });

      it('não presume resultado de exame, triagem de segurança nem história clínica', () => {
        Object.entries(saidas).forEach(([formato, texto]) => {
          expect(texto, formato).not.toMatch(/Creatinina:?\s*1,0/);
          expect(texto, formato).not.toContain('> 60');
          expect(texto, formato).not.toMatch(/marca-passo/i);
          expect(texto, formato).not.toContain('Mais de 3 semanas');
          expect(texto, formato).not.toContain('Nunca realizou');
          expect(texto, formato).not.toContain('Soro / Amostra Biológica padrão');
        });
      });

      it('não usa a data de hoje como início dos sintomas', () => {
        expect(md).not.toContain(`(D1)**: ${hoje}`);
        expect(html).not.toContain(`(D1):</strong> ${hoje}`);
      });
    });
  });

  it('pedido com contraste declara a função renal como não informada quando o médico não preencheu', () => {
    const contraste = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'apac_complementar')!;
    expect(buildSusDocumentMarkdown(contraste, semDadosClinicos)).toContain('Creatinina: não informada | eTFG: não informada');
    expect(buildSusDocumentHtml(contraste, semDadosClinicos)).toContain('Creatinina: não informada | eTFG: não informada');
  });

  it('imprime a função renal exatamente como informada', () => {
    const contraste = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'apac_complementar')!;
    const preenchido = { ...semDadosClinicos, renalCreatinine: '0,9', renalEtfg: '95' };
    expect(buildSusDocumentMarkdown(contraste, preenchido)).toContain('Creatinina: 0,9 mg/dL | eTFG: 95 mL/min/1,73m²');
    expect(buildSusDocumentHtml(contraste, preenchido)).toContain('Creatinina: 0,9 mg/dL | eTFG: 95 mL/min/1,73m²');
  });
});
