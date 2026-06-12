/**
 * CONTRATO (W2 implementa) — installer R8–R10:
 * - sobrescreve arquivos da skill no dir canônico (copySkill com force)
 * - NUNCA toca PROJECT_PROFILE.md nem adapters
 * - orienta revisar `git diff` antes de commitar
 * - erro claro (exit 1) se a skill não está instalada (sugere init)
 * @param {{ cwd: string, yes: boolean, force: boolean, dir: string|null }} opts
 * @returns {Promise<number>} exit code
 */
export async function update(opts) {
  throw new Error('not implemented');
}
