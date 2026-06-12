import path from 'node:path';

export const DEFAULT_CANONICAL_DIR = path.join('.claude', 'skills', 'pr-review');

export const ADAPTER_RELPATHS = {
  cursor: path.join('.cursor', 'rules', 'pr-review.mdc'),
  github: path.join('.github', 'instructions', 'pr-review.instructions.md'),
};

export const PROFILE_FILENAME = 'PROJECT_PROFILE.md';

/**
 * Resolve o diretório canônico da skill (absoluto).
 * dirFlag, quando presente, é relativo ao cwd (ou absoluto).
 */
export function resolveCanonicalDir(cwd, dirFlag = null) {
  const rel = dirFlag ?? DEFAULT_CANONICAL_DIR;
  return path.isAbsolute(rel) ? rel : path.resolve(cwd, rel);
}

/** Caminho do canônico relativo ao repo, para interpolar nos adapters. */
export function canonicalRelPath(cwd, dirFlag = null) {
  return path.relative(cwd, resolveCanonicalDir(cwd, dirFlag));
}
