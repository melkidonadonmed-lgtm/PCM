import React, { useState } from 'react';
import { Icon } from '../Icon';
import { escapeHtml } from '../../utils/sanitizeHtml';
import type { PrescriptionItem } from '../../types';
import type { InfusionProtocol } from '../../utils/scores/scoreTypes';
import {
  calculateInfusionRate,
  generateTitrationMatrix,
} from '../../utils/scores/infusionEngine';

interface ScoreBicInfusionCardProps {
  protocol: InfusionProtocol;
  patientWeightKg: number;
  onWeightChange?: (weight: number) => void;
  onAddPrescriptionItem?: (item: PrescriptionItem) => void;
  onSendToA4Editor?: (html: string, title?: string) => void;
}

export const ScoreBicInfusionCard: React.FC<ScoreBicInfusionCardProps> = ({
  protocol,
  patientWeightKg,
  onWeightChange,
  onAddPrescriptionItem,
  onSendToA4Editor,
}) => {
  const [useConcentrated, setUseConcentrated] = useState(false);
  const [dose, setDose] = useState<number>(protocol.defaultDose);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const activeSolution =
    useConcentrated && protocol.concentratedSolution
      ? protocol.concentratedSolution
      : protocol.standardSolution;

  const safeWeight = patientWeightKg > 0 ? patientWeightKg : 70;

  const calculation = calculateInfusionRate({
    protocol,
    weightKg: safeWeight,
    dose,
    concentrationMcgPerMl: activeSolution.concentrationMcgMl,
    useConcentrated,
  });

  const titrationSteps = generateTitrationMatrix({
    protocol,
    weightKg: safeWeight,
    useConcentrated,
  });

  const stepSize =
    protocol.doseUnit === 'UI/min'
      ? 0.005
      : protocol.doseUnit === 'mcg/min'
        ? 5
        : protocol.drugName.toLowerCase().includes('dobutamina')
          ? 0.5
          : 0.02;

  const handleCopyBicSummary = async () => {
    const text = `[BIC — ${protocol.drugName}] Preparo: ${calculation.recommendedVehicle} (${calculation.concentrationFormatted}) | Dose Alvo: ${calculation.formattedDose}${!protocol.isFixedDose ? ` (Peso: ${safeWeight} kg)` : ''} => Vazão em Bomba: ${calculation.rateMlPerHour} mL/h. Via: ${protocol.administrationRoute}.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    } catch {
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    }
  };

  const handlePrescribeBic = () => {
    if (!onAddPrescriptionItem) return;
    const item: PrescriptionItem = {
      id: `bic-${protocol.drugId ?? 'dva'}-${Date.now()}`,
      name: `${protocol.drugName} — Infusão Contínua em BIC`,
      presentation: `${activeSolution.ampoules} + ${activeSolution.diluent} (${calculation.concentrationFormatted})`,
      route: 'EV contínuo em BIC',
      quantity: '1 bolsa preparada (250 mL / 100 mL)',
      doseCalculatedText: `${calculation.formattedDose} (Vazão em BIC: ${calculation.rateMlPerHour} mL/h)`,
      frequencyText: 'Infusão contínua guiada por meta hemodinâmica',
      scheduleInterval: 'Uso Contínuo',
      scheduleTimes: [],
      instructions: `Preparo: ${calculation.recommendedVehicle} [Concentração: ${calculation.concentrationFormatted}]. Via: ${protocol.administrationRoute}. ${protocol.nursingPrecautions}`,
      isContinuous: true,
      calculatedFromWeight: !protocol.isFixedDose ? safeWeight : undefined,
    };
    onAddPrescriptionItem(item);
  };

  const handleSendBicToA4 = () => {
    if (!onSendToA4Editor) return;
    const html = [
      `<h2>PRESCRIÇÃO DE INFUSÃO CONTÍNUA EM BOMBA (BIC) — ${escapeHtml(protocol.drugName)}</h2>`,
      `<p><strong>Fármaco:</strong> ${escapeHtml(protocol.drugName)} (${escapeHtml(useConcentrated ? 'Solução Concentrada 2x' : 'Solução Padrão')})</p>`,
      `<p><strong>Preparo e Diluição:</strong> ${escapeHtml(calculation.recommendedVehicle)} — Concentração Final: <strong>${escapeHtml(calculation.concentrationFormatted ?? '')}</strong></p>`,
      `<p><strong>Dose Alvo Selecionada:</strong> ${escapeHtml(calculation.formattedDose)}${!protocol.isFixedDose ? ` (Peso de cálculo: ${escapeHtml(String(safeWeight))} kg)` : ' (Dose fixa independente do peso)'}</p>`,
      `<p><strong>Vazão Calculada na Bomba de Infusão:</strong> <strong>${escapeHtml(String(calculation.rateMlPerHour))} mL/h</strong></p>`,
      `<p><strong>Via de Administração:</strong> ${escapeHtml(protocol.administrationRoute)}</p>`,
      `<p><strong>Cuidados de Enfermagem e Estabilidade:</strong> ${escapeHtml(protocol.nursingPrecautions)}</p>`,
      calculation.safetyAlerts.length > 0
        ? `<h3>Alertas de Segurança Farmacotécnica</h3><ul>${calculation.safetyAlerts.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
        : '',
    ]
      .filter(Boolean)
      .join('');
    onSendToA4Editor(html, `BIC — ${protocol.drugName}`);
  };

  return (
    <div
      className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-card)] p-4 shadow-elevation-low"
      data-state="idle"
      aria-busy={false}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hairline)] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-chip-muted)] border border-[var(--hairline)] text-[var(--ink-clinical)]">
            <Icon name="Vaccines" className="text-lg" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[var(--ink-primary)]">
              {protocol.drugName}
            </h4>
            <p className="text-[11px] text-[var(--ink-muted)]">
              Calculadora de Vazão em Bomba de Infusão Contínua (mL/h)
            </p>
          </div>
        </div>

        {protocol.concentratedSolution ? (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              aria-pressed={!useConcentrated}
              onClick={() => setUseConcentrated(false)}
              className={`touch-target min-h-[44px] rounded-[10px] px-3 py-1.5 font-semibold cursor-pointer ${
                !useConcentrated
                  ? 'btn-tactile-primary'
                  : 'btn-tactile-secondary'
              }`}
            >
              Padrão ({protocol.standardSolution.concentrationMcgMl}{' '}
              <span className="clinical-unit">
                {protocol.doseUnit === 'UI/min' ? 'UI/mL' : 'mcg/mL'}
              </span>
              )
            </button>
            <button
              type="button"
              aria-pressed={useConcentrated}
              onClick={() => setUseConcentrated(true)}
              className={`touch-target min-h-[44px] inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 font-semibold cursor-pointer ${
                useConcentrated
                  ? 'btn-tactile-primary'
                  : 'btn-tactile-secondary'
              }`}
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] shrink-0" />
              <span>
                Concentrada 2x ({protocol.concentratedSolution.concentrationMcgMl}{' '}
                <span className="clinical-unit">
                  {protocol.doseUnit === 'UI/min' ? 'UI/mL' : 'mcg/mL'}
                </span>
                )
              </span>
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[var(--ink-secondary)]">
            Preparo Magistral:{' '}
            <span className="font-mono text-[var(--ink-clinical)]">
              {activeSolution.ampoules} + {activeSolution.diluent}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--ink-primary)] clinical-tabular-nums">
            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" />
            Volume Total: {activeSolution.totalVolumeMl} mL (
            {calculation.concentrationFormatted})
          </span>
        </div>
        {activeSolution.mandatoryVehicleNotice ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-secondary)]">
            <Icon name="warning" className="text-sm shrink-0 text-[var(--accent-amber)]" />
            <span>{activeSolution.mandatoryVehicleNotice}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {!protocol.isFixedDose ? (
          <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-3">
            <label
              htmlFor={`bic-weight-${protocol.drugId ?? protocol.drugName}`}
              className="block text-[11px] font-medium text-[var(--ink-muted)]"
            >
              Peso do Paciente (<span className="clinical-unit">kg</span>)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id={`bic-weight-${protocol.drugId ?? protocol.drugName}`}
                type="number"
                min={1}
                max={300}
                placeholder="Ex.: 70"
                value={safeWeight}
                onChange={(e) =>
                  onWeightChange?.(
                    Math.max(1, parseFloat(e.target.value) || 70)
                  )
                }
                className="tactile-input w-full h-11 min-h-[44px] rounded-[10px] border border-[var(--border-control)] px-2.5 py-1.5 font-mono text-sm font-bold text-[var(--ink-primary)] clinical-tabular-nums"
              />
              <span className="font-mono text-xs text-[var(--ink-muted)] clinical-unit">
                kg
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-3">
            <span className="text-[11px] font-medium text-[var(--ink-muted)]">
              Regime de Dosagem
            </span>
            <span className="mt-1 font-mono text-xs font-semibold text-[var(--ink-clinical)]">
              Dose Fixa (Independente do Peso)
            </span>
          </div>
        )}

        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`bic-dose-${protocol.drugId ?? protocol.drugName}`}
              className="text-[11px] font-medium text-[var(--ink-muted)]"
            >
              Dose Alvo (
              <span className="clinical-unit">{protocol.doseUnit}</span>)
            </label>
            <span className="font-mono text-xs font-bold text-[var(--ink-clinical)] clinical-tabular-nums">
              {dose} <span className="clinical-unit">{protocol.doseUnit}</span>
            </span>
          </div>
          <input
            id={`bic-dose-${protocol.drugId ?? protocol.drugName}`}
            type="range"
            aria-label={`Dose alvo de ${protocol.drugName}`}
            min={protocol.initialDose}
            max={protocol.maxDose}
            step={stepSize}
            value={dose}
            onChange={(e) => setDose(parseFloat(e.target.value))}
            className="mt-2 w-full accent-[var(--primary)] cursor-pointer"
          />
          <div className="mt-1 flex justify-between font-mono text-[11px] text-[var(--ink-muted)] clinical-tabular-nums">
            <span>Início: {protocol.initialDose}</span>
            <span>
              Alvo: {protocol.maintenanceDoseMin}–{protocol.maintenanceDoseMax}
            </span>
            <span>Máx: {protocol.maxDose}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--hairline)] border-l-[3px] border-l-[var(--ink-clinical)] bg-[var(--surface-card-lit)] p-3 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-clinical)]">
            Vazão na Bomba (BIC)
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-extrabold text-[var(--ink-primary)] clinical-tabular-nums">
              {calculation.rateMlPerHour}
            </span>
            <span className="font-mono text-xs font-semibold text-[var(--ink-clinical)] clinical-unit">
              mL/h
            </span>
          </div>
          <span className="text-[11px] text-[var(--ink-muted)] clinical-tabular-nums">
            para {calculation.formattedDose}
          </span>
        </div>
      </div>

      {calculation.safetyAlerts.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          {calculation.safetyAlerts.map((alertText, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-xl border border-[var(--hairline)] border-l-[3px] border-l-[var(--accent-amber)] bg-[var(--surface-card-lit)] px-3 py-2 text-xs text-[var(--ink-secondary)]"
            >
              <Icon name="warning" className="mt-0.5 text-sm shrink-0 text-[var(--accent-amber)]" />
              <span>{alertText}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
          Matriz Rápida de Titulação à Beira do Leito (Toque para selecionar)
        </span>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-8">
          {titrationSteps.map((step) => {
            const isActiveStep = Math.abs(dose - step.dose) < 0.001;
            return (
              <button
                key={step.dose}
                type="button"
                aria-pressed={isActiveStep}
                onClick={() => setDose(step.dose)}
                className={`touch-target min-h-[44px] flex flex-col items-center justify-center rounded-[10px] px-2 py-1.5 text-center font-mono cursor-pointer clinical-tabular-nums ${
                  isActiveStep
                    ? 'btn-tactile-primary'
                    : step.isWarning
                      ? 'btn-tactile-secondary border-l-[3px] border-l-[var(--status-danger)]'
                      : 'btn-tactile-secondary'
                }`}
              >
                <span className="text-[11px] opacity-80">{step.dose}</span>
                <span className="text-xs font-bold">{step.rateMlPerHour} mL/h</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--hairline)] pt-2.5 text-[11px] text-[var(--ink-muted)]">
        <span>
          <strong className="text-[var(--ink-primary)]">Via:</strong> {protocol.administrationRoute}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyBicSummary}
            className="touch-target btn-tactile-secondary min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <Icon name={copiedFeedback ? 'check' : 'content_copy'} className="text-sm text-[var(--ink-clinical)]" />
            {copiedFeedback ? 'Copiado!' : 'Copiar Vazão PEP'}
          </button>
          {onAddPrescriptionItem ? (
            <button
              type="button"
              onClick={handlePrescribeBic}
              className="touch-target btn-tactile-secondary min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <Icon name="add_circle" className="text-sm text-[var(--ink-clinical)]" />
              Prescrever na Receita
            </button>
          ) : null}
          {onSendToA4Editor ? (
            <button
              type="button"
              onClick={handleSendBicToA4}
              className="touch-target btn-tactile-primary min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <Icon name="description" className="text-sm" />
              Enviar BIC ao Editor A4
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
