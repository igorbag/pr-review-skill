import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { detectTools } from '../lib/detect.js';
import { resolveCanonicalDir, canonicalRelPath, ADAPTER_RELPATHS } from '../lib/paths.js';
import { copySkill } from '../lib/skillfs.js';

/**
 * Gera o conteúdo do adapter para Cursor (.mdc).
 * @param {string} canonicalRel caminho relativo ao repo
 * @returns {string}
 */
function cursorAdapter(canonicalRel) {
  return `---
description: PR review skill — aponta para a skill canônica
alwaysApply: false
---

Read and follow the instructions in ${canonicalRel}/SKILL.md.
`;
}

/**
 * Gera o conteúdo do adapter para GitHub Copilot (.instructions.md).
 * @param {string} canonicalRel caminho relativo ao repo
 * @returns {string}
 */
function githubAdapter(canonicalRel) {
  return `---
applyTo: "**"
---

Read and follow the instructions in ${canonicalRel}/SKILL.md.
`;
}

/**
 * Pergunta ao usuário via stdin (TTY) e retorna a resposta.
 * @param {string} question
 * @returns {Promise<string>}
 */
function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Escreve um arquivo de adapter (ponteiro), respeitando idempotência e --force.
 * @param {string} destPath caminho absoluto do adapter
 * @param {string} content conteúdo do ponteiro
 * @param {boolean} force
 * @returns {'written'|'skipped'}
 */
function writeAdapter(destPath, content, force) {
  if (!force && fs.existsSync(destPath)) {
    return 'skipped';
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content, 'utf8');
  return 'written';
}

/**
 * Instala a skill canônica e os adapters no repo — R1–R7.
 * @param {{ cwd: string, yes: boolean, force: boolean, dir: string|null }} opts
 * @returns {Promise<number>} exit code
 */
export async function init(opts) {
  const { cwd, yes, force, dir } = opts;

  try {
    const tools = detectTools(cwd);
    const canonicalDir = resolveCanonicalDir(cwd, dir);
    const canonicalRel = canonicalRelPath(cwd, dir);

    // Alvos: canônico sempre + adapters condicionais
    const targets = ['skill canônica → ' + canonicalRel];
    if (tools.cursor) targets.push('adapter Cursor → ' + ADAPTER_RELPATHS.cursor);
    if (tools.github) targets.push('adapter GitHub Copilot → ' + ADAPTER_RELPATHS.github);

    // Confirmação interativa (skip com --yes ou stdin não-TTY)
    const needsConfirm = !yes && process.stdin.isTTY;
    if (needsConfirm) {
      console.log('Alvos detectados:');
      for (const t of targets) console.log('  • ' + t);
      const answer = await ask('\nInstalar? [S/n] ');
      if (answer.trim().toLowerCase() === 'n') {
        console.log('Instalação cancelada.');
        return 0;
      }
    }

    // 1. Copiar skill canônica
    const { written, skipped } = copySkill(canonicalDir, { force });

    // Garante que o diretório canônico existe mesmo quando skill/ está vazia
    fs.mkdirSync(canonicalDir, { recursive: true });

    for (const f of written) console.log('  escrito: ' + path.join(canonicalRel, f));
    for (const f of skipped) console.log('  já existe — pulado: ' + path.join(canonicalRel, f));

    // 2. Adapters
    if (tools.cursor) {
      const destPath = path.join(cwd, ADAPTER_RELPATHS.cursor);
      const status = writeAdapter(destPath, cursorAdapter(canonicalRel), force);
      if (status === 'written') {
        console.log('  escrito: ' + ADAPTER_RELPATHS.cursor);
      } else {
        console.log('  já existe — pulado: ' + ADAPTER_RELPATHS.cursor);
      }
    }

    if (tools.github) {
      const destPath = path.join(cwd, ADAPTER_RELPATHS.github);
      const status = writeAdapter(destPath, githubAdapter(canonicalRel), force);
      if (status === 'written') {
        console.log('  escrito: ' + ADAPTER_RELPATHS.github);
      } else {
        console.log('  já existe — pulado: ' + ADAPTER_RELPATHS.github);
      }
    }

    // 3. Próximos passos
    console.log(`
Próximos passos:
  1. Commite os novos arquivos:
       git add ${canonicalRel} && git commit -m "chore: instala pr-review-skill"
  2. Peça o primeiro review na sua ferramenta de IA (Claude Code, Cursor ou Copilot):
       "revise este PR"
`);

    return 0;
  } catch (err) {
    console.error('Erro durante init: ' + err.message);
    return 1;
  }
}
