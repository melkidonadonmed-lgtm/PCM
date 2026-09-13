import React, { useId } from 'react';
import { Package, Calculator, Check, Info } from 'lucide-react';
import type { QuantityPlan } from '../types';
import { suggestQuantity } from '../utils/prescriptionRules';

export const EMPTY_QUANTITY_PLAN: QuantityPlan = { unit: 'mL', packageUnit: 'mL', packageLabel: 'frasco', regimen: 'regular', source: 'manual' };

export function QuantityAssistant({ value, onChange, onApply }: {
  value: QuantityPlan; onChange: (value: QuantityPlan) => void; onApply: (text: string) => void;
}) {
  const baseId = useId();
  const suggestion = suggestQuantity(value);
  const update = (patch: Partial<QuantityPlan>) => onChange({ ...value, ...patch, source: value.source === 'manual' ? 'manual' : 'stale' });
  const units = ['mL', 'comprimidos', 'cápsulas', 'gotas', 'doses'] as const;

  return (
    <details className="quantity-assistant p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 group transition-all">
      <summary className="cursor-pointer font-bold text-xs flex items-center justify-between gap-2 text-slate-800 dark:text-slate-200 select-none list-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <Package className="w-4 h-4 text-navy-900 dark:text-cream-200 shrink-0" strokeWidth={1.75} />
          <span>Calcular Embalagens (Caixas / Frascos por Período)</span>
        </span>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Informe os dados do esquema terapêutico. A sugestão calcula a quantidade total necessária sem alterar a dose prescrita.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <div>
          <label htmlFor={`${baseId}-regimen`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Esquema Terapêutico
          </label>
          <select
            id={`${baseId}-regimen`}
            value={value.regimen}
            onChange={e => update({ regimen: e.target.value as QuantityPlan['regimen'] })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="regular">Regular</option>
            <option value="asNeeded">Se necessário</option>
            <option value="variable">Variável / desmame</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${baseId}-unit`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Unidade por Dose
          </label>
          <select
            id={`${baseId}-unit`}
            value={value.unit}
            onChange={e => update({ unit: e.target.value as QuantityPlan['unit'] })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        {([
          ['dose', 'Quantidade por administração', 'Ex: 5 ou 1'],
          ['administrationsPerDay', 'Administrações por dia', 'Ex: 3 (8/8h)'],
          ['days', 'Dias de tratamento / fornecimento', 'Ex: 7'],
          ['packageSize', 'Conteúdo da embalagem', 'Ex: 20 ou 100']
        ] as const).map(([key, label, placeholder]) => (
          <div key={key}>
            <label htmlFor={`${baseId}-${key}`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {label}
            </label>
            <input
              id={`${baseId}-${key}`}
              type="number"
              min="0.001"
              step="any"
              placeholder={placeholder}
              value={value[key] ?? ''}
              onChange={e => update({ [key]: e.target.value === '' ? undefined : Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        ))}

        <div>
          <label htmlFor={`${baseId}-packageUnit`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Unidade da Embalagem
          </label>
          <select
            id={`${baseId}-packageUnit`}
            value={value.packageUnit}
            onChange={e => update({ packageUnit: e.target.value as QuantityPlan['unit'] })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor={`${baseId}-packageLabel`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tipo de Embalagem
          </label>
          <select
            id={`${baseId}-packageLabel`}
            value={value.packageLabel}
            onChange={e => update({ packageLabel: e.target.value as QuantityPlan['packageLabel'] })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="frasco">Frasco</option>
            <option value="caixa">Caixa</option>
          </select>
        </div>

        {value.unit === 'gotas' && value.packageUnit === 'mL' && (
          <div className="sm:col-span-2">
            <label htmlFor={`${baseId}-dropsPerMl`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Gotas por mL (conforme fabricante)
            </label>
            <input
              id={`${baseId}-dropsPerMl`}
              type="number"
              min="1"
              value={value.dropsPerMl ?? ''}
              onChange={e => update({ dropsPerMl: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Padrão: 20 gotas/mL"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/10 text-xs font-semibold outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        )}
      </div>

      <div
        className={`my-3 p-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
          suggestion
            ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
        }`}
        aria-live="polite"
      >
        {suggestion ? (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
        )}
        <span>
          {suggestion?.explanation ?? 'Informe dados completos e compatíveis. Para uso se necessário ou variável, preencha a quantidade manualmente.'}
        </span>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          className="clinical-button"
          disabled={!suggestion}
          onClick={() => {
            if (suggestion) {
              onChange({ ...value, source: 'suggested' });
              onApply(suggestion.text);
            }
          }}
        >
          <Calculator className="w-4 h-4" strokeWidth={1.75} />
          <span>Usar sugestão{suggestion ? `: ${suggestion.text}` : ''}</span>
        </button>
      </div>
    </details>
  );
}
