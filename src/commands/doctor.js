import fs from 'node:fs';
import path from 'node:path';
import { resolveCanonicalDir, ADAPTER_RELPATHS, PROFILE_FILENAME } from '../lib/paths.js';
import { detectTools } from '../lib/detect.js';

/**
 * CONTRATO (W2 implementa) — installer R11–R12:
 * - lista skill canônica, adapters e PROJECT_PROFILE.md com presente/ausente
 * - quando algo essencial falta, imprime o próximo passo
 * - exit 0 = saudável; exit 1 = incompleto
 * @param {{ cwd: string, yes: boolean, force: boolean, dir: string|null }} opts
 * @returns {Promise<number>} exit code
 */
export async function doctor(opts) {
  const { cwd, dir } = opts;
  const canonicalDir = resolveCanonicalDir(cwd, dir);
  const tools = detectTools(cwd);

  const skillMd = path.join(canonicalDir, 'SKILL.md');
  const skillPresent = fs.existsSync(skillMd);

  const cursorAdapter = path.join(cwd, ADAPTER_RELPATHS.cursor);
  const githubAdapter = path.join(cwd, ADAPTER_RELPATHS.github);
  const cursorPresent = fs.existsSync(cursorAdapter);
  const githubPresent = fs.existsSync(githubAdapter);

  const profilePath = path.join(canonicalDir, PROFILE_FILENAME);
  const profilePresent = fs.existsSync(profilePath);

  const pad = (label, width = 44) => label.padEnd(width, ' ');
  const status = (present) => (present ? 'presente' : 'ausente ');

  console.log('\nDiagnóstico da instalação:\n');
  console.log(`  ${pad('Skill canônica (SKILL.md)')}${status(skillPresent)}`);

  if (tools.cursor) {
    console.log(`  ${pad('Adapter Cursor (.cursor/rules/...)')}${status(cursorPresent)}`);
  }
  if (tools.github) {
    console.log(`  ${pad('Adapter Copilot (.github/instructions/...)')}${status(githubPresent)}`);
  }

  console.log(`  ${pad('PROJECT_PROFILE.md')}${status(profilePresent)}`);
  console.log('');

  const issues = [];

  // Essential: skill must be installed
  if (!skillPresent) {
    issues.push({
      label: 'skill canônica ausente',
      next: 'Execute "pr-review-skill init" para instalar a skill.',
    });
  }

  // Adapters: only checked when the tool folder exists
  if (tools.cursor && !cursorPresent) {
    issues.push({
      label: 'adapter Cursor ausente',
      next: 'Execute "pr-review-skill init" (ou "pr-review-skill init --force") para gerar os adapters.',
    });
  }
  if (tools.github && !githubPresent) {
    issues.push({
      label: 'adapter Copilot ausente',
      next: 'Execute "pr-review-skill init" (ou "pr-review-skill init --force") para gerar os adapters.',
    });
  }

  // Non-essential but reported: profile
  if (!profilePresent) {
    issues.push({
      label: 'PROJECT_PROFILE.md ausente',
      next: 'Rode o primeiro review para gerar o profile automaticamente.',
    });
  }

  if (issues.length > 0) {
    console.log('Problemas encontrados:\n');
    for (const issue of issues) {
      console.log(`  - ${issue.label}`);
      console.log(`    Próximo passo: ${issue.next}`);
    }
    console.log('');
    return 1;
  }

  console.log('  Tudo certo! A instalação está completa.\n');
  return 0;
}
