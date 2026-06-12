import fs from 'node:fs';
import path from 'node:path';

/**
 * Detecta as ferramentas presentes no repo.
 * @returns {{ claude: boolean, cursor: boolean, github: boolean }}
 */
export function detectTools(cwd) {
  return {
    claude: fs.existsSync(path.join(cwd, '.claude')),
    cursor: fs.existsSync(path.join(cwd, '.cursor')),
    github: fs.existsSync(path.join(cwd, '.github')),
  };
}
