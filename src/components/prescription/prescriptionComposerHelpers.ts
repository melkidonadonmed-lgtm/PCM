import React, { useEffect } from 'react';
import { PrescriptionItem } from '../../types';
import { UnifiedMedication } from '../../data/medicationDatabase';
import { classificarReceita, type RegimeReceita } from '../../utils/isSpecialControlOrAntibiotic';
import {
  calcularPrescricaoRapida,
  FrequenciaHorario,
  UnidadeDose,
  formatarUnidadeDose,
} from '../../utils/prescricaoRapida';

export const REGIMES: RegimeReceita[] = ['simples', 'antimicrobiano', 'controle_especial'];

/** Como cada tipo de receita é apresentado na tela e no texto compartilhado. */
export const REGIME_INFO: Record<
  RegimeReceita,
  { rotulo: string; detalhe: string; tituloTexto: string }
> = {
  simples: {
    rotulo: 'Simples',
    detalhe: '1 via',
    tituloTexto: 'RECEITUÁRIO MÉDICO',
  },
  antimicrobiano: {
    rotulo: 'Antimicrobiano',
    detalhe: '2 vias • válida por 10 dias • a farmácia retém a 2ª via',
    tituloTexto: 'RECEITUÁRIO MÉDICO — ANTIMICROBIANO (2 vias • válida por 10 dias)',
  },
  controle_especial: {
    rotulo: 'Controle especial',
    detalhe: '2 vias • a farmácia retém a 1ª via',
    tituloTexto: 'RECEITUÁRIO DE CONTROLE ESPECIAL (2 vias • retenção na farmácia)',
  },
};

/**
 * Resolve de forma determinística a ação de teclado no combobox de medicamentos (#med-search-input).
 * Garante que pressionar Enter sem ter navegado com as setas (highlightedIndex === -1)
 * nunca sobrescreva um medicamento manipulado/personalizado com uma sugestão aproximada do catálogo.
 */
export function resolveMedicationKeyAction(
  key: string,
  showSuggestions: boolean,
  suggestions: UnifiedMedication[],
  highlightedIndex: number,
  typedName: string
):
  | { type: 'none' }
  | { type: 'highlight'; nextIndex: number }
  | { type: 'select'; medication: UnifiedMedication }
  | { type: 'dismiss' } {
  if (!showSuggestions || suggestions.length === 0) {
    return { type: 'none' };
  }

  if (key === 'ArrowDown') {
    const nextIndex = highlightedIndex < 0 ? 0 : (highlightedIndex + 1) % suggestions.length;
    return { type: 'highlight', nextIndex };
  }

  if (key === 'ArrowUp') {
    const nextIndex = highlightedIndex <= 0 ? suggestions.length - 1 : highlightedIndex - 1;
    return { type: 'highlight', nextIndex };
  }

  if (key === 'Escape') {
    return { type: 'dismiss' };
  }

  if (key === 'Enter') {
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      return { type: 'select', medication: suggestions[highlightedIndex] };
    }
    const cleanTyped = typedName.trim().toLowerCase();
    const exactMatch = suggestions.find((m) => m.name.trim().toLowerCase() === cleanTyped);
    if (exactMatch) {
      return { type: 'select', medication: exactMatch };
    }
    return { type: 'dismiss' };
  }

  return { type: 'none' };
}

/**
 * Deduz de forma determinística a unidade farmacêutica principal a partir do nome/apresentação do fármaco.
 */
export function inferirUnidadeDoseDoMedicamento(medName: string): UnidadeDose {
  const lower = (medName || '').toLowerCase();
  if (lower.includes('cáps') || lower.includes('caps')) return 'cápsula';
  if (
    lower.includes('gotas') ||
    lower.includes('gota') ||
    lower.includes('colírio') ||
    lower.includes('colirio')
  ) {
    return 'gota';
  }
  if (lower.includes('xarope') || lower.includes('suspens') || lower.includes('/ml')) {
    return 'mL';
  }
  if (lower.includes('sachê') || lower.includes('sache') || lower.includes('envelope')) {
    return 'sachê';
  }
  if (lower.includes('ampola')) return 'ampola';
  if (lower.includes('spray') || lower.includes('jato')) return 'jato';
  if (
    lower.includes('pomada') ||
    lower.includes('creme') ||
    lower.includes('gel') ||
    lower.includes('caneta')
  ) {
    return 'aplicação';
  }
  return 'comprimido';
}

