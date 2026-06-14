# Feature: i18n — idioma do review

## Objetivo

O Tech Lead escolhe, na instalação, o idioma em que os reviews de PR serão
emitidos. A escolha é persistida por projeto (commitada) e consumida pela skill
em todo review subsequente. Default `pt-BR` (idioma atual da skill), preservando
retrocompatibilidade.

## Escopo (decisões de contexto)

- **D-i18n-1 — Escopo = saída do relatório.** Os arquivos da skill (passes,
  template, instruções) permanecem em pt-BR. O orquestrador é instruído a emitir
  o **relatório final** (rótulos e seções) no idioma configurado. NÃO traduzimos
  N cópias da skill. Fonte: discuss (usuário não selecionou "traduzir skill toda").
- **D-i18n-2 — Persistência em config dedicado.** `init` grava
  `<canonicalDir>/pr-review.config.json` = `{ "lang": "<code>" }`. Não é
  embarcado em `skill/`; `update` preserva byte-a-byte (mesma mecânica do
  `PROJECT_PROFILE.md`). Não mexe na invariante do profile.
- **D-i18n-3 — Lista fixa de idiomas:** `pt-BR`, `en`, `es`. Default `pt-BR`.
- **D-i18n-4 — Flag `--lang <code>` + default pt-BR** no modo não-interativo.
- **D-i18n-5 — README deste repo documenta a feature** (pedido explícito do
  usuário: "também o README do projeto seguir o i18n").

## Requisitos

| ID | Requisito | Critério de aceite |
|---|---|---|
| R1 | `init` aceita `--lang <code>` com `code ∈ {pt-BR,en,es}`. | `--lang xx` inválido → exit 2 + mensagem listando os válidos. |
| R2 | `init` interativo (TTY, sem `--yes`, e config será escrito) pergunta o idioma em lista numerada (1=pt-BR, 2=English, 3=Español). | Entrada vazia → default pt-BR. |
| R3 | `init` não-interativo (`--yes` ou stdin não-TTY) sem `--lang` usa default pt-BR. | `init --yes` grava `lang: "pt-BR"`. |
| R4 | `init` grava `<canonicalDir>/pr-review.config.json` = `{ "lang": "<code>" }` (JSON válido + newline). | Escreve quando: config ausente, OU `--force`, OU `--lang` explícito. Pula (preserva) quando: config presente E sem `--force` E sem `--lang`. |
| R5 | `copySkill` nunca escreve/sobrescreve `pr-review.config.json`. | Guard igual ao `PROJECT_PROFILE.md`. |
| R6 | `update` preserva `pr-review.config.json` byte-a-byte. | Conteúdo idêntico antes/depois de `update`. |
| R7 | `doctor` reporta presença do config e o idioma configurado. | Ausência sugere `init`; não é falha crítica isolada. |
| R8 | `SKILL.md` lê o idioma do config (default pt-BR se ausente) e instrui o orquestrador a emitir o relatório nesse idioma, preservando a estrutura do template. | Passo explícito no SKILL.md. |
| R9 | README do repo documenta a feature i18n. | Flag, prompt, idiomas, arquivo de config, como alterar. |
| R10 | Testes cobrem R1–R7 (CLI), padrão `node:test` + temp dir. | `npm test` verde. |

## Rastreabilidade

US relacionada: **US-03** (parametrização automática do projeto) — i18n é uma
nova dimensão de parametrização ao lado de stack/docs. Feature nova: `i18n`.
