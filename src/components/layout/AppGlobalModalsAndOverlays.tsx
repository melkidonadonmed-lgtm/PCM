import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Icon } from '../Icon';
import {
  ActiveTab,
  DoctorProfile,
  LgpdConsentPreferences,
  Patient,
  SusDocumentId,
  WorkContext,
} from '../../types';
import type { HospitalBedPatientRecord } from '../../core/domain/clinicalEntities';
import type { HospitalSubViewId } from '../hospital/HospitalWardModuleView';
import { ClinicalKit } from '../../data/clinicalKits';
import { UnifiedMedication } from '../../data/medicationDatabase';
import { LgpdConsentBanner } from '../lgpd/LgpdConsentBanner';
import { lgpdConsentService } from '../../services/lgpdConsentService';
import { storageService } from '../../services/storageService';
import { cloudAuthService, type DoctorUserProfile } from '../../services/cloud/cloudAuthService';

const CommandPaletteModal = React.lazy(() =>
  import('./CommandPaletteModal').then((m) => ({ default: m.CommandPaletteModal }))
);
const PatientModal = React.lazy(() => import('../PatientModal'));
const DoctorProfileModal = React.lazy(() => import('../DoctorProfileModal'));
const BackupModal = React.lazy(() => import('../BackupModal'));
const LgpdSecurityModal = React.lazy(() => import('../lgpd/LgpdSecurityModal'));

export function useAppThemeAndSidebarViewport(onIdlePreload?: () => void) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = storageService.loadRawString('prescmed_theme');
    return saved !== null ? saved === 'dark' : false;
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    storageService.saveRawString('prescmed_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const DESKTOP_BREAKPOINT = 1024;
    let wasDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;

    const handleBreakpointChange = () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      if (isDesktop !== wasDesktop) {
        wasDesktop = isDesktop;
        setSidebarOpen(isDesktop);
      }
    };

    handleBreakpointChange();
    window.addEventListener('resize', handleBreakpointChange);
    return () => window.removeEventListener('resize', handleBreakpointChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 1024;
    if (isMobile && sidebarOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (!onIdlePreload || typeof window === 'undefined') return;
    const idleWin = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof idleWin.requestIdleCallback === 'function') {
      idleWin.requestIdleCallback(onIdlePreload, { timeout: 2500 });
    } else {
      setTimeout(onIdlePreload, 1200);
    }
  }, [onIdlePreload]);

  return {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
  };
}

