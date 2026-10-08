import { PrescriptionItem } from '../types';

/**
 * Remove tags HTML e decodifica entidades básicas para obter texto puro
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .trim();
}

/**
 * Converte o HTML gerado ou editado no DocumentEditorView de volta para a lista tipada
 * de PrescriptionItem[] da consulta ativa.
 *
 * É 100% agnóstico ao DOM (funciona tanto no browser quanto no Node/Vitest).
 * Preserva IDs e propriedades clínicas dos itens originais quando presentes.
 */
export function parsePrescriptionHtmlToItems(
  html: string,
  originalItems: PrescriptionItem[] = []
): PrescriptionItem[] {
  if (!html || !html.trim()) {
    return originalItems;
  }

  // Extrai conteúdos de parágrafos <p>...</p> ou quebras de linha
  const paragraphMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  const lines: string[] = paragraphMatches && paragraphMatches.length > 0
    ? paragraphMatches.map(p => stripHtmlTags(p))
    : html.split('\n').map(l => stripHtmlTags(l));

  const parsedItems: PrescriptionItem[] = [];
  let currentItem: {
    name: string;
    presentation: string;
    route: string;
    quantity: string;
    instructions: string;
  } | null = null;
  let itemIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i]?.trim();
    if (!text) continue;

    // Detecta início de medicamento: "1. Amoxicilina...", "2. Dipirona..."
    const itemHeaderMatch = text.match(/^(\d+)\.\s*(.+)$/);
    if (itemHeaderMatch) {
      // Salva item anterior se já estava em construção
      if (currentItem && currentItem.name) {
        const original = originalItems[itemIndex];
        parsedItems.push({
          id: original?.id || `item-parsed-${Date.now()}-${itemIndex}`,
          name: currentItem.name,
          presentation: currentItem.presentation || original?.presentation || '',
          route: currentItem.route || original?.route || 'Uso Oral',
          quantity: currentItem.quantity || original?.quantity || 'Conforme posologia',
          instructions: currentItem.instructions || original?.instructions || 'Conforme orientação médica.',
          doseCalculatedText: original?.doseCalculatedText,
          frequencyText: original?.frequencyText,
          scheduleInterval: original?.scheduleInterval || 'Conforme posologia',
          scheduleTimes: original?.scheduleTimes || [],
          isContinuous: original?.isContinuous || false,
          isSpecialControl: original?.isSpecialControl || false
        });
        itemIndex++;
      }

      const rawContent = itemHeaderMatch[2];
      let medName = rawContent;
      let medRoute = '';
      let medQuantity = '';
      let medPresentation = '';

      // Extrai quantidade após traços (ex.: "----------------- 30 cápsulas" ou "--- 1 frasco")
      const quantityMatch = medName.match(/[-—–]{2,}\s*(.+)$/);
      if (quantityMatch) {
        medQuantity = quantityMatch[1].trim();
        medName = medName.replace(/[-—–]{2,}\s*(.+)$/, '').trim();
      }

      // Extrai via (ex: (Uso Oral), (Uso Tópico))
      const routeMatch = medName.match(/\((Uso\s+[^)]+|Oral|Tópico|Inalatório|Oftálmico|Nasal|Retal|Intravenoso|Intramuscular)\)/i);
      if (routeMatch) {
        medRoute = routeMatch[1].trim();
        medName = medName.replace(routeMatch[0], '').trim();
      }

      // Extrai apresentação se estiver entre parênteses no nome (ex: (Cápsulas), (Gotas))
      const presMatch = medName.match(/\(([^)]+)\)$/);
      if (presMatch) {
        medPresentation = presMatch[1].trim();
        medName = medName.replace(presMatch[0], '').trim();
      }

      currentItem = {
        name: medName.trim(),
        presentation: medPresentation,
        route: medRoute,
        quantity: medQuantity,
        instructions: ''
      };
      continue;
    }

    // Se temos um item aberto, verifica se é encerramento ou continuação das instruções
    if (currentItem) {
      if (
        text.startsWith('Orientações Gerais:') ||
        text.startsWith('Recomendações Clínicas:') ||
        text.startsWith('USO INTERNO') ||
        text.startsWith('RECEITUÁRIO')
      ) {
        const original = originalItems[itemIndex];
        parsedItems.push({
          id: original?.id || `item-parsed-${Date.now()}-${itemIndex}`,
          name: currentItem.name || 'Medicamento',
          presentation: currentItem.presentation || original?.presentation || '',
          route: currentItem.route || original?.route || 'Uso Oral',
          quantity: currentItem.quantity || original?.quantity || 'Conforme posologia',
          instructions: currentItem.instructions || original?.instructions || 'Conforme orientação médica.',
          doseCalculatedText: original?.doseCalculatedText,
          frequencyText: original?.frequencyText,
          scheduleInterval: original?.scheduleInterval || 'Conforme posologia',
          scheduleTimes: original?.scheduleTimes || [],
          isContinuous: original?.isContinuous || false,
          isSpecialControl: original?.isSpecialControl || false
        });
        itemIndex++;
        currentItem = null;
        continue;
      }

      // Ignora carimbo ou linhas informativas secundárias de horários
      if (!text.startsWith('Horários recomendados:')) {
        currentItem.instructions = currentItem.instructions
          ? `${currentItem.instructions}\n${text}`
          : text;
      }
    }
  }

  // Salva o último item se o documento terminou sem marcador de encerramento
  if (currentItem && currentItem.name) {
    const original = originalItems[itemIndex];
    parsedItems.push({
      id: original?.id || `item-parsed-${Date.now()}-${itemIndex}`,
      name: currentItem.name,
      presentation: currentItem.presentation || original?.presentation || '',
      route: currentItem.route || original?.route || 'Uso Oral',
      quantity: currentItem.quantity || original?.quantity || 'Conforme posologia',
      instructions: currentItem.instructions || original?.instructions || 'Conforme orientação médica.',
      doseCalculatedText: original?.doseCalculatedText,
      frequencyText: original?.frequencyText,
      scheduleInterval: original?.scheduleInterval || 'Conforme posologia',
      scheduleTimes: original?.scheduleTimes || [],
      isContinuous: original?.isContinuous || false,
      isSpecialControl: original?.isSpecialControl || false
    });
  }

  return parsedItems.length > 0 ? parsedItems : originalItems;
}
