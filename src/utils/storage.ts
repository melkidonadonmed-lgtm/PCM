const blocked = new Set<string>();
const messages = new Set<string>();
export const getStorageMessages = () => [...messages];
function report(message: string) {
  messages.add(message);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('prescmed-storage-warning'));
}
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(s => typeof s === 'string');
export function validStoredValue(key: string, value: unknown): boolean {
  if (key === 'prescmed_prescription') return Array.isArray(value) && value.every(v => record(v) && ['id', 'name', 'presentation', 'quantity', 'instructions', 'route'].every(k => typeof v[k] === 'string') && (v.scheduleTimes === undefined || strings(v.scheduleTimes)) && (v.controlledSubstances === undefined || strings(v.controlledSubstances)));
  if (key === 'prescmed_exams') return Array.isArray(value) && value.every(v => record(v) && ['id', 'name', 'category'].every(k => typeof v[k] === 'string'));
  if (!record(value)) return false;
  if (key === 'prescmed_certificate' && (!['patientName', 'documentNumber', 'startDate', 'endDate'].every(k => typeof value[k] === 'string') || typeof value.includeCID !== 'boolean' || typeof value.daysOff !== 'number')) return false;
  if (key === 'prescmed_referral' && !['patientName', 'documentNumber', 'clinicalSummary', 'reason'].every(k => typeof value[k] === 'string')) return false;
  if (key === 'prescmed_patient' && value.gender !== undefined && !['male', 'female', 'other'].includes(String(value.gender))) return false;
  const numeric = new Set(['weightKg', 'daysOff']);
  const boolean = new Set(['showSignature', 'weightCalcEnabled', 'includeCID']);
  return Object.entries(value).every(([k, v]) => {
    if (k === 'allergies') return strings(v);
    if (numeric.has(k)) return typeof v === 'number' && Number.isFinite(v) && v >= 0;
    if (boolean.has(k)) return typeof v === 'boolean';
    return typeof v === 'string';
  });
}
const jsonKeys = new Set(['prescmed_doctor', 'prescmed_patient', 'prescmed_prescription', 'prescmed_exams', 'prescmed_certificate', 'prescmed_referral']);
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null && jsonKeys.has(key)) {
        try { if (!validStoredValue(key, JSON.parse(raw))) throw new Error(); }
        catch { blocked.add(key); report(`Dados inválidos em ${key}. O original foi preservado; alterações desta seção ficam apenas nesta sessão.`); return null; }
      }
      return raw;
    } catch { report('O navegador bloqueou o armazenamento. Alterações ficam apenas nesta sessão.'); return null; }
  },
  setItem(key: string, value: string) {
    if (blocked.has(key)) return false;
    try { localStorage.setItem(key, value); return true; }
    catch { report('Não foi possível salvar no navegador. Mantenha esta aba aberta e exporte seus documentos.'); return false; }
  },
  removeItem(key: string) {
    // Corrupt originals may only be removed through an explicit recovery operation.
    if (blocked.has(key)) return false;
    try { localStorage.removeItem(key); return true; }
    catch { report('Não foi possível limpar o armazenamento do navegador.'); return false; }
  },
};

export function downloadLocalBackup() {
  try {
    const data: Record<string, string | null> = {};
    for (const key of jsonKeys) data[key] = localStorage.getItem(key);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'prescmed-backup-local.json'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch { report('Não foi possível ler o armazenamento para gerar o backup.'); }
}
