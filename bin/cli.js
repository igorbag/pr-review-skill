#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { init } from '../src/commands/init.js';
import { update } from '../src/commands/update.js';
import { doctor } from '../src/commands/doctor.js';

const USAGE = `pr-review-skill — reviews de PR confiáveis com IA

Uso:
  pr-review-skill init   [--yes] [--force] [--dir <path>]
  pr-review-skill update [--dir <path>]
  pr-review-skill doctor [--dir <path>]

Comandos:

  init   [--yes] [--force] [--dir <path>]
    Copia a skill canônica para <dir> e gera adapters-ponteiro para cada
    ferramenta detectada (.cursor/, .github/). Idempotente por padrão:
    arquivos existentes são pulados. Use --force para sobrescrever.
    Pede confirmação interativa a menos que --yes ou stdin não seja TTY.
    Saída: exit 0 em sucesso; exit 1 em erro.

  update [--dir <path>]
    Atualiza os arquivos da skill em <dir> (sobrescreve tudo exceto
    PROJECT_PROFILE.md). Nunca toca adapters (.cursor/, .github/).
    Requer que a skill já esteja instalada; sugere init caso contrário.
    Saída: exit 0 em sucesso; exit 1 se skill não instalada ou erro.

  doctor [--dir <path>]
    Diagnóstico somente-leitura: lista skill canônica, adapters e
    PROJECT_PROFILE.md com status presente/ausente. Quando algo
    essencial falta, imprime o próximo passo exato.
    Saída: exit 0 = instalação completa; exit 1 = algo faltando.

Flags globais:
  --dir <path>   Diretório canônico da skill (default: .claude/skills/pr-review)
                 Relativo ao cwd ou absoluto.
  --help, -h     Mostra esta ajuda e sai (exit 0).
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

const isDirectRun =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  });
}
