import { Patient, PrescriptionItem } from '../types';
import { ClinicalKit } from '../data/clinicalKits';

/**
 * Monta os itens da prescrição a partir de um kit clínico e dos dados do paciente.
 * Lógica pura extraída de PrescriptionBuilder (handleApplyClinicalKit).
 */
export function montarItensDoKit(
  kit: ClinicalKit,
  patient: Patient,
  gerarId?: (idx: number) => string
): PrescriptionItem[] {
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasWeight = patientWeight > 0;

  const defaultGerarId = (idx: number) =>
    `kit-item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`;

  const idGenerator = gerarId || defaultGerarId;

  // Texto pt-BR: vírgula decimal sem separador de milhar e "1 gota" no singular.
  const ml = (valor: number) => valor.toLocaleString('pt-BR', { useGrouping: false });
  const gotas = (n: number) => `${n} ${n === 1 ? 'gota' : 'gotas'}`;

  return kit.items.map((kitItem, idx) => {
    let itemName = kitItem.name;
    let itemPresentation = kitItem.quantity;
    let itemInstructions = kitItem.instructions;
    let itemDoseCalculatedText = '';

    if (hasWeight && kitItem.pediaDrugKey) {
      if (kitItem.pediaDrugKey === 'dipirona_gotas') {
        const drops = Math.min(Math.round(patientWeight), 40);
        itemName = 'Dipirona Sódica 500mg/mL gotas (Novalgina)';
        itemPresentation = '1 frasco (20 mL)';
        itemInstructions = `Administrar ${gotas(drops)} via oral de 6 em 6 horas se dor ou febre (máx 4x ao dia).`;
        itemDoseCalculatedText = `${gotas(drops)}`;
      } else if (kitItem.pediaDrugKey === 'paracetamol_gotas') {
        const drops = Math.min(Math.round(patientWeight), 35);
        itemName = 'Paracetamol 200mg/mL gotas (Tylenol Bebê/Criança)';
        itemPresentation = '1 frasco (15 mL)';
        itemInstructions = `Administrar ${gotas(drops)} via oral de 6 em 6 horas se dor ou febre.`;
        itemDoseCalculatedText = `${gotas(drops)}`;
      } else if (kitItem.pediaDrugKey === 'ibuprofeno_100') {
        const drops = Math.min(Math.round(patientWeight), 40);
        itemName = 'Ibuprofeno 100mg/mL suspensão gotas (Alivium)';
        itemPresentation = '1 frasco (20 mL)';
        itemInstructions = `Administrar ${gotas(drops)} via oral de 8 em 8 horas após as refeições por 3 dias.`;
        itemDoseCalculatedText = `${gotas(drops)}`;
      } else if (kitItem.pediaDrugKey === 'amoxicilina_susp') {
        const mlPerDose = parseFloat(((patientWeight * 50) / 3 / 50).toFixed(1));
        itemName = 'Amoxicilina 250mg/5mL pó para suspensão oral (Amoxil)';
        itemPresentation = '1 frasco (150 mL)';
        itemInstructions = `Administrar ${ml(mlPerDose)} mL via oral de 8 em 8 horas durante 10 dias consecutivos.`;
        itemDoseCalculatedText = `${ml(mlPerDose)} mL`;
      } else if (kitItem.pediaDrugKey === 'prednisolona_sol') {
        const mlPerDose = parseFloat(((patientWeight * 1) / 3).toFixed(1));
        itemName = 'Fosfato Sódico de Prednisolona 3mg/mL solução oral (Prelone)';
        itemPresentation = '1 frasco (60 mL)';
        itemInstructions = `Administrar ${ml(mlPerDose)} mL via oral 1 vez ao dia, pela manhã, por 5 dias.`;
        itemDoseCalculatedText = `${ml(mlPerDose)} mL`;
      }
    }

    return {
      id: idGenerator(idx),
      name: itemName,
      presentation: itemPresentation,
      route: kitItem.route,
      quantity: itemPresentation,
      doseCalculatedText: itemDoseCalculatedText,
      frequencyText: itemInstructions,
      // Os itens do kit têm posologias diferentes: sem grade de horários automática.
      scheduleInterval: 'Conforme posologia',
      scheduleTimes: [],
      instructions: itemInstructions,
      isContinuous: false,
      isSpecialControl: Boolean((kitItem as any).isSpecial),
      calculatedFromWeight: hasWeight ? patientWeight : undefined
    };
  });
}
