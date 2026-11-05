import type { LgpdConsentPreferences } from '../types';
import { storageService } from './storageService';
import { db } from './db';

export const LGPD_CONSENT_STORAGE_KEY = 'prescmed_lgpd_consent';

/**
 * Chaves do localStorage que contêm dados clínicos ou rascunhos da consulta ativa
 * (higienizáveis em 1 clique ao encerrar o plantão em computador compartilhado).
 */
export const CLINICAL_SESSION_STORAGE_KEYS = [
  'prescmed_patient',
  'prescmed_prescription',
  'prescmed_exams',
  'prescmed_exam_indication',
  'prescmed_certificate',
  'prescmed_referral',
  'prescmed_draft_referral',
  'prescmed_draft_certificate',
] as const;

/**
 * Todas as chaves de aplicativo no localStorage sujeitas ao Direito de Eliminação (Art. 18, VI da LGPD).
 */
export const ALL_PRESCMED_STORAGE_KEYS = [
  ...CLINICAL_SESSION_STORAGE_KEYS,
  'prescmed_doctor',
  'prescmed_show_kits',
  'prescmed_custom_styles',
  'prescmed_cloud_auth_active',
  'prescmed_cloud_pending_deletes',
  'prescmed_prescription_models',
  'prescmed_logo_left',
  'prescmed_logo_right',
  LGPD_CONSENT_STORAGE_KEY,
] as const;

export const DEFAULT_LGPD_CONSENT: LgpdConsentPreferences = {
  version: '1.0',
  consentedAt: null,
  essentialStorage: true,
  cloudAuthCookies: false,
  sharedComputerMode: false,
  dismissedNoLoginNotice: false,
};

type LgpdConsentListener = (prefs: LgpdConsentPreferences) => void;

class LgpdConsentService {
  private listeners: Set<LgpdConsentListener> = new Set();

  /**
   * Carrega o estado atual de consentimento LGPD e seleção de cookies do localStorage.
   * Quando `consentedAt === null`, significa que é o 1º acesso do médico no navegador.
   */
  loadConsent(): LgpdConsentPreferences {
    const raw = storageService.loadRawString(LGPD_CONSENT_STORAGE_KEY, null);
    if (!raw) {
      return { ...DEFAULT_LGPD_CONSENT };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<LgpdConsentPreferences>;
      if (!parsed || typeof parsed !== 'object') {
        return { ...DEFAULT_LGPD_CONSENT };
      }

      return {
        version: '1.0',
        consentedAt: typeof parsed.consentedAt === 'number' ? parsed.consentedAt : null,
        essentialStorage: true,
        cloudAuthCookies: Boolean(parsed.cloudAuthCookies),
        sharedComputerMode: Boolean(parsed.sharedComputerMode),
        dismissedNoLoginNotice: Boolean(parsed.dismissedNoLoginNotice),
      };
    } catch {
      return { ...DEFAULT_LGPD_CONSENT };
    }
  }

  /**
   * Verifica se o usuário já tomou uma decisão explícita sobre cookies e LGPD no navegador.
   */
  hasUserConsented(): boolean {
    return this.loadConsent().consentedAt !== null;
  }

  /**
   * Salva e propaga as preferências de consentimento LGPD e cookies.
   */
  saveConsent(
    partial: Partial<Omit<LgpdConsentPreferences, 'version' | 'essentialStorage'>>,
    options?: { markConsentedNow?: boolean }
  ): LgpdConsentPreferences {
    const current = this.loadConsent();
    const shouldStampTime = options?.markConsentedNow ?? true;

    const next: LgpdConsentPreferences = {
      version: '1.0',
      consentedAt:
        partial.consentedAt !== undefined
          ? partial.consentedAt
          : shouldStampTime
            ? current.consentedAt ?? Date.now()
            : current.consentedAt,
      essentialStorage: true,
      cloudAuthCookies:
        partial.cloudAuthCookies !== undefined
          ? Boolean(partial.cloudAuthCookies)
          : current.cloudAuthCookies,
      sharedComputerMode:
        partial.sharedComputerMode !== undefined
          ? Boolean(partial.sharedComputerMode)
          : current.sharedComputerMode,
      dismissedNoLoginNotice:
        partial.dismissedNoLoginNotice !== undefined
          ? Boolean(partial.dismissedNoLoginNotice)
          : current.dismissedNoLoginNotice,
    };

    storageService.saveItem(LGPD_CONSENT_STORAGE_KEY, next);
    this.notifyListeners(next);
    return next;
  }

  /**
   * Aceita apenas os cookies/armazenamento estritamente necessários (Modo 100% Local Offline, sem Firebase).
   */
  acceptEssentialOnly(): LgpdConsentPreferences {
    return this.saveConsent(
      {
        consentedAt: Date.now(),
        cloudAuthCookies: false,
      },
      { markConsentedNow: true }
    );
  }

  /**
   * Aceita armazenamento local essencial + cookies de autenticação em nuvem opcional (Google Firebase).
   */
  acceptAllCookies(): LgpdConsentPreferences {
    return this.saveConsent(
      {
        consentedAt: Date.now(),
        cloudAuthCookies: true,
      },
      { markConsentedNow: true }
    );
  }

  /**
   * Recolhe ou exibe novamente a faixa contextual de "Modo Local • Sem Login (LGPD)".
   */
  setNoLoginNoticeDismissed(dismissed: boolean): LgpdConsentPreferences {
    return this.saveConsent(
      {
        dismissedNoLoginNotice: dismissed,
      },
      { markConsentedNow: false }
    );
  }

  /**
   * Higieniza imediatamente os dados clínicos de pacientes e da consulta ativa no navegador
   * (Art. 46 da LGPD — Segurança em Computador Compartilhado de Plantão / UBS / Enfermaria),
   * preservando os timbrados institucionais e o perfil profissional do médico.
   */
  sanitizeSharedShiftClinicalData(): void {
    CLINICAL_SESSION_STORAGE_KEYS.forEach((key) => {
      storageService.removeItem(key);
    });
  }

  /**
   * Direito de Eliminação Total (Art. 18, VI da LGPD):
   * Remove todos os dados locais do PresCMed (localStorage + IndexedDB Dexie v3).
   */
  async eraseAllLocalData(): Promise<void> {
    ALL_PRESCMED_STORAGE_KEYS.forEach((key) => {
      storageService.removeItem(key);
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('prescmed_')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignora erro de acesso restrito ao storage
      }
    }

    if (typeof indexedDB !== 'undefined') {
      try {
        await Promise.all([
          db.workContexts.clear(),
          db.savedDocuments.clear(),
          db.hospitalBeds.clear(),
        ]);
      } catch (err) {
        console.warn('[LGPD] Aviso ao limpar tabelas do IndexedDB:', err);
      }
    }

    const resetPrefs: LgpdConsentPreferences = { ...DEFAULT_LGPD_CONSENT };
    this.notifyListeners(resetPrefs);
  }

  subscribe(listener: LgpdConsentListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(prefs: LgpdConsentPreferences): void {
    this.listeners.forEach((cb) => cb(prefs));
  }
}

export const lgpdConsentService = new LgpdConsentService();
