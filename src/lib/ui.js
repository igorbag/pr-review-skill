/**
 * Helpers de apresentação para a CLI: cores ANSI com degradação graciosa.
 *
 * Cores são aplicadas apenas quando a saída é um TTY e `NO_COLOR` está ausente
 * (convenção https://no-color.org). Em CI, pipes ou redirecionamentos, todas as
 * funções viram identidade (texto puro), preservando a mesma informação textual.
 */

const CODES = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
};

/**
 * Decide se cores devem ser emitidas para um dado stream.
 * @param {NodeJS.WriteStream} [stream] default: process.stdout
 * @returns {boolean}
 */
export function colorEnabled(stream = process.stdout) {
  if (process.env.NO_COLOR !== undefined) return false;
  return Boolean(stream && stream.isTTY);
}

/**
 * Constrói um conjunto de funções de cor já ligadas (ou não) ao estado do stream.
 * Cada função é `(text) => string`. Quando cor está desligada, retorna o texto cru.
 * @param {NodeJS.WriteStream} [stream]
 */
export function makeStyler(stream = process.stdout) {
  const on = colorEnabled(stream);
  const wrap = (code) => (text) => (on ? `${code}${text}${CODES.reset}` : String(text));
  return {
    enabled: on,
    bold: wrap(CODES.bold),
    dim: wrap(CODES.dim),
    green: wrap(CODES.green),
    gray: wrap(CODES.gray),
    cyan: wrap(CODES.cyan),
  };
}

/**
 * Formata uma duração em ms para exibição humana curta (ex.: "0.3s", "12ms").
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
