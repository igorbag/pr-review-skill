import fs from 'node:fs';
import path from 'node:path';
import { resolveCanonicalDir } from '../lib/paths.js';
import { copySkill } from '../lib/skillfs.js';
import { PROFILE_FILENAME } from '../lib/paths.js';

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

  // Preserve PROJECT_PROFILE.md byte-for-byte: read before copy, restore after
  const profilePath = path.join(canonicalDir, PROFILE_FILENAME);
  let profileContent = null;
  let profileExists = false;
  if (fs.existsSync(profilePath)) {
    profileExists = true;
    profileContent = fs.readFileSync(profilePath);
  }

  const result = copySkill(canonicalDir, { force: true });

  // Restore PROJECT_PROFILE.md if it existed (copySkill never writes it, but be defensive)
  if (profileExists && profileContent !== null) {
    fs.writeFileSync(profilePath, profileContent);
  } else if (!profileExists && fs.existsSync(profilePath)) {
    // copySkill should never write it, but if somehow it did, remove it
    fs.unlinkSync(profilePath);
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
