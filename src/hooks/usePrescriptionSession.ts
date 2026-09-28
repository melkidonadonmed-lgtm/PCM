import { useState, useEffect, useCallback } from 'react';
import {
  DoctorProfile,
  Patient,
  PrescriptionItem,
  ExamItem,
  MedicalCertificate,
  MedicalReferral
} from '../types';
import { storageService } from '../services/storageService';

export const DEFAULT_DOCTOR: DoctorProfile = {
  name: '',
  crm: '',
  crmState: 'SP',
  specialty: 'Clínica Médica',
  rqe: '',
  clinicName: '',
  address: '',
  cityState: '',
  phone: '',
  email: '',
  showSignature: true,
  stampText: ''
};

export const DEFAULT_PATIENT: Patient = {
  id: '',
  name: '',
  weightKg: 0,
  birthDate: '',
  ageText: '',
  gender: 'male',
  documentNumber: '',
  phone: '',
  allergies: []
};

const createDefaultCertificate = (cityState?: string): MedicalCertificate => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  return {
    id: 'cert-1',
    patientName: '',
    documentType: 'CPF',
    documentNumber: '',
    daysOff: 2,
    startDate: today,
    endDate: tomorrow,
    periodText: 'por motivo de doença e necessidade de repouso',
    includeCID: true,
    cid10Code: 'J00',
    cid10Description: 'Nasofaringite aguda (resfriado comum)',
    observations: 'Paciente necessita de repouso e hidratação domiciliar durante o período estipulado.',
    cityDateText: (cityState || 'Brasil') + ', ' + new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  };
};

const createDefaultReferral = (): MedicalReferral => {
  return {
    id: 'ref-1',
    patientName: '',
    documentNumber: '',
    destinationSpecialty: 'Cardiologia Ambulatorial',
    destinationInstitution: 'Ambulatório de Especialidades',
    priority: 'prioritario',
    reason: 'Investigação diagnóstica e acompanhamento especializado.',
    clinicalSummary: 'Paciente com indicação de avaliação especializada.',
    relevantExams: '',
    hypothesisCID: '',
    date: new Date().toISOString().split('T')[0]
  };
};

export const DEFAULT_EXAM_INDICATION = 'Investigação clínica de rotina e controle metabólico.';

export function usePrescriptionSession() {
  // 1. Doctor Profile
  const [doctor, setDoctor] = useState<DoctorProfile>(() =>
    storageService.loadItem('prescmed_doctor', DEFAULT_DOCTOR)
  );

  // 2. Patient
  const [patient, setPatient] = useState<Patient>(() =>
    storageService.loadItem('prescmed_patient', DEFAULT_PATIENT)
  );

  // 3. Prescription Items
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>(() =>
    storageService.loadItem('prescmed_prescription', [])
  );

  // 4. Selected Exams
  const [selectedExams, setSelectedExams] = useState<ExamItem[]>(() =>
    storageService.loadItem('prescmed_exams', [])
  );

  // 5. Exam Indication
  const [examIndication, setExamIndication] = useState<string>(() =>
    storageService.loadItem('prescmed_exam_indication', DEFAULT_EXAM_INDICATION)
  );

  // 6. Medical Certificate
  const [certificate, setCertificate] = useState<MedicalCertificate>(() =>
    storageService.loadItem('prescmed_certificate', createDefaultCertificate(doctor.cityState))
  );

  // 7. Medical Referral
  const [referral, setReferral] = useState<MedicalReferral>(() =>
    storageService.loadItem('prescmed_referral', createDefaultReferral())
  );

  // Sincronização automática com localStorage via storageService
  useEffect(() => {
    storageService.saveItem('prescmed_doctor', doctor);
  }, [doctor]);

  useEffect(() => {
    storageService.saveItem('prescmed_patient', patient);
    // Sincroniza dados básicos do paciente com atestados e encaminhamentos
    setCertificate(prev => ({
      ...prev,
      patientName: patient.name || '',
      documentNumber: patient.documentNumber || ''
    }));
    setReferral(prev => ({
      ...prev,
      patientName: patient.name || '',
      documentNumber: patient.documentNumber || ''
    }));
  }, [patient]);

  useEffect(() => {
    storageService.saveItem('prescmed_prescription', prescriptionItems);
  }, [prescriptionItems]);

  useEffect(() => {
    storageService.saveItem('prescmed_exams', selectedExams);
  }, [selectedExams]);

  useEffect(() => {
    storageService.saveItem('prescmed_exam_indication', examIndication);
  }, [examIndication]);

  useEffect(() => {
    storageService.saveItem('prescmed_certificate', certificate);
  }, [certificate]);

  useEffect(() => {
    storageService.saveItem('prescmed_referral', referral);
  }, [referral]);

  // Ação auxiliar: Iniciar Novo Atendimento (limpa paciente e dados clínicos, preservando perfil do médico)
  const startNewConsultation = useCallback(() => {
    setPatient({ ...DEFAULT_PATIENT, id: `pat-${Date.now()}` });
    setPrescriptionItems([]);
    setSelectedExams([]);
    setExamIndication(DEFAULT_EXAM_INDICATION);
    setCertificate(createDefaultCertificate(doctor.cityState));
    setReferral(createDefaultReferral());

    storageService.removeItem('prescmed_patient');
    storageService.removeItem('prescmed_prescription');
    storageService.removeItem('prescmed_exams');
    storageService.removeItem('prescmed_exam_indication');
    storageService.removeItem('prescmed_certificate');
    storageService.removeItem('prescmed_referral');
  }, [doctor.cityState]);

  return {
    doctor,
    setDoctor,
    patient,
    setPatient,
    prescriptionItems,
    setPrescriptionItems,
    selectedExams,
    setSelectedExams,
    examIndication,
    setExamIndication,
    certificate,
    setCertificate,
    referral,
    setReferral,
    startNewConsultation
  };
}
