import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  lgpdConsentService,
  LGPD_CONSENT_STORAGE_KEY,
  DEFAULT_LGPD_CONSENT,
} from '../services/lgpdConsentService';
import { storageService } from '../services/storageService';
import { LgpdConsentBanner } from '../components/lgpd/LgpdConsentBanner';
import { LgpdLocalModeNotice } from '../components/lgpd/LgpdLocalModeNotice';
import { LgpdSecurityModal } from '../components/lgpd/LgpdSecurityModal';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

describe('Segurança, Seleção de Cookies e Conformidade LGPD (Lei nº 13.709/2018)', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    const mockLocalStorage: Storage = {
      get length() {
        return store.size;
      },
      clear() {
        store.clear();
      },
      getItem(key: string) {
        return store.has(key) ? store.get(key)! : null;
      },
      key(index: number) {
        return Array.from(store.keys())[index] ?? null;
      },
      removeItem(key: string) {
        store.delete(key);
      },
      setItem(key: string, value: string) {
        store.set(key, String(value));
      },
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: mockLocalStorage,
        matchMedia: () => ({
          matches: false,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      },
      configurable: true,
      writable: true,
    });
  });

  it('retorna estado padrão de 1º acesso (consentedAt === null e cloudAuthCookies === false) quando não há escolha salva', () => {
    const initial = lgpdConsentService.loadConsent();
    expect(initial).toEqual(DEFAULT_LGPD_CONSENT);
    expect(initial.consentedAt).toBeNull();
    expect(initial.essentialStorage).toBe(true);
    expect(initial.cloudAuthCookies).toBe(false);
    expect(lgpdConsentService.hasUserConsented()).toBe(false);
  });

  it('registra consentimento de "Apenas Necessários (100% Local)" mantendo cookies de nuvem desativados', () => {
    const listener = vi.fn();
    const unsub = lgpdConsentService.subscribe(listener);

    const prefs = lgpdConsentService.acceptEssentialOnly();
    expect(prefs.consentedAt).toBeTypeOf('number');
    expect(prefs.essentialStorage).toBe(true);
    expect(prefs.cloudAuthCookies).toBe(false);
    expect(lgpdConsentService.hasUserConsented()).toBe(true);
    expect(listener).toHaveBeenCalledWith(prefs);

    unsub();
  });

  it('registra consentimento de "Aceitar Todos" habilitando cookies opcionais de autenticação em nuvem', () => {
    const prefs = lgpdConsentService.acceptAllCookies();
    expect(prefs.consentedAt).toBeTypeOf('number');
    expect(prefs.essentialStorage).toBe(true);
    expect(prefs.cloudAuthCookies).toBe(true);

    const reloaded = lgpdConsentService.loadConsent();
    expect(reloaded.cloudAuthCookies).toBe(true);
    expect(reloaded.consentedAt).toBe(prefs.consentedAt);
  });

  it('higieniza dados clínicos de plantão em computador compartilhado preservando perfil do médico e escolha LGPD (Art. 46 LGPD)', () => {
    storageService.saveItem('prescmed_doctor', { name: 'Dr. Melki', crm: '12345' });
    storageService.saveItem('prescmed_patient', { name: 'Paciente Sigiloso', weightKg: 70 });
    storageService.saveItem('prescmed_prescription', [{ id: '1', name: 'Dipirona 500 mg' }]);
    storageService.saveItem('prescmed_certificate', { cid10Code: 'J00' });
    lgpdConsentService.acceptEssentialOnly();

    lgpdConsentService.sanitizeSharedShiftClinicalData();

    expect(storageService.loadItem('prescmed_patient', null)).toBeNull();
    expect(storageService.loadItem('prescmed_prescription', null)).toBeNull();
    expect(storageService.loadItem('prescmed_certificate', null)).toBeNull();
    // Preserva CRM do médico e registro de consentimento LGPD
    expect(storageService.loadItem<{ name: string } | null>('prescmed_doctor', null)?.name).toBe('Dr. Melki');
    expect(storageService.loadRawString(LGPD_CONSENT_STORAGE_KEY)).not.toBeNull();
  });

  it('executa Direito de Eliminação Total (Art. 18, VI da LGPD) limpando todas as chaves prescmed_*', async () => {
    storageService.saveItem('prescmed_doctor', { name: 'Dr. Melki', crm: '12345' });
    storageService.saveItem('prescmed_patient', { name: 'Paciente', weightKg: 65 });
    lgpdConsentService.acceptAllCookies();

    await lgpdConsentService.eraseAllLocalData();

    expect(storageService.loadItem('prescmed_doctor', null)).toBeNull();
    expect(storageService.loadItem('prescmed_patient', null)).toBeNull();
    expect(lgpdConsentService.hasUserConsented()).toBe(false);
  });

  it('renderiza LgpdConsentBanner no 1º acesso com classe .no-print e os 3 botões canônicos de seleção de cookies', () => {
    const htmlOpen = renderToStaticMarkup(
      <LgpdConsentBanner
        isOpen={true}
        onAcceptEssential={vi.fn()}
        onAcceptAll={vi.fn()}
        onOpenCustomizeModal={vi.fn()}
      />
    );

    expect(htmlOpen).toContain('id="prescmed-lgpd-consent-banner"');
    expect(htmlOpen).toContain('no-print');
    expect(htmlOpen).toContain('Lei nº 13.709/2018');
    expect(htmlOpen).toContain('id="btn-lgpd-accept-essential"');
    expect(htmlOpen).toContain('Apenas Necessários (100% Local)');
    expect(htmlOpen).toContain('id="btn-lgpd-accept-all"');
    expect(htmlOpen).toContain('Aceitar Todos');
    expect(htmlOpen).toContain('id="btn-lgpd-customize"');
    expect(htmlOpen).toContain('Selecionar Cookies &amp; LGPD');

    const htmlClosed = renderToStaticMarkup(
      <LgpdConsentBanner
        isOpen={false}
        onAcceptEssential={vi.fn()}
        onAcceptAll={vi.fn()}
        onOpenCustomizeModal={vi.fn()}
      />
    );
    expect(htmlClosed).toBe('');
  });

  it('renderiza LgpdLocalModeNotice quando o usuário não faz login ou ativa o Modo Computador Compartilhado', () => {
    // 1. Modo Local Sem Login padrão
    const htmlNoLogin = renderToStaticMarkup(
      <LgpdLocalModeNotice
        isCloudAuthenticated={false}
        sharedComputerMode={false}
        isDismissed={false}
        hasActiveClinicalData={true}
        onOpenLgpdModal={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onSanitizeShiftData={vi.fn()}
        onDismiss={vi.fn()}
      />
    );

    expect(htmlNoLogin).toContain('id="prescmed-lgpd-local-mode-notice"');
    expect(htmlNoLogin).toContain('no-print');
    expect(htmlNoLogin).toContain('Modo Local • Sem Login (LGPD):');
    expect(htmlNoLogin).toContain('id="btn-lgpd-notice-sanitize"');
    expect(htmlNoLogin).toContain('id="btn-lgpd-notice-settings"');
    expect(htmlNoLogin).toContain('id="btn-lgpd-notice-dismiss"');

    // 2. Oculto quando o médico está logado e não está em computador compartilhado
    const htmlLogged = renderToStaticMarkup(
      <LgpdLocalModeNotice
        isCloudAuthenticated={true}
        sharedComputerMode={false}
        isDismissed={false}
        hasActiveClinicalData={false}
        onOpenLgpdModal={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onSanitizeShiftData={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(htmlLogged).toBe('');

    // 3. Sempre visível quando Modo Computador Compartilhado está ativo (mesmo se isDismissed=true)
    const htmlSharedPc = renderToStaticMarkup(
      <LgpdLocalModeNotice
        isCloudAuthenticated={false}
        sharedComputerMode={true}
        isDismissed={true}
        hasActiveClinicalData={false}
        onOpenLgpdModal={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onSanitizeShiftData={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(htmlSharedPc).toContain('Computador Compartilhado de Plantão (LGPD Art. 46):');
    expect(htmlSharedPc).toContain('id="btn-lgpd-notice-sanitize"');
  });

  it('renderiza LgpdSecurityModal com controles granulares de cookies (role="switch") e ações de direitos LGPD (Art. 18)', () => {
    const htmlModal = renderToStaticMarkup(
      <LgpdSecurityModal
        isOpen={true}
        darkMode={false}
        consent={DEFAULT_LGPD_CONSENT}
        isCloudAuthenticated={false}
        onSavePreferences={vi.fn()}
        onAcceptEssentialOnly={vi.fn()}
        onAcceptAll={vi.fn()}
        onSanitizeShiftData={vi.fn()}
        onEraseAllLocalData={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(htmlModal).toContain('id="prescmed-lgpd-security-modal"');
    expect(htmlModal).toContain('modal-content');
    expect(htmlModal).toContain('Sempre Ativo');
    expect(htmlModal).toContain('id="switch-cloud-cookies"');
    expect(htmlModal).toContain('id="switch-shared-pc-mode"');
    expect(htmlModal).toContain('id="btn-lgpd-modal-sanitize-shift"');
    expect(htmlModal).toContain('id="btn-lgpd-modal-erase-all"');
    expect(htmlModal).toContain('Operando em Modo 100% Local (Sem Login)');
  });

  it('exibe botão de acesso rápido ao Escudo LGPD no Header e na Sidebar', () => {
    const headerHtml = renderToStaticMarkup(
      <Header
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        onOpenLgpdModal={vi.fn()}
      />
    );
    expect(headerHtml).toContain('id="btn-header-lgpd-security"');

    const sidebarHtml = renderToStaticMarkup(
      <Sidebar
        darkMode={false}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        isOpen={true}
        onToggleOpen={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onOpenLgpdModal={vi.fn()}
      />
    );
    expect(sidebarHtml).toContain('id="btn-sidebar-lgpd-security"');
  });
});
