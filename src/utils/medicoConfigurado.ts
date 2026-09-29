import type { DoctorProfile } from '../types';

// Documento médico só pode ser emitido (impressão, PDF ou texto compartilhado)
// com nome e CRM do médico preenchidos. Os nomes de src/data/exemplos.ts
// aparecem apenas como placeholder e na prévia marcada "EXEMPLO".
export function medicoConfigurado(doctor: DoctorProfile | null | undefined): boolean {
  return Boolean(doctor?.name?.trim() && doctor?.crm?.trim());
}
