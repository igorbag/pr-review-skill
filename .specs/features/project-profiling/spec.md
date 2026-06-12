# Feature: project-profiling

> Stories: US-03 · Prioridade: P2
> Pilares cobertos: 2 (Grounding — habilita o piso de docs do review-engine)

## Resumo

No primeiro review, a skill descobre sozinha a stack do projeto e onde estão os docs,
gera um `PROJECT_PROFILE.md` versionável e só pergunta ao usuário o que não conseguiu
inferir. O profile é o contrato consumido pelo review-engine (R1–R2, R8 de
[review-engine/spec.md](../review-engine/spec.md)).

## Requisitos

- **R1** — Detecta linguagem/stack pelos manifests (`build.gradle`, `go.mod`, `pyproject.toml`, `package.json`, …), inclusive monorepo com múltiplos módulos (um bloco de stack por módulo).
- **R2** — Varre `docs/`, README, CONTRIBUTING, ADRs e regras de agente existentes (`.claude/`, `.cursor/rules`, `.github/instructions`), classificando cada doc por papel (arquitetura, convenções, segurança, testes, …).
- **R3** — Pergunta ao usuário apenas o que não conseguiu inferir, agrupado em **uma única mensagem** (zero ping-pong).
- **R4** — Gera `PROJECT_PROFILE.md` versionável, com cada doc marcado `obrigatório` ou `sob demanda`.
- **R5** — Lacunas (papéis sem doc no repo) ficam registradas no profile em "Lacunas conhecidas" e **não bloqueiam** o uso.

## Contrato do PROJECT_PROFILE.md

Seções mínimas (interface com review-engine e installer-cli):

```markdown
# PROJECT_PROFILE

## Stack
<linguagens, frameworks, build tools — por módulo se monorepo>

## Linters e formatters
<ferramentas configuradas — review-engine usa para suprimir comentários (R4 do engine)>

## Docs
| Doc | Papel | Carga |
|---|---|---|
| docs/architecture.md | arquitetura | obrigatório |
| CONTRIBUTING.md | convenções | obrigatório |
| ... | ... | sob demanda |

## Lacunas conhecidas
<papéis sem doc — ex.: "sem doc de segurança">
```

Propriedades do contrato:
- Editável à mão e versionado — `git diff` legível por humanos
- `update` da skill nunca o toca (R2 de [installer-cli/spec.md](../installer-cli/spec.md))
- Ausência do arquivo dispara o profiling no primeiro review; presença o pula

## Fora de escopo

- Re-profiling automático quando manifests mudam (usuário re-roda sob demanda)
- Inferir convenções não escritas a partir do código (só docs existentes contam)

## Critérios de aceitação da feature

1. Repo poliglota de teste (ex.: Gradle + npm) → profile lista os dois módulos com stacks corretas.
2. Repo com docs/ + CONTRIBUTING → cada doc classificado por papel; ao menos os papéis principais marcados `obrigatório` quando há 7+ docs relevantes.
3. Repo sem docs → profile gerado com "Lacunas conhecidas" preenchida; review roda mesmo assim.
4. Tudo inferível → zero perguntas ao usuário; algo faltando → exatamente uma mensagem agrupada.
