import React from 'react';
import { ActionButton } from './ui/ActionButton';

/**
 * Prescription Action Bar.
 * Covers explicit UI states: empty (no items), loading (issuance),
 * success (text copied), and error/alert (doctor profile unconfigured).
 */
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
  className = '',
}) => {
  const isDisabledSemMedico = !isMedicoConfigurado;
  const isTextShareDisabled = itemsCount === 0;
  const avisoId = 'aviso-medico-config-acoes';

  return (
    <div className={`space-y-2.5 ${className}`}>
      {isDisabledSemMedico && (
        <div
          data-state="idle"
          aria-busy={false}
          id={avisoId}
          className="px-3 py-2 rounded-[10px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] text-[var(--ink-secondary)] text-xs flex items-center justify-between gap-2.5"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)] shrink-0" aria-hidden="true" />
            <span className="font-medium leading-snug">
              Configure nome e CRM do médico para emitir documentos.
            </span>
          </div>
          {onAbrirPerfilMedico && (
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={onAbrirPerfilMedico}
              className="shrink-0 whitespace-nowrap"
            >
              Configurar médico
            </ActionButton>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Primary CTA: Print / Generate PDF (always enabled, including blank sheet printing) */}
        <ActionButton
          variant="primary"
          iconName="print"
          onClick={onNavigateToPrint}
          aria-describedby={isDisabledSemMedico ? avisoId : undefined}
          className="w-full whitespace-nowrap"
          title={
            itemsCount === 0
              ? 'Imprimir ou gerar PDF da receita em branco (para anotações à mão e carimbo)'
              : 'Emitir receita oficial: imprimir folha A4 ou gerar PDF'
          }
        >
          Imprimir / Gerar PDF
        </ActionButton>

        {/* Secondary CTA: A4 Sheet Editor */}
        {onNavigateToEditor && (
          <ActionButton
            variant="secondary"
            iconName="description"
            onClick={onNavigateToEditor}
            className="w-full whitespace-nowrap"
            title="Abrir no Editor visual A4 para ajustes de texto livre, layout ou timbrados"
          >
            Editor de Folha A4
          </ActionButton>
        )}

        {/* Secondary CTA: WhatsApp */}
        <ActionButton
          variant="secondary"
          iconName="send"
          onClick={onSendWhatsApp}
          disabled={isTextShareDisabled}
          aria-describedby={isDisabledSemMedico ? avisoId : undefined}
          className="w-full whitespace-nowrap"
          title={
            isTextShareDisabled
              ? 'Adicione ao menos um medicamento para enviar o texto pelo WhatsApp'
              : 'Enviar receita no WhatsApp'
          }
        >
          WhatsApp
        </ActionButton>

        {/* Secondary CTA: Copy text */}
        <ActionButton
          variant="secondary"
          iconName={copiedSuccess ? 'check' : 'content_copy'}
          iconClassName={copiedSuccess ? 'text-[var(--ink-clinical)]' : undefined}
          onClick={onCopyText}
          disabled={isTextShareDisabled}
          state={copiedSuccess ? 'success' : 'idle'}
          aria-describedby={isDisabledSemMedico ? avisoId : undefined}
          className="w-full whitespace-nowrap"
          title={
            isTextShareDisabled
              ? 'Adicione ao menos um medicamento para copiar o texto'
              : 'Copiar texto da receita'
          }
        >
          {copiedSuccess ? 'Copiado!' : 'Copiar texto'}
        </ActionButton>
      </div>
    </div>
  );
};
