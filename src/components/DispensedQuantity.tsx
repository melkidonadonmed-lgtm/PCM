import React from 'react';

const units = ['caixa', 'frasco', 'comprimido', 'cápsula', 'ampola', 'bisnaga', 'sachê', 'unidade', 'mL', 'g'];
export function DispensedQuantity({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const match = value.match(/^(\d+(?:[.,]\d+)?)\s+([^()]+?)(\s*\(.*\))?$/);
  const count = match ? Number(match[1].replace(',', '.')) : 1;
  const rawUnit = match?.[2].trim() || 'caixa';
  const unit = units.find(u => rawUnit === u || rawUnit === `${u}s`) || rawUnit;
  const suffix = match?.[3] || '';
  const update = (next: number, nextUnit = unit) => {
    if (!Number.isFinite(next)) return;
    const bounded = Math.min(9999, Math.max(1, Math.round(next)));
    onChange(`${bounded} ${nextUnit}${bounded > 1 && !['mL', 'g'].includes(nextUnit) ? 's' : ''}${nextUnit === unit ? suffix : ''}`);
  };
  return <div>
    {!match && value && <p className="text-xs mb-1">Quantidade atual: {value}. Revise nos controles abaixo.</p>}
    <div className="flex items-center gap-1">
      <button type="button" className="clinical-button-secondary min-w-11 min-h-11" aria-label="Diminuir quantidade" disabled={count <= 1} onClick={() => update(count - 1)}>−</button>
      <input id={id} aria-label="Quantidade dispensada" className="clinical-input min-w-0 w-20" type="number" inputMode="numeric" min={1} max={9999} step={1} value={count} onChange={e => update(e.target.valueAsNumber)} />
      <button type="button" className="clinical-button-secondary min-w-11 min-h-11" aria-label="Aumentar quantidade" disabled={count >= 9999} onClick={() => update(count + 1)}>+</button>
    </div>
    <select aria-label="Unidade dispensada" className="clinical-input mt-1" value={unit} onChange={e => update(count, e.target.value)}>
      {[...new Set([...units, unit])].map(u => <option key={u} value={u}>{u}</option>)}
    </select>
  </div>;
}
