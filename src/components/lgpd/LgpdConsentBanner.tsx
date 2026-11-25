import React from 'react';
import { Icon } from '../Icon';

/**
 * Banner Inferior Não-Bloqueante de 1º Acesso — Seleção de Cookies e Aviso LGPD.
 * Estados de UI cobertos: empty (oculto após consentimento), idle (aguardando seleção do médico),
 * loading (gravando preferência) e success (consentimento aplicado).
 * Segue `content-first-noise-reduction` e ergonomia clínica YMYL: não bloqueia cálculos de emergência
 * e nunca é impresso na FolhaA4 (`.no-print`).
 */
export interface LgpdConsentBannerProps {
  isOpen: boolean;
  onAcceptEssential: () => void;
  onAcceptAll: () => void;
  onOpenCustomizeModal: () => void;
}

export const LgpdConsentBanner: React.FC<LgpdConsentBannerProps> = ({
  isOpen,
  onAcceptEssential,
  onAcceptAll,
  onOpenCustomizeModal,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      id="prescmed-lgpd-consent-banner"
      role="region"
      aria-label="Aviso de Privacidade, Seleção de Cookies e Conformidade LGPD"
      data-state="idle"
      aria-busy={false}
      className="fixed bottom-16 lg:bottom-4 inset-x-2.5 sm:inset-x-4 lg:inset-x-6 z-[58] max-w-screen-xl mx-auto no-print animate-tab-fade"
    >
      <div className="rounded-2xl border border-[var(--hairline)] border-l-[3px] border-l-[var(--ink-clinical)] bg-[var(--surface-card)] p-3.5 sm:p-4 shadow-[var(--elevation-high)] text-[var(--text-main)] flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Texto explicativo de 1º acesso, LGPD e operação sem login */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-chip-muted)] text-[var(--ink-clinical)] border border-[var(--hairline)] flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="shield" size={20} filled />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                Segurança Clínica, Cookies &amp; LGPD (Lei nº 13.709/2018)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--surface-chip-muted)] text-[var(--ink-primary)] border border-[var(--hairline)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" aria-hidden="true" />
                <span>100% Local-First • Zero Rastreadores</span>
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong>Privacidade por padrão (Art. 11 e 46 da LGPD):</strong> Dados de pacientes, receitas, exames e leitos ficam{' '}
              <strong>exclusivamente no armazenamento local deste navegador</strong> e nunca são enviados a servidores.{' '}
              <strong>Sem login:</strong> seus timbrados e modelos ficam salvos apenas neste dispositivo. Utilizamos apenas armazenamento técnico essencial offline; cookies de autenticação Google (Nuvem) são opcionais.
            </p>
          </div>
        </div>

        {/* Botões de decisão rápida (Zero Dark Patterns, mesma hierarquia visual e alvos >= 44px) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <button
            id="btn-lgpd-customize"
            type="button"
            onClick={onOpenCustomizeModal}
            className="btn-tactile-secondary w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
          >
            <Icon name="tune" size={16} className="text-[var(--ink-clinical)] shrink-0" />
            <span>Selecionar Cookies &amp; LGPD</span>
          </button>

          <button
            id="btn-lgpd-accept-essential"
            type="button"
            onClick={onAcceptEssential}
            className="btn-tactile-secondary flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
            title="Ativar apenas armazenamento local essencial offline e bloquear cookies de nuvem"
          >
            <Icon name="lock" size={15} className="text-[var(--ink-clinical)] shrink-0" />
            <span>Apenas Necessários (100% Local)</span>
          </button>

          <button
            id="btn-lgpd-accept-all"
            type="button"
            onClick={onAcceptAll}
            className="flex-1 sm:flex-initial btn-tactile-primary min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
            title="Permitir armazenamento local essencial e cookies opcionais caso conecte a Nuvem Google"
          >
            <Icon name="check" size={16} className="shrink-0" />
            <span>Aceitar Todos</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
