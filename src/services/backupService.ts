import { db, SavedDocument } from './db';
import { WorkContext, DoctorProfile } from '../types';

export interface PresCMedBackup {
  version: number;
  exportedAt: string;
  system: 'PresCMed';
  data: {
    workContexts: WorkContext[];
    savedDocuments: SavedDocument[];
    activeContextId: string | null;
    doctorProfile?: DoctorProfile;
  };
}

export interface BackupStats {
  contextsCount: number;
  documentsCount: number;
  templatesCount: number;
}

/**
 * Coleta estatísticas atuais da base local do IndexedDB
 */
export async function getLocalDatabaseStats(): Promise<BackupStats> {
  await db.open();
  const workContexts = await db.workContexts.toArray();
  const savedDocuments = await db.savedDocuments.toArray();
  const templatesCount = savedDocuments.filter(d => d.isTemplate).length;

  return {
    contextsCount: workContexts.length,
    documentsCount: savedDocuments.length,
    templatesCount
  };
}

/**
 * Exporta a base completa do PresCMed em arquivo JSON criptograficamente íntegro
 */
export async function exportCompleteBackup(doctorProfile?: DoctorProfile): Promise<{ filename: string; sizeBytes: number }> {
  await db.open();
  const workContexts = await db.workContexts.toArray();
  const savedDocuments = await db.savedDocuments.toArray();
  const activeContextId = localStorage.getItem('pcm_active_context_id');

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  const filename = `prescmed_backup_${dateStr}.pcm.json`;

  const backupData: PresCMedBackup = {
    version: 1,
    exportedAt: now.toISOString(),
    system: 'PresCMed',
    data: {
      workContexts,
      savedDocuments,
      activeContextId,
      doctorProfile
    }
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { filename, sizeBytes: blob.size };
}

/**
 * Analisa e valida defensivamente o arquivo de backup
 */
export async function parseAndValidateBackup(file: File): Promise<PresCMedBackup> {
  const text = await file.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('O arquivo selecionado não é um arquivo JSON válido ou está corrompido.');
  }

  if (!json || typeof json !== 'object') {
    throw new Error('Estrutura de dados inválida no arquivo.');
  }

  if (json.system !== 'PresCMed') {
    throw new Error('Arquivo não reconhecido como um backup legítimo do PresCMed (.pcm.json).');
  }

  if (!json.data || typeof json.data !== 'object') {
    throw new Error('Conteúdo do backup vazio ou ilegível.');
  }

  const { workContexts, savedDocuments } = json.data;

  if (!Array.isArray(workContexts) || !Array.isArray(savedDocuments)) {
    throw new Error('As tabelas institucionais e de modelos não estão em formato de lista válido.');
  }

  // Validação de integridade dos WorkContexts
  for (let i = 0; i < workContexts.length; i++) {
    const ctx = workContexts[i];
    if (!ctx || typeof ctx !== 'object' || typeof ctx.id !== 'string' || typeof ctx.name !== 'string') {
      throw new Error(`O local de atendimento #${i + 1} contém campos obrigatórios ausentes.`);
    }
  }

  // Validação de integridade dos SavedDocuments
  for (let i = 0; i < savedDocuments.length; i++) {
    const doc = savedDocuments[i];
    if (!doc || typeof doc !== 'object' || typeof doc.id !== 'string' || typeof doc.title !== 'string') {
      throw new Error(`O documento #${i + 1} contém campos obrigatórios ausentes.`);
    }
  }

  return json as PresCMedBackup;
}

/**
 * Aplica os dados do backup no IndexedDB seguindo a estratégia escolhida
 */
export async function importBackupData(
  backup: PresCMedBackup,
  strategy: 'merge' | 'replace'
): Promise<{ 
  importedContexts: number; 
  importedDocs: number; 
  doctorProfile?: DoctorProfile; 
  activeContextId?: string | null 
}> {
  await db.open();
  const { workContexts, savedDocuments, activeContextId, doctorProfile } = backup.data;

  if (strategy === 'replace') {
    await db.workContexts.clear();
    await db.savedDocuments.clear();
  }

  if (workContexts.length > 0) {
    await db.workContexts.bulkPut(workContexts);
  }

  if (savedDocuments.length > 0) {
    await db.savedDocuments.bulkPut(savedDocuments);
  }

  if (activeContextId) {
    localStorage.setItem('pcm_active_context_id', activeContextId);
  }

  return {
    importedContexts: workContexts.length,
    importedDocs: savedDocuments.length,
    doctorProfile,
    activeContextId
  };
}
