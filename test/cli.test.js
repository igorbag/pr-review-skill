/**
 * CLI integration + unit tests.
 * Covers R1–R12 acceptance criteria 1–4.
 *
 * Skips that depend on init/skillfs being implemented are marked with
 * skip reason "contract-pending: init/skillfs not implemented yet"
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

// ─── helpers ────────────────────────────────────────────────────────────────

const ROOT = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname), '..');
const CLI = path.join(ROOT, 'bin', 'cli.js');
const NODE = process.execPath;

function mktemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pr-review-test-'));
}

function rmtemp(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Run CLI via child_process; returns { code, stdout, stderr }.
 * Never throws — captures exit code.
 */
function runCLI(args, cwd) {
  try {
    const stdout = execFileSync(NODE, [CLI, ...args], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' },
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
    };
  }
}

// ─── parseArgs ───────────────────────────────────────────────────────────────

describe('parseArgs', () => {
  // Import inline to avoid circular dep issues
  let parseArgs;
  before(async () => {
    ({ parseArgs } = await import('../bin/cli.js'));
  });

  it('parses command only', () => {
    const r = parseArgs(['init']);
    assert.equal(r.command, 'init');
    assert.equal(r.yes, false);
    assert.equal(r.force, false);
    assert.equal(r.dir, null);
    assert.equal(r.help, false);
  });

  it('parses --yes flag', () => {
    const r = parseArgs(['init', '--yes']);
    assert.equal(r.yes, true);
  });

  it('parses --force flag', () => {
    const r = parseArgs(['init', '--force']);
    assert.equal(r.force, true);
  });

  it('parses --dir value', () => {
    const r = parseArgs(['init', '--dir', 'custom/skill']);
    assert.equal(r.dir, 'custom/skill');
  });

  it('parses --help / -h', () => {
    assert.equal(parseArgs(['--help']).help, true);
    assert.equal(parseArgs(['-h']).help, true);
  });

  it('throws on --dir with no value', () => {
    assert.throws(() => parseArgs(['--dir']), /--dir requer/);
  });

  it('throws on unknown flag', () => {
    assert.throws(() => parseArgs(['--unknown']), /argumento desconhecido/);
  });

  it('throws on extra positional after command', () => {
    assert.throws(() => parseArgs(['init', 'extra']), /argumento desconhecido/);
  });
});

// ─── detectTools ─────────────────────────────────────────────────────────────

describe('detectTools', () => {
  let detectTools;
  before(async () => {
    ({ detectTools } = await import('../src/lib/detect.js'));
  });

  it('detects nothing in empty dir', () => {
    const dir = mktemp();
    try {
      const r = detectTools(dir);
      assert.equal(r.claude, false);
      assert.equal(r.cursor, false);
      assert.equal(r.github, false);
    } finally {
      rmtemp(dir);
    }
  });

  it('detects .claude only', () => {
    const dir = mktemp();
    try {
      fs.mkdirSync(path.join(dir, '.claude'));
      const r = detectTools(dir);
      assert.equal(r.claude, true);
      assert.equal(r.cursor, false);
      assert.equal(r.github, false);
    } finally {
      rmtemp(dir);
    }
  });

  it('detects .cursor and .github', () => {
    const dir = mktemp();
    try {
      fs.mkdirSync(path.join(dir, '.cursor'));
      fs.mkdirSync(path.join(dir, '.github'));
      const r = detectTools(dir);
      assert.equal(r.cursor, true);
      assert.equal(r.github, true);
      assert.equal(r.claude, false);
    } finally {
      rmtemp(dir);
    }
  });

  it('detects all three', () => {
    const dir = mktemp();
    try {
      fs.mkdirSync(path.join(dir, '.claude'));
      fs.mkdirSync(path.join(dir, '.cursor'));
      fs.mkdirSync(path.join(dir, '.github'));
      const r = detectTools(dir);
      assert.equal(r.claude, true);
      assert.equal(r.cursor, true);
      assert.equal(r.github, true);
    } finally {
      rmtemp(dir);
    }
  });
});

