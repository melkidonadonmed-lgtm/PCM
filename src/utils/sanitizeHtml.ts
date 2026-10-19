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
const TAGS_PERIGOSAS_ISOLADAS = /<\s*\/?\s*(script|iframe|object|embed|applet|form|input|button|select|textarea|meta|link|base|frame|frameset)\b[^>]*\/?>/gi;
const ATRIBUTOS_EVENTO_INLINE = /\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const PROTOCOLOS_PERIGOSOS_ATTR = /\s+(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"]*"|'\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^']*'|(?:\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>]+))/gi;
const EXPRESSOES_CSS_PERIGOSAS = /expression\s*\(|javascript\s*:|vbscript\s*:|-moz-binding/gi;

/**
 * Sanitiza um fragmento HTML removendo vetores de injeção XSS e preservando
 * a marcação estrutural e tipográfica de documentos médicos.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return '';
  let clean = String(dirtyHtml);

  // Remove blocos inteiros de script/iframe/object/svg/math
  clean = clean.replace(TAGS_BLOQUEADAS_COM_CONTEUDO, '');
  // Remove tags perigosas remanescentes ou auto-fechadas
  clean = clean.replace(TAGS_PERIGOSAS_ISOLADAS, '');
  // Remove atributos de evento inline (onerror, onload, onclick, etc.)
  clean = clean.replace(ATRIBUTOS_EVENTO_INLINE, '');
  // Remove URLs com javascript:, vbscript: ou data:text/html
  clean = clean.replace(PROTOCOLOS_PERIGOSOS_ATTR, '');
  // Remove expressões maliciosas dentro de atributos style
  clean = clean.replace(EXPRESSOES_CSS_PERIGOSAS, '');

  return clean;
}

export const DOMPurify = {
  sanitize: sanitizeHtml
};
