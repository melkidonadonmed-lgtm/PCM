import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DoctorProfile, Patient } from '../types';
import {
  DEFAULT_PATIENT,
  DEFAULT_EXAM_INDICATION,
  createDefaultCertificate,
  createDefaultReferral,
  syncPatientToDocuments,
  createCleanConsultationState
} from '../hooks/usePrescriptionSession';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';

describe('Sincronização de Paciente e Higiene de Consulta', () => {
  it('deve sincronizar nome e documento do paciente para atestados e encaminhamentos automaticamente', () => {
    const originalPatient: Patient = {
      ...DEFAULT_PATIENT,
      id: 'pat-123',
      name: 'Maria Aparecida da Silva',
      documentNumber: '987.654.321-99',
      weightKg: 65.5,
      ageText: '52 anos'
    };

    const certInitial = createDefaultCertificate('Porto Velho - RO');
    const refInitial = createDefaultReferral();

    const synced = syncPatientToDocuments(originalPatient, certInitial, refInitial);

    expect(synced.certificate.patientName).toBe('Maria Aparecida da Silva');
    expect(synced.certificate.documentNumber).toBe('987.654.321-99');
    expect(synced.referral.patientName).toBe('Maria Aparecida da Silva');
    expect(synced.referral.documentNumber).toBe('987.654.321-99');
  });

  it('ao limpar o paciente, deve disparar a limpeza de todos os documentos clínicos do atendimento', () => {
    const cleanState = createCleanConsultationState('Porto Velho - RO', 'pat-reset-001');

    expect(cleanState.patient.id).toBe('pat-reset-001');
    expect(cleanState.patient.name).toBe('');
    expect(cleanState.patient.documentNumber).toBe('');
    expect(cleanState.patient.weightKg).toBe(0);
    expect(cleanState.prescriptionItems).toHaveLength(0);
    expect(cleanState.selectedExams).toHaveLength(0);
    expect(cleanState.examIndication).toBe(DEFAULT_EXAM_INDICATION);
    expect(cleanState.certificate.patientName).toBe('');
    expect(cleanState.certificate.includeCID).toBe(false);
    expect(cleanState.certificate.cid10Code).toBe('');
    expect(cleanState.referral.patientName).toBe('');
  });

  it('deve permitir fluxo rápido apenas com nome do paciente para atestados e encaminhamentos sem exigir CPF ou peso obrigatoriamente', () => {
    const doctor: DoctorProfile = {
      name: 'Dr. Roberto Almeida',
      crm: '54321',
      crmState: 'RO',
      specialty: 'Clínica Médica',
      clinicName: 'UBS Teste',
      address: 'Rua A, 10',
      cityState: 'Porto Velho - RO',
      phone: '(69) 0000-0000',
      email: '',
      showSignature: true
    };
    const fastPatient: Patient = {
      ...DEFAULT_PATIENT,
      id: 'pat-fast-1',
      name: 'Carlos Eduardo Souza'
    };

    const synced = syncPatientToDocuments(
      fastPatient,
      createDefaultCertificate('Porto Velho - RO'),
      createDefaultReferral()
    );

    const certHtml = renderToStaticMarkup(
      React.createElement(DocumentoClinico, {
        tipo: 'certificate',
        doctor,
        patient: fastPatient,
        certificate: synced.certificate
      })
    );
    expect(certHtml).toContain('Carlos Eduardo Souza');
    expect(fastPatient.documentNumber).toBe('');
    expect(fastPatient.weightKg).toBe(0);
  });
});

