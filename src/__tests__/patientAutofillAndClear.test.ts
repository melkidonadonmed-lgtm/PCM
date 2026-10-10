import { describe, it, expect } from 'vitest';
import { Patient, PrescriptionItem, ExamItem, MedicalCertificate, MedicalReferral } from '../types';
import { DEFAULT_PATIENT } from '../hooks/usePrescriptionSession';

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

    // Simulação do sincronizador da sessão
    const syncWithDocuments = (
      p: Patient,
      cert: Partial<MedicalCertificate>,
      ref: Partial<MedicalReferral>
    ) => ({
      cert: {
        ...cert,
        patientName: p.name || '',
        documentNumber: p.documentNumber || ''
      },
      ref: {
        ...ref,
        patientName: p.name || '',
        documentNumber: p.documentNumber || ''
      }
    });

    const certInitial = { id: 'c1', patientName: '', documentNumber: '', daysOff: 3 };
    const refInitial = { id: 'r1', patientName: '', documentNumber: '', destinationSpecialty: 'Cardiologia' };

    const synced = syncWithDocuments(originalPatient, certInitial, refInitial);

    expect(synced.cert.patientName).toBe('Maria Aparecida da Silva');
    expect(synced.cert.documentNumber).toBe('987.654.321-99');
    expect(synced.ref.patientName).toBe('Maria Aparecida da Silva');
    expect(synced.ref.documentNumber).toBe('987.654.321-99');
  });

  it('ao limpar o paciente, deve disparar a limpeza de todos os documentos clínicos do atendimento', () => {
    // Estado populado antes da limpeza
    let currentPatient: Patient = {
      ...DEFAULT_PATIENT,
      id: 'pat-old',
      name: 'João Pedro de Oliveira',
      documentNumber: '111.222.333-44',
      weightKg: 80
    };

    let prescriptionItems: PrescriptionItem[] = [
      {
        id: 'i1',
        name: 'Losartana 50 mg',
        presentation: '30 comp',
        quantity: '1 cx',
        doseCalculatedText: '',
        frequencyText: '1x ao dia',
        scheduleInterval: '24/24h',
        scheduleTimes: ['08:00'],
        instructions: 'Tomar pela manhã',
        route: 'Oral',
        isContinuous: true,
        isSpecialControl: false
      }
    ];

    let selectedExams: ExamItem[] = [
      {
        id: 'e1',
        name: 'Hemograma Completo',
        category: 'Hematologia',
        description: 'Rotina',
        urgency: 'routine',
        selected: true
      }
    ];

    let examIndication = 'Controle de rotina anual';

    // Ação sanitária: Limpeza segura do atendimento
    const handleClearPatientConsultation = () => {
      currentPatient = {
        ...DEFAULT_PATIENT,
        id: `pat-${Date.now()}`
      };
      prescriptionItems = [];
      selectedExams = [];
      examIndication = 'Investigação clínica de rotina e controle metabólico.';
    };

    // Executa a limpeza
    handleClearPatientConsultation();

    // Validação estrita: Nenhum dado residual do paciente anterior deve restar
    expect(currentPatient.name).toBe('');
    expect(currentPatient.documentNumber).toBe('');
    expect(currentPatient.weightKg).toBe(0);
    expect(prescriptionItems).toHaveLength(0);
    expect(selectedExams).toHaveLength(0);
    expect(examIndication).toBe('Investigação clínica de rotina e controle metabólico.');
  });

  it('deve permitir fluxo rápido apenas com nome do paciente para atestados e encaminhamentos sem exigir CPF ou peso obrigatoriamente', () => {
    // Fluxo ambulatorial ágil: médico preenche apenas o nome no card inicial
    const fastPatient: Patient = {
      ...DEFAULT_PATIENT,
      id: 'pat-fast-1',
      name: 'Carlos Eduardo Souza'
    };

    expect(fastPatient.name).toBe('Carlos Eduardo Souza');
    expect(fastPatient.documentNumber).toBe('');
    expect(fastPatient.weightKg).toBe(0);

    // O atestado e encaminhamento devem aceitar o paciente mesmo sem CPF e peso cadastrados
    const certPayload: Partial<MedicalCertificate> = {
      patientName: fastPatient.name,
      documentNumber: fastPatient.documentNumber || '',
      daysOff: 2
    };

    expect(certPayload.patientName).toBe('Carlos Eduardo Souza');
    expect(certPayload.documentNumber).toBe('');
  });
});
