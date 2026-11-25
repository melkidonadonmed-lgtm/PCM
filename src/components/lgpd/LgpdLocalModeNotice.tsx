import React from 'react';
import { Icon } from '../Icon';

/**
 * Faixa Contextual de Aviso LGPD quando o médico opera Sem Login (Modo Local)
 * ou em Computador Compartilhado de Plantão (UBS / UPA / Enfermaria).
 * Estados de UI cobertos: empty (usuário autenticado ou aviso recolhido), idle (exibindo status local),
 * loading (higienizando sessão) e success (sessão limpa).
 */
export interface LgpdLocalModeNoticeProps {
  /** Se o médico está conectado à nuvem Firebase */
  isCloudAuthenticated: boolean;
  /** Se o médico ativou o Modo Computador Compartilhado de Plantão */
  sharedComputerMode: boolean;
  /** Se o médico já recolheu o aviso compacto de modo sem login */
  isDismissed: boolean;
  /** Se existe algum dado de paciente ou item prescrito na consulta atual */
  hasActiveClinicalData: boolean;
  onOpenLgpdModal: () => void;
  onOpenBackupModal: () => void;
  onSanitizeShiftData: () => void;
  onDismiss: () => void;
}

export const LgpdLocalModeNotice: React.FC<LgpdLocalModeNoticeProps> = ({
  isCloudAuthenticated,
  sharedComputerMode,
  isDismissed,
  hasActiveClinicalData,
  onOpenLgpdModal,
  onOpenBackupModal,
  onSanitizeShiftData,
  onDismiss,
}) => {
  // Exibe quando: (1) Modo Computador Compartilhado está ativo, OU (2) Médico não fez login e não recolheu o aviso
  const shouldRender = sharedComputerMode || (!isCloudAuthenticated && !isDismissed);

  if (!shouldRender) return null;

  return (
    <div
      id="prescmed-lgpd-local-mode-notice"
      role="status"
      aria-live="polite"
      data-state="idle"
      aria-busy={false}
      className={`mb-2 rounded-2xl bg-[var(--surface-card-lit)] border border-[var(--hairline)] border-l-[3px] px-3 py-1.5 text-xs no-print transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 text-[var(--ink-secondary)] ${
        sharedComputerMode
          ? 'border-l-[var(--accent-amber)]'
          : 'border-l-[var(--ink-clinical)]'
      }`}
    >
      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[var(--surface-chip-muted)] border border-[var(--hairline)] ${
            sharedComputerMode
              ? 'text-[var(--accent-amber)]'
              : 'text-[var(--ink-clinical)]'
          }`}
        >
          <Icon name={sharedComputerMode ? 'warning' : 'shield'} size={15} />
        </span>

        <div className="min-w-0 flex-1 leading-snug">
          {sharedComputerMode ? (
            <p>
              <strong className="font-bold text-[var(--ink-primary)]">
                Computador Compartilhado de Plantão (LGPD Art. 46):
              </strong>{' '}
              Os dados da consulta ficam gravados localmente neste navegador. Ao encerrar seu turno na UBS/Hospital, clique em{' '}
              <strong className="text-[var(--ink-primary)]">Limpar Plantão</strong> para remover dados de pacientes.
            </p>
          ) : (
            <p>
              <strong className="font-bold text-[var(--ink-primary)]">
                Modo Local • Sem Login (LGPD):
              </strong>{' '}
              Dados salvos <strong>apenas neste navegador</strong>.
              <span className="hidden sm:inline"> Timbrados e modelos permanecem offline no dispositivo.</span>
            </p>
          )}
        </div>
      </div>

      {/* Ações rápidas inline */}
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        {(sharedComputerMode || hasActiveClinicalData) && (
          <button
            id="btn-lgpd-notice-sanitize"
            type="button"
            onClick={onSanitizeShiftData}
            className="btn-tactile-danger touch-target px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-xl font-bold text-[11px] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] outline-none"
            title="Limpar imediatamente dados do paciente, receita, exames e atestado atual deste navegador"
          >
            <Icon name="ink_eraser" size={14} className="text-[var(--accent-amber)]" />
            <span>Limpar Plantão</span>
          </button>
        )}

        <button
          id="btn-lgpd-notice-backup"
          type="button"
          onClick={onOpenBackupModal}
          className="btn-tactile-secondary touch-target px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-xl font-semibold text-[11px] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
          title="Exportar ou restaurar backup portátil (.pcm.json) sem precisar de login"
        >
          <Icon name="cloud_download" size={14} className="text-[var(--ink-clinical)]" />
          <span>Backup (.pcm)</span>
        </button>

        <button
          id="btn-lgpd-notice-settings"
          type="button"
          onClick={onOpenLgpdModal}
          className="btn-tactile-secondary touch-target px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-xl font-semibold text-[11px] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
          title="Gerenciar seleção de cookies, privacidade e direitos LGPD"
        >
          <Icon name="tune" size={14} className="text-[var(--ink-clinical)]" />
          <span>Cookies &amp; LGPD</span>
        </button>

        {!sharedComputerMode && (
          <button
            id="btn-lgpd-notice-dismiss"
            type="button"
            onClick={onDismiss}
            aria-label="Ocultar aviso de modo local sem login"
            title="Ocultar aviso (você pode reabrir a qualquer momento no escudo LGPD no topo ou menu lateral)"
            className="touch-target px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-hover)] font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
          >
            <Icon name="close" size={14} />
            <span className="sr-only sm:not-sr-only">Ocultar</span>
          </button>
        )}
      </div>
    </div>
  );
};
