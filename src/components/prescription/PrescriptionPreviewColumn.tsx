import React from 'react';
import { PrescriptionItem, Patient, DoctorProfile, WorkContext } from '../../types';
import { type RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';
import { DOCUMENTO_DO_REGIME } from '../../utils/documentoClinico';
import { notificacaoExigida } from '../../utils/notificacaoDeReceita';
import { FolhaA4 } from '../documento/FolhaA4';
import { DocumentoClinico } from '../documento/DocumentoClinico';
import { Icon } from '../Icon';
import { AcoesDaReceita } from '../AcoesDaReceita';
import { AvisoNotificacaoReceita } from '../AvisoNotificacaoReceita';
import { PediatricCalculator } from '../PediatricCalculator';

interface PrescriptionPreviewColumnProps {
  darkMode: boolean;
  mobileSection: 'composer' | 'preview';
  isDoctorConfigured: boolean;
  porRegime: Record<RegimeReceita, PrescriptionItem[]>;
  regimesComItens: RegimeReceita[];
  regimeAtivo: RegimeReceita;
  itemsInPreview: PrescriptionItem[];
  itemsCount: number;
  regimeLabels: Record<RegimeReceita, { rotulo: string; detalhe: string; tituloTexto: string }>;
  doctor: DoctorProfile;
  patient: Patient;
  activeContext: WorkContext | null;
  copiedSuccess: boolean;
  isPediatricDrawerOpen: boolean;
  pediatricDrawerRef: React.RefObject<HTMLDivElement | null>;
  onSelectPreviewRegime: (regime: RegimeReceita) => void;
  onNavigateToPrint: () => void;
  onNavigateToEditor?: () => void;
  onSendWhatsApp: () => void;
  onCopyText: () => void;
  onAbrirPerfilMedico?: () => void;
  onClosePediatricDrawer: () => void;
  onUpdatePatientWeight: (weightKg?: number) => void;
  onAddPediatricItem: (item: PrescriptionItem) => void;
}

export const PrescriptionPreviewColumn: React.FC<PrescriptionPreviewColumnProps> = ({
  darkMode,
  mobileSection,
  isDoctorConfigured,
  porRegime,
  regimesComItens,
  regimeAtivo,
  itemsInPreview,
  itemsCount,
  regimeLabels,
  doctor,
  patient,
  activeContext,
  copiedSuccess,
  isPediatricDrawerOpen,
  pediatricDrawerRef,
  onSelectPreviewRegime,
  onNavigateToPrint,
  onNavigateToEditor,
  onSendWhatsApp,
  onCopyText,
  onAbrirPerfilMedico,
  onClosePediatricDrawer,
  onUpdatePatientWeight,
  onAddPediatricItem,
}) => {
  return (
    <>
      {/* RIGHT COLUMN: Real-Time A4 Document Simulation (Sticky Tactile Sheet) */}
      <div className={`xl:col-span-5 xl:sticky xl:top-20 space-y-3.5 ${mobileSection === 'composer' ? 'hidden md:block' : 'block'}`}>
        <div className="flex items-center justify-between gap-2 px-1">
          <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Icon name="visibility" className="text-[15px] text-sky-600 dark:text-sky-400" />
            <span>Prévia da folha — é exatamente o que será impresso</span>
          </h3>
          {!isDoctorConfigured && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Prévia de exemplo
            </span>
          )}
        </div>

        {/* Controlados que exigem Notificação de Receita: no desktop (xl) fica aqui; abaixo disso, junto das ações */}
        {porRegime.controle_especial.some((it) => notificacaoExigida(it)) && (
          <div className="hidden xl:block">
            <AvisoNotificacaoReceita items={porRegime.controle_especial} />
          </div>
        )}

        {/* Uma aba por receita quando a consulta gera mais de um documento */}
        {regimesComItens.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-navy-900 border border-medium dark:border-navy-700 w-full overflow-x-auto shadow-tactile-sm">
            {regimesComItens.map((regime) => (
              <button
                key={regime}
                type="button"
                onClick={() => onSelectPreviewRegime(regime)}
                aria-pressed={regimeAtivo === regime}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  regimeAtivo === regime
                    ? 'bg-white dark:bg-navy-800 text-sky-700 dark:text-blue-300 shadow-tactile-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{regimeLabels[regime].rotulo} ({porRegime[regime].length})</span>
              </button>
            ))}
          </div>
        )}

        {/* Folha A4 da bancada: o mesmo documento que será impresso / exportado em PDF (sempre paisagem no padrão PEC do SUS) */}
        <FolhaA4 orientacao="landscape">
          <DocumentoClinico
            tipo={DOCUMENTO_DO_REGIME[regimeAtivo]}
            doctor={doctor}
            patient={patient}
            activeContext={activeContext}
            prescriptionItems={itemsInPreview}
          />
        </FolhaA4>

        {/* Action Buttons: visível no desktop (xl), nunca duplicado com o cartão */}
        <div className="hidden xl:block">
          <AcoesDaReceita
            itemsCount={itemsCount}
            isMedicoConfigurado={isDoctorConfigured}
            onNavigateToPrint={onNavigateToPrint}
            onNavigateToEditor={onNavigateToEditor}
            onSendWhatsApp={onSendWhatsApp}
            onCopyText={onCopyText}
            copiedSuccess={copiedSuccess}
            onAbrirPerfilMedico={onAbrirPerfilMedico}
          />
        </div>
      </div>

      {/* Drawer Lateral Flutuante da Calculadora Pediátrica */}
      {isPediatricDrawerOpen && (
        <div
          ref={pediatricDrawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Calculadora pediátrica por peso"
          className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-backdrop-fade"
          onClick={onClosePediatricDrawer}
        >
          <div
            className="w-full max-w-3xl h-full bg-[var(--surface-card)] shadow-2xl border-l border-[var(--border-subtle)] flex flex-col animate-drawer-right overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Drawer */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-elevated)] shrink-0">
              <div className="flex items-center gap-2.5">
                <Icon name="balanca" className="text-emerald-600 dark:text-emerald-400 text-[22px]" />
                <h3 className="font-semibold text-sm text-[var(--text-main)]">
                  Calculadora pediátrica por peso
                </h3>
              </div>
              <button
                type="button"
                onClick={onClosePediatricDrawer}
                className="min-h-[44px] min-w-[44px] p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer inline-flex items-center justify-center"
                title="Fechar calculadora (Esc)"
                aria-label="Fechar calculadora"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            {/* Corpo do Drawer com rolagem */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
              <PediatricCalculator
                darkMode={darkMode}
                patient={patient}
                onUpdatePatientWeight={onUpdatePatientWeight}
                onAddPrescriptionItem={onAddPediatricItem}
                onNavigateToPrescription={onClosePediatricDrawer}
                isDrawer={true}
                onClose={onClosePediatricDrawer}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
