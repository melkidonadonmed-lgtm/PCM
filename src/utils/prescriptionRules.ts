import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import type { PrescriptionDocument, PrescriptionItem, PrescriptionKind, QuantityPlan } from '../types';
import { quantityWords } from './quantityWords';

export const PRESCRIPTION_LABELS: Record<PrescriptionKind, string> = {
  simple: 'Receita simples', antimicrobial: 'Receita de antimicrobianos',
  c1: 'Controle especial — C1', notification: 'Formulário específico', pending: 'Revisar classificação',
};
const kinds = Object.keys(PRESCRIPTION_LABELS);
const catalog = new Map(UNIFIED_MEDICATIONS.map(m => [m.id, m]));

export function catalogPresentation(name: string): string {
  const description = name.split(' (')[0];
  if (/\s\/\s|\bou\b/.test(description)) return '';
  return description.match(/\d.*$/)?.[0] ?? '';
}

/** Only a catalog ID or an explicit review is authoritative; never match a substring. */
export function normalizePrescriptionItem(item: PrescriptionItem): PrescriptionItem {
  const med = item.medicationId ? catalog.get(item.medicationId) : undefined;
  const trusted = item.schemaVersion === 2 && item.classificationReviewed && kinds.includes(item.prescriptionKind);
  const kind = med?.prescriptionKind ?? (trusted ? item.prescriptionKind : 'pending');
  return {
    ...item, schemaVersion: 2, prescriptionKind: kind,
    controlledSubstances: med?.controlledSubstances ?? (trusted ? item.controlledSubstances : undefined),
    regulatoryNote: med?.regulatoryNote ?? item.regulatoryNote,
    isSpecialControl: kind === 'c1',
    // Preserve old data for review, but never propagate fabricated legacy schedules.
    scheduleTimes: item.schemaVersion === 2 ? item.scheduleTimes ?? [] : [],
  };
}

export function prescriptionIssues(item: PrescriptionItem): string[] {
  const normalized = normalizePrescriptionItem(item);
  const errors: string[] = [];
  if (normalized.prescriptionKind === 'pending') errors.push('Revise a classificação e a apresentação.');
  if (normalized.prescriptionKind === 'notification') errors.push(normalized.regulatoryNote || 'Exige formulário específico não emitido pelo app.');
  if (!item.name?.trim()) errors.push('Informe o medicamento.');
  if (!item.presentation?.trim() || item.presentation === item.quantity) errors.push('Informe concentração e forma farmacêutica separadamente da quantidade.');
  if (!/^[1-9]\d*(?:[,.]\d+)?\s+\S/.test(item.quantity?.trim() ?? '') || /\bou\b/i.test(item.quantity)) errors.push('Informe uma quantidade positiva e definida, com unidade (ex.: 2 frascos).');
  if (!item.instructions?.trim()) errors.push('Informe a posologia.');
  if (normalized.prescriptionKind === 'c1') {
    const substances = normalized.controlledSubstances?.filter(s => s.trim());
    if (!substances?.length || new Set(substances).size > 3) errors.push('Revise as substâncias C1 da apresentação; o modelo suporta até três.');
    const amount = Number(item.quantity?.match(/^\d+(?:[,.]\d+)?/)?.[0].replace(',', '.'));
    if (!Number.isInteger(amount) || amount < 1 || amount >= 1000000) errors.push('Para controle especial, informe a quantidade total em unidades inteiras para emissão por extenso.');
  }
  if (item.quantityPlan?.source === 'suggested') {
    const suggestion = suggestQuantity(item.quantityPlan);
    if (!suggestion || item.quantity !== suggestion.text) errors.push('Recalcule a quantidade ou confirme o preenchimento manual.');
  }
  if (item.quantityPlan?.source === 'stale') errors.push('O esquema foi alterado. Aplique uma nova sugestão ou confirme a quantidade manualmente.');
  return errors;
}

