import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  calculateHospitalStayDays,
  calculatePatientAgeYearsFromDate,
  computeLongitudinalLabDeltas,
  analyzeConductVsEvolution,
  formatStandardHospitalEvolutionText,
  buildHospitalEvolutionHtmlForA4,
  sortLabPanelsChronologically,
} from '../utils/hospital/hospitalEvolutionFormatter';
import {
  DEFAULT_HOSPITAL_BEDS_SEED,
  createEmptyHospitalBedRecord,
  extractStructuredHospitalDataFromRawInput,
  mergeExtractedHospitalDataIntoBed,
} from '../utils/hospital/hospitalMultimodalIngestor';
import {
  generateBedCopilotResponse,
  queryScienceLiteratureAgent,
} from '../utils/hospital/hospitalAiAssistantService';
import { HospitalWardModuleView } from '../components/hospital/HospitalWardModuleView';
import { HospitalEvolutionFormPanel } from '../components/hospital/HospitalEvolutionFormPanel';
import { HospitalLabsAndAnalyticsPanel } from '../components/hospital/HospitalLabsAndAnalyticsPanel';
import { HospitalBedChatAndSciencePanel } from '../components/hospital/HospitalBedChatAndSciencePanel';
import { HospitalMultimodalImportModal } from '../components/hospital/HospitalMultimodalImportModal';
import type { DoctorProfile, Patient } from '../types';

const sampleDoctor: DoctorProfile = {
  name: 'Dr. Melki Donadon',
  crm: '12345',
  crmState: 'RO',
  specialty: 'Clínica Médica',
  clinicName: 'Hospital Regional',
  address: 'Av. Principal, 100',
  cityState: 'Porto Velho - RO',
  phone: '(69) 99999-0000',
  email: 'medico@hospital.med.br',
  showSignature: true,
};

const samplePatient: Patient = {
  id: 'pat-hosp-1',
  name: 'M. A. S.',
  weightKg: 72,
  gender: 'male',
  allergies: ['Dipirona'],
};

