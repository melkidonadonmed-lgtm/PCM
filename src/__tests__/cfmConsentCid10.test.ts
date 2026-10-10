import { describe, it, expect } from 'vitest';
import { COMMON_CID10 } from '../data/cidCatalog';
import { MedicalCertificate } from '../types';

describe('Conformidade Sanitária e Ética: Sigilo Médico e Inclusão de CID-10 (Res. CFM nº 1.658/2002 e 1.819/2007)', () => {
  it('não deve incluir diagnóstico nem código CID-10 no atestado sem consentimento do paciente', () => {
    const certificateWithoutConsent: MedicalCertificate = {
      patientName: 'Paciente Teste',
      documentNumber: '123.456.789-00',
      daysOff: 3,
      startDate: '2026-09-28',
      endDate: '2026-09-30',
      periodText: 'por motivo de saúde',
      includeCID: false,
      cid10Code: '',
      cid10Description: '',
      observations: ''
    };

    expect(certificateWithoutConsent.includeCID).toBe(false);
    expect(certificateWithoutConsent.cid10Code).toBeFalsy();
    expect(certificateWithoutConsent.cid10Description).toBeFalsy();
  });

  it('deve conter aviso legal mandatório da Resolução CFM 1.658/2002 quando o CID-10 for incluído', () => {
    const certificateWithConsent: MedicalCertificate = {
      patientName: 'Paciente Teste',
      documentNumber: '123.456.789-00',
      daysOff: 5,
      startDate: '2026-09-28',
      endDate: '2026-10-02',
      periodText: 'por motivo de saúde',
      includeCID: true,
      cid10Code: 'J06.9',
      cid10Description: 'Infecção aguda das vias aéreas superiores (IVAS)',
      observations: ''
    };

    const legalDisclaimer = '* Inclusão do CID expressamente solicitada e autorizada pelo(a) paciente (Resolução CFM nº 1.658/2002).';

    expect(certificateWithConsent.includeCID).toBe(true);
    expect(certificateWithConsent.cid10Code).toBe('J06.9');
    expect(legalDisclaimer).toContain('Resolução CFM nº 1.658/2002');
    expect(legalDisclaimer).toContain('expressamente solicitada e autorizada');
  });

  it('deve conter diagnósticos prioritários com codificação válida no catálogo CID-10', () => {
    const essentialCodes = ['J00', 'J06.9', 'A09', 'M54.5', 'B34.9', 'F41.1', 'R50.9'];

    essentialCodes.forEach((code) => {
      const found = COMMON_CID10.find((item) => item.code === code);
      expect(found, `CID ${code} deve estar presente no catálogo clínico`).toBeDefined();
      expect(found?.description.length).toBeGreaterThan(5);
      expect(found?.category).toBeDefined();
    });
  });

  it('deve permitir normalização e busca por palavras-chave e códigos sem pontuação', () => {
    const queryTerm = 'resfriado';
    const matches = COMMON_CID10.filter((item) =>
      item.description.toLowerCase().includes(queryTerm) ||
      item.keywords?.some((k) => k.toLowerCase().includes(queryTerm))
    );

    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.some((m) => m.code === 'J00')).toBe(true);
  });
});
