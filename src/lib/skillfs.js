import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Raiz do conteúdo da skill embarcado no pacote (skill/). */
export const SKILL_SRC_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'skill'
);

/**
 * Lista os arquivos da skill embarcada (caminhos relativos a skill/).
 * CONTRATO (W1 implementa):
 * @returns {string[]} relpaths ordenados
 */
export function listSkillFiles() {
  throw new Error('not implemented');
}

/**
 * Copia a skill embarcada para destDir.
 * CONTRATO (W1 implementa):
 * - sem force: arquivo existente no destino é pulado (idempotência, installer R3)
 * - com force: sobrescreve
 * - NUNCA escreve PROJECT_PROFILE.md (gerado em runtime pelo profiling, não embarcado)
 * @param {string} destDir destino absoluto (dir canônico)
 * @param {{ force?: boolean }} [opts]
 * @returns {{ written: string[], skipped: string[] }} relpaths
 */
export function copySkill(destDir, opts = {}) {
  throw new Error('not implemented');
}
