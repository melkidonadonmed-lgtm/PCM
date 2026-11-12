import {
  DoctorProfile,
  Patient,
  SusFilledFormData,
  WorkContext,
} from '../types';

export interface SusPatientExtras {
  patientRaceColor: SusFilledFormData['patientRaceColor'];
  patientEthnicity: string;
  patientHeightCm: string;
  patientEmail: string;
}

export interface SusClinicOverride {
  clinicName?: string;
  cnes?: string;
}

export type SusRoutedFieldUpdate =
  | {
      kind: 'doctor';
      patch: Partial<DoctorProfile>;
      clinicOverride?: SusClinicOverride;
    }
  | {
      kind: 'patient';
      patch: Partial<Patient>;
      weightDraft?: string;
    }
  | {
      kind: 'susExtra';
      key: keyof SusPatientExtras;
      value: string;
    }
  | {
      kind: 'specific';
    };

const DOCTOR_STRING_FIELD_MAP: Partial<
  Record<keyof SusFilledFormData, keyof DoctorProfile>
> = {
  doctorName: 'name',
  doctorCrm: 'crm',
  doctorCrmState: 'crmState',
  doctorSpecialty: 'specialty',
  doctorCpf: 'cpf',
  doctorCns: 'cns',
};

const PATIENT_STRING_FIELD_MAP: Partial<
  Record<keyof SusFilledFormData, keyof Patient>
> = {
  patientName: 'name',
  patientCpf: 'documentNumber',
  patientCns: 'cns',
  patientMotherName: 'motherName',
  patientPhone: 'phone',
  patientAddress: 'address',
  patientNeighborhood: 'neighborhood',
  patientCity: 'city',
  patientState: 'state',
  patientCep: 'cep',
  patientBirthDate: 'birthDate',
  patientAge: 'ageText',
};

export function resolveSusWeightString(
  propWeightKg: number | undefined,
  weightDraft: string | null
): string {
  const propWeight = propWeightKg || 0;
  if (weightDraft !== null) {
    const parsedDraft = parseFloat(weightDraft.replace(',', '.')) || 0;
    if (parsedDraft === propWeight) {
      return weightDraft;
    }
  }
  return propWeight > 0 ? String(propWeight) : '';
}

export function resolveSusCommonData(
  doctor: DoctorProfile | null | undefined,
  patient: Patient | null | undefined,
  activeContext: WorkContext | null | undefined,
  clinicOverride: SusClinicOverride,
  susPatientExtras: SusPatientExtras,
  weightDraft: string | null
) {
  const resolvedClinicName =
    clinicOverride.clinicName ??
    (activeContext?.clinicName || doctor?.clinicName || 'Unidade Básica de Saúde');
  const resolvedCnes =
    clinicOverride.cnes ??
    (activeContext
      ? activeContext.sphere === 'private'
        ? activeContext.cnes || ''
        : activeContext.cnes || doctor?.cnes || ''
      : doctor?.cnes || '');

  return {
    doctorName: doctor?.name ?? '',
    doctorCrm: doctor?.crm ?? '',
    doctorCrmState: doctor?.crmState || 'SP',
    doctorSpecialty: doctor?.specialty || 'Clínica Médica',
    doctorCnes: resolvedCnes,
    doctorClinicName: resolvedClinicName,
    doctorCpf: doctor?.cpf ?? '',
    doctorCns: doctor?.cns ?? '',

    patientSex: (patient?.sex || '') as SusFilledFormData['patientSex'],
    patientRaceColor: susPatientExtras.patientRaceColor,
    patientEthnicity: susPatientExtras.patientEthnicity,
    patientWeightKg: resolveSusWeightString(patient?.weightKg, weightDraft),
    patientHeightCm: susPatientExtras.patientHeightCm,
    patientEmail: susPatientExtras.patientEmail,

    patientName: patient?.name ?? '',
    patientCns: patient?.cns ?? '',
    patientCpf: patient?.documentNumber ?? '',
    patientBirthDate: patient?.birthDate ?? '',
    patientAge: patient?.ageText ?? '',
    patientGender: patient?.gender || 'female',
    patientMotherName: patient?.motherName ?? '',
    patientPhone: patient?.phone ?? '',
    patientAddress: patient?.address ?? '',
    patientNeighborhood: patient?.neighborhood ?? '',
    patientCity: patient?.city ?? '',
    patientState: patient?.state ?? '',
    patientCep: patient?.cep ?? '',
  };
}

export function routeSusFieldUpdate<K extends keyof SusFilledFormData>(
  field: K,
  value: SusFilledFormData[K] | string
): SusRoutedFieldUpdate {
  const strVal = typeof value === 'string' ? value : '';

  const mappedDoctorKey = DOCTOR_STRING_FIELD_MAP[field];
  if (mappedDoctorKey) {
    return { kind: 'doctor', patch: { [mappedDoctorKey]: strVal } };
  }
  if (field === 'doctorClinicName') {
    return {
      kind: 'doctor',
      patch: { clinicName: strVal },
      clinicOverride: { clinicName: strVal },
    };
  }
  if (field === 'doctorCnes') {
    return {
      kind: 'doctor',
      patch: { cnes: strVal },
      clinicOverride: { cnes: strVal },
    };
  }

  if (
    field === 'patientRaceColor' ||
    field === 'patientEthnicity' ||
    field === 'patientHeightCm' ||
    field === 'patientEmail'
  ) {
    return { kind: 'susExtra', key: field, value: strVal };
  }

  const mappedPatientKey = PATIENT_STRING_FIELD_MAP[field];
  if (mappedPatientKey) {
    return { kind: 'patient', patch: { [mappedPatientKey]: strVal } };
  }
  if (field === 'patientGender') {
    return {
      kind: 'patient',
      patch: {
        gender:
          strVal === 'male' || strVal === 'female' || strVal === 'other'
            ? strVal
            : 'female',
      },
    };
  }
  if (field === 'patientSex') {
    return {
      kind: 'patient',
      patch: { sex: strVal === 'M' || strVal === 'F' ? strVal : '' },
    };
  }
  if (field === 'patientWeightKg') {
    return {
      kind: 'patient',
      patch: { weightKg: parseFloat(strVal.replace(',', '.')) || 0 },
      weightDraft: strVal,
    };
  }

  return { kind: 'specific' };
}
