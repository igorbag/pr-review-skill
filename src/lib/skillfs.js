import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

/** Raiz do conteúdo da skill embarcado no pacote (skill/). */
export const SKILL_SRC_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'skill'
);

const PROFILE_FILENAME = 'PROJECT_PROFILE.md';
const CONFIG_FILENAME = 'pr-review.config.json';

/**
 * Lista os arquivos da skill embarcada (caminhos relativos a skill/).
 * @returns {string[]} relpaths ordenados
 */
export function listSkillFiles() {
  /** @param {string} dir @param {string} base @returns {string[]} */
  function walk(dir, base) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    /** @type {string[]} */
    const results = [];
    for (const entry of entries) {
      const relpath = base ? path.join(base, entry.name) : entry.name;
      if (entry.isDirectory()) {
        results.push(...walk(path.join(dir, entry.name), relpath));
      } else {
        results.push(relpath);
      }
    }
    return results;
  }

  return walk(SKILL_SRC_DIR, '').sort();
}

/**
 * Copia a skill embarcada para destDir.
 * - sem force: arquivo existente no destino é pulado (idempotência, installer R3)
 * - com force: sobrescreve
 * - NUNCA escreve PROJECT_PROFILE.md (gerado em runtime pelo profiling, não embarcado)
 * - NUNCA escreve pr-review.config.json (config de idioma gravado pelo init, não embarcado)
 * @param {string} destDir destino absoluto (dir canônico)
 * @param {{ force?: boolean }} [opts]
 * @returns {{ written: string[], skipped: string[] }} relpaths
 */
export function copySkill(destDir, opts = {}) {
  const { force = false } = opts;
  const files = listSkillFiles();
  /** @type {string[]} */
  const written = [];
  /** @type {string[]} */
  const skipped = [];

  for (const relpath of files) {
    if (path.basename(relpath) === PROFILE_FILENAME) continue;
    if (path.basename(relpath) === CONFIG_FILENAME) continue;

    const src = path.join(SKILL_SRC_DIR, relpath);
    const dest = path.join(destDir, relpath);

    if (!force && fs.existsSync(dest)) {
      skipped.push(relpath);
      continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    written.push(relpath);
  }

  return { written, skipped };
}
