import React, { useState } from 'react';
import { escapeHtml } from '../../utils/sanitizeHtml';
import {
  type BiradsCategory,
  type CervicalCytologyResult,
  evaluateBreastScreening,
  evaluateCervicalScreening,
  evaluateProstateScreening,
} from '../../utils/scores/eparadaAndScreeningEngine';

export interface OncologyScreeningSubPanelProps {
  initialAgeYears: number;
  onAddExamById?: (examId: string) => void;
  onSendToA4Editor?: (html: string, title?: string) => void;
}

export const OncologyScreeningSubPanel: React.FC<
  OncologyScreeningSubPanelProps
> = ({ initialAgeYears, onAddExamById, onSendToA4Editor }) => {
  const [screeningAge, setScreeningAge] = useState<number>(
    initialAgeYears > 0 ? initialAgeYears : 54
  );
  const [birads, setBirads] = useState<BiradsCategory>('SEM_EXAME_PREVIO');
  const [breastHighRisk, setBreastHighRisk] = useState<boolean>(false);
  const [breastRedFlag, setBreastRedFlag] = useState<boolean>(false);

  const [cervicalResult, setCervicalResult] =
    useState<CervicalCytologyResult>('NORMAL_BENIGNO');
  const [twoConsecutiveNormals, setTwoConsecutiveNormals] =
    useState<boolean>(true);
  const [cervicalImmunosuppressed, setCervicalImmunosuppressed] =
    useState<boolean>(false);

  const [psaTotal, setPsaTotal] = useState<number>(1.8);
  const [psaFreeRatio, setPsaFreeRatio] = useState<number>(22);
  const [prostateHighRisk, setProstateHighRisk] = useState<boolean>(false);
  const [abnormalDre, setAbnormalDre] = useState<boolean>(false);

  const breastRec = evaluateBreastScreening({
    ageYears: screeningAge,
    highFamilyOrGeneticRisk: breastHighRisk,
    palpableNoduleOrRedFlag: breastRedFlag,
    birads,
  });

  const cervicalRec = evaluateCervicalScreening({
    ageYears: screeningAge,
    twoConsecutiveAnnualNormals: twoConsecutiveNormals,
    immunosuppressedOrHiv: cervicalImmunosuppressed,
    cytologyResult: cervicalResult,
  });

  const prostateRec = evaluateProstateScreening({
    ageYears: screeningAge,
    highRiskFamilyOrAncestry: prostateHighRisk,
    psaTotalNgMl: psaTotal,
    freeToTotalRatioPct: psaFreeRatio,
    abnormalDigitalRectalExam: abnormalDre,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3.5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Bancada de Rastreio Oncológico Rápido (Diretrizes INCA / Ministério
            da Saúde & SIGTAP SUS)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Classificação imediata de BI-RADS Mamário, Citopatológico do Colo do
            Útero e PSA/Próstata com adição de exame em 1 clique.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="onco-screening-age"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            Idade do(a) Paciente:
          </label>
          <input
            id="onco-screening-age"
            type="number"
            min={18}
            max={105}
            placeholder="Ex.: 54"
            value={screeningAge}
            onChange={(e) =>
              setScreeningAge(
                Math.max(18, parseInt(e.target.value, 10) || 50)
              )
            }
            className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:text-white clinical-tabular-nums"
          />
          <span className="font-mono text-xs text-slate-500 clinical-unit">
            anos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 1. Câncer de Mama (BI-RADS) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-400">
                1. Mama (Mamografia / BI-RADS)
              </span>
              <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] clinical-tabular-nums">
                {breastRec.sigtapCode}
              </span>
            </div>

            <div>
              <label
                htmlFor="birads-select"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
              >
                Categoria BI-RADS Atual
              </label>
              <select
                id="birads-select"
                aria-label="Categoria BI-RADS"
                value={birads}
                onChange={(e) => setBirads(e.target.value as BiradsCategory)}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="SEM_EXAME_PREVIO">
                  Sem exame prévio (Rastreio inicial)
                </option>
                <option value="1">BI-RADS 1 (Negativo / Normal)</option>
                <option value="2">BI-RADS 2 (Achado Benigno)</option>
                <option value="0">
                  BI-RADS 0 (Incompleto — Requer USG/Incidências)
                </option>
                <option value="3">
                  BI-RADS 3 (Provavelmente Benigno — 6 meses)
                </option>
                <option value="4">
                  BI-RADS 4 (Suspeito — Biópsia Obrigatória)
                </option>
                <option value="5">
                  BI-RADS 5 (Altamente Suspeito — Biópsia)
                </option>
                <option value="6">BI-RADS 6 (Malignidade já comprovada)</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={breastHighRisk}
                  onChange={(e) => setBreastHighRisk(e.target.checked)}
                />
                <span>
                  Alto risco familiar/genético (parente 1º grau &lt; 50a / BRCA)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={breastRedFlag}
                  onChange={(e) => setBreastRedFlag(e.target.checked)}
                />
                <span>
                  Nódulo palpável endurecido / descarga papilar / retração
                </span>
              </label>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                {breastRec.title}
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {breastRec.conductSummary}
              </p>
              <div className="pt-1 font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                Intervalo: {breastRec.followUpInterval}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {onAddExamById ? (
              <button
                type="button"
                onClick={() => onAddExamById(breastRec.presetExamId)}
                className="flex-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
              >
                + Solicitar Exame ({breastRec.presetExamId})
              </button>
            ) : null}
            {onSendToA4Editor ? (
              <button
                type="button"
                onClick={() =>
                  onSendToA4Editor(
                    `<p>${escapeHtml(breastRec.soapSnippet)}</p>`,
                    'Rastreio Mamário'
                  )
                }
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Enviar A4
              </button>
            ) : null}
          </div>
        </div>

        {/* 2. Colo do Útero (Citopatológico / Papanicolaou) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                2. Colo do Útero (25–64 anos)
              </span>
              <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] clinical-tabular-nums">
                {cervicalRec.sigtapCode}
              </span>
            </div>

            <div>
              <label
                htmlFor="cervical-select"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
              >
                Resultado Citopatológico (Papanicolaou)
              </label>
              <select
                id="cervical-select"
                aria-label="Resultado do exame citopatológico"
                value={cervicalResult}
                onChange={(e) =>
                  setCervicalResult(e.target.value as CervicalCytologyResult)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="NORMAL_BENIGNO">
                  Normal / Alteração Benigna
                </option>
                <option value="SEM_EXAME_PREVIO">Sem exame prévio</option>
                <option value="ASC_US">
                  ASC-US (Atipias de significado indeterminado)
                </option>
                <option value="LSIL">LSIL / NIC I (Lesão de baixo grau)</option>
                <option value="ASC_H">
                  ASC-H (Não podendo excluir alto grau)
                </option>
                <option value="HSIL">
                  HSIL / NIC II-III (Lesão de alto grau)
                </option>
                <option value="AGC">
                  AGC (Atipias em células glandulares)
                </option>
                <option value="CARCINOMA">Suspeita de Carcinoma Invasor</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoConsecutiveNormals}
                  onChange={(e) => setTwoConsecutiveNormals(e.target.checked)}
                />
                <span>
                  Possui 2 exames anuais consecutivos anteriores normais
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cervicalImmunosuppressed}
                  onChange={(e) =>
                    setCervicalImmunosuppressed(e.target.checked)
                  }
                />
                <span>Imunossuprimida / Vivendo com HIV</span>
              </label>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                {cervicalRec.title}
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {cervicalRec.conductSummary}
              </p>
              <div className="pt-1 font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                Seguimento: {cervicalRec.followUpInterval}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {onAddExamById ? (
              <button
                type="button"
                onClick={() => onAddExamById(cervicalRec.presetExamId)}
                className="flex-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
              >
                + Solicitar Papanicolaou
              </button>
            ) : null}
            {onSendToA4Editor ? (
              <button
                type="button"
                onClick={() =>
                  onSendToA4Editor(
                    `<p>${escapeHtml(cervicalRec.soapSnippet)}</p>`,
                    'Rastreio Cervical'
                  )
                }
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Enviar A4
              </button>
            ) : null}
          </div>
        </div>

        {/* 3. Próstata (Decisão Compartilhada PSA Total / Livre) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                3. Próstata (PSA & Decisão Compartilhada)
              </span>
              <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] clinical-tabular-nums">
                {prostateRec.sigtapCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="psa-total-input"
                  className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  PSA Total (<span className="clinical-unit">ng/mL</span>)
                </label>
                <input
                  id="psa-total-input"
                  type="number"
                  step={0.1}
                  min={0}
                  placeholder="Ex.: 1.8"
                  value={psaTotal}
                  onChange={(e) => setPsaTotal(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:text-white clinical-tabular-nums"
                />
              </div>
              <div>
                <label
                  htmlFor="psa-ratio-input"
                  className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  Relação L/T (<span className="clinical-unit">%</span>)
                </label>
                <input
                  id="psa-ratio-input"
                  type="number"
                  step={1}
                  min={1}
                  max={100}
                  placeholder="Ex.: 22"
                  value={psaFreeRatio}
                  onChange={(e) =>
                    setPsaFreeRatio(parseFloat(e.target.value) || 20)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:text-white clinical-tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prostateHighRisk}
                  onChange={(e) => setProstateHighRisk(e.target.checked)}
                />
                <span>
                  História familiar 1º grau (&lt; 65a) ou homem negro (&gt;=
                  45a)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={abnormalDre}
                  onChange={(e) => setAbnormalDre(e.target.checked)}
                />
                <span>Toque retal suspeito (nódulo / endurecimento)</span>
              </label>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                {prostateRec.title}
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {prostateRec.conductSummary}
              </p>
              <div className="pt-1 font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                Conduta: {prostateRec.followUpInterval}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {onAddExamById ? (
              <button
                type="button"
                onClick={() => onAddExamById(prostateRec.presetExamId)}
                className="flex-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
              >
                + Solicitar PSA ({prostateRec.presetExamId})
              </button>
            ) : null}
            {onSendToA4Editor ? (
              <button
                type="button"
                onClick={() =>
                  onSendToA4Editor(
                    `<p>${escapeHtml(prostateRec.soapSnippet)}</p>`,
                    'Avaliação Prostática'
                  )
                }
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Enviar A4
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
