# STATE

## Decisões

- **D1 — Desvio único do pilar 4:** findings de segurança com confiança < 80% viram "verificação sugerida" (com a pergunta exata a responder) em vez de descartados. Racional: falso negativo de segurança tem custo assimétrico. Qualquer outro passe corta sem exceção. Fonte: `docs/us.md` nota US-07.
- **D2 — Agrupamento das 12 US em 3 features:** `review-engine` (US-04…10), `project-profiling` (US-03), `installer-cli` (US-01, 02, 11, 12). Racional: review-engine é conteúdo de skill (markdown/prompts), installer é código Node; profiling é a ponte (gera o PROJECT_PROFILE.md que o engine consome).
- **D3 — Specs em pt-BR:** acompanha o idioma de `docs/us.md`.
- **D4 — IDs de requisito:** cada feature spec numera R1, R2… mapeados 1:1 aos critérios de aceite das US, preservando rastreabilidade US → R → task → commit.
- **D5 — i18n persistido em config dedicado:** idioma do review fica em `<canonicalDir>/pr-review.config.json` (`{ "lang": "<code>" }`), gravado pelo `init`. Não embarcado em `skill/`; `update` preserva byte-a-byte (mesma mecânica do `PROJECT_PROFILE.md`), guard em `skillfs.js`. Racional: não quebra a invariante do profile (gerado pela IA no 1º review).
- **D6 — i18n escopo = saída do relatório:** arquivos da skill seguem em pt-BR; `SKILL.md` instrui o orquestrador a emitir o relatório em `{{LANG}}`. Não traduzimos N cópias da skill (usuário não pediu).
- **D7 — Idiomas suportados:** `pt-BR` (default), `en`, `es`. Flag `init --lang <code>`; inválido → exit 2.
- **D8 — README do repo documenta i18n** (pedido explícito do usuário). Feature: `.specs/features/i18n/`.
- **D9 — init-ux só apresentação:** feature `init-ux` (`.specs/features/init-ux/`) muda apenas a saída do `init` — cabeçalho com local + ferramentas detectadas, ícones ✓/• por arquivo, bloco-resumo Local/Idioma/Arquivos/Tempo. Zero mudança em quais arquivos são escritos, idempotência ou config. Cores ANSI via novo helper `src/lib/ui.js`, ligadas só quando `stdout.isTTY` e `NO_COLOR` ausente. Estilo escolhido pelo usuário: cores+ícones, com contagem de arquivos, tempo e lista de ferramentas.

## Questões abertas

- **Q1:** `docs/us.md` afirma "P0–P2 já estão implementadas na v1.0.0", mas o repo não contém código nem git. Hipótese de trabalho: specs servem como plano de implementação do zero. Confirmar com o usuário se existe código em outro lugar (ex.: pacote npm já publicado) a importar.
- **Q2:** Imagem-fonte do framework ("Os 7 Pilares do Review Confiável com IA") não está no repo — rastreabilidade depende só de `docs/us.md`. Vale anexar a imagem/fonte em `docs/`.

## Bloqueios

- Nenhum.

## Lições

- (vazio)

## Ideias adiadas

- Adapter para outras ferramentas além de Claude Code/Cursor/Copilot (ex.: Windsurf, Zed) — fora do escopo da v1.0.0.

## Preferences

- (vazio)