// ─── paths ───────────────────────────────────────────────────────────────────

describe('paths', () => {
  let resolveCanonicalDir, canonicalRelPath, DEFAULT_CANONICAL_DIR, ADAPTER_RELPATHS;
  before(async () => {
    ({ resolveCanonicalDir, canonicalRelPath, DEFAULT_CANONICAL_DIR, ADAPTER_RELPATHS } =
      await import('../src/lib/paths.js'));
  });

  it('DEFAULT_CANONICAL_DIR is .claude/skills/pr-review', () => {
    assert.equal(DEFAULT_CANONICAL_DIR, path.join('.claude', 'skills', 'pr-review'));
  });

  it('resolveCanonicalDir with no dirFlag returns absolute default', () => {
    const cwd = '/tmp/repo';
    const resolved = resolveCanonicalDir(cwd, null);
    assert.equal(resolved, path.join('/tmp/repo', '.claude', 'skills', 'pr-review'));
  });

  it('resolveCanonicalDir with relative dirFlag resolves against cwd', () => {
    const cwd = '/tmp/repo';
    const resolved = resolveCanonicalDir(cwd, 'custom/skill');
    assert.equal(resolved, '/tmp/repo/custom/skill');
  });

  it('resolveCanonicalDir with absolute dirFlag returns it unchanged', () => {
    const cwd = '/tmp/repo';
    const resolved = resolveCanonicalDir(cwd, '/abs/path');
    assert.equal(resolved, '/abs/path');
  });

  it('canonicalRelPath returns relative path from cwd', () => {
    const cwd = '/tmp/repo';
    const rel = canonicalRelPath(cwd, null);
    assert.equal(rel, path.join('.claude', 'skills', 'pr-review'));
  });

  it('ADAPTER_RELPATHS has cursor and github keys', () => {
    assert.ok(ADAPTER_RELPATHS.cursor);
    assert.ok(ADAPTER_RELPATHS.github);
    assert.match(ADAPTER_RELPATHS.cursor, /\.cursor/);
    assert.match(ADAPTER_RELPATHS.github, /\.github/);
  });
});

// ─── init command ────────────────────────────────────────────────────────────
// These tests require W1 (init.js + skillfs.js) to be implemented.
// They are expected to fail until integration.

