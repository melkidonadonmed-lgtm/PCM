import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

/**
 * Modal de Confirmação Acessível (substitui window.confirm).
 * Estados de UI cobertos: empty (fechado/vazio), loading (carregando ação),
 * success (ação confirmada com sucesso) e error (alerta de ação destrutiva/falha).
 */
export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  darkMode: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  darkMode,
  onConfirm,
  onCancel
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen,
    onClose: onCancel,
    containerRef: modalRef,
    initialFocusRef: confirmButtonRef,
  });

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      ref={modalRef}
      data-state="idle"
      aria-busy={false}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[oklch(0.14_0.02_258/0.60)] animate-backdrop-fade surface-raised"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div 
        className="w-full max-w-md rounded-2xl p-6 relative tactile-modal modal-content isolate transition modal-surface-spring"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div 
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border bg-[var(--surface-chip-muted)] border-[var(--hairline)] ${
              isDanger 
                ? 'text-[var(--status-danger)]' 
                : 'text-[var(--ink-clinical)]'
            }`}
          >
            <Icon name="warning" className="text-[24px]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 
              id="confirm-modal-title" 
              className="text-base font-bold text-[var(--text-main)]"
            >
              {title}
            </h3>
            <p 
              id="confirm-modal-desc" 
              className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar modal de confirmação"
            className="btn-tactile-icon touch-target text-[var(--ink-muted)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[var(--hairline)]">
          <button
            type="button"
            onClick={onCancel}
            className="btn-tactile-secondary min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 focus-visible:ring-2 focus-visible:outline-none ${
              isDanger
                ? 'btn-tactile-danger focus-visible:ring-[var(--status-danger)]'
                : 'btn-tactile-primary focus-visible:ring-[var(--accent-focus)]'
            }`}
          >
            <Icon name="check" className={`text-[16px] ${isDanger ? 'text-[var(--status-danger)]' : ''}`} />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
