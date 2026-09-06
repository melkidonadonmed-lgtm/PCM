const units = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

export function quantityWords(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value >= 1000000) throw new Error('Quantidade por extenso: informe um inteiro entre 1 e 999999.');
  if (value < 10) return units[value];
  if (value < 20) return teens[value - 10];
  if (value < 100) return tens[Math.floor(value / 10)] + (value % 10 ? ' e ' + quantityWords(value % 10) : '');
  if (value === 100) return 'cem';
  if (value < 1000) return hundreds[Math.floor(value / 100)] + (value % 100 ? ' e ' + quantityWords(value % 100) : '');
  const thousands = Math.floor(value / 1000);
  const rest = value % 1000;
  return (thousands === 1 ? 'mil' : quantityWords(thousands) + ' mil') + (rest ? (rest < 100 || rest % 100 === 0 ? ' e ' : ' ') + quantityWords(rest) : '');
}