describe('init command', () => {
  let fixture;
  beforeEach(() => {
    fixture = mktemp();
  });
  afterEach(() => rmtemp(fixture));

  it('R1/R2: creates canonical dir and adapters when .cursor and .github exist (--yes)', () => {
    fs.mkdirSync(path.join(fixture, '.cursor'));
    fs.mkdirSync(path.join(fixture, '.github'));

    const r = runCLI(['init', '--yes'], fixture);
    assert.equal(r.code, 0, `stderr: ${r.stderr}`);

    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    assert.ok(fs.existsSync(path.join(canonicalDir, 'SKILL.md')), 'SKILL.md should exist');

    const cursorAdapter = path.join(fixture, '.cursor', 'rules', 'pr-review.mdc');
    const githubAdapter = path.join(fixture, '.github', 'instructions', 'pr-review.instructions.md');
    assert.ok(fs.existsSync(cursorAdapter), 'cursor adapter should exist');
    assert.ok(fs.existsSync(githubAdapter), 'github adapter should exist');
  });

  it('R6: adapters are pointers (contain canonical path, not skill content)', () => {
    fs.mkdirSync(path.join(fixture, '.cursor'));
    fs.mkdirSync(path.join(fixture, '.github'));

    runCLI(['init', '--yes'], fixture);

    const cursorAdapter = path.join(fixture, '.cursor', 'rules', 'pr-review.mdc');
    const content = fs.readFileSync(cursorAdapter, 'utf8');

    // Adapter must contain the canonical path reference
    assert.match(content, /\.claude\/skills\/pr-review|\.claude\\skills\\pr-review/);
    // Adapter must NOT contain full skill content (should be short)
    assert.ok(content.length < 2000, 'adapter should be a pointer, not full skill copy');
  });

  it('R3: second run is idempotent (no files changed without --force)', () => {
    fs.mkdirSync(path.join(fixture, '.cursor'));

    runCLI(['init', '--yes'], fixture);

    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    const skillMd = path.join(canonicalDir, 'SKILL.md');
    const statBefore = fs.statSync(skillMd);

    // Wait 10ms to ensure mtime would differ if rewritten
    const startMs = Date.now();
    while (Date.now() - startMs < 10) { /* spin */ }

    const r2 = runCLI(['init', '--yes'], fixture);
    assert.equal(r2.code, 0);

    const statAfter = fs.statSync(skillMd);
    assert.equal(statBefore.mtimeMs, statAfter.mtimeMs, 'SKILL.md should not be rewritten on second init');
  });

  it('R3: --force overwrites existing files', () => {
    fs.mkdirSync(path.join(fixture, '.cursor'));
    runCLI(['init', '--yes'], fixture);

    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    const skillMd = path.join(canonicalDir, 'SKILL.md');
    // Corrupt it
    fs.writeFileSync(skillMd, 'corrupted');

    const r = runCLI(['init', '--yes', '--force'], fixture);
    assert.equal(r.code, 0);

    const content = fs.readFileSync(skillMd, 'utf8');
    assert.notEqual(content, 'corrupted', 'SKILL.md should be overwritten with --force');
  });
});

// ─── update command ───────────────────────────────────────────────────────────

describe('update command', () => {
  let fixture;
  beforeEach(() => {
    fixture = mktemp();
  });
  afterEach(() => rmtemp(fixture));

  it('R8: errors with exit 1 if skill not installed (no SKILL.md)', () => {
    const r = runCLI(['update'], fixture);
    assert.equal(r.code, 1);
    assert.match(r.stderr, /não instalada|init/i);
  });

  it('R8/R9/R10: updates skill files, preserves PROJECT_PROFILE.md, leaves adapters untouched', () => {
    // Set up a simulated installed state manually (since init is also pending)
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });

    // Create a fake SKILL.md (simulating a prior install)
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# old skill content');

    // Create PROJECT_PROFILE.md — must be preserved byte-for-byte
    const profileContent = '# My Project Profile\n\nImportant custom content.';
    fs.writeFileSync(path.join(canonicalDir, 'PROJECT_PROFILE.md'), profileContent);

    // Create an adapter — must NOT be touched
    fs.mkdirSync(path.join(fixture, '.cursor', 'rules'), { recursive: true });
    const adapterPath = path.join(fixture, '.cursor', 'rules', 'pr-review.mdc');
    const adapterContent = '# adapter pointer content';
    fs.writeFileSync(adapterPath, adapterContent);
    const adapterStatBefore = fs.statSync(adapterPath);

    const r = runCLI(['update'], fixture);
    assert.equal(r.code, 0, `stderr: ${r.stderr}`);

    // R8: PROJECT_PROFILE.md preserved byte-for-byte
    const profileAfter = fs.readFileSync(path.join(canonicalDir, 'PROJECT_PROFILE.md'), 'utf8');
    assert.equal(profileAfter, profileContent, 'PROJECT_PROFILE.md must be byte-identical after update');

    // R9: adapter untouched
    const adapterStatAfter = fs.statSync(adapterPath);
    assert.equal(adapterStatBefore.mtimeMs, adapterStatAfter.mtimeMs, 'adapter must not be touched by update');

    // R10: output mentions git diff
    assert.match(r.stdout, /git diff/i);
  });

  it('R10: successful update output mentions git diff', () => {
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');

    const r = runCLI(['update'], fixture);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /git diff/i);
  });
});

