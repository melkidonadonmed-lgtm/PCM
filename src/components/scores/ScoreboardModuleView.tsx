import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '../Icon';
import { storageService } from '../../services/storageService';
import type { Patient, PrescriptionItem } from '../../types';
import type {
  HospitalBedPatientRecord,
  HospitalBedScoreEntry,
} from '../../core/domain/clinicalEntities';
import {
  ALL_SCOREBOARD_CALCULATORS,
  DEFAULT_QUICK_PIN_IDS,
  SCOREBOARD_BLOCKS_META,
  SCOREBOARD_MANIFEST,
  getCalculatorByIdOrSlug,
  searchScoreboardCatalog,
} from '../../data/scores/scoreboardCatalog';
import {
  DOBUTAMINE_PROTOCOL,
  NITROGLYCERIN_PROTOCOL,
  NOREPINEPHRINE_PROTOCOL,
  VASOPRESSIN_PROTOCOL,
} from '../../utils/scores/infusionEngine';
import { ScoreCalculatorDetailView } from './ScoreCalculatorDetailView';
import { ScoreBicInfusionCard } from './ScoreBicInfusionCard';
import { EparadaAndScreeningPanel } from './EparadaAndScreeningPanel';

const FAVORITES_STORAGE_KEY = 'prescmed_scoreboard_favorites_v1';

export type ScoreboardTabMode =
  | 'CALCULATOR'
  | 'CATALOG'
  | 'BIC_DVA'
  | 'EPARADA_ONCO';

interface ScoreboardModuleViewProps {
  patient: Patient;
  initialCalculatorId?: string | null;
  onUpdatePatientWeight?: (weightKg: number) => void;
  onAddPrescriptionItem?: (item: PrescriptionItem) => void;
  onAddExamById?: (examId: string) => void;
  onSendToA4Editor?: (html: string, title?: string) => void;
  hospitalBeds?: HospitalBedPatientRecord[];
  activeHospitalBedId?: string;
  onSelectHospitalBed?: (bedId: string) => void;
  onRecordScoreToBed?: (
    bedId: string,
    entry: HospitalBedScoreEntry,
    options?: { appendConductToBed?: boolean }
  ) => void;
  onNavigateToHospitalDashboard?: (bedId: string, scoreAcronym: string) => void;
  onReturnToHospitalBed?: (bedId: string) => void;
}