export interface UseAppLgpdAndCloudGovernanceParams {
  startNewConsultation: () => void;
  setDoctor: React.Dispatch<React.SetStateAction<DoctorProfile>>;
  loadContexts: () => Promise<void>;
  reloadHospitalBedsFromStorage: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export function useAppLgpdAndCloudGovernance({
  startNewConsultation,
  setDoctor,
  loadContexts,
  reloadHospitalBedsFromStorage,
  onShowToast,
}: UseAppLgpdAndCloudGovernanceParams) {
  const [lgpdConsent, setLgpdConsent] = useState<LgpdConsentPreferences>(() =>
    lgpdConsentService.loadConsent()
  );
  const [cloudUser, setCloudUser] = useState<DoctorUserProfile | null>(() =>
    cloudAuthService.getCurrentUser()
  );

  useEffect(() => {
    const unsubscribeLgpd = lgpdConsentService.subscribe((nextPrefs) => {
      setLgpdConsent(nextPrefs);
    });
    let unsubscribeAuth: (() => void) | undefined;
    cloudAuthService.subscribe((userProfile) => {
      setCloudUser(userProfile);
    }).then((unsub) => {
      unsubscribeAuth = unsub;
    });

    return () => {
      unsubscribeLgpd();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  const handleAcceptEssentialCookies = useCallback(() => {
    const updated = lgpdConsentService.acceptEssentialOnly();
    setLgpdConsent(updated);
    if (cloudUser) {
      cloudAuthService.logout().catch(() => {});
    }
    onShowToast('Modo 100% Local ativado: apenas armazenamento essencial offline permitido.');
  }, [cloudUser, onShowToast]);

  const handleAcceptAllCookies = useCallback(() => {
    const updated = lgpdConsentService.acceptAllCookies();
    setLgpdConsent(updated);
    onShowToast('Preferências LGPD salvas: armazenamento local e nuvem opcional habilitados.');
  }, [onShowToast]);

  const handleSaveLgpdPreferences = useCallback(
    (prefs: {
      cloudAuthCookies: boolean;
      sharedComputerMode: boolean;
      dismissedNoLoginNotice?: boolean;
    }) => {
      const updated = lgpdConsentService.saveConsent(prefs, { markConsentedNow: true });
      setLgpdConsent(updated);
      if (!prefs.cloudAuthCookies && cloudUser) {
        cloudAuthService.logout().catch(() => {});
      }
      onShowToast('Configurações de segurança e cookies LGPD atualizadas.');
    },
    [cloudUser, onShowToast]
  );

  const handleSanitizeShiftData = useCallback(() => {
    lgpdConsentService.sanitizeSharedShiftClinicalData();
    startNewConsultation();
    onShowToast('Plantão higienizado: dados do paciente e consulta ativa removidos do navegador.');
  }, [startNewConsultation, onShowToast]);

  const handleEraseAllLocalData = useCallback(async () => {
    if (cloudUser) {
      await cloudAuthService.logout({ clearLocalSession: true });
    }
    await lgpdConsentService.eraseAllLocalData();
    startNewConsultation();
    setDoctor({
      name: '',
      crm: '',
      crmState: 'SP',
      specialty: '',
      clinicName: '',
      address: '',
      cityState: '',
      phone: '',
      email: '',
      showSignature: true,
    });
    await loadContexts();
    await reloadHospitalBedsFromStorage();
    onShowToast('Base local eliminada com sucesso conforme Art. 18, VI da LGPD.');
  }, [cloudUser, startNewConsultation, setDoctor, loadContexts, reloadHospitalBedsFromStorage, onShowToast]);

  const handleDismissNoLoginNotice = useCallback(() => {
    const updated = lgpdConsentService.setNoLoginNoticeDismissed(true);
    setLgpdConsent(updated);
  }, []);

  return {
    lgpdConsent,
    cloudUser,
    handleAcceptEssentialCookies,
    handleAcceptAllCookies,
    handleSaveLgpdPreferences,
    handleSanitizeShiftData,
    handleEraseAllLocalData,
    handleDismissNoLoginNotice,
  };
}

export interface AppGlobalModalsAndOverlaysProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  setDoctor: React.Dispatch<React.SetStateAction<DoctorProfile>>;
  patient: Patient;
  setPatient: React.Dispatch<React.SetStateAction<Patient>>;
  activeContext: WorkContext | null;
  saveContext: (ctx: WorkContext) => Promise<void>;
  hospitalBeds: HospitalBedPatientRecord[];
  setActiveHospitalBedId: React.Dispatch<React.SetStateAction<string>>;
  setHospitalSubView: React.Dispatch<React.SetStateAction<HospitalSubViewId>>;
  setProtocolSearchQuery: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
  isCommandPaletteOpen: boolean;
  handleCloseCommandPalette: () => void;
  handleSelectTab: (tab: ActiveTab) => void;
  handleSelectSusDocFromPalette: (docId: SusDocumentId) => void;
  handleSelectScoreFromPalette: (calculatorId: string) => void;
  handleAplicarKit: (kit: ClinicalKit) => void;
  handleUsarMedicamento: (med: UnifiedMedication) => void;
  isPatientModalOpen: boolean;
  handleOpenPatientModal: () => void;
  handleClosePatientModal: () => void;
  handleClearPatient: () => void;
  isDoctorModalOpen: boolean;
  handleOpenDoctorModal: () => void;
  handleCloseDoctorModal: () => void;
  isBackupModalOpen: boolean;
  handleOpenBackupModal: () => void;
  handleCloseBackupModal: () => void;
  handleBackupRestored: () => Promise<void>;
  isLgpdModalOpen: boolean;
  handleOpenLgpdModal: () => void;
  handleCloseLgpdModal: () => void;
  lgpdConsent: LgpdConsentPreferences;
  cloudUser: DoctorUserProfile | null;
  handleSaveLgpdPreferences: (prefs: {
    cloudAuthCookies: boolean;
    sharedComputerMode: boolean;
    dismissedNoLoginNotice?: boolean;
  }) => void;
  handleAcceptEssentialCookies: () => void;
  handleAcceptAllCookies: () => void;
  handleSanitizeShiftData: () => void;
  handleEraseAllLocalData: () => Promise<void>;
  showInstallHelp: boolean;
  closeInstallHelp: () => void;
  installHelpModalRef: React.RefObject<HTMLDivElement | null>;
  kitToast: string | null;
}

export const AppGlobalModalsAndOverlays: React.FC<AppGlobalModalsAndOverlaysProps> = ({
  darkMode,
  doctor,
  setDoctor,
  patient,
  setPatient,
  activeContext,
  saveContext,
  hospitalBeds,
  setActiveHospitalBedId,
  setHospitalSubView,
  setProtocolSearchQuery,
  setActiveTab,
  isCommandPaletteOpen,
  handleCloseCommandPalette,
  handleSelectTab,
  handleSelectSusDocFromPalette,
  handleSelectScoreFromPalette,
  handleAplicarKit,
  handleUsarMedicamento,
  isPatientModalOpen,
  handleOpenPatientModal,
  handleClosePatientModal,
  handleClearPatient,
  isDoctorModalOpen,
  handleOpenDoctorModal,
  handleCloseDoctorModal,
  isBackupModalOpen,
  handleOpenBackupModal,
  handleCloseBackupModal,
  handleBackupRestored,
  isLgpdModalOpen,
  handleOpenLgpdModal,
  handleCloseLgpdModal,
  lgpdConsent,
  cloudUser,
  handleSaveLgpdPreferences,
  handleAcceptEssentialCookies,
  handleAcceptAllCookies,
  handleSanitizeShiftData,
  handleEraseAllLocalData,
  showInstallHelp,
  closeInstallHelp,
  installHelpModalRef,
  kitToast,
}) => {
  return (
    <>
      {isCommandPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPaletteModal
            isOpen={isCommandPaletteOpen}
            onClose={handleCloseCommandPalette}
            onSelectTab={handleSelectTab}
            onSelectSusDoc={handleSelectSusDocFromPalette}
            onSelectScore={handleSelectScoreFromPalette}
            onAplicarKit={handleAplicarKit}
            onUsarMedicamento={handleUsarMedicamento}
            onOpenPatientModal={handleOpenPatientModal}
            onOpenDoctorModal={handleOpenDoctorModal}
            hospitalBeds={hospitalBeds}
            onSelectHospitalBed={(bedId) => {
              setActiveHospitalBedId(bedId);
              setHospitalSubView('evolution_form');
              setActiveTab('hospital');
            }}
            onSelectProtocol={(query) => {
              setProtocolSearchQuery(query);
              setActiveTab('protocols');
            }}
          />
        </Suspense>
      )}

      {isPatientModalOpen && (
        <Suspense fallback={null}>
          <PatientModal
            darkMode={darkMode}
            patient={patient}
            onSavePatient={setPatient}
            onClearPatient={handleClearPatient}
            onClose={handleClosePatientModal}
          />
        </Suspense>
      )}

      {isDoctorModalOpen && (
        <Suspense fallback={null}>
          <DoctorProfileModal
            darkMode={darkMode}
            doctor={doctor}
            onSaveDoctor={setDoctor}
            onClose={handleCloseDoctorModal}
            activeContext={activeContext}
            onSaveContext={saveContext}
          />
        </Suspense>
      )}

      {isBackupModalOpen && (
        <Suspense fallback={null}>
          <BackupModal
            isOpen={isBackupModalOpen}
            darkMode={darkMode}
            doctor={doctor}
            onUpdateDoctor={setDoctor}
            onBackupRestored={handleBackupRestored}
            onClose={handleCloseBackupModal}
          />
        </Suspense>
      )}

      {isLgpdModalOpen && (
        <Suspense fallback={null}>
          <LgpdSecurityModal
            isOpen={isLgpdModalOpen}
            darkMode={darkMode}
            consent={lgpdConsent}
            isCloudAuthenticated={Boolean(cloudUser)}
            cloudUserEmail={cloudUser?.email || cloudUser?.displayName}
            onSavePreferences={handleSaveLgpdPreferences}
            onAcceptEssentialOnly={handleAcceptEssentialCookies}
            onAcceptAll={handleAcceptAllCookies}
            onSanitizeShiftData={handleSanitizeShiftData}
            onEraseAllLocalData={handleEraseAllLocalData}
            onOpenBackupModal={handleOpenBackupModal}
            onClose={handleCloseLgpdModal}
          />
        </Suspense>
      )}

      <LgpdConsentBanner
        isOpen={lgpdConsent.consentedAt === null}
        onAcceptEssential={handleAcceptEssentialCookies}
        onAcceptAll={handleAcceptAllCookies}
        onOpenCustomizeModal={handleOpenLgpdModal}
      />

      {showInstallHelp && (
        <div
          role="dialog"
          aria-modal="true"
          data-state="idle"
          aria-busy={false}
          aria-labelledby="install-help-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 animate-backdrop-fade"
          onClick={closeInstallHelp}
        >
          <div
            ref={installHelpModalRef}
            className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-2xl space-y-4 text-[var(--text-main)] modal-surface-spring"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 id="install-help-modal-title" className="text-sm font-bold">Instalar PresCMed no Dispositivo</h3>
              <button
                type="button"
                onClick={closeInstallHelp}
                aria-label="Fechar instruções de instalação"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              <div className="p-3 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] space-y-1">
                <p className="font-bold text-[var(--text-main)]">No Android (Chrome / Edge / Samsung):</p>
                <p>Toque no ícone de menu <strong>⋮</strong> (canto superior ou inferior do navegador) e selecione <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong>.</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] space-y-1">
                <p className="font-bold text-[var(--text-main)]">No iPhone / iPad (Safari):</p>
                <p>Toque no botão <strong>Compartilhar</strong> na barra do navegador e escolha <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.</p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={closeInstallHelp}
                className="btn-tactile-primary h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {kitToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-tactile-lg border border-slate-700/50"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{kitToast}</span>
        </div>
      )}
    </>
  );
};
