import type { Table } from 'dexie';
import type {
  Firestore,
  collection as firestoreCollection,
  doc as firestoreDoc,
  writeBatch as firestoreWriteBatch,
  getDocs as firestoreGetDocs
} from 'firebase/firestore';
import { getFirebaseInstances } from './firebaseClient';
import { cloudAuthService, type DoctorUserProfile } from './cloudAuthService';
import { db } from '../db';
import { storageService } from '../storageService';
import type { SavedDocument } from '../../types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
export type SyncStatusListener = (status: SyncStatus, pendingCount: number) => void;

interface SyncableEntity {
  id: string;
  updatedAt?: number;
  _deleted?: boolean;
}

type SyncCollectionKey = 'work_contexts' | 'prescription_models';

const PENDING_DELETES_STORAGE_KEY = 'prescmed_cloud_pending_deletes';
const MAX_FIRESTORE_BATCH_OPS = 450;
const MAX_FIRESTORE_DOC_BYTES = 950_000;

/**
 * Remove recursivamente campos `undefined` para prevenir exceções do Firestore SDK
 * (Unsupported field value: undefined).
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return data;
  }
  if (typeof data !== 'object' || data instanceof Date) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as T;
}

class CloudSyncManager {
  private isSyncing = false;
  private isApplyingRemoteChanges = false;
  private currentStatus: SyncStatus = 'idle';
  private pendingChangesCount = 0;
  private listeners: Set<SyncStatusListener> = new Set();
  private currentUser: DoctorUserProfile | null = null;
  private debounceTimer: number | null = null;
  private hooksRegistered = false;
  private pendingDeletedIds: Record<SyncCollectionKey, Set<string>> = {
    work_contexts: new Set<string>(),
    prescription_models: new Set<string>(),
  };

  constructor() {
    this.loadPendingDeletesFromStorage();
    this.initListeners();
    this.registerDexieHooks();
  }

  private loadPendingDeletesFromStorage(): void {
    const parsed = storageService.loadItem<Partial<Record<SyncCollectionKey, string[]>> | null>(
      PENDING_DELETES_STORAGE_KEY,
      null
    );
    if (!parsed) return;
    if (Array.isArray(parsed.work_contexts)) {
      parsed.work_contexts.forEach((id) => this.pendingDeletedIds.work_contexts.add(String(id)));
    }
    if (Array.isArray(parsed.prescription_models)) {
      parsed.prescription_models.forEach((id) =>
        this.pendingDeletedIds.prescription_models.add(String(id))
      );
    }
    this.recalculatePendingCount();
  }

  private persistPendingDeletesToStorage(): void {
    this.recalculatePendingCount();
    storageService.saveItem(PENDING_DELETES_STORAGE_KEY, {
      work_contexts: Array.from(this.pendingDeletedIds.work_contexts),
      prescription_models: Array.from(this.pendingDeletedIds.prescription_models),
    });
  }

  private recalculatePendingCount(): void {
    this.pendingChangesCount =
      this.pendingDeletedIds.work_contexts.size +
      this.pendingDeletedIds.prescription_models.size;
  }

  public recordPendingDelete(collectionKey: SyncCollectionKey, id: string): void {
    if (!id) return;
    this.pendingDeletedIds[collectionKey].add(String(id));
    this.persistPendingDeletesToStorage();
  }

  public getPendingDeletedIds(collectionKey: SyncCollectionKey): string[] {
    return Array.from(this.pendingDeletedIds[collectionKey]);
  }

  /**
   * Inicializa escutas de conectividade e sessão de usuário.
   */
  private initListeners(): void {
    if (typeof window === 'undefined') return;

    // Escuta estado da autenticação
    cloudAuthService.subscribe((user) => {
      this.currentUser = user;
      if (user && navigator.onLine) {
        this.triggerSyncDebounced(1500); // Dispara sync inicial após autenticação
      } else if (!navigator.onLine) {
        this.setStatus('offline');
      } else {
        this.setStatus('idle');
      }
    });

    // Escuta reconexão de rede
    window.addEventListener('online', () => {
      if (this.currentUser) {
        this.triggerSyncDebounced(1000);
      } else {
        this.setStatus('idle');
      }
    });

    window.addEventListener('offline', () => {
      this.setStatus('offline');
    });
  }

  /**
   * Intercepta operações no IndexedDB para sincronizar modelos e postos automaticamente.
   */
  private registerDexieHooks(): void {
    if (this.hooksRegistered) return;
    this.hooksRegistered = true;

    try {
      // 1. Postos de Trabalho (WorkContexts)
      db.workContexts.hook('creating', (_primKey, obj) => {
        if (this.isApplyingRemoteChanges) return;
        obj.updatedAt = Date.now();
        if (obj?.id) {
          this.pendingDeletedIds.work_contexts.delete(String(obj.id));
          this.persistPendingDeletesToStorage();
        }
        this.triggerSyncDebounced();
      });

      db.workContexts.hook('updating', (modifications: Record<string, unknown>) => {
        if (this.isApplyingRemoteChanges) return;
        modifications.updatedAt = Date.now();
        this.triggerSyncDebounced();
      });

      db.workContexts.hook('deleting', (primKey) => {
        if (this.isApplyingRemoteChanges) return;
        this.recordPendingDelete('work_contexts', String(primKey));
        this.triggerSyncDebounced();
      });

      // 2. Documentos Salvos (Apenas templates/modelos - sigilo médico para prontuários)
      db.savedDocuments.hook('creating', (_primKey, obj) => {
        if (this.isApplyingRemoteChanges) return;
        obj.updatedAt = Date.now();
        if (obj.isTemplate) {
          if (obj.id) {
            this.pendingDeletedIds.prescription_models.delete(String(obj.id));
            this.persistPendingDeletesToStorage();
          }
          this.triggerSyncDebounced();
        }
      });

      db.savedDocuments.hook('updating', (modifications: Record<string, unknown>, _primKey, obj) => {
        if (this.isApplyingRemoteChanges) return;
        modifications.updatedAt = Date.now();
        if (obj.isTemplate || Boolean(modifications.isTemplate)) {
          this.triggerSyncDebounced();
        }
      });

      db.savedDocuments.hook('deleting', (primKey, obj) => {
        if (this.isApplyingRemoteChanges) return;
        if (obj?.isTemplate) {
          this.recordPendingDelete('prescription_models', String(primKey));
          this.triggerSyncDebounced();
        }
      });
    } catch (err) {
      console.warn('[CloudSync] Falha ao registrar hooks do Dexie:', err);
    }
  }

  /**
   * Gatilho com debounce para evitar tempestade de requisições ao digitar/salvar.
   */
  public triggerSyncDebounced(delayMs = 2000): void {
    if (!this.currentUser || !navigator.onLine) return;

    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.runFullSync().catch((err) => {
        console.warn('[CloudSync] Falha na sincronização em segundo plano:', err);
      });
    }, delayMs);
  }

  /**
   * Executa a sincronização bidirecional completa (Upstream + Downstream).
   */
  public async runFullSync(): Promise<void> {
    if (this.isSyncing || !this.currentUser || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    this.setStatus('syncing');

    try {
      const { db: firestore } = await getFirebaseInstances();
      const { 
        collection, 
        doc, 
        writeBatch, 
        getDocs 
      } = await import('firebase/firestore');

      const uid = this.currentUser.uid;

      // =======================================================================
      // 1. SINCRONIZAR WORK CONTEXTS (Postos de Trabalho / Timbrados)
      // =======================================================================
      await this.syncGenericCollection({
        collectionKey: 'work_contexts',
        firestorePath: `users/${uid}/work_contexts`,
        localTable: db.workContexts,
        firestore,
        collection,
        doc,
        writeBatch,
        getDocs,
        getLocalItems: async () => await db.workContexts.toArray()
      });

      // =======================================================================
      // 2. SINCRONIZAR MODELOS DE PRESCRIÇÃO (Templates reutilizáveis - LGPD)
      // =======================================================================
      await this.syncGenericCollection({
        collectionKey: 'prescription_models',
        firestorePath: `users/${uid}/prescription_models`,
        localTable: db.savedDocuments,
        firestore,
        collection,
        doc,
        writeBatch,
        getDocs,
        // Filtra estritamente templates para NUNCA sincronizar prontuários ou rascunhos de pacientes
        getLocalItems: async () => {
          const allDocs = await db.savedDocuments.toArray();
          return allDocs.filter((d: SavedDocument) => d.isTemplate === true);
        }
      });

      this.setStatus('synced');
    } catch (error) {
      console.error('[CloudSync] Erro no processamento do lote Firestore:', error);
      this.setStatus('error');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Algoritmo de resolução determinística por timestamp (Last-Write-Wins)
   * com propagação de exclusões (anti-ressurreição) e fatiamento de lotes (<= 450 ops).
   */
  private async syncGenericCollection<T extends SyncableEntity>(params: {
    collectionKey: SyncCollectionKey;
    firestorePath: string;
    localTable: Table<T, string>;
    firestore: Firestore;
    collection: typeof firestoreCollection;
    doc: typeof firestoreDoc;
    writeBatch: typeof firestoreWriteBatch;
    getDocs: typeof firestoreGetDocs;
    getLocalItems: () => Promise<T[]>;
  }): Promise<void> {
    const {
      collectionKey,
      firestorePath,
      localTable,
      firestore,
      collection,
      doc,
      writeBatch,
      getDocs,
      getLocalItems
    } = params;

    const colRef = collection(firestore, firestorePath);

    // 1. Obter registros da nuvem
    const cloudSnapshot = await getDocs(colRef);
    const cloudMap = new Map<string, T & SyncableEntity>();
    cloudSnapshot.forEach((snap) => {
      cloudMap.set(snap.id, { id: snap.id, ...snap.data() } as T & SyncableEntity);
    });

    // 2. Obter registros do IndexedDB local
    const localItems = await getLocalItems();
    const localMap = new Map<string, T>(
      localItems.map((item) => [String(item.id), item])
    );

    const pendingDeletesSet = this.pendingDeletedIds[collectionKey];
    const idsDeletedInThisRun: string[] = [];

    let currentBatch = writeBatch(firestore);
    let currentBatchOps = 0;
    const batchesToCommit: ReturnType<typeof writeBatch>[] = [];

    const enqueueBatchOp = (applyOp: (b: ReturnType<typeof writeBatch>) => void) => {
      if (currentBatchOps >= MAX_FIRESTORE_BATCH_OPS) {
        batchesToCommit.push(currentBatch);
        currentBatch = writeBatch(firestore);
        currentBatchOps = 0;
      }
      applyOp(currentBatch);
      currentBatchOps += 1;
    };

    // 2.1. Propagar exclusões locais pendentes para o Firestore (evita Zombie Records)
    for (const deletedId of Array.from(pendingDeletesSet)) {
      if (!localMap.has(deletedId)) {
        if (cloudMap.has(deletedId)) {
          const docRef = doc(firestore, firestorePath, deletedId);
          enqueueBatchOp((b) => b.delete(docRef));
          cloudMap.delete(deletedId);
        }
        idsDeletedInThisRun.push(deletedId);
      } else {
        // Foi recriado localmente antes do sync
        idsDeletedInThisRun.push(deletedId);
      }
    }

    // 3. Processar Local -> Cloud (Upstream)
    for (const localItem of localItems) {
      const localId = String(localItem.id);
      const cloudItem = cloudMap.get(localId);

      const localTime = localItem.updatedAt || 0;
      const cloudTime = cloudItem?.updatedAt || 0;

      if (!cloudItem || localTime > cloudTime) {
        const payload = sanitizeForFirestore({
          ...localItem,
          updatedAt: localTime || Date.now()
        });
        const approxBytes = JSON.stringify(payload).length;
        if (approxBytes > MAX_FIRESTORE_DOC_BYTES) {
          console.warn(
            `[CloudSync] Documento ${firestorePath}/${localId} excede limite seguro de 1 MiB (${approxBytes} bytes). Ignorado para preservar o lote.`
          );
          continue;
        }
        const docRef = doc(firestore, firestorePath, localId);
        enqueueBatchOp((b) => b.set(docRef, payload, { merge: true }));
      }
    }

    if (currentBatchOps > 0) {
      batchesToCommit.push(currentBatch);
    }

    // Comita alterações na nuvem em lotes seguros (<= 450 ops por batch)
    for (const b of batchesToCommit) {
      await b.commit();
    }

    if (idsDeletedInThisRun.length > 0) {
      idsDeletedInThisRun.forEach((id) => pendingDeletesSet.delete(id));
      this.persistPendingDeletesToStorage();
    }

    // 4. Processar Cloud -> Local (Downstream)
    this.isApplyingRemoteChanges = true;
    try {
      for (const [cloudId, cloudItem] of cloudMap.entries()) {
        if (pendingDeletesSet.has(cloudId)) {
          continue;
        }
        const localItem = localMap.get(cloudId);
        const localTime = localItem?.updatedAt || 0;
        const cloudTime = cloudItem.updatedAt || 0;

        if (!localItem || cloudTime > localTime) {
          if (cloudItem._deleted) {
            await localTable.delete(cloudId);
          } else {
            await localTable.put(cloudItem);
          }
        }
      }
    } finally {
      this.isApplyingRemoteChanges = false;
    }
  }

  /**
   * Inscrição de observadores na UI para status de sincronização.
   */
  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus, this.pendingChangesCount);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: SyncStatus): void {
    this.currentStatus = status;
    this.listeners.forEach((listener) => listener(status, this.pendingChangesCount));
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }
}

export const cloudSyncManager = new CloudSyncManager();
