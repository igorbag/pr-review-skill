# STATE

## Decisões

- **D1 (2026-06-12) — Desvio único do pilar 4:** findings de segurança com confiança < 80% viram "verificação sugerida" (com a pergunta exata a responder) em vez de descartados. Racional: falso negativo de segurança tem custo assimétrico. Qualquer outro passe corta sem exceção. Fonte: `docs/us.md` nota US-07.
- **D2 (2026-06-12) — Agrupamento das 12 US em 3 features:** `review-engine` (US-04…10), `project-profiling` (US-03), `installer-cli` (US-01, 02, 11, 12). Racional: review-engine é conteúdo de skill (markdown/prompts), installer é código Node; profiling é a ponte (gera o PROJECT_PROFILE.md que o engine consome).
- **D3 (2026-06-12) — Specs em pt-BR:** acompanha o idioma de `docs/us.md`.
- **D4 (2026-06-12) — IDs de requisito:** cada feature spec numera R1, R2… mapeados 1:1 aos critérios de aceite das US, preservando rastreabilidade US → R → task → commit.

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
