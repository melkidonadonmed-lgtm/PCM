import React from 'react';
import { Icon } from '../Icon';
import type {
  HospitalBedPatientRecord,
  HospitalBedScoreEntry,
} from '../../core/domain/clinicalEntities';
import type {
  Calculator,
  RiskSeverityLevel,
  RiskTier,
} from '../../utils/scores/scoreTypes';

export interface ScoreExportAndBedBridgeCardProps {
  calculator: Calculator;
  activeTier: RiskTier;
  severityBadgeClasses: Record<RiskSeverityLevel, string>;
  bedIdentifier: string;
  onBedIdentifierChange: (b: string) => void;
  patientWeightKg: number;
  onWeightChange: (w: number) => void;
  copyFeedback: 'PEP' | 'SBAR' | 'A4' | 'BED_RECORDED' | null;
  onCopyText: (mode: 'PEP' | 'SBAR') => void;
  onSendToA4Editor?: (html: string, title?: string) => void;
  onSendScoreToA4: () => void;
  hospitalBeds: HospitalBedPatientRecord[];
  selectedHospitalBed?: HospitalBedPatientRecord;
  onSelectHospitalBed?: (bedId: string) => void;
  appendConductToBed: boolean;
  onToggleAppendConductToBed: (checked: boolean) => void;
  onRecordScoreToBed?: (
    bedId: string,
    entry: HospitalBedScoreEntry,
    options?: { appendConductToBed?: boolean }
  ) => void;
  onRecordScoreInHospitalBed: () => void;
  onNavigateToHospitalDashboard?: (bedId: string, scoreAcronym: string) => void;
}

export const ScoreExportAndBedBridgeCard: React.FC<
  ScoreExportAndBedBridgeCardProps
