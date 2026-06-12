/**
 * CONTRATO (W1 implementa) — installer R1–R7:
 * - detecta ferramentas (detectTools) e sugere alvos; --yes pula perguntas
 * - copia skill → dir canônico (resolveCanonicalDir); idempotente sem --force
 * - gera adapters (.cursor/rules/pr-review.mdc, .github/instructions/...)
 *   como PONTEIROS com o caminho canônico interpolado — nunca cópia de conteúdo
 * - ao final imprime próximos passos (commit + primeiro review)
 * @param {{ cwd: string, yes: boolean, force: boolean, dir: string|null }} opts
 * @returns {Promise<number>} exit code
 */
export async function init(opts) {
  throw new Error('not implemented');
}
