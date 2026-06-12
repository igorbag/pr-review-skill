/**
 * CONTRATO (W2 implementa) — installer R11–R12:
 * - lista skill canônica, adapters e PROJECT_PROFILE.md com presente/ausente
 * - quando algo essencial falta, imprime o próximo passo
 * - exit 0 = saudável; exit 1 = incompleto
 * @param {{ cwd: string, yes: boolean, force: boolean, dir: string|null }} opts
 * @returns {Promise<number>} exit code
 */
export async function doctor(opts) {
  throw new Error('not implemented');
}