export interface ComposerDraftInput {
  selectedMedName: string;
  selectedRoute: string;
  selectedQuantity: string;
  selectedPosology: string;
  doseAmount: number;
  doseUnit: UnidadeDose;
  doseFrequency: FrequenciaHorario;
  doseDays: number;
  isContinuousDose: boolean;
}

/**
 * Constrói ou atualiza um item de prescrição aplicando classificação sanitária determinística.
 */
export function construirOuAtualizarItemPrescrito(
  draft: ComposerDraftInput,
  existingItems: PrescriptionItem[],
  editingItemId: string | null
): { updatedItems: PrescriptionItem[]; regime: RegimeReceita } {
  const posologiaFinal =
    draft.selectedPosology.trim() ||
    calcularPrescricaoRapida({
      dose: draft.doseAmount,
      unidade: draft.doseUnit,
      frequencia: draft.doseFrequency,
      diasTratamento: draft.doseDays,
      usoContinuo: draft.isContinuousDose,
      via: draft.selectedRoute,
    }).posologiaTexto;

  const regime: RegimeReceita = classificarReceita(draft.selectedMedName);
  const isContinuous =
    draft.isContinuousDose || posologiaFinal.toLowerCase().includes('contínuo');
  const doseCalculatedText = `${draft.doseAmount} ${formatarUnidadeDose(
    draft.doseUnit,
    draft.doseAmount
  )}`;
  const cleanName = draft.selectedMedName.trim();
  const cleanQuantity = draft.selectedQuantity.trim() || '30 comprimidos';

  if (editingItemId) {
    const updatedItems = existingItems.map((it) => {
      if (it.id === editingItemId) {
        return {
          ...it,
          name: cleanName,
          presentation: draft.doseUnit || it.presentation || 'comprimido',
          route: draft.selectedRoute,
          quantity: cleanQuantity,
          doseCalculatedText,
          frequencyText: posologiaFinal,
          scheduleInterval: draft.doseFrequency,
          instructions: posologiaFinal,
          isContinuous,
          isSpecialControl: regime !== 'simples',
          regimeReceita: regime,
        };
      }
      return it;
    });

    return { updatedItems, regime };
  }

  const newItem: PrescriptionItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    presentation: draft.doseUnit || 'comprimido',
    route: draft.selectedRoute,
    quantity: cleanQuantity,
    doseCalculatedText,
    frequencyText: posologiaFinal,
    scheduleInterval: draft.doseFrequency,
    scheduleTimes: [],
    instructions: posologiaFinal,
    isContinuous,
    isSpecialControl: regime !== 'simples',
    regimeReceita: regime,
  };

  return {
    updatedItems: [...existingItems, newItem],
    regime,
  };
}

/**
 * Atalhos globais de teclado ('/' e 'Ctrl+K') para foco rápido na busca de medicamentos,
 * respeitando modais/drawers abertos ([role="dialog"], [aria-modal="true"]).
 */
export function usePrescriptionSearchHotkeys(
  searchInputRef: React.RefObject<HTMLInputElement | null>,
  setMobileSection: (section: 'composer' | 'preview') => void,
  setShowSuggestions: (show: boolean) => void
): void {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"], [aria-modal="true"]')) {
        return;
      }

      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isEditing =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;

      if (
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === 'k'
      ) {
        if (
          document.activeElement === searchInputRef.current &&
          searchInputRef.current?.value.trim()
        ) {
          e.preventDefault();
          searchInputRef.current.select();
          setShowSuggestions(true);
        }
        return;
      }

      if (e.key === '/' && !isEditing) {
        e.preventDefault();
        setMobileSection('composer');
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setShowSuggestions(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchInputRef, setMobileSection, setShowSuggestions]);
}
