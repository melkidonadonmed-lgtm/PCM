import { getFirebaseInstances } from './firebaseClient';
import { cloudAuthService, type DoctorUserProfile } from './cloudAuthService';
import { db } from '../db';
import type { WorkContext, SavedDocument } from '../../types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
export type SyncStatusListener = (status: SyncStatus, pendingCount: number) => void;

interface SyncableEntity {
  id: string;
  updatedAt?: number;
  _deleted?: boolean;
}

class CloudSyncManager {
  private isSyncing = false;
  private currentStatus: SyncStatus = 'idle';
  private pendingChangesCount = 0;
  private listeners: Set<SyncStatusListener> = new Set();
  private currentUser: DoctorUserProfile | null = null;
  private debounceTimer: number | null = null;
  private hooksRegistered = false;

  constructor() {
    this.initListeners();
    this.registerDexieHooks();
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
        obj.updatedAt = Date.now();
        this.triggerSyncDebounced();
      });

      db.workContexts.hook('updating', (modifications: any) => {
        modifications.updatedAt = Date.now();
        this.triggerSyncDebounced();
      });

      db.workContexts.hook('deleting', () => {
        this.triggerSyncDebounced();
      });

      // 2. Documentos Salvos (Apenas templates/modelos - sigilo médico para prontuários)
      db.savedDocuments.hook('creating', (_primKey, obj) => {
        obj.updatedAt = Date.now();
        if (obj.isTemplate) {
          this.triggerSyncDebounced();
        }
      });

      db.savedDocuments.hook('updating', (modifications: any, _primKey, obj) => {
        modifications.updatedAt = Date.now();
        if (obj.isTemplate || modifications.isTemplate) {
          this.triggerSyncDebounced();
        }
      });

      db.savedDocuments.hook('deleting', (_primKey, obj) => {
        if (obj.isTemplate) {
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
   * Algoritmo de resolução determinística por timestamp (Last-Write-Wins).
   */
  private async syncGenericCollection<T extends SyncableEntity>(params: {
    firestorePath: string;
    localTable: any;
    firestore: any;
    collection: any;
    doc: any;
    writeBatch: any;
    getDocs: any;
    getLocalItems: () => Promise<T[]>;
  }): Promise<void> {
    const {
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
    cloudSnapshot.forEach((snap: any) => {
      cloudMap.set(snap.id, { id: snap.id, ...snap.data() } as T & SyncableEntity);
    });

    // 2. Obter registros do IndexedDB local
    const localItems = await getLocalItems();
    const localMap = new Map<string, T>(
      localItems.map((item) => [String(item.id), item])
    );

    const batch = writeBatch(firestore);
    let hasCloudWrites = false;

    // 3. Processar Local -> Cloud (Upstream)
    for (const localItem of localItems) {
      const localId = String(localItem.id);
      const cloudItem = cloudMap.get(localId);

      const localTime = localItem.updatedAt || 0;
      const cloudTime = cloudItem?.updatedAt || 0;

      if (!cloudItem || localTime > cloudTime) {
        // Envia versão mais recente local para a nuvem
        const docRef = doc(firestore, firestorePath, localId);
        const payload = {
          ...localItem,
          updatedAt: localTime || Date.now()
        };
        batch.set(docRef, payload, { merge: true });
        hasCloudWrites = true;
      }
    }

    // Comita alterações na nuvem se houver dados novos locais
    if (hasCloudWrites) {
      await batch.commit();
    }

    // 4. Processar Cloud -> Local (Downstream)
    for (const [cloudId, cloudItem] of cloudMap.entries()) {
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
