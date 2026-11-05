import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import type { LgpdConsentPreferences } from '../../types';
import { ConfirmationModal } from '../ConfirmationModal';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

/**
 * Central de Segurança, Seleção Granular de Cookies e Conformidade LGPD (Lei nº 13.709/2018 & Sigilo CFM).
 * Estados de UI cobertos: empty (nenhum consentimento prévio), idle (exibindo controles granulares),
 * loading (executando limpeza/eliminação de dados locais) e success/error (feedback de operação).
 */
export interface LgpdSecurityModalProps {
  isOpen: boolean;
  darkMode: boolean;
  consent: LgpdConsentPreferences;
  isCloudAuthenticated: boolean;
  cloudUserEmail?: string | null;
  onSavePreferences: (prefs: {
    cloudAuthCookies: boolean;
    sharedComputerMode: boolean;
    dismissedNoLoginNotice?: boolean;
  }) => void;
  onAcceptEssentialOnly: () => void;
  onAcceptAll: () => void;
  onSanitizeShiftData: () => void;
  onEraseAllLocalData: () => Promise<void>;
  onOpenBackupModal: () => void;
  onClose: () => void;
}

export const LgpdSecurityModal: React.FC<LgpdSecurityModalProps> = ({
  isOpen,
  darkMode,
  consent,
  isCloudAuthenticated,
  cloudUserEmail,
  onSavePreferences,
  onAcceptEssentialOnly,
  onAcceptAll,
  onSanitizeShiftData,
  onEraseAllLocalData,
  onOpenBackupModal,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const [cloudCookiesEnabled, setCloudCookiesEnabled] = useState<boolean>(consent.cloudAuthCookies);
  const [sharedPcEnabled, setSharedPcEnabled] = useState<boolean>(consent.sharedComputerMode);
  const [showNoLoginBanner, setShowNoLoginBanner] = useState<boolean>(!consent.dismissedNoLoginNotice);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isErasingAll, setIsErasingAll] = useState<boolean>(false);
  const [confirmEraseAllOpen, setConfirmEraseAllOpen] = useState<boolean>(false);

  useModalAccessibility({
    isOpen,
    onClose,
    containerRef: modalRef,
  });

  useEffect(() => {
    if (isOpen) {
      setCloudCookiesEnabled(consent.cloudAuthCookies);
      setSharedPcEnabled(consent.sharedComputerMode);
      setShowNoLoginBanner(!consent.dismissedNoLoginNotice);
      setFeedbackMessage(null);
      setConfirmEraseAllOpen(false);
    }
  }, [isOpen, consent]);

  if (!isOpen) return null;

  const handleSaveCustom = () => {
    onSavePreferences({
      cloudAuthCookies: cloudCookiesEnabled,
      sharedComputerMode: sharedPcEnabled,
      dismissedNoLoginNotice: !showNoLoginBanner,
    });
    setFeedbackMessage('Preferências de cookies e segurança LGPD salvas com sucesso.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSanitizeClick = () => {
    onSanitizeShiftData();
    setFeedbackMessage('Dados clínicos da consulta ativa (paciente, receita, exames e atestado) removidos deste navegador.');
  };

  const handleConfirmEraseAll = async () => {
    setConfirmEraseAllOpen(false);
    setIsErasingAll(true);
    try {
      await onEraseAllLocalData();
      setFeedbackMessage('Toda a base local do PresCMed (localStorage e IndexedDB) foi eliminada deste navegador.');
    } finally {
      setIsErasingAll(false);
    }
  };

  return (
    <div
      ref={modalRef}
      id="prescmed-lgpd-security-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lgpd-security-modal-title"
      data-state={isErasingAll ? 'loading' : 'idle'}
      aria-busy={isErasingAll}
      className="fixed inset-0 z-[65] flex items-center justify-center p-3 sm:p-5 bg-black/70 isolate animate-backdrop-fade no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl tactile-modal modal-content text-[var(--text-main)] rounded-2xl overflow-hidden flex flex-col max-h-[92vh] modal-surface-spring"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0">
              <Icon name="shield" size={22} filled />
            </div>
            <div>
              <h2 id="lgpd-security-modal-title" className="text-base sm:text-lg font-bold">
                Segurança, Seleção de Cookies &amp; Conformidade LGPD
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Lei Geral de Proteção de Dados (Lei nº 13.709/2018) • Sigilo Médico CFM (Res. 1.658/2002 e 1.821/2007)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar central de segurança e LGPD"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Status Atual: Modo Local Sem Login vs Conectado */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              isCloudAuthenticated
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-sky-500/10 border-sky-500/30'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                isCloudAuthenticated
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-sky-500/20 text-sky-700 dark:text-sky-300'
              }`}
            >
              <Icon name={isCloudAuthenticated ? 'cloud_done' : 'lock'} size={18} />
            </div>
            <div className="space-y-1 text-xs leading-relaxed">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="font-bold text-sm text-[var(--text-main)]">
                  {isCloudAuthenticated
                    ? `Nuvem Opcional Conectada (${cloudUserEmail || 'Conta Google'})`
                    : 'Operando em Modo 100% Local (Sem Login)'}
                </strong>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  {consent.consentedAt
                    ? `Consentimento registrado em ${new Date(consent.consentedAt).toLocaleDateString('pt-BR')}`
                    : 'Aguardando seleção de cookies'}
                </span>
              </div>
              <p className="text-[var(--text-secondary)]">
                {isCloudAuthenticated
                  ? 'A sincronização em nuvem armazena apenas seus postos de trabalho (timbrados) e modelos reutilizáveis em branco. Dados nominais de pacientes, receitas ativas e leitos hospitalares jamais são enviados à nuvem.'
                  : 'Você não fez login. Todos os dados clínicos, receitas, timbrados e modelos estão gravados exclusivamente neste navegador (localStorage e IndexedDB), sem qualquer comunicação com servidores externos.'}
              </p>
            </div>
          </div>

          {/* SEÇÃO 1: SELEÇÃO GRANULAR DE COOKIES E ARMAZENAMENTO */}
          <section aria-labelledby="lgpd-cookies-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="lgpd-cookies-heading" className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Icon name="tune" size={16} className="text-sky-600 dark:text-sky-400" />
                <span>1. Seleção de Cookies e Armazenamento no Navegador</span>
              </h3>
            </div>

            {/* Categoria 1: Estritamente Necessários */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon name="verified_user" size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                    Cookies e Armazenamento Estritamente Necessários (Offline-First)
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold shrink-0">
                  Sempre Ativo
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Indispensáveis para o funcionamento clínico 100% offline da aplicação: rascunho da prescrição ativa, cálculo pediátrico por peso, geração da folha A4, tema visual (<code className="font-mono">prescmed_theme</code>), banco local (<code className="font-mono">IndexedDB / PresCMed_DB</code>), cache PWA (<code className="font-mono">Service Worker</code>) e guarda desta escolha LGPD. <strong>Não inclui nenhum rastreador publicitário ou analytics.</strong>
              </p>
            </div>

            {/* Categoria 2: Cookies de Autenticação e Nuvem Opcional (Firebase) */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="cloud" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
                  <label htmlFor="switch-cloud-cookies" className="text-xs sm:text-sm font-bold text-[var(--text-main)] cursor-pointer">
                    Cookies de Autenticação e Sincronização em Nuvem (Google Firebase)
                  </label>
                </div>
                <button
                  id="switch-cloud-cookies"
                  type="button"
                  role="switch"
                  aria-checked={cloudCookiesEnabled}
                  onClick={() => setCloudCookiesEnabled((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                    cloudCookiesEnabled ? 'bg-sky-600' : 'bg-slate-400 dark:bg-slate-700'
                  }`}
                >
                  <span className="sr-only">Permitir cookies de autenticação Google Firebase</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      cloudCookiesEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Quando ativado, autoriza o carregamento sob demanda do pacote <code className="font-mono">vendor-firebase</code> e cookies técnicos de sessão Google (<code className="font-mono">apis.google.com</code> / <code className="font-mono">firebaseapp.com</code>) caso você clique em <strong>Nuvem</strong> para sincronizar seus timbrados e modelos. Se desativado, o aplicativo bloqueia conexões com a nuvem e desconecta sessões ativas.
              </p>
            </div>

            {/* Categoria 3: Modo Computador Compartilhado de Plantão */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="local_hospital" size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <label htmlFor="switch-shared-pc-mode" className="text-xs sm:text-sm font-bold text-[var(--text-main)] cursor-pointer">
                    Modo Computador Compartilhado de Plantão (UBS / UPA / Enfermaria)
                  </label>
                </div>
                <button
                  id="switch-shared-pc-mode"
                  type="button"
                  role="switch"
                  aria-checked={sharedPcEnabled}
                  onClick={() => setSharedPcEnabled((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-amber-500 outline-none ${
                    sharedPcEnabled ? 'bg-amber-600' : 'bg-slate-400 dark:bg-slate-700'
                  }`}
                >
                  <span className="sr-only">Ativar modo computador compartilhado de plantão</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      sharedPcEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Recomendado quando você estiver usando um computador público ou compartilhado no consultório/hospital sem fazer login. Mantém visível no topo da tela a barra rápida de <strong>Limpar Plantão</strong> para apagar dados de pacientes ao final do turno (Art. 46 da LGPD).
              </p>
            </div>

            {/* Opção de reexibir aviso de Modo Sem Login */}
            {!isCloudAuthenticated && !sharedPcEnabled && (
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNoLoginBanner}
                  onChange={(e) => setShowNoLoginBanner(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-[var(--text-secondary)]">
                  Exibir faixa informativa de <strong>&ldquo;Modo Local • Sem Login (LGPD)&rdquo;</strong> no topo da bancada
                </span>
              </label>
            )}
          </section>

          {/* SEÇÃO 2: DIREITOS DO TITULAR E HIGIENIZAÇÃO DE DADOS (ART. 18 E 46 DA LGPD) */}
          <section aria-labelledby="lgpd-rights-heading" className="space-y-3 pt-1">
            <h3 id="lgpd-rights-heading" className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Icon name="security" size={16} className="text-sky-600 dark:text-sky-400" />
              <span>2. Higienização de Plantão &amp; Direitos LGPD (Art. 18 — Portabilidade e Eliminação)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Ação 1: Portabilidade */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBackupModal();
                }}
                className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-left flex flex-col justify-between gap-2 transition cursor-pointer group focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              >
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs">
                  <Icon name="cloud_download" size={18} />
                  <span>Portabilidade (.pcm)</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  Exporte ou restaure todos os seus locais, modelos e leitos em arquivo local (Art. 18, V).
                </p>
              </button>

              {/* Ação 2: Limpar Consulta / Fim de Plantão */}
              <button
                id="btn-lgpd-modal-sanitize-shift"
                type="button"
                onClick={handleSanitizeClick}
                className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left flex flex-col justify-between gap-2 transition cursor-pointer group focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
              >
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <Icon name="ink_eraser" size={18} />
                  <span>Limpar Consulta Atual</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  Apaga imediatamente paciente, receita, exames e atestado ativos, mantendo seu CRM e timbrados.
                </p>
              </button>

              {/* Ação 3: Eliminação Total (Reset do Navegador) */}
              <button
                id="btn-lgpd-modal-erase-all"
                type="button"
                onClick={() => setConfirmEraseAllOpen(true)}
                className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-left flex flex-col justify-between gap-2 transition cursor-pointer group focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
              >
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                  <Icon name="delete" size={18} />
                  <span>Eliminar Base Local</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  Apaga 100% dos dados do PresCMed (<code className="font-mono">localStorage</code> + <code className="font-mono">IndexedDB</code>) deste navegador (Art. 18, VI).
                </p>
              </button>
            </div>
          </section>

          {/* Feedback de ação executada */}
          {feedbackMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-tab-fade"
            >
              <Icon name="check_circle" size={16} className="shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onAcceptEssentialOnly();
                onClose();
              }}
              className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
            >
              Apenas Necessários
            </button>
            <button
              type="button"
              onClick={() => {
                onAcceptAll();
                onClose();
              }}
              className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
            >
              Aceitar Todos
            </button>
          </div>

          <button
            id="btn-lgpd-save-preferences"
            type="button"
            onClick={handleSaveCustom}
            className="w-full sm:w-auto btn-tactile-primary min-h-[40px] px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-tactile-btn cursor-pointer transition active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          >
            <Icon name="check" size={16} />
            <span>Salvar Preferências LGPD</span>
          </button>
        </div>
      </div>

      {/* Confirmação HITL para Eliminação Total */}
      <ConfirmationModal
        isOpen={confirmEraseAllOpen}
        title="Eliminar Toda a Base Local deste Navegador?"
        description="Esta ação exercerá a eliminação completa prevista no Art. 18, VI da LGPD: apagará todos os pacientes, receitas, leitos hospitalares, timbrados, modelos salvos e configurações deste navegador. Exporte seu backup (.pcm.json) antes se desejar guardar seus modelos."
        confirmLabel="Eliminar Todos os Dados Locais"
        cancelLabel="Cancelar"
        variant="danger"
        darkMode={darkMode}
        onConfirm={handleConfirmEraseAll}
        onCancel={() => setConfirmEraseAllOpen(false)}
      />
    </div>
  );
};

export default LgpdSecurityModal;