> = ({
  calculator,
  activeTier,
  severityBadgeClasses,
  bedIdentifier,
  onBedIdentifierChange,
  patientWeightKg,
  onWeightChange,
  copyFeedback,
  onCopyText,
  onSendToA4Editor,
  onSendScoreToA4,
  hospitalBeds,
  selectedHospitalBed,
  onSelectHospitalBed,
  appendConductToBed,
  onToggleAppendConductToBed,
  onRecordScoreToBed,
  onRecordScoreInHospitalBed,
  onNavigateToHospitalDashboard,
}) => {
  return (
    <>
      {/* Matriz de Faixas de Risco */}
      <div className="cq-card card-surface surface-card-minimal rounded-2xl border border-subtle dark:border-strong p-3.5 sm:p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon
            name="analytics"
            size={18}
            className="text-[var(--ink-clinical)] shrink-0"
          />
          <h4 className="text-sm font-semibold text-[var(--text-main)]">
            Matriz de Estratificação do Escore
          </h4>
        </div>
        <div className="space-y-1.5">
          {calculator.riskTiers.map((tier) => {
            const isActive = tier.id === activeTier.id;
            return (
              <div
                key={tier.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-1.5 text-xs ${
                  isActive
                    ? severityBadgeClasses[tier.severityLevel]
                    : 'border-subtle dark:border-strong bg-[var(--surface-inset)] text-[var(--ink-muted)]'
                }`}
              >
                <span className="font-medium">{tier.label}</span>
                <span className="font-mono text-[11px] font-bold clinical-tabular-nums">
                  {tier.minScore === tier.maxScore
                    ? `${tier.minScore} pt`
                    : `${tier.minScore} a ${tier.maxScore} pts`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hub de Exportação SOAP / SBAR / Editor A4 */}
      <div className="cq-card card-surface surface-card-minimal rounded-2xl border border-subtle dark:border-strong p-3.5 sm:p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon
              name="clinical_notes"
              size={18}
              className="text-[var(--ink-clinical)] shrink-0"
            />
            <h4 className="text-sm font-semibold text-[var(--text-main)] truncate">
              Exportação Prontuário (PEP / SBAR / Editor A4)
            </h4>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-primary)] shrink-0">
            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" />
            Zero-PII / LGPD
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="score-bed-id"
                className="block text-[11px] font-semibold text-[var(--ink-muted)]"
              >
                Identificador de Leito
              </label>
              {bedIdentifier && (
                <button
                  type="button"
                  onClick={() => onBedIdentifierChange('')}
                  className="touch-target btn-tactile-danger min-h-[44px] min-w-[44px] px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
                  title="Limpar identificador de leito"
                >
                  <Icon name="close" size={14} />
                  <span>Limpar</span>
                </button>
              )}
            </div>
            <input
              id="score-bed-id"
              name="scoreBedId"
              type="text"
              placeholder="Ex.: UTI-04, Sala Vermelha"
              value={bedIdentifier}
              onChange={(e) => onBedIdentifierChange(e.target.value)}
              className="tactile-input mt-1 w-full h-11 min-h-[44px] rounded-[10px] border border-[var(--border-control)] px-2.5 py-1.5 text-xs text-[var(--ink-primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="score-patient-weight"
              className="block text-[11px] font-semibold text-[var(--ink-muted)]"
            >
              Peso p/ BIC (<span className="clinical-unit">kg</span>)
            </label>
            <input
              id="score-patient-weight"
              name="scorePatientWeight"
              type="number"
              min={1}
              max={300}
              placeholder="Ex.: 70"
              value={patientWeightKg > 0 ? patientWeightKg : 70}
              onChange={(e) =>
                onWeightChange(Math.max(1, parseFloat(e.target.value) || 70))
              }
              className="tactile-input mt-1 w-full h-11 min-h-[44px] rounded-[10px] border border-[var(--border-control)] px-2.5 py-1.5 font-mono text-xs text-[var(--ink-primary)] clinical-tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onCopyText('PEP')}
            className="touch-target btn-tactile-secondary min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold cursor-pointer"
          >
            <Icon
              name={copyFeedback === 'PEP' ? 'check' : 'content_copy'}
              className="text-sm text-[var(--ink-clinical)]"
            />
            {copyFeedback === 'PEP' ? 'SOAP Copiado!' : 'Copiar Evolução SOAP'}
          </button>
          <button
            type="button"
            onClick={() => onCopyText('SBAR')}
            className="touch-target btn-tactile-secondary min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold cursor-pointer"
          >
            <Icon
              name={copyFeedback === 'SBAR' ? 'check' : 'share'}
              className="text-sm text-[var(--ink-accent)]"
            />
            {copyFeedback === 'SBAR' ? 'SBAR Copiado!' : 'Copiar SBAR'}
          </button>
        </div>

        {onSendToA4Editor ? (
          <button
            type="button"
            onClick={onSendScoreToA4}
            className="touch-target btn-tactile-primary flex w-full items-center justify-center gap-2 text-xs"
          >
            <Icon
              name={copyFeedback === 'A4' ? 'check' : 'description'}
              className="text-base"
            />
            {copyFeedback === 'A4'
              ? 'Enviado para o Editor A4!'
              : 'Enviar Relatório Estruturado para o Editor A4'}
          </button>
        ) : null}

        {/* Ponte Direta: Registrar Escore no Módulo de Internação (MOD-03) e Dashboard */}
        {onRecordScoreToBed && selectedHospitalBed ? (
          <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
                <Icon name="local_hospital" size={14} className="text-[var(--ink-clinical)]" />
                Integração Internação & Dashboard (MOD-03)
              </span>
              <span className="rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--ink-primary)] clinical-tabular-nums">
                EF/LT {selectedHospitalBed.wardAndBed}
              </span>
            </div>

            {hospitalBeds.length > 1 && onSelectHospitalBed ? (
              <div>
                <label
                  htmlFor="score-hospital-bed-select"
                  className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1"
                >
                  Leito Hospitalar Alvo (MOD-03)
                </label>
                <select
                  id="score-hospital-bed-select"
                  name="scoreHospitalBed"
                  value={selectedHospitalBed.id}
                  onChange={(e) => {
                    onSelectHospitalBed(e.target.value);
                    const chosen = hospitalBeds.find(
                      (b) => b.id === e.target.value
                    );
                    if (chosen) {
                      onBedIdentifierChange(chosen.wardAndBed);
                    }
                  }}
                  className="tactile-input w-full h-11 min-h-[44px] rounded-[10px] border border-[var(--border-control)] px-2.5 text-xs font-semibold text-[var(--ink-primary)] clinical-tabular-nums"
                >
                  {hospitalBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      EF/LT {b.wardAndBed} —{' '}
                      {b.patientNameOrInitials || 'Leito sem ID'}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <label
              htmlFor="score-append-conduct-checkbox"
              className="flex items-center gap-2 text-xs text-[var(--ink-secondary)] cursor-pointer"
            >
              <input
                id="score-append-conduct-checkbox"
                name="appendConductToBed"
                type="checkbox"
                checked={appendConductToBed}
                onChange={(e) => onToggleAppendConductToBed(e.target.checked)}
                className="rounded border-[var(--border-control)] text-[var(--clinical)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
              />
              <span>
                Sincronizar conduta sugerida na lista <strong className="text-[var(--ink-primary)]">CD</strong> do leito
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onRecordScoreInHospitalBed}
                className="touch-target btn-tactile-primary flex-1 flex items-center justify-center gap-1.5 text-xs"
              >
                <Icon
                  name={
                    copyFeedback === 'BED_RECORDED' ? 'check' : 'add_chart'
                  }
                  size={15}
                />
                <span>
                  {copyFeedback === 'BED_RECORDED'
                    ? `Registrado no Leito ${selectedHospitalBed.wardAndBed}!`
                    : `Registrar no Leito ${selectedHospitalBed.wardAndBed} (Dashboard)`}
                </span>
              </button>

              {onNavigateToHospitalDashboard ? (
                <button
                  type="button"
                  onClick={() =>
                    onNavigateToHospitalDashboard(
                      selectedHospitalBed.id,
                      calculator.acronym
                    )
                  }
                  className="touch-target btn-tactile-secondary flex items-center justify-center gap-1.5 text-xs whitespace-nowrap"
                >
                  <Icon name="monitor_heart" size={14} className="text-[var(--ink-muted)]" />
                  <span>Ver no Dashboard</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="border-t border-[var(--hairline)] pt-2 text-[11px] text-[var(--ink-muted)]">
          <strong>Fonte Científica:</strong> {calculator.evidenceSource}
        </div>
      </div>
    </>
  );
};
