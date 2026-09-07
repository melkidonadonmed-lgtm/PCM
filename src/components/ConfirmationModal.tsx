import React, { useRef } from 'react';
import { useModalA11y } from '../hooks/useModalA11y';
import { AlertTriangle, X, Check } from 'lucide-react';

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

  const dialogRef = useRef<HTMLDivElement>(null);

  // Contenção de foco, inertização do fundo, Escape e restauração do foco.
  useModalA11y({ dialogRef, isOpen, onClose: onCancel, initialFocusRef: confirmButtonRef });

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-tab-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      tabIndex={-1}
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-md rounded-2xl p-6 relative border shadow-tactile-lg isolate transition-all"
        style={{
          backgroundColor: darkMode ? '#192130' : '#FFFFFF',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0',
          boxShadow: darkMode 
            ? '0 24px 50px -8px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255,255,255,0.08)' 
            : '0 20px 40px -8px rgba(20, 32, 50, 0.18), inset 0 1px 0 rgba(255,255,255,0.95)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div 
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger 
                ? 'bg-rose-500/10 text-rose-500' 
                : 'bg-navy-900/10 text-navy-900 dark:bg-cream-100/15 dark:text-cream-100'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 
              id="confirm-modal-title" 
              className="text-base font-bold text-navy-900 dark:text-cream-50"
            >
              {title}
            </h3>
            <p 
              id="confirm-modal-desc" 
              className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300"
            >
              {description}
            </p>
          </div>

          <button
            onClick={onCancel}
            aria-label="Fechar modal de confirmação"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-transparent bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-tactile-btn border-none flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white' 
                : 'bg-navy-900 hover:bg-navy-950 text-white dark:bg-cream-100 dark:hover:bg-white dark:text-navy-950'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
