# Feature: installer-cli

> Stories: US-01, US-02 (P2) · US-11, US-12 (P3)
> Pilares cobertos: Fundação (skill versionada no repo como fonte de verdade)

## Resumo

Pacote npm executável via `npx pr-review-skill <comando>`. Instala a skill canônica em
um diretório único do repo do usuário e gera adapters-ponteiro para cada ferramenta
(Claude Code, Cursor, Copilot). Comandos: `init`, `update`, `doctor`.

## Requisitos

### `init` (US-01) — P2

- **R1** — `npx pr-review-skill init` detecta as ferramentas presentes (`.claude/`, `.cursor/`, `.github/`) e sugere os alvos de instalação.
- **R2** — `--yes` instala sem nenhuma pergunta (CI/onboarding script).
- **R3** — Idempotente: rodar duas vezes não sobrescreve nada sem `--force`.
- **R4** — Ao final, exibe os próximos passos (commit + primeiro review).

### Fonte de verdade única (US-02) — P2

- **R5** — Conteúdo da skill existe em exatamente **um** diretório do repo (canônico, caminho configurável via `--dir`).
- **R6** — Adapters (`.cursor/rules`, `.github/instructions`) são ponteiros com o caminho canônico reescrito conforme `--dir` — nunca cópias do conteúdo.
- **R7** — `git log` do diretório canônico conta a história das regras de review do time.

### `update` (US-11) — P3

- **R8** — `update` sobrescreve os arquivos da skill e **nunca** toca no `PROJECT_PROFILE.md`.
- **R9** — Adapters não são tocados pelo `update` (regeneráveis com `init --force`).
- **R10** — Saída orienta revisar o `git diff` antes de commitar.

### `doctor` (US-12) — P3

- **R11** — Lista skill canônica, adapters e `PROJECT_PROFILE.md` com presente/ausente.
- **R12** — Quando algo essencial falta, sai com a instrução do próximo passo (ex.: "profile ausente — rode o primeiro review para gerá-lo").

## Layout instalado (referência)

```
repo-do-usuário/
├── .claude/skills/pr-review/     # canônico (default; muda com --dir)
│   ├── SKILL.md                  # review-engine: orquestração
│   ├── passes/                   # 5 passes + meta-review
│   └── PROJECT_PROFILE.md        # gerado no 1º review; nunca tocado por update
├── .cursor/rules/pr-review.mdc   # adapter → aponta para canônico
└── .github/instructions/pr-review.instructions.md  # adapter → idem
```

## Fora de escopo

- Instalação global (sempre por repo — a skill versionada COM o projeto é a fundação)
- Auto-update / verificação de versão em background
- Ferramentas além de Claude Code, Cursor, Copilot (ideia adiada em STATE.md)

## Critérios de aceitação da feature

1. Repo com `.claude/` e `.cursor/` → `init` sugere os dois alvos; `--yes` instala direto.
2. `init` duas vezes seguidas → segunda execução não altera nenhum arquivo (sem `--force`).
3. `update` com profile presente → arquivos da skill mudam, profile byte-idêntico, adapters intactos.
4. `doctor` em repo sem profile → reporta ausente + próximo passo; exit code distingue saudável de incompleto.
