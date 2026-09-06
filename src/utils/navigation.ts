import type { ActiveTab } from '../types';

/**
 * Destinos reais da aplicação — os valores de ActiveTab que correspondem a uma
 * tela. `patients` fica de fora de propósito: ele abre um modal, não navega.
 */
export type RouteTab = Exclude<ActiveTab, 'patients' | 'models'>;

/** Rota inicial quando a URL não diz nada ou diz algo desconhecido. */
export const DEFAULT_TAB: RouteTab = 'prescription';

/**
 * Fragmentos em português: a URL é parte da interface e aparece no histórico
 * do navegador, nos favoritos e em links compartilhados.
 */
const TAB_TO_SLUG: Record<RouteTab, string> = {
  prescription: 'prescricao',
  pediatric_calc: 'calculadora',
  exams: 'exames',
  certificate: 'atestado',
  referral: 'encaminhamento',
  protocols: 'protocolos',
  print_preview: 'exportar'
};

const SLUG_TO_TAB = Object.entries(TAB_TO_SLUG).reduce<Record<string, RouteTab>>(
  (acc, [tab, slug]) => {
    acc[slug] = tab as RouteTab;
    return acc;
  },
  {}
);

/** Rótulo anunciado a leitores de tela quando a tela troca. */
export const TAB_TITLES: Record<RouteTab, string> = {
  prescription: 'Prescrição de medicamentos',
  pediatric_calc: 'Calculadoras clínicas',
  exams: 'Solicitação de exames',
  certificate: 'Atestado médico',
  referral: 'Encaminhamento',
  protocols: 'Protocolos clínicos',
  print_preview: 'Exportar e baixar PDF'
};

export function tabToHash(tab: RouteTab): string {
  return `#/${TAB_TO_SLUG[tab]}`;
}

/**
 * Lê a aba a partir de um hash de URL. Aceita `#/exames`, `#exames` e
 * `#/exames?algo`, e cai no destino padrão diante de qualquer coisa
 * desconhecida — uma URL inválida nunca deve deixar a aplicação em branco.
 */
export function hashToTab(hash: string): RouteTab {
  const slug = hash.replace(/^#\/?/, '').split(/[?&#]/)[0].trim().toLowerCase();
  return SLUG_TO_TAB[slug] ?? DEFAULT_TAB;
}

/** True quando o hash já aponta para esta aba, evitando entradas duplicadas. */
export function hashMatchesTab(hash: string, tab: RouteTab): boolean {
  return hashToTab(hash) === tab && hash !== '';
}