// ─── doctor command ───────────────────────────────────────────────────────────

describe('doctor command', () => {
  let fixture;
  beforeEach(() => {
    fixture = mktemp();
  });
  afterEach(() => rmtemp(fixture));

  it('R11/R12: exit 1 when nothing installed', () => {
    const r = runCLI(['doctor'], fixture);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /ausente/i);
  });

  it('R11: lists SKILL.md as ausente when not installed', () => {
    const r = runCLI(['doctor'], fixture);
    assert.match(r.stdout, /SKILL\.md/);
    assert.match(r.stdout, /ausente/);
  });

  it('R12: reports next step when skill absent', () => {
    const r = runCLI(['doctor'], fixture);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /init/i);
  });

  it('R11/R12: exit 1 and reports profile missing when skill present but no profile', () => {
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');

    const r = runCLI(['doctor'], fixture);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /PROJECT_PROFILE\.md/);
    assert.match(r.stdout, /ausente/);
    assert.match(r.stdout, /primeiro review|profile/i);
  });

  it('R12: next step for missing profile mentions "primeiro review"', () => {
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');

    const r = runCLI(['doctor'], fixture);
    assert.match(r.stdout, /primeiro review/i);
  });

  it('R11: exit 0 when skill and profile present (no tool dirs)', () => {
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');
    fs.writeFileSync(path.join(canonicalDir, 'PROJECT_PROFILE.md'), '# profile');

    const r = runCLI(['doctor'], fixture);
    assert.equal(r.code, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
  });

  it('R11: shows cursor adapter status when .cursor dir exists', () => {
    fs.mkdirSync(path.join(fixture, '.cursor'));
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');

    const r = runCLI(['doctor'], fixture);
    assert.match(r.stdout, /cursor/i);
  });

  it('R11: shows github adapter status when .github dir exists', () => {
    fs.mkdirSync(path.join(fixture, '.github'));
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');

    const r = runCLI(['doctor'], fixture);
    assert.match(r.stdout, /copilot|github/i);
  });

  it('R11: exit 1 if cursor dir exists but adapter missing', () => {
    fs.mkdirSync(path.join(fixture, '.cursor'));
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');
    fs.writeFileSync(path.join(canonicalDir, 'PROJECT_PROFILE.md'), '# profile');

    const r = runCLI(['doctor'], fixture);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /cursor/i);
    assert.match(r.stdout, /ausente/);
  });

  it('R11: exit 0 when skill, profile, and cursor adapter all present', () => {
    fs.mkdirSync(path.join(fixture, '.cursor'));
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');
    fs.writeFileSync(path.join(canonicalDir, 'PROJECT_PROFILE.md'), '# profile');

    const cursorRulesDir = path.join(fixture, '.cursor', 'rules');
    fs.mkdirSync(cursorRulesDir, { recursive: true });
    fs.writeFileSync(path.join(cursorRulesDir, 'pr-review.mdc'), '# pointer');

    const r = runCLI(['doctor'], fixture);
    assert.equal(r.code, 0, `stdout: ${r.stdout}`);
  });
});

// ─── i18n (--lang / pr-review.config.json) ──────────────────────────────────

