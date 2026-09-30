import React from 'react';
import { Printer, FileText, Send, Copy, Check } from 'lucide-react';
import { Icon } from './Icon';

export interface AcoesDaReceitaProps {
  itemsCount: number;
  isMedicoConfigurado: boolean;
  onNavigateToPrint: () => void;
  onNavigateToEditor?: () => void;
  onSendWhatsApp: () => void;
  onCopyText: () => void;
  copiedSuccess?: boolean;
  onAbrirPerfilMedico?: () => void;
  className?: string;
}

export const AcoesDaReceita: React.FC<AcoesDaReceitaProps> = ({
  itemsCount,
  isMedicoConfigurado,
  onNavigateToPrint,
  onNavigateToEditor,
  onSendWhatsApp,
  onCopyText,
  copiedSuccess = false,
  onAbrirPerfilMedico,
  className = ''
}) => {
  const isDisabledSemMedico = !isMedicoConfigurado;
  const isActionDisabled = isDisabledSemMedico || itemsCount === 0;
  const avisoId = 'aviso-medico-config-acoes';

  return (
    <div className={`space-y-2.5 ${className}`}>
      {isDisabledSemMedico && (
        <div
          id={avisoId}
          className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon name="warning" className="text-amber-600 dark:text-amber-400 text-[18px] shrink-0" />
            <span className="font-medium truncate">
              Configure nome e CRM do médico para emitir documentos.
            </span>
          </div>
          {onAbrirPerfilMedico && (
            <button
              type="button"
              onClick={onAbrirPerfilMedico}
              className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] transition shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Configurar médico
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão Primário: Visualizar (Editor A4 em tamanho real e editável) */}
          {onNavigateToEditor ? (
            <button
              type="button"
              onClick={onNavigateToEditor}
              disabled={itemsCount === 0}
              className="btn-tactile-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-tactile-btn focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Abrir a folha A4 oficial no Editor para conferir, editar ou imprimir"
            >
              <FileText className="w-4 h-4" />
              <span>Visualizar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNavigateToPrint}
              disabled={isActionDisabled}
              aria-describedby={isDisabledSemMedico ? avisoId : undefined}
              className="btn-tactile-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-tactile-btn focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          )}

          {/* Botão Secundário: Imprimir Direto (dispara impressão ou visualização de envio imediato) */}
          {onNavigateToEditor && (
            <button
              type="button"
              onClick={onNavigateToPrint}
              disabled={isActionDisabled}
              aria-describedby={isDisabledSemMedico ? avisoId : undefined}
              className="btn-tactile-secondary px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-tactile-sm focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
              title={
                isDisabledSemMedico
                  ? 'Configure nome e CRM do médico para emitir documentos.'
                  : 'Imprimir ou salvar PDF imediatamente sem passar pela edição'
              }
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>Imprimir Direto</span>
            </button>
          )}

          {/* Botão Secundário: WhatsApp (sem fundo verde, com contorno secundário) */}
          <button
            type="button"
            onClick={onSendWhatsApp}
            disabled={isActionDisabled}
            aria-describedby={isDisabledSemMedico ? avisoId : undefined}
            className="btn-tactile-secondary px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 cursor-pointer shadow-tactile-sm focus-visible:ring-2 focus-visible:ring-sky-500"
            title={
              isDisabledSemMedico
                ? 'Configure nome e CRM do médico para emitir documentos.'
                : 'Enviar receita no WhatsApp'
            }
          >
            <Send className="w-4 h-4" strokeWidth={2} />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Botão Terciário: Copiar texto */}
        <button
          type="button"
          onClick={onCopyText}
          disabled={isActionDisabled}
          aria-describedby={isDisabledSemMedico ? avisoId : undefined}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:underline flex items-center gap-1.5 py-2 px-1 cursor-pointer transition rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500"
          title={
            isDisabledSemMedico
              ? 'Configure nome e CRM do médico para emitir documentos.'
              : 'Copiar texto da receita'
          }
        >
          {copiedSuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
          ) : (
            <Copy className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          <span>{copiedSuccess ? 'Copiado!' : 'Copiar texto'}</span>
        </button>
      </div>
    </div>
  );
};
