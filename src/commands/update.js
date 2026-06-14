import fs from 'node:fs';
import path from 'node:path';
import { resolveCanonicalDir } from '../lib/paths.js';
import { copySkill } from '../lib/skillfs.js';
import { PROFILE_FILENAME, CONFIG_FILENAME } from '../lib/paths.js';

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
  const { cwd, dir } = opts;
  const canonicalDir = resolveCanonicalDir(cwd, dir);
  const skillMd = path.join(canonicalDir, 'SKILL.md');

  if (!fs.existsSync(skillMd)) {
    console.error(`Erro: skill não instalada em "${canonicalDir}".`);
    console.error('  Execute "pr-review-skill init" para instalar primeiro.');
    return 1;
  }

  // Preserve arquivos gerados em runtime byte-a-byte: read before copy, restore after.
  // PROJECT_PROFILE.md (profiling) e pr-review.config.json (idioma) seguem a mesma regra.
  const preserved = [PROFILE_FILENAME, CONFIG_FILENAME].map((name) => {
    const filePath = path.join(canonicalDir, name);
    const exists = fs.existsSync(filePath);
    return { filePath, exists, content: exists ? fs.readFileSync(filePath) : null };
  });

  const result = copySkill(canonicalDir, { force: true });

  // Restore se existiam (copySkill nunca os escreve, mas a restauração é defensiva)
  for (const { filePath, exists, content } of preserved) {
    if (exists && content !== null) {
      fs.writeFileSync(filePath, content);
    } else if (!exists && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  const writtenCount = result.written.length;
  const skippedCount = result.skipped.length;

  console.log('\nSkill atualizada com sucesso!');
  console.log(`  Arquivos sobrescritos : ${writtenCount}`);
  if (skippedCount > 0) {
    console.log(`  Arquivos pulados      : ${skippedCount}`);
  }
  console.log('\n  Revise o git diff antes de commitar.\n');

  return 0;
}