describe('i18n: idioma do review', () => {
  let fixture;
  const CONFIG_REL = path.join('.claude', 'skills', 'pr-review', 'pr-review.config.json');
  const readConfig = (dir) => JSON.parse(fs.readFileSync(path.join(dir, CONFIG_REL), 'utf8'));

  beforeEach(() => {
    fixture = mktemp();
  });
  afterEach(() => rmtemp(fixture));

  it('R1: --lang inválido sai com exit 2', () => {
    const r = runCLI(['init', '--yes', '--lang', 'xx'], fixture);
    assert.equal(r.code, 2);
    assert.match(r.stderr, /inválido|pt-BR/i);
  });

  it('R1/R4: --lang en grava config com lang en', () => {
    const r = runCLI(['init', '--yes', '--lang', 'en'], fixture);
    assert.equal(r.code, 0, `stderr: ${r.stderr}`);
    assert.equal(readConfig(fixture).lang, 'en');
  });

  it('R3: sem flag e não-TTY usa default pt-BR', () => {
    const r = runCLI(['init', '--yes'], fixture);
    assert.equal(r.code, 0, `stderr: ${r.stderr}`);
    assert.equal(readConfig(fixture).lang, 'pt-BR');
  });

  it('R4: config existente é preservado em init sem --force nem --lang', () => {
    runCLI(['init', '--yes', '--lang', 'es'], fixture);
    const r = runCLI(['init', '--yes'], fixture);
    assert.equal(r.code, 0);
    assert.equal(readConfig(fixture).lang, 'es', 'idioma escolhido deve ser preservado');
  });

  it('R4: --lang explícito sobrescreve config existente sem --force', () => {
    runCLI(['init', '--yes', '--lang', 'pt-BR'], fixture);
    const r = runCLI(['init', '--yes', '--lang', 'en'], fixture);
    assert.equal(r.code, 0);
    assert.equal(readConfig(fixture).lang, 'en');
  });

  it('R4: config é JSON válido com newline final', () => {
    runCLI(['init', '--yes', '--lang', 'es'], fixture);
    const raw = fs.readFileSync(path.join(fixture, CONFIG_REL), 'utf8');
    assert.ok(raw.endsWith('\n'), 'config deve terminar com newline');
    assert.deepEqual(JSON.parse(raw), { lang: 'es' });
  });

  it('R6: update preserva pr-review.config.json byte-a-byte', () => {
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');
    const configContent = '{\n  "lang": "en"\n}\n';
    fs.writeFileSync(path.join(canonicalDir, 'pr-review.config.json'), configContent);

    const r = runCLI(['update'], fixture);
    assert.equal(r.code, 0, `stderr: ${r.stderr}`);
    const after = fs.readFileSync(path.join(canonicalDir, 'pr-review.config.json'), 'utf8');
    assert.equal(after, configContent, 'config deve ser idêntico após update');
  });

  it('R7: doctor reporta o idioma configurado', () => {
    runCLI(['init', '--yes', '--lang', 'en'], fixture);
    const r = runCLI(['doctor'], fixture);
    assert.match(r.stdout, /idioma: en/i);
  });

  it('R7: doctor mostra default quando config ausente, sem flipar exit', () => {
    const canonicalDir = path.join(fixture, '.claude', 'skills', 'pr-review');
    fs.mkdirSync(canonicalDir, { recursive: true });
    fs.writeFileSync(path.join(canonicalDir, 'SKILL.md'), '# skill');
    fs.writeFileSync(path.join(canonicalDir, 'PROJECT_PROFILE.md'), '# profile');

    const r = runCLI(['doctor'], fixture);
    assert.equal(r.code, 0, `stdout: ${r.stdout}`);
    assert.match(r.stdout, /pt-BR/);
  });
});

// ─── CLI top-level ────────────────────────────────────────────────────────────

describe('CLI top-level', () => {
  it('--help exits 0', () => {
    const r = runCLI(['--help'], process.cwd());
    assert.equal(r.code, 0);
    assert.match(r.stdout, /pr-review-skill/);
  });

  it('no args exits 2', () => {
    const r = runCLI([], process.cwd());
    assert.equal(r.code, 2);
  });

  it('unknown command exits 2', () => {
    const r = runCLI(['nonexistent'], process.cwd());
    assert.equal(r.code, 2);
    assert.match(r.stderr, /comando desconhecido/);
  });

  it('unknown flag exits 2', () => {
    const r = runCLI(['--foobar'], process.cwd());
    assert.equal(r.code, 2);
  });
});