export const ScoreboardModuleView: React.FC<ScoreboardModuleViewProps> = ({
  patient,
  initialCalculatorId,
  onUpdatePatientWeight,
  onAddPrescriptionItem,
  onAddExamById,
  onSendToA4Editor,
  hospitalBeds = [],
  activeHospitalBedId,
  onSelectHospitalBed,
  onRecordScoreToBed,
  onNavigateToHospitalDashboard,
  onReturnToHospitalBed,
}) => {
  const [tabMode, setTabMode] = useState<ScoreboardTabMode>('CALCULATOR');
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>(
    initialCalculatorId || 'calc_qsofa'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('ALL');
  const [onlyFavoritesFilter, setOnlyFavoritesFilter] =
    useState<boolean>(false);
  const activeHospitalBed = useMemo(
    () =>
      hospitalBeds.find((b) => b.id === activeHospitalBedId) ?? hospitalBeds[0],
    [hospitalBeds, activeHospitalBedId]
  );
  const [bedIdentifier, setBedIdentifier] = useState<string>(
    activeHospitalBed?.wardAndBed || 'UTI-01'
  );

  useEffect(() => {
    if (activeHospitalBed?.wardAndBed) {
      setBedIdentifier(activeHospitalBed.wardAndBed);
    }
  }, [activeHospitalBed?.id, activeHospitalBed?.wardAndBed]);

  const [localWeightKg, setLocalWeightKg] = useState<number>(
    Number.isFinite(patient.weightKg) && patient.weightKg > 0 ? patient.weightKg : 70
  );

  const parsedAge = parseInt(patient.ageText || '', 10);
  const patientAgeYears =
    Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : 54;

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = storageService.loadItem<string[] | null>(
      FAVORITES_STORAGE_KEY,
      null
    );
    return Array.isArray(saved) && saved.length > 0
      ? saved
      : DEFAULT_QUICK_PIN_IDS;
  });

  useEffect(() => {
    if (initialCalculatorId) {
      const found = getCalculatorByIdOrSlug(initialCalculatorId);
      if (found) {
        setActiveCalculatorId(found.id);
        setTabMode('CALCULATOR');
      }
    }
  }, [initialCalculatorId]);

  useEffect(() => {
    if (Number.isFinite(patient.weightKg) && patient.weightKg > 0) {
      setLocalWeightKg(patient.weightKg);
    }
  }, [patient.weightKg]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const handleToggleFavorite = (calcId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(calcId)
        ? prev.filter((id) => id !== calcId)
        : [...prev, calcId];
      storageService.saveItem(FAVORITES_STORAGE_KEY, next);
      return next;
    });
  };

  const handleWeightUpdate = (newWeight: number) => {
    setLocalWeightKg(newWeight);
    if (onUpdatePatientWeight && newWeight > 0) {
      onUpdatePatientWeight(newWeight);
    }
  };

  const activeCalculator = useMemo(
    () =>
      getCalculatorByIdOrSlug(activeCalculatorId) ??
      ALL_SCOREBOARD_CALCULATORS[0],
    [activeCalculatorId]
  );

  const filteredManifest = useMemo(
    () =>
      searchScoreboardCatalog(
        searchQuery,
        selectedBlockId,
        favoriteSet,
        onlyFavoritesFilter
      ),
    [searchQuery, selectedBlockId, favoriteSet, onlyFavoritesFilter]
  );

  const quickPinManifestItems = useMemo(
    () =>
      SCOREBOARD_MANIFEST.filter((item) => favoriteSet.has(item.id)).slice(
        0,
        10
      ),
    [favoriteSet]
  );

  const handleSelectScore = (idOrSlug: string) => {
    const found = getCalculatorByIdOrSlug(idOrSlug);
    if (found) {
      setActiveCalculatorId(found.id);
      setTabMode('CALCULATOR');
    }
  };

  return (
    <section
      className="space-y-4"
      aria-label="Módulo de Escores Clínicos e Ferramentas de Apoio"
      aria-busy={false}
      data-state="idle"
    >
      {/* Cabeçalho da Bancada Scoreboard CDSS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Icon name="monitor_heart" className="text-xl" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  Scoreboard CDSS — Escores Clínicos, Infusão em BIC & Emergência
                </h1>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300 clinical-tabular-nums">
                  {ALL_SCOREBOARD_CALCULATORS.length} Escores Monográficos
                </span>
                {activeHospitalBed && onReturnToHospitalBed && (
                  <button
                    type="button"
                    onClick={() => onReturnToHospitalBed(activeHospitalBed.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer clinical-tabular-nums"
                    title={`Retornar diretamente ao prontuário do Leito ${activeHospitalBed.wardAndBed}`}
                  >
                    <Icon name="arrow_back" className="text-sm" />
                    <span>Voltar ao Leito {activeHospitalBed.wardAndBed}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estratificação multissistêmica em tempo real, Radar Fisiológico SVG 60fps, Drogas Vasoativas em BIC, EPARADA (ACLS/PALS) e Rastreio INCA/MS integrados à prescrição e ao Editor A4.
              </p>
            </div>
          </div>

          {/* Navegação Segmentada da Bancada */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setTabMode('CALCULATOR')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                tabMode === 'CALCULATOR'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon name="calculate" className="text-sm" />
              Calculadora Ativa ({activeCalculator.acronym})
            </button>
            <button
              type="button"
              onClick={() => setTabMode('CATALOG')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                tabMode === 'CATALOG'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon name="apps" className="text-sm" />
              Catálogo A–Z ({ALL_SCOREBOARD_CALCULATORS.length})
            </button>
            <button
              type="button"
              onClick={() => setTabMode('BIC_DVA')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                tabMode === 'BIC_DVA'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon name="Vaccines" className="text-sm" />
              Drogas Vasoativas (BIC)
            </button>
            <button
              type="button"
              onClick={() => setTabMode('EPARADA_ONCO')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                tabMode === 'EPARADA_ONCO'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon name="emergency" className="text-sm" />
              EPARADA & Rastreio INCA
            </button>
          </div>
        </div>

        {/* Barra de Acesso Rápido (Quick-Pins Favoritos) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-200 dark:border-slate-700 pt-2.5">
          <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Icon name="star" className="text-xs text-amber-500" />
            Acesso Rápido:
          </span>
          {quickPinManifestItems.map((pin) => {
            const isActive =
              tabMode === 'CALCULATOR' && activeCalculator.id === pin.id;
            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => handleSelectScore(pin.id)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                }`}
              >
                {pin.acronym}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setTabMode('CATALOG')}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-50/70 dark:bg-blue-950/30 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 cursor-pointer"
          >
            <Icon name="search" className="text-xs" />
            Buscar entre {ALL_SCOREBOARD_CALCULATORS.length} Escores
          </button>

          {hospitalBeds.length > 0 && activeHospitalBed && onSelectHospitalBed ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-800 dark:text-sky-200">
              <Icon name="local_hospital" size={14} className="text-sky-600 dark:text-sky-400" />
              <label htmlFor="scoreboard-top-bed-select" className="sr-only">
                Leito Hospitalar Vinculado (MOD-03)
              </label>
              <select
                id="scoreboard-top-bed-select"
                value={activeHospitalBed.id}
                onChange={(e) => onSelectHospitalBed(e.target.value)}
                className="bg-transparent font-mono text-xs font-bold focus:outline-none cursor-pointer clinical-tabular-nums"
              >
                {hospitalBeds.map((b) => (
                  <option key={b.id} value={b.id} className="text-slate-900">
                    Leito {b.wardAndBed} — {b.patientNameOrInitials || 'Sem ID'}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>

      {/* ABA 1: Calculadora Ativa */}
      {tabMode === 'CALCULATOR' ? (
        <ScoreCalculatorDetailView
          key={activeCalculator.id}
          calculator={activeCalculator}
          isFavorite={favoriteSet.has(activeCalculator.id)}
          onToggleFavorite={handleToggleFavorite}
          patientWeightKg={localWeightKg}
          onWeightChange={handleWeightUpdate}
          bedIdentifier={bedIdentifier}
          onBedIdentifierChange={setBedIdentifier}
          onAddPrescriptionItem={onAddPrescriptionItem}
          onSendToA4Editor={onSendToA4Editor}
          onOpenScoreBySlug={handleSelectScore}
          hospitalBeds={hospitalBeds}
          activeHospitalBedId={activeHospitalBed?.id}
          onSelectHospitalBed={onSelectHospitalBed}
          onRecordScoreToBed={onRecordScoreToBed}
          onNavigateToHospitalDashboard={onNavigateToHospitalDashboard}
        />
      ) : null}

      {/* ABA 2: Catálogo Completo (114 Escores) */}
      {tabMode === 'CATALOG' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  aria-label="Buscar escore clínico por sigla, nome, síndrome ou CID"
                  placeholder="Ex.: qSOFA, SOFA, Glasgow-P, Wells TEP, CHA2DS2-VASc, Child-Pugh, Balanço Sagital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setOnlyFavoritesFilter((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  onlyFavoritesFilter
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon name="star" className="text-sm" />
                Apenas Favoritos ({favoriteIds.length})
              </button>
            </div>

            {/* Pílulas de Blocos de Especialidades */}
            <div className="flex flex-wrap gap-1.5">
              {SCOREBOARD_BLOCKS_META.map((blk) => {
                const isSelected = selectedBlockId === blk.blockId;
                return (
                  <button
                    key={blk.blockId}
                    type="button"
                    onClick={() => setSelectedBlockId(blk.blockId)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <Icon name={blk.icon} className="text-sm" />
                    <span>{blk.shortLabel}</span>
                    <span className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[11px] clinical-tabular-nums">
                      {blk.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
            {filteredManifest.map((item) => {
              const isFav = favoriteSet.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3.5 transition hover:border-blue-500/60 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-blue-600/10 dark:bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                        {item.acronym}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.hasInfusionProtocol ? (
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                            +BIC
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(item.id)}
                          aria-label={
                            isFav
                              ? `Remover ${item.acronym} dos favoritos`
                              : `Fixar ${item.acronym} nos favoritos`
                          }
                          className={`rounded p-1 transition-colors cursor-pointer ${
                            isFav
                              ? 'text-amber-500'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Icon name="star" className="text-sm" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/70 pt-2.5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-44">
                      {item.categoryName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectScore(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                    >
                      Abrir Escore
                      <Icon name="arrow_forward" className="text-xs" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ABA 3: Bancada Dedicada de Drogas Vasoativas em BIC */}
      {tabMode === 'BIC_DVA' ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Bancada de Titulação de Drogas Vasoativas em Bomba de Infusão Contínua (BIC)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Protocolos padronizados de terapia intensiva com alertas de veículo, adsorção em PVC, teto de choque refratário e envio direto para Receita/A4.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="global-bic-weight"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Peso do Paciente:
              </label>
              <input
                id="global-bic-weight"
                type="number"
                min={1}
                max={300}
                placeholder="Ex.: 70"
                value={localWeightKg}
                onChange={(e) =>
                  handleWeightUpdate(
                    Math.max(1, parseFloat(e.target.value) || 70)
                  )
                }
                className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:text-white clinical-tabular-nums"
              />
              <span className="font-mono text-xs text-slate-500 clinical-unit">
                kg
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ScoreBicInfusionCard
              protocol={NOREPINEPHRINE_PROTOCOL}
              patientWeightKg={localWeightKg}
              onWeightChange={handleWeightUpdate}
              onAddPrescriptionItem={onAddPrescriptionItem}
              onSendToA4Editor={onSendToA4Editor}
            />
            <ScoreBicInfusionCard
              protocol={VASOPRESSIN_PROTOCOL}
              patientWeightKg={localWeightKg}
              onWeightChange={handleWeightUpdate}
              onAddPrescriptionItem={onAddPrescriptionItem}
              onSendToA4Editor={onSendToA4Editor}
            />
            <ScoreBicInfusionCard
              protocol={DOBUTAMINE_PROTOCOL}
              patientWeightKg={localWeightKg}
              onWeightChange={handleWeightUpdate}
              onAddPrescriptionItem={onAddPrescriptionItem}
              onSendToA4Editor={onSendToA4Editor}
            />
            <ScoreBicInfusionCard
              protocol={NITROGLYCERIN_PROTOCOL}
              patientWeightKg={localWeightKg}
              onWeightChange={handleWeightUpdate}
              onAddPrescriptionItem={onAddPrescriptionItem}
              onSendToA4Editor={onSendToA4Editor}
            />
          </div>
        </div>
      ) : null}

      {/* ABA 4: Painel EPARADA (PCR ACLS/PALS) & Rastreio Oncológico Rápido */}
      {tabMode === 'EPARADA_ONCO' ? (
        <EparadaAndScreeningPanel
          patientWeightKg={localWeightKg}
          patientAgeYears={patientAgeYears}
          onWeightChange={handleWeightUpdate}
          onAddExamById={onAddExamById}
          onSendToA4Editor={onSendToA4Editor}
        />
      ) : null}
    </section>
  );
};
