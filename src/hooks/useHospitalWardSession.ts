import { useState, useEffect, useCallback, useRef } from 'react';
import type { ActiveTab } from '../types';
import type {
  HospitalBedPatientRecord,
  HospitalBedScoreEntry,
} from '../core/domain/clinicalEntities';
import type { HospitalSubViewId } from '../components/hospital/HospitalWardModuleView';
import type { DashboardMetricSource } from '../components/hospital/HospitalLabsAndAnalyticsPanel';
import { clinicalRepository } from '../core/storage/clinicalRepository';
import { DEFAULT_HOSPITAL_BEDS_SEED } from '../utils/hospital/hospitalMultimodalIngestor';
import { sortScoreEntriesChronologically } from '../utils/hospital/hospitalEvolutionFormatter';

interface UseHospitalWardSessionOptions {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedScoreboardId: (id: string | null) => void;
  onShowToast: (message: string) => void;
}

const SAVE_BED_DEBOUNCE_MS = 300;

export function useHospitalWardSession({
  setActiveTab,
  setSelectedScoreboardId,
  onShowToast,
}: UseHospitalWardSessionOptions) {
  const [hospitalBeds, setHospitalBeds] = useState<HospitalBedPatientRecord[]>(
    DEFAULT_HOSPITAL_BEDS_SEED
  );
  const [activeHospitalBedId, setActiveHospitalBedId] = useState<string>(
    DEFAULT_HOSPITAL_BEDS_SEED[0].id
  );
  const [hospitalSubView, setHospitalSubView] =
    useState<HospitalSubViewId>('ward_map');
  const [hospitalDashboardMetricSource, setHospitalDashboardMetricSource] =
    useState<DashboardMetricSource>('labs');
  const [hospitalDashboardScoreAcronym, setHospitalDashboardScoreAcronym] =
    useState<string | null>(null);

  const pendingSavesRef = useRef<Map<string, HospitalBedPatientRecord>>(
    new Map()
  );
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const flushPendingBedSaves = useCallback(() => {
    debounceTimersRef.current.forEach((timer) => clearTimeout(timer));
    debounceTimersRef.current.clear();

    if (clinicalRepository.saveHospitalBed) {
      pendingSavesRef.current.forEach((bed) => {
        clinicalRepository.saveHospitalBed?.(bed);
      });
    }
    pendingSavesRef.current.clear();
  }, []);

  const scheduleBedPersistence = useCallback(
    (updated: HospitalBedPatientRecord) => {
      if (!clinicalRepository.saveHospitalBed) return;
      pendingSavesRef.current.set(updated.id, updated);

      const existingTimer = debounceTimersRef.current.get(updated.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        debounceTimersRef.current.delete(updated.id);
        const latest = pendingSavesRef.current.get(updated.id);
        if (latest) {
          pendingSavesRef.current.delete(updated.id);
          clinicalRepository.saveHospitalBed?.(latest);
        }
      }, SAVE_BED_DEBOUNCE_MS);

      debounceTimersRef.current.set(updated.id, timer);
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleVisibilityOrUnload = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingBedSaves();
      }
    };
    window.addEventListener('beforeunload', flushPendingBedSaves);
    document.addEventListener('visibilitychange', handleVisibilityOrUnload);
    return () => {
      window.removeEventListener('beforeunload', flushPendingBedSaves);
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityOrUnload
      );
      flushPendingBedSaves();
    };
  }, [flushPendingBedSaves]);

  const reloadHospitalBedsFromStorage = useCallback(async () => {
    if (!clinicalRepository.listHospitalBeds) return;
    const storedBeds = await clinicalRepository.listHospitalBeds();
    if (storedBeds && storedBeds.length > 0) {
      setHospitalBeds(storedBeds);
      setActiveHospitalBedId((prev) =>
        storedBeds.some((b) => b.id === prev) ? prev : storedBeds[0].id
      );
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (clinicalRepository.listHospitalBeds) {
      clinicalRepository.listHospitalBeds().then((stored) => {
        if (!mounted) return;
        if (stored && stored.length > 0) {
          setHospitalBeds(stored);
          setActiveHospitalBedId(stored[0].id);
        } else if (clinicalRepository.saveHospitalBed) {
          DEFAULT_HOSPITAL_BEDS_SEED.forEach((b) => {
            clinicalRepository.saveHospitalBed?.(b);
          });
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateHospitalBed = useCallback(
    (updated: HospitalBedPatientRecord) => {
      setHospitalBeds((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      scheduleBedPersistence(updated);
    },
    [scheduleBedPersistence]
  );

  const handleCreateHospitalBed = useCallback(
    (created: HospitalBedPatientRecord) => {
      setHospitalBeds((prev) => [...prev, created]);
      setActiveHospitalBedId(created.id);
      clinicalRepository.saveHospitalBed?.(created);
    },
    []
  );

  const handleDeleteHospitalBed = useCallback((bedId: string) => {
    const existingTimer = debounceTimersRef.current.get(bedId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      debounceTimersRef.current.delete(bedId);
    }
    pendingSavesRef.current.delete(bedId);

    setHospitalBeds((prev) => {
      const next = prev.filter((b) => b.id !== bedId);
      const safeNext = next.length > 0 ? next : DEFAULT_HOSPITAL_BEDS_SEED;
      setActiveHospitalBedId((currId) =>
        currId === bedId ? safeNext[0].id : currId
      );
      return safeNext;
    });
    clinicalRepository.deleteHospitalBed?.(bedId);
  }, []);

  const handleRecordScoreToHospitalBed = useCallback(
    (
      bedId: string,
      entry: HospitalBedScoreEntry,
      options?: { appendConductToBed?: boolean }
    ) => {
      let targetWardAndBed = bedId;
      setHospitalBeds((prev) =>
        prev.map((bed) => {
          if (bed.id !== bedId) return bed;
          targetWardAndBed = bed.wardAndBed || bedId;
          const nextScoreEntries = sortScoreEntriesChronologically([
            ...(bed.scoreEntries || []),
            entry,
          ]);
          const nextConductList =
            options?.appendConductToBed &&
            entry.recommendedConducts &&
            entry.recommendedConducts.length > 0
              ? [
                  ...bed.conductList,
                  ...entry.recommendedConducts.filter(
                    (c) => !bed.conductList.includes(c)
                  ),
                ]
              : bed.conductList;

          const updatedBed: HospitalBedPatientRecord = {
            ...bed,
            scoreEntries: nextScoreEntries,
            conductList: nextConductList,
            updatedAt: Date.now(),
          };
          clinicalRepository.saveHospitalBed?.(updatedBed);
          return updatedBed;
        })
      );
      onShowToast(
        `Escore ${entry.acronym} (${entry.scoreFormatted} pts) registrado no Leito ${targetWardAndBed}.`
      );
    },
    [onShowToast]
  );

  const handleNavigateToHospitalDashboardFromScore = useCallback(
    (bedId: string, scoreAcronym: string) => {
      setActiveHospitalBedId(bedId);
      setHospitalSubView('analytics_dashboard');
      setHospitalDashboardMetricSource('scores');
      setHospitalDashboardScoreAcronym(scoreAcronym);
      setActiveTab('hospital');
    },
    [setActiveTab]
  );

  const handleOpenScoreboardForBed = useCallback(
    (bed: HospitalBedPatientRecord, calculatorId?: string) => {
      setActiveHospitalBedId(bed.id);
      if (calculatorId) {
        setSelectedScoreboardId(calculatorId);
      }
      setActiveTab('scores');
    },
    [setActiveTab, setSelectedScoreboardId]
  );

  return {
    hospitalBeds,
    activeHospitalBedId,
    setActiveHospitalBedId,
    hospitalSubView,
    setHospitalSubView,
    hospitalDashboardMetricSource,
    hospitalDashboardScoreAcronym,
    reloadHospitalBedsFromStorage,
    handleUpdateHospitalBed,
    handleCreateHospitalBed,
    handleDeleteHospitalBed,
    handleRecordScoreToHospitalBed,
    handleNavigateToHospitalDashboardFromScore,
    handleOpenScoreboardForBed,
  };
}