// ─── init-ux: saída intuitiva do init ────────────────────────────────────────

describe('init-ux: saída do init', () => {
  let fixture;
  beforeEach(() => {
    fixture = mktemp();
    fs.mkdirSync(path.join(fixture, '.claude'));
    fs.mkdirSync(path.join(fixture, '.cursor'));
  });
  afterEach(() => rmtemp(fixture));

  it('R1: cabeçalho mostra onde instala + ferramentas detectadas', () => {
    const r = runCLI(['init', '--yes'], fixture);
    assert.equal(r.code, 0, `stderr: ${r.stderr}`);
    assert.match(r.stdout, /Instalando pr-review-skill em/);
    assert.match(r.stdout, /Detectado:.*Claude Code/);
    assert.match(r.stdout, /Cursor/);
  });

  it('R2: arquivos escritos usam ícone ✓', () => {
    const r = runCLI(['init', '--yes'], fixture);
    assert.match(r.stdout, /✓ .*SKILL\.md/);
  });

  it('R2: segunda execução marca pulados com •', () => {
    runCLI(['init', '--yes'], fixture);
    const r = runCLI(['init', '--yes'], fixture);
    assert.match(r.stdout, /• .*SKILL\.md \(já existe\)/);
  });

  it('R3: NO_COLOR → saída sem códigos ANSI', () => {
    // runCLI já força NO_COLOR=1
    const r = runCLI(['init', '--yes'], fixture);
    assert.ok(!r.stdout.includes('\x1b['), 'não deve conter escapes ANSI');
  });

  it('R4: resumo final traz Local, Idioma, Arquivos e Tempo', () => {
    const r = runCLI(['init', '--yes', '--lang', 'en'], fixture);
    assert.match(r.stdout, /Local:\s+\.claude\/skills\/pr-review/);
    assert.match(r.stdout, /Idioma:\s+English \(en\)/);
    assert.match(r.stdout, /Arquivos:\s+\d+ escritos, \d+ pulados/);
    assert.match(r.stdout, /Tempo:\s+\d+(\.\d+)?(ms|s)/);
  });

  it('R4: contagem reflete 0 escritos na reexecução', () => {
    runCLI(['init', '--yes'], fixture);
    const r = runCLI(['init', '--yes'], fixture);
    assert.match(r.stdout, /Arquivos:\s+0 escritos, \d+ pulados/);
  });

  it('R5: próximos passos preservados', () => {
    const r = runCLI(['init', '--yes'], fixture);
    assert.match(r.stdout, /git add/);
    assert.match(r.stdout, /revise este PR/i);
  });
});

// ─── ui.js: helper de cor ────────────────────────────────────────────────────

describe('ui: makeStyler / formatDuration', () => {
  let makeStyler, formatDuration;
  before(async () => {
    ({ makeStyler, formatDuration } = await import('../src/lib/ui.js'));
  });

  it('TTY sem NO_COLOR emite escapes ANSI', () => {
    const saved = process.env.NO_COLOR;
    delete process.env.NO_COLOR;
    const s = makeStyler({ isTTY: true });
    assert.ok(s.green('x').includes('\x1b['), 'deve conter escape');
    if (saved !== undefined) process.env.NO_COLOR = saved;
  });

  it('NO_COLOR força texto puro mesmo em TTY', () => {
    const saved = process.env.NO_COLOR;
    process.env.NO_COLOR = '1';
    const s = makeStyler({ isTTY: true });
    assert.equal(s.green('x'), 'x');
    if (saved === undefined) delete process.env.NO_COLOR;
  });

  it('stream não-TTY → texto puro', () => {
    const s = makeStyler({ isTTY: false });
    assert.equal(s.bold('x'), 'x');
  });

  it('formatDuration: ms abaixo de 1s, s acima', () => {
    assert.equal(formatDuration(7), '7ms');
    assert.equal(formatDuration(1300), '1.3s');
  });
});