describe('Módulo Hospitalar e Gestão de Pacientes (MOD-03) — Rigor Terapêutico e Evolução Padronizada', () => {
  it('calcula idade em anos (DN) e dias de internação (DIH) deterministicamente sem inventar dados quando vazio', () => {
    expect(calculatePatientAgeYearsFromDate('14/05/1962', '2026-10-24')).toBe('64 A');
    expect(calculatePatientAgeYearsFromDate('25/12/2000', '2026-10-24')).toBe('25 A');
    expect(calculatePatientAgeYearsFromDate('', '2026-10-24')).toBe('');
    expect(calculateHospitalStayDays('20/10/2026', '2026-10-24')).toBe(5);
    expect(calculateHospitalStayDays('', '2026-10-24')).toBe(0);
  });

  it('gera o Modelo Padronizado de Evolução / Admissão completo (EF/LT, ID, DN, CNS, DIH, QP, HD 1/1.1, HDA, FEZ/EM USO, EXAMES, EXAME FÍSICO, EVOLUÇÃO 24H, PENDÊNCIAS e CD)', () => {
    const bed110 = DEFAULT_HOSPITAL_BEDS_SEED[0];
    const formatted = formatStandardHospitalEvolutionText(bed110);

    expect(formatted).toContain('EF/LT : 110-15');
    expect(formatted).toContain('ID: M. A. S. (Pront. 48291)');
    expect(formatted).toContain('DN: 14/05/1962 (64 A)');
    expect(formatted).toContain('CNS: 704801239481029');
    expect(formatted).toContain('DIH: 20/10/2026');
    expect(formatted).toContain('QP: "Falta de ar aos pequenos esforços e tosse com catarro há 4 dias"');
    expect(formatted).toContain('1 - Pneumonia Adquirida na Comunidade — CURB-65 2 (20/10/2026)');
    expect(formatted).toContain('1.1- Injúria Renal Aguda KDIGO 1 pré-renal em resolução (20/10/2026)');
    expect(formatted).toContain('ALERGIAS: Dipirona (urticária documentada em 2019)');
    expect(formatted).toContain('FEZ USO:\n- Cateter Nasal de O2 2 L/min (3 dias (20/10/2026 a 23/10/2026))');
    expect(formatted).toContain('EM USO:\n- Ceftriaxona 1 g EV 12/12h (D4/D7 (início 20/10/2026))');
    expect(formatted).toContain('20/10/2026: HB 12,8 | HT 38 | LEU 16400');
    expect(formatted).toContain('EVOLUÇÃO 24H: Paciente permaneceu afebril nas últimas 24h');
    expect(formatted).toContain('DIETA: Dieta branda hipossódica via oral');
    expect(formatted).toContain('PENDÊNCIAS:');
    expect(formatted).toContain('CD:\n- Manter Ceftriaxona 1 g EV 12/12h (D4/D7) e Azitromicina 500 mg VO (D4/D5)');

    const htmlA4 = buildHospitalEvolutionHtmlForA4(bed110);
    expect(htmlA4).toContain('EVOLUÇÃO / ADMISSÃO HOSPITALAR — LEITO 110-15');
    expect(htmlA4).not.toContain('<script>');
  });

  it('ordena exames laboratoriais em ordem estritamente cronológica, calcula deltas (elevação, queda, estabilidade) e cruza Conduta x Evolução', () => {
    const bed110 = DEFAULT_HOSPITAL_BEDS_SEED[0];
    const reversedPanels = [...bed110.labPanels].reverse();
    const sorted = sortLabPanelsChronologically(reversedPanels);
    expect(sorted.map((p) => p.dateBr)).toEqual(['20/10/2026', '22/10/2026', '24/10/2026']);

    const deltas = computeLongitudinalLabDeltas(bed110.labPanels);
    const leu = deltas.find((d) => d.key === 'LEU')!;
    const pcr = deltas.find((d) => d.key === 'PCR')!;
    const cr = deltas.find((d) => d.key === 'CR')!;

    expect(leu.previousValue).toBe(11900);
    expect(leu.latestValue).toBe(8600);
    expect(leu.direction).toBe('down');
    expect(pcr.direction).toBe('down');
    expect(cr.direction).toBe('down');

    const correlations = analyzeConductVsEvolution(bed110);
    expect(correlations.length).toBeGreaterThanOrEqual(2);
    expect(correlations[0].domain).toBe('infeccioso');
    expect(correlations[0].efficacyStatus).toBe('favorable');
  });

  it('opera sob Diretriz de Rigor Terapêutico na ingestão multimodal: ordena datas cronologicamente e nunca inventa campos ausentes', () => {
    const rawUnordered = [
      'EF/LT : 110-19',
      'ID: A. B. C.',
      'DN: 10/01/1976',
      'DIH: 21/10/2026',
      'QP: Dor torácica ventilatório-dependente',
      '24/10/2026: HB 13,0 | LEU 8200 | CR 0,9 | K 4,1 | PCR 14',
      '21/10/2026: HB 13,2 | LEU 15400 | CR 1,4 | K 4,8 | PCR 120',
    ].join('\n');

    const extraction = extractStructuredHospitalDataFromRawInput(rawUnordered, 'Teste Rigor Terapêutico');
    expect(extraction.chronologicalDatesFound).toEqual(['10/01/1976', '21/10/2026', '24/10/2026']);
    expect(extraction.partialRecord.wardAndBed).toBe('110-19');
    expect(extraction.partialRecord.patientNameOrInitials).toBe('A. B. C.');
    expect(extraction.partialRecord.ageYearsText).toBe('50 A');
    expect(extraction.partialRecord.labPanels?.map((p) => p.dateBr)).toEqual(['21/10/2026', '24/10/2026']);

    // Campos não informados no texto bruto permanecem indefinidos (zero alucinação)
    expect(extraction.partialRecord.allergiesText).toBeUndefined();
    expect(extraction.partialRecord.serologiesText).toBeUndefined();

    const emptyBed = createEmptyHospitalBedRecord('110-19', 'enfermaria_clinica');
    const merged = mergeExtractedHospitalDataIntoBed(emptyBed, extraction);
    expect(merged.allergiesText).toBe('');
    expect(merged.serologiesText).toBe('');
    expect(merged.labPanels.length).toBe(2);
  });

  it('consulta o Agente Science de Literatura e o Assistente Virtual do Leito com citações verificadas', () => {
    const bed110 = DEFAULT_HOSPITAL_BEDS_SEED[0];
    const sciReply = queryScienceLiteratureAgent('critérios de switch oral para pneumonia e ceftriaxona', bed110);
    expect(sciReply.replyText).toContain('Pneumonia Adquirida na Comunidade');
    expect(sciReply.citations.length).toBeGreaterThan(0);

    const copilotMsg = generateBedCopilotResponse('Resumo do leito', bed110, 'bed_copilot');
    expect(copilotMsg.content).toContain('Resumo Auditado do Leito 110-15');
    expect(copilotMsg.content).toContain('Dipirona');
  });

  it('renderiza HospitalWardModuleView, HospitalEvolutionFormPanel, HospitalLabsAndAnalyticsPanel, HospitalBedChatAndSciencePanel e HospitalMultimodalImportModal com WAI-ARIA e tabular-nums', () => {
    const wardHtml = renderToStaticMarkup(
      <HospitalWardModuleView
        darkMode={false}
        doctor={sampleDoctor}
        patient={samplePatient}
        onSendToA4Editor={vi.fn()}
      />
    );
    expect(wardHtml).toContain('Módulo Hospitalar e Gestão de Pacientes');
    expect(wardHtml).toContain('MOD-03 Ativo');
    expect(wardHtml).toContain('EF/LT 110-15');
    expect(wardHtml).toContain('EF/LT 204-02');

    const formHtml = renderToStaticMarkup(
      <HospitalEvolutionFormPanel
        bedRecord={DEFAULT_HOSPITAL_BEDS_SEED[1]}
        doctor={sampleDoctor}
        onUpdateBedRecord={vi.fn()}
        onOpenMultimodalModal={vi.fn()}
        onSendToA4Editor={vi.fn()}
      />
    );
    expect(formHtml).toContain('EXAME NEUROVASCULAR DISTAL (MID)');
    expect(formHtml).toContain('id="hospital-standard-evolution-preview"');

    const labsHtml = renderToStaticMarkup(
      <HospitalLabsAndAnalyticsPanel
        mode="longitudinal_labs"
        bedRecord={DEFAULT_HOSPITAL_BEDS_SEED[0]}
        onUpdateBedRecord={vi.fn()}
      />
    );
    expect(labsHtml).toContain('Monitoramento Longitudinal de Exames');
    expect(labsHtml).toContain('↓ Queda');

    const dashboardHtml = renderToStaticMarkup(
      <HospitalLabsAndAnalyticsPanel
        mode="analytics_dashboard"
        bedRecord={DEFAULT_HOSPITAL_BEDS_SEED[0]}
        onUpdateBedRecord={vi.fn()}
      />
    );
    expect(dashboardHtml).toContain('Agente Analítico — Cruzamento Conduta × Evolução');
    expect(dashboardHtml).toContain('Resposta Favorável');

    const chatHtml = renderToStaticMarkup(
      <HospitalBedChatAndSciencePanel
        allBeds={DEFAULT_HOSPITAL_BEDS_SEED}
        activeBed={DEFAULT_HOSPITAL_BEDS_SEED[0]}
        onSelectBed={vi.fn()}
        onUpdateBed={vi.fn()}
      />
    );
    expect(chatHtml).toContain('Agente Science (Literatura)');
    expect(chatHtml).toContain('Live API (Voz)');

    const modalHtml = renderToStaticMarkup(
      <HospitalMultimodalImportModal
        isOpen={true}
        activeBedCode="110-15"
        onClose={vi.fn()}
        onApplyExtraction={vi.fn()}
      />
    );
    expect(modalHtml).toContain('role="dialog"');
    expect(modalHtml).toContain('aria-modal="true"');
    expect(modalHtml).toContain('Importação Multimodal &amp; Extração Estruturada — Leito 110-15');
  });
});