export function buildPrescriptionDocuments(items: PrescriptionItem[]): PrescriptionDocument[] {
  const normalized = items.map(normalizePrescriptionItem);
  const documents: PrescriptionDocument[] = [];
  for (const kind of ['simple', 'antimicrobial', 'c1'] as const) {
    const selected = normalized.filter(i => i.prescriptionKind === kind);
    if (!selected.length) continue;
    const groups: PrescriptionItem[][] = [];
    let group: PrescriptionItem[] = [];
    let substances = new Set<string>();
    for (const item of selected) {
      const next = new Set([...substances, ...(item.controlledSubstances ?? [])]);
      if (kind === 'c1' && next.size > 3 && group.length) {
        groups.push(group); group = []; substances = new Set();
      }
      group.push(item);
      item.controlledSubstances?.forEach(s => substances.add(s));
    }
    if (group.length) groups.push(group);
    groups.forEach((entries, index) => documents.push({
      id: `${kind}-${index + 1}`, kind, title: PRESCRIPTION_LABELS[kind],
      copies: kind === 'simple' ? 1 : 2, items: entries,
    }));
  }
  return documents;
}

export function suggestQuantity(plan: QuantityPlan): { total: number; packages: number; text: string; explanation: string } | null {
  const { dose, administrationsPerDay: frequency, days, packageSize } = plan;
  if (plan.regimen !== 'regular' || ![dose, frequency, days, packageSize].every(n => typeof n === 'number' && Number.isFinite(n) && n > 0)) return null;
  let total = dose * frequency * days;
  if (plan.unit !== plan.packageUnit) {
    if (plan.unit !== 'gotas' || plan.packageUnit !== 'mL' || !Number.isFinite(plan.dropsPerMl) || plan.dropsPerMl <= 0) return null;
    total /= plan.dropsPerMl;
  }
  const packages = Math.ceil(Number((total / packageSize).toPrecision(12)));
  if (!Number.isSafeInteger(packages) || packages < 1 || !Number.isFinite(total) || total <= 0) return null;
  const n = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  return { total, packages,
    text: `${packages} ${plan.packageLabel}${packages > 1 ? 's' : ''} (${n(packageSize)} ${plan.packageUnit} cada)`,
    explanation: `${n(dose)} ${plan.unit} × ${n(frequency)} administrações/dia × ${n(days)} dias = ${n(total)} ${plan.packageUnit}. Embalagens de ${n(packageSize)} ${plan.packageUnit}; arredondamento para cima.`,
  };
}

export function prescriptionItemText(item: PrescriptionItem, index: number): string {
  const quantity = normalizePrescriptionItem(item).prescriptionKind === 'c1'
    ? item.quantity.replace(/^\d+/, digits => `${digits} (${quantityWords(Number(digits))})`)
    : item.quantity;
  const lines = [`${index + 1}. ${item.name}`, `Apresentação: ${item.presentation}`, `Via: ${item.route}`, `Quantidade: ${quantity}`, `Posologia: ${item.instructions}`];
  if (item.durationDays) lines.push(`Duração: ${item.durationDays} dias`);
  if (item.scheduleTimes?.length) lines.push(`Horários sugeridos: ${item.scheduleTimes.join(', ')}`);
  return lines.join('\n');
}

export function prescriptionDocumentText(document: PrescriptionDocument): string {
  if (!document.items.length || document.items.some(i => prescriptionIssues(i).length)) throw new Error('Revise as pendências antes de emitir.');
  if (document.items.some(i => normalizePrescriptionItem(i).prescriptionKind !== document.kind)) throw new Error('O documento contém medicamentos de outro tipo de receita.');
  if (document.copies !== (document.kind === 'simple' ? 1 : 2)) throw new Error('Número de vias incompatível com o tipo de receita.');
  if (document.kind === 'c1' && new Set(document.items.flatMap(i => normalizePrescriptionItem(i).controlledSubstances ?? [])).size > 3) throw new Error('Separe as substâncias C1 em receitas com até três substâncias.');
  return `${document.title}\n\n${document.items.map(prescriptionItemText).join('\n\n')}`;
}
