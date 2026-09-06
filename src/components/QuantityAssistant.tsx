import type { QuantityPlan } from '../types';
import { suggestQuantity } from '../utils/prescriptionRules';

export const EMPTY_QUANTITY_PLAN: QuantityPlan = { unit: 'mL', packageUnit: 'mL', packageLabel: 'frasco', regimen: 'regular', source: 'manual' };

export function QuantityAssistant({ value, onChange, onApply }: {
  value: QuantityPlan; onChange: (value: QuantityPlan) => void; onApply: (text: string) => void;
}) {
  const suggestion = suggestQuantity(value);
  const update = (patch: Partial<QuantityPlan>) => onChange({ ...value, ...patch, source: value.source === 'manual' ? 'manual' : 'stale' });
  const units = ['mL', 'comprimidos', 'cápsulas', 'gotas', 'doses'] as const;
  return <details className="quantity-assistant clinical-card p-3">
    <summary className="cursor-pointer font-semibold">Calcular caixas ou frascos</summary>
    <p className="mt-2 text-sm">Informe os dados do esquema escolhido. A sugestão não altera a dose nem a posologia.</p>
    <div className="grid grid-cols-2 gap-3 mt-3">
      <label>Esquema<select value={value.regimen} onChange={e => update({ regimen: e.target.value as QuantityPlan['regimen'] })}>
        <option value="regular">Regular</option><option value="asNeeded">Se necessário</option><option value="variable">Variável / desmame</option>
      </select></label>
      <label>Unidade por dose<select value={value.unit} onChange={e => update({ unit: e.target.value as QuantityPlan['unit'] })}>{units.map(u => <option key={u}>{u}</option>)}</select></label>
      {([['dose', 'Quantidade por administração'], ['administrationsPerDay', 'Administrações por dia'], ['days', 'Dias de tratamento / fornecimento'], ['packageSize', 'Conteúdo de cada embalagem']] as const).map(([key, label]) =>
        <label key={key}>{label}<input type="number" min="0.001" step="any" value={value[key] ?? ''} onChange={e => update({ [key]: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>)}
      <label>Unidade da embalagem<select value={value.packageUnit} onChange={e => update({ packageUnit: e.target.value as QuantityPlan['unit'] })}>{units.map(u => <option key={u}>{u}</option>)}</select></label>
      <label>Embalagem<select value={value.packageLabel} onChange={e => update({ packageLabel: e.target.value as QuantityPlan['packageLabel'] })}><option value="frasco">Frasco</option><option value="caixa">Caixa</option></select></label>
      {value.unit === 'gotas' && value.packageUnit === 'mL' && <label>Gotas por mL, conforme fabricante<input type="number" min="1" value={value.dropsPerMl ?? ''} onChange={e => update({ dropsPerMl: e.target.value ? Number(e.target.value) : undefined })} /></label>}
    </div>
    <p className="my-3 text-sm" aria-live="polite">{suggestion?.explanation ?? 'Informe dados completos e compatíveis. Para uso se necessário ou variável, preencha a quantidade manualmente.'}</p>
    <button type="button" className="clinical-button" disabled={!suggestion} onClick={() => { if (suggestion) { onChange({ ...value, source: 'suggested' }); onApply(suggestion.text); } }}>Usar sugestão{suggestion ? `: ${suggestion.text}` : ''}</button>
  </details>;
}
