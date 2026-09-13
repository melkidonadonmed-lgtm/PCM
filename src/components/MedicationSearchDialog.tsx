import { MedicationVoiceSearch } from './MedicationVoiceSearch';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';
import type { UnifiedMedication } from '../data/medicationDatabase';

const BRAND_SUFFIX_PATTERN = /\s*\([^)]*\)\s*$/;

function MedicationResultButton({ medication, onSelect }: {
  key?: React.Key;
  medication: UnifiedMedication;
  onSelect: (medication: UnifiedMedication) => void;
}) {
  const displayName = medication.name.replace(BRAND_SUFFIX_PATTERN, '');

  return (
    <button
      type="button"
      className="w-full min-h-[52px] px-3 py-2 text-left rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
      onClick={() => onSelect(medication)}
    >
      <strong className="block text-sm leading-tight truncate">{displayName}</strong>
      <span className="block mt-0.5 text-[11px] leading-tight text-slate-500 dark:text-slate-400 truncate">
        {medication.activeIngredient} · {medication.route}
      </span>
    </button>
  );
}

export function MedicationSearchDialog({ query, onQuery, results, recent, onSelect, onClose, onManual }: {
  query: string; onQuery: (value: string) => void; results: UnifiedMedication[]; recent: UnifiedMedication[];
  onSelect: (med: UnifiedMedication) => void; onClose: () => void; onManual: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewport, setViewport] = useState({ height: window.visualViewport?.height || window.innerHeight, top: window.visualViewport?.offsetTop || 0 });
  useModalA11y({ dialogRef, isOpen: true, onClose, initialFocusRef: inputRef });
  useEffect(() => {
    const vv = window.visualViewport;
    const update = () => setViewport({ height: vv?.height || window.innerHeight, top: vv?.offsetTop || 0 });
    vv?.addEventListener('resize', update); vv?.addEventListener('scroll', update);
    return () => { vv?.removeEventListener('resize', update); vv?.removeEventListener('scroll', update); };
  }, []);
  return createPortal(<div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Buscar medicamento" className="fixed inset-x-0 z-[100] p-3 flex flex-col gap-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" style={{ top: viewport.top, height: viewport.height }}>
    <div className="flex justify-between items-center"><h2 className="font-bold">Buscar medicamento</h2><button type="button" aria-label="Fechar busca" className="min-w-11 min-h-11 flex items-center justify-center" onClick={onClose}><X /></button></div>
    <label className="flex items-center gap-2"><Search className="shrink-0 w-5" /><input ref={inputRef} aria-label="Buscar medicamento" className="clinical-input" placeholder="Buscar medicamento" value={query} onChange={e => onQuery(e.target.value)} /></label>
    <MedicationVoiceSearch onResult={onQuery} />
    <div className="flex-1 min-h-0 max-h-[48vh] overflow-y-auto overscroll-contain space-y-1.5 pr-0.5">
      {!query.trim() && recent.length > 0 ? <><h3 className="font-semibold text-sm">Medicamentos recentes</h3>{recent.map(medication => <MedicationResultButton key={`recent-${medication.id}`} medication={medication} onSelect={onSelect} />)}</> : null}
      <h3 className="font-semibold text-sm">{query.trim() ? 'Resultados' : 'Catálogo'}</h3>
      {results.length ? results.map(medication => <MedicationResultButton key={medication.id} medication={medication} onSelect={onSelect} />) : <p role="status">Medicamento não encontrado.</p>}
    </div>
    <button type="button" className="clinical-button min-h-11 w-full shrink-0" onClick={onManual}>Prescrever manualmente</button>
  </div>, document.body);
}
