/**
 * Constantes canônicas de URLs de referência regulatória e namespaces XML/SVG.
 * Centralizadas em arquivo de configuração para conformidade anti-hardcode.
 */
export const SUS_OFFICIAL_FORM_URLS = {
  apacLaudoPrincipal:
    'http://www1.saude.rs.gov.br/dados/1199297634903Laudo%20de%20APAC%20-%20P%E1gina%20Principal%20%5Bfolha%201%5D.pdf',
  lmeMedicamentos:
    'https://www.gov.br/saude/pt-br/composicao/sectics/daf/publicacoes/lme.pdf'
} as const;

export const SVG_XML_NAMESPACES = {
  svg: 'http://www.w3.org/2000/svg',
  xlink: 'http://www.w3.org/1999/xlink'
} as const;
