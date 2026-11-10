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
      className={`mb-2 rounded-2xl border px-3 py-1.5 text-xs no-print transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 ${
        sharedComputerMode
          ? 'bg-amber-500/10 border-amber-500/30 text-[var(--text-main)]'
          : 'bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] shadow-tactile-sm'
      }`}
    >
      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
            sharedComputerMode
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
              : 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25'
          }`}
        >
          <Icon name={sharedComputerMode ? 'warning' : 'shield'} size={15} />
        </span>

        <div className="min-w-0 flex-1 leading-snug">
          {sharedComputerMode ? (
            <p>
              <strong className="font-bold text-amber-800 dark:text-amber-300">
                Computador Compartilhado de Plantão (LGPD Art. 46):
              </strong>{' '}
              Os dados da consulta ficam gravados localmente neste navegador. Ao encerrar seu turno na UBS/Hospital, clique em{' '}
              <strong>Limpar Plantão</strong> para remover dados de pacientes.
            </p>
          ) : (
            <p>
              <strong className="font-bold text-[var(--text-main)]">
                Modo Local • Sem Login (LGPD):
              </strong>{' '}
              Pacientes e receitas permanecem <strong>100% restritos a este navegador</strong> (sem envio a servidores). Sem login na nuvem, seus timbrados e modelos ficam salvos apenas neste dispositivo.
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
            className="px-2.5 py-1.5 min-h-[32px] rounded-xl border border-amber-500/35 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
            title="Limpar imediatamente dados do paciente, receita, exames e atestado atual deste navegador"
          >
            <Icon name="ink_eraser" size={14} />
            <span>Limpar Plantão</span>
          </button>
        )}

        <button
          id="btn-lgpd-notice-backup"
          type="button"
          onClick={onOpenBackupModal}
          className="px-2.5 py-1.5 min-h-[32px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          title="Exportar ou restaurar backup portátil (.pcm.json) sem precisar de login"
        >
          <Icon name="cloud_download" size={14} className="text-sky-600 dark:text-sky-400" />
          <span>Backup (.pcm)</span>
        </button>

        <button
          id="btn-lgpd-notice-settings"
          type="button"
          onClick={onOpenLgpdModal}
          className="px-2.5 py-1.5 min-h-[32px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          title="Gerenciar seleção de cookies, privacidade e direitos LGPD"
        >
          <Icon name="tune" size={14} className="text-sky-600 dark:text-sky-400" />
          <span>Cookies &amp; LGPD</span>
        </button>

        {!sharedComputerMode && (
          <button
            id="btn-lgpd-notice-dismiss"
            type="button"
            onClick={onDismiss}
            aria-label="Ocultar aviso de modo local sem login"
            title="Ocultar aviso (você pode reabrir a qualquer momento no escudo LGPD no topo ou menu lateral)"
            className="px-2 py-1.5 min-h-[32px] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)] font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          >
            <Icon name="close" size={14} />
            <span className="sr-only sm:not-sr-only">Ocultar</span>
          </button>
        )}
      </div>
    </div>
  );
};
