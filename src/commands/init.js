import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { detectTools } from '../lib/detect.js';
import {
  resolveCanonicalDir,
  canonicalRelPath,
  ADAPTER_RELPATHS,
  CONFIG_FILENAME,
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  LANG_LABELS,
} from '../lib/paths.js';
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
 * Pergunta o idioma do review numa lista numerada. Entrada vazia → DEFAULT_LANG.
 * @returns {Promise<string>} código de idioma suportado
 */
async function promptLang() {
  const lines = ['', 'Em qual idioma os reviews devem ser emitidos?'];
  SUPPORTED_LANGS.forEach((code, i) => {
    const mark = code === DEFAULT_LANG ? ' (default)' : '';
    lines.push(`  ${i + 1}) ${LANG_LABELS[code] ?? code}${mark}`);
  });
  console.log(lines.join('\n'));
  const answer = (await ask(`Escolha [1-${SUPPORTED_LANGS.length}, Enter=${DEFAULT_LANG}] `)).trim();
  if (answer === '') return DEFAULT_LANG;
  const idx = Number.parseInt(answer, 10) - 1;
  if (Number.isInteger(idx) && idx >= 0 && idx < SUPPORTED_LANGS.length) {
    return SUPPORTED_LANGS[idx];
  }
  if (SUPPORTED_LANGS.includes(answer)) return answer;
  console.log(`  Entrada inválida — usando ${DEFAULT_LANG}.`);
  return DEFAULT_LANG;
}

/**
 * Lê o idioma do config existente; DEFAULT_LANG se ausente/ilegível.
 * @param {string} configPath
 * @returns {string}
 */
function readConfigLang(configPath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (parsed && SUPPORTED_LANGS.includes(parsed.lang)) return parsed.lang;
  } catch {
    /* config ausente ou inválido → default */
  }
  return DEFAULT_LANG;
}

/**
 * Grava o config de idioma como JSON válido + newline final.
 * @param {string} configPath
 * @param {string} lang
 */
function writeConfig(configPath, lang) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ lang }, null, 2) + '\n', 'utf8');
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
  const { cwd, yes, force, dir, lang: langFlag = null } = opts;

  try {
    const tools = detectTools(cwd);
    const canonicalDir = resolveCanonicalDir(cwd, dir);
    const canonicalRel = canonicalRelPath(cwd, dir);

    const configPath = path.join(canonicalDir, CONFIG_FILENAME);
    const configRel = path.join(canonicalRel, CONFIG_FILENAME);
    // Grava o config quando: ausente, OU --force, OU --lang explícito.
    // Caso contrário preserva a escolha manual já gravada.
    const writeCfg = !fs.existsSync(configPath) || force || langFlag !== null;

    // Alvos: canônico sempre + adapters condicionais
    const targets = ['skill canônica → ' + canonicalRel];
    if (tools.cursor) targets.push('adapter Cursor → ' + ADAPTER_RELPATHS.cursor);
    if (tools.github) targets.push('adapter GitHub Copilot → ' + ADAPTER_RELPATHS.github);
    if (writeCfg) targets.push('config de idioma → ' + configRel);

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

    // Resolver idioma do review: flag → prompt interativo → config existente → default
    const shouldPrompt = !yes && process.stdin.isTTY && writeCfg && langFlag === null;
    let lang;
    if (langFlag !== null) {
      lang = langFlag;
    } else if (shouldPrompt) {
      lang = await promptLang();
    } else {
      lang = writeCfg ? DEFAULT_LANG : readConfigLang(configPath);
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

    // 3. Config de idioma (preserva escolha manual quando writeCfg=false)
    if (writeCfg) {
      writeConfig(configPath, lang);
      console.log('  escrito: ' + configRel + ` (idioma: ${lang})`);
    } else {
      console.log('  já existe — pulado: ' + configRel + ` (idioma: ${lang})`);
    }

    // 4. Próximos passos
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
