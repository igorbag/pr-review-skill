# Profiling — Descoberta automática de stack e docs

> Execute este procedimento **uma única vez**: no primeiro review, quando `PROJECT_PROFILE.md`
> ainda não existe no diretório canônico da skill.
> Após gerado, o profile é a **memória permanente do projeto** — evita re-descoberta
> e economiza tokens em todos os reviews subsequentes.
> `update` nunca o sobrescreve. Se existir, pule direto para o review.

---

## Passo 1 — Detectar stack (R1)

Varra o repositório em busca dos manifests abaixo. Em monorepos, repita por módulo e
nomeie cada bloco pelo caminho relativo.

| Manifest | Stack inferida |
|---|---|
| `go.mod` | Go |
| `build.gradle` / `build.gradle.kts` | Kotlin / Java (Gradle) |
| `pom.xml` | Java / Kotlin (Maven) |
| `pyproject.toml` / `setup.py` / `setup.cfg` / `requirements.txt` | Python |
| `package.json` | JavaScript / TypeScript (Node) |
| `Gemfile` | Ruby |
| `Cargo.toml` | Rust |
| `*.csproj` / `*.sln` | C# / .NET |
| `composer.json` | PHP |
| `pubspec.yaml` | Dart / Flutter |

**Monorepo:** se houver mais de um manifest em caminhos distintos, crie um bloco
`## Stack — <módulo>` separado por módulo no profile final.

---

## Passo 2 — Detectar linters e formatters

Procure arquivos de configuração conhecidos e registre as ferramentas ativas:

- **Go:** `.golangci.yml` / `.golangci.yaml` / `.golangci.toml` → golangci-lint
- **Kotlin/Java:** `.editorconfig` com `ktlint`, `checkstyle.xml`, `detekt.yml` → ktlint / Checkstyle / Detekt
- **Python:** `pyproject.toml` (`[tool.ruff]`, `[tool.black]`, `[tool.flake8]`, `[tool.isort]`), `.flake8`, `setup.cfg` → ruff / black / flake8 / isort / mypy
- **JavaScript/TypeScript:** `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `prettier.config.*`, `biome.json` → ESLint / Prettier / Biome
- **Java:** `checkstyle.xml`, `pmd.xml`, `.editorconfig` → Checkstyle / PMD / SpotBugs
- **Ruby:** `.rubocop.yml` → RuboCop

Se não encontrar nenhum arquivo de configuração de linter, registre "nenhum configurado"
na seção correspondente do profile — o review-engine **não suprimirá** comentários de
estilo nesses casos.

---

## Passo 3 — Varrer e classificar documentação (R2)

**Primeiro: descubra todos os arquivos Markdown e diretórios de doc existentes.**

Execute mentalmente o equivalente a:

```
find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.omc/*"
find . -type d \( -name "doc" -o -name "docs" \) -not -path "*/node_modules/*"
```

Liste todos os arquivos `.md` encontrados e todos os diretórios `doc/` ou `docs/`. Esse
conjunto é a fonte real — não assuma que só existem os caminhos canônicos abaixo.

**Depois: classifique cada arquivo encontrado pelo papel predominante.**

Caminhos adicionais a verificar (complementam o `find`):
- `.claude/` (instruções Claude Code)
- `.cursor/rules/` (regras Cursor)
- `.github/instructions/` / `.github/PULL_REQUEST_TEMPLATE*` / `.github/ISSUE_TEMPLATE*`
- `Makefile` / `Taskfile.yml` (como proxy de convenções de build)

**Papéis de classificação:**

| Papel | Critério de identificação |
|---|---|
| `arquitetura` | descreve componentes, decisões de design, ADRs |
| `convenções` | guia de estilo, padrões de código, CONTRIBUTING |
| `segurança` | políticas de segurança, SECURITY.md, threat model |
| `testes` | estratégia de testes, como rodar, cobertura esperada |
| `operações` | deploy, runbook, SLO, monitoramento |
| `produto` | requisitos, user stories, especificações funcionais |
| `onboarding` | setup inicial, primeiros passos, README geral |
| `api` | contratos de API, OpenAPI/Swagger, proto files |

**Regra do piso de grounding (R2 do review-engine):**
- Se o repositório possui **7 ou mais** docs relevantes → marque ao menos os papéis
  `arquitetura`, `convenções`, `segurança` e `testes` como `obrigatório` (se existirem).
- Se houver menos de 7 docs relevantes → registre em "Lacunas conhecidas" os papéis
  ausentes; marque os existentes conforme julgamento.

**Escopo dos docs `sob demanda` (R31, R34):** para cada doc que você marcar `sob demanda`,
determine os **paths/globs que ele cobre** e registre na coluna **Escopo** do profile. Use
sinais do próprio doc (títulos, caminhos citados, módulo descrito) e da estrutura do repo:

- Doc sobre um módulo/área específica → glob desse módulo (ex.: `docs/payments.md` → `src/payments/**`).
- Doc de API de um serviço → path do serviço (ex.: `openapi/orders.yaml` → `services/orders/**`).
- Vários módulos → globs separados por vírgula.

Se não der para determinar um escopo confiável, **deixe o Escopo em branco** — o doc só será
carregado se um passe pedir explicitamente; ele **não** entra na carga automática (R34). Não
invente um escopo amplo demais (`**`) só para forçar carga: isso anula o ganho de tokens do `sob demanda`.

---

## Passo 4 — Perguntar ao usuário (R3)

Agrupe **tudo** que não foi possível inferir em **uma única mensagem**. Só pergunte se
realmente necessário. Exemplos do que pode ser incerto:

- Módulo principal em monorepo com estrutura não convencional
- Framework de testes usado (quando `package.json` não lista nenhum)
- Política de segurança (quando não há `SECURITY.md` nem equivalente)
- Convenções de branch/merge não documentadas

Nunca envie mais de uma mensagem de pergunta. Se tudo foi inferível, pule este passo.

---

## Passo 5 — Gerar `PROJECT_PROFILE.md` (R4 e R5)

Grave o arquivo em `<diretório canônico da skill>/PROJECT_PROFILE.md` usando o template
em `templates/PROJECT_PROFILE.template.md`.

Regras de preenchimento:
- Cada doc listado recebe `obrigatório` ou `sob demanda` na coluna **Carga**.
- Doc `sob demanda` recebe a coluna **Escopo** (paths/globs que ele cobre); `obrigatório` deixa
  Escopo em branco. Doc `sob demanda` sem Escopo não entra na carga automática (R34).
- Papéis sem nenhum doc no repositório vão para **Lacunas conhecidas** — nunca bloqueiam
  o uso.
- O arquivo deve ser legível em `git diff` e editável à mão pelo Tech Lead.
- Após gerado, o profile **não é mais tocado** por execuções subsequentes de profiling
  nem por `update`.
