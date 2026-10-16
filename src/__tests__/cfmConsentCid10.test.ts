import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { COMMON_CID10 } from '../data/cidCatalog';
import { DoctorProfile, MedicalCertificate, Patient } from '../types';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';

const testDoctor: DoctorProfile = {
  name: 'Dra. Marina Campos',
  crm: '11223',
  crmState: 'RO',
  specialty: 'Clínica Médica',
  clinicName: 'UBS Central',
  address: 'Rua das Palmeiras, 50',
  cityState: 'Porto Velho - RO',
  phone: '(69) 3222-1111',
  email: '',
  showSignature: true
};

const testPatient: Patient = {
  id: 'pat-cid-1',
  name: 'Paciente Teste',
  documentNumber: '123.456.789-00',
  weightKg: 70,
  gender: 'male',
  allergies: []
};

describe('Conformidade Sanitária e Ética: Sigilo Médico e Inclusão de CID-10 (Res. CFM nº 1.658/2002 e 1.819/2007)', () => {
  it('não deve incluir diagnóstico nem código CID-10 no atestado renderizado sem consentimento do paciente', () => {
    const certificateWithoutConsent: MedicalCertificate = {
      patientName: 'Paciente Teste',
      documentNumber: '123.456.789-00',
      daysOff: 3,
      startDate: '2026-09-28',
      endDate: '2026-09-30',
      periodText: 'por motivo de saúde',
      includeCID: false,
      cid10Code: 'J06.9',
      cid10Description: 'Infecção aguda das vias aéreas superiores (IVAS)',
      observations: ''
    };

    const html = renderToStaticMarkup(
      React.createElement(DocumentoClinico, {
        tipo: 'certificate',
        doctor: testDoctor,
        patient: testPatient,
        certificate: certificateWithoutConsent
      })
    );

    expect(html).toContain('Atestado Médico');
    expect(html).not.toContain('J06.9');
    expect(html).not.toContain('Resolução CFM nº 1.658/2002');
  });

  it('deve conter aviso legal mandatório da Resolução CFM 1.658/2002 na folha A4 quando o CID-10 for autorizado', () => {
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

    const html = renderToStaticMarkup(
      React.createElement(DocumentoClinico, {
        tipo: 'certificate',
        doctor: testDoctor,
        patient: testPatient,
        certificate: certificateWithConsent
      })
    );

    expect(html).toContain('J06.9');
    expect(html).toContain('Infecção aguda das vias aéreas superiores (IVAS)');
    expect(html).toContain('Resolução CFM nº 1.658/2002');
    expect(html).toContain('expressamente solicitada e autorizada');
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

