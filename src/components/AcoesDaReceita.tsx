import React from 'react';
import { Icon } from './Icon';
import { ActionButton } from './ui/ActionButton';

/**
 * Barra de Ações da Receita.
 * Estados de UI cobertos: empty (nenhum item na receita), loading (carregando emissão),
 * success (sucesso ao copiar texto) e error (alerta de médico não configurado).
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
  className = ''
}) => {
  const isDisabledSemMedico = !isMedicoConfigurado;
  const isActionDisabled = isDisabledSemMedico || itemsCount === 0;
  const avisoId = 'aviso-medico-config-acoes';

  return (
    <div className={`space-y-2.5 ${className}`}>
      {isDisabledSemMedico && (
        <div data-state="idle" aria-busy={false}
          id={avisoId}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="font-medium truncate">
              Configure nome e CRM do médico para emitir documentos.
            </span>
          </div>
          {onAbrirPerfilMedico && (
            <button
              type="button"
              onClick={onAbrirPerfilMedico}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#334155] hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-white/12 font-semibold text-xs transition shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
            >
              Configurar médico
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Botão Primário: Imprimir / Gerar PDF (Comando Canônico de Emissão) */}
          <ActionButton
            variant="primary"
            iconName="print"
            onClick={onNavigateToPrint}
            disabled={isActionDisabled}
            aria-describedby={isDisabledSemMedico ? avisoId : undefined}
            className="!px-2.5 !py-2 !gap-1 text-[11px] 2xl:text-xs rounded-xl font-bold shadow-tactile-btn"
            title={
              isDisabledSemMedico
                ? 'Configure nome e CRM do médico para emitir documentos.'
                : 'Emitir receita oficial: imprimir folha A4 ou gerar PDF'
            }
          >
            Imprimir / Gerar PDF
          </ActionButton>

          {/* Botão Secundário: Editor de Folha A4 (para edições manuais livres de timbrado ou texto) */}
          {onNavigateToEditor && (
            <ActionButton
              variant="secondary"
              iconName="description"
              onClick={onNavigateToEditor}
              disabled={itemsCount === 0}
              className="!px-2.5 !py-2 !gap-1 text-[11px] 2xl:text-xs rounded-xl font-bold shadow-tactile-sm text-slate-700 dark:text-slate-300"
              title="Abrir no Editor visual A4 para ajustes de texto livre, layout ou timbrados"
            >
              Editor de Folha A4
            </ActionButton>
          )}

          {/* Botão Secundário: WhatsApp (sem fundo verde, com contorno secundário) */}
          <ActionButton
            variant="secondary"
            iconName="send"
            onClick={onSendWhatsApp}
            disabled={isActionDisabled}
            aria-describedby={isDisabledSemMedico ? avisoId : undefined}
            className="!px-2.5 !py-2 !gap-1 text-[11px] 2xl:text-xs rounded-xl font-bold shadow-tactile-sm"
            title={
              isDisabledSemMedico
                ? 'Configure nome e CRM do médico para emitir documentos.'
                : 'Enviar receita no WhatsApp'
            }
          >
            WhatsApp
          </ActionButton>
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
            <Icon name="check" className="text-[14px] text-emerald-500" />
          ) : (
            <Icon name="content_copy" className="text-[14px]" />
          )}
          <span>{copiedSuccess ? 'Copiado!' : 'Copiar texto'}</span>
        </button>
      </div>
    </div>
  );
};
