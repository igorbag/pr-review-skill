#!/usr/bin/env node
import { init } from '../src/commands/init.js';
import { update } from '../src/commands/update.js';
import { doctor } from '../src/commands/doctor.js';

const USAGE = `pr-review-skill — reviews de PR confiáveis com IA

Uso: pr-review-skill <comando> [flags]

Comandos:
  init     Instala a skill canônica e os adapters no repo atual
  update   Atualiza os arquivos da skill (preserva PROJECT_PROFILE.md e adapters)
  doctor   Diagnostica a instalação (o que existe, o que falta)

Flags:
  --yes          Não pergunta nada (CI/onboarding)
  --force        Permite sobrescrever arquivos existentes (init)
  --dir <path>   Diretório canônico da skill (default: .claude/skills/pr-review)
  --help         Mostra esta ajuda
`;

export function parseArgs(argv) {
  const args = { command: null, yes: false, force: false, dir: null, help: false };
  const rest = [...argv];
  while (rest.length > 0) {
    const arg = rest.shift();
    if (arg === '--yes') args.yes = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--dir') {
      args.dir = rest.shift() ?? null;
      if (args.dir === null) throw new Error('--dir requer um caminho');
    } else if (!arg.startsWith('-') && args.command === null) {
      args.command = arg;
    } else {
      throw new Error(`argumento desconhecido: ${arg}`);
    }
  }
  return args;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`Erro: ${err.message}\n`);
    console.error(USAGE);
    process.exit(2);
  }

  if (args.help || args.command === null) {
    console.log(USAGE);
    process.exit(args.help ? 0 : 2);
  }

  const cwd = process.cwd();
  const commands = { init, update, doctor };
  const run = commands[args.command];
  if (!run) {
    console.error(`Erro: comando desconhecido "${args.command}"\n`);
    console.error(USAGE);
    process.exit(2);
  }

  const exitCode = await run({ cwd, yes: args.yes, force: args.force, dir: args.dir });
  process.exit(exitCode ?? 0);
}

const isDirectRun = import.meta.url === `file://${process.argv[1]}`;
if (isDirectRun) {
  main().catch((err) => {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  });
}
