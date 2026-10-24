/**
 * Utilitário determinístico de sanitização HTML e prevenção contra XSS (AUDIT-SEC-01).
 *
 * 1. `escapeHtml`: escapa caracteres especiais (`&`, `<`, `>`, `"`, `'`) em campos de texto
 *    do usuário antes de interpolar em templates HTML (preservando símbolos clínicos como
 *    `eTFG < 60 mL/min` ou `lesão > 2 cm` sem quebrar tags HTML).
 * 2. `DOMPurify.sanitize`: remove tags executáveis (`<script>`, `<iframe>`, `<object>`,
 *    `<embed>`, `<form>`, `<meta>`), handlers inline (`onerror=`, `onload=`, `onclick=`)
 *    e protocolos perigosos (`javascript:`, `vbscript:`, `data:text/html`) mantendo
 *    a formatação clínica segura do Editor A4 e dos documentos SUS.
 */

const ENTIDADES_HTML: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escapa texto livre para inserção segura em templates HTML.
 */
export function escapeHtml(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace(/[&<>"']/g, (char) => ENTIDADES_HTML[char] || char);
}

const TAGS_BLOQUEADAS_COM_CONTEUDO = /<\s*(script|iframe|object|embed|applet|style|math|svg|template|noscript)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const TAGS_PERIGOSAS_ISOLADAS = /<\s*\/?\s*(script|iframe|object|embed|applet|form|input|button|select|textarea|meta|link|base|frame|frameset|svg|math|template|noscript)\b[^>]*\/?>/gi;
const ATRIBUTOS_EVENTO_INLINE = /(?:\s+|\/|(?<=['"]))on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const ATRIBUTOS_URL = /\s+(href|src|xlink:href|action|formaction)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const EXPRESSOES_CSS_PERIGOSAS = /expression\s*\(|javascript\s*:|vbscript\s*:|-moz-binding/gi;

function decodeHtmlEntitiesForProtocolCheck(raw: string): string {
  return raw
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&colon;/gi, ':')
    .replace(/&tab;|&newline;/gi, '')
    .replace(/[\u0000-\u0020]+/g, '');
}

function stripDangerousUrlAttributes(html: string): string {
  return html.replace(ATRIBUTOS_URL, (fullMatch, _attrName: string, rawVal: string) => {
    const unquoted = rawVal.replace(/^['"]|['"]$/g, '');
    const normalized = decodeHtmlEntitiesForProtocolCheck(unquoted).toLowerCase();
    if (
      normalized.startsWith('javascript:') ||
      normalized.startsWith('vbscript:') ||
      normalized.startsWith('data:text/html') ||
      normalized.startsWith('data:application/xhtml')
    ) {
      return '';
    }
    return fullMatch;
  });
}

/**
 * Sanitiza um fragmento HTML em ponto fixo (multi-pass) removendo vetores de injeção XSS
 * (incluindo tags aninhadas reconstruídas, delimitadores `/` sem espaço e protocolos
 * codificados em entidades HTML) e preservando a marcação estrutural de documentos médicos.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return '';
  let clean = String(dirtyHtml);
  let previous = '';
  let iterations = 0;

  while (clean !== previous && iterations < 6) {
    previous = clean;
    iterations += 1;

    // Remove blocos inteiros de script/iframe/object/svg/math
    clean = clean.replace(TAGS_BLOQUEADAS_COM_CONTEUDO, '');
    // Remove tags perigosas remanescentes, aninhadas ou auto-fechadas
    clean = clean.replace(TAGS_PERIGOSAS_ISOLADAS, '');
    // Remove atributos de evento inline (onerror, onload, onclick, inclusive precedidos por /)
    clean = clean.replace(ATRIBUTOS_EVENTO_INLINE, '');
    // Remove URLs com javascript:, vbscript: ou data:text/html (mesmo com entidades numéricas/hex)
    clean = stripDangerousUrlAttributes(clean);
    // Remove expressões maliciosas dentro de atributos style
    clean = clean.replace(EXPRESSOES_CSS_PERIGOSAS, '');
  }

  return clean;
}

export const DOMPurify = {
  sanitize: sanitizeHtml
};
