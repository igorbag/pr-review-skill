# pr-review-skill

<img width="1024" height="506" alt="image" src="https://github.com/user-attachments/assets/b33abad1-4b82-43b2-b41d-75f816282d49" />

**Português** · [English](README.en.md) · [Español](README.es.md)

Reviews de PR assistidos por IA **confiáveis o suficiente para agir sobre eles** — sem o ruído de falsos positivos que destrói a confiança na ferramenta.

Uma skill canônica versionada no seu repo. Funciona com **qualquer ferramenta agêntica** de código: a skill é markdown puro, agnóstico de ferramenta. Vem com adapters-ponteiro nativos para **Claude Code**, **Cursor** e **GitHub Copilot** — qualquer outro agente (Windsurf, Zed, Aider, Continue, …) é só apontar para `SKILL.md`. Baseada no framework *Os 7 Pilares do Review Confiável com IA*.

## Instalação

```bash
npx pr-review-skill init
```

Detecta as ferramentas presentes (`.claude/`, `.cursor/`, `.github/`), instala a skill canônica em `.claude/skills/pr-review/` (configurável com `--dir`) e gera adapters-ponteiro para cada ferramenta detectada. Idempotente — rodar duas vezes não sobrescreve nada sem `--force`. Use `--yes` em CI/scripts.

> **Qualquer agente.** Os adapters automáticos cobrem Claude Code, Cursor e Copilot. Para qualquer outra ferramenta agêntica, basta instruí-la a ler e seguir `.claude/skills/pr-review/SKILL.md` (ou o caminho que você definir com `--dir`) — o conteúdo da skill não depende de nenhuma ferramenta específica.

Depois commite a pasta instalada. O `git log` do diretório canônico vira o histórico das regras de review do seu time.

## Como usar

Com a skill instalada, peça um review passando a **URL do PR**:

```
revisar PR https://github.com/org/repo/pull/123
review this PR https://github.com/org/repo/pull/123
revisar este PR https://github.com/org/repo/pull/123
review the diff https://github.com/org/repo/pull/123
```

**No primeiro review do projeto**, a skill detecta automaticamente stack, linters e docs do seu repositório e gera um `PROJECT_PROFILE.md` — você só precisa responder o que ela não conseguir inferir sozinha. A partir do segundo review, o profile já está pronto e o review começa direto.

O resultado é sempre um **relatório acionável** com findings numerados (F1, F2 …), tabela de cobertura arquivo por arquivo, rastreabilidade contra o ticket/spec e saldo de auditoria. A IA nunca aprova nem rejeita — a decisão final é sempre sua.

## Comandos

| Comando | O que faz |
|---|---|
| `npx pr-review-skill init` | Instala skill canônica + adapters |
| `npx pr-review-skill@latest update` | Atualiza a skill; **nunca** toca no seu `PROJECT_PROFILE.md` nem nos adapters |
| `npx pr-review-skill doctor` | Diagnostica a instalação: o que existe, o que falta, próximo passo |

### Flags

| Flag | Descrição |
|---|---|
| `--dir <path>` | Diretório canônico da skill (default: `.claude/skills/pr-review`) |
| `--force` | Sobrescreve arquivos existentes no `init` (inclui o config de idioma) |
| `--yes` | Pula confirmação interativa (útil em CI) |
| `--lang <code>` | Idioma do relatório (`init`): `pt-BR`, `en` ou `es`. Default `pt-BR` |
| `--help`, `-h` | Mostra ajuda |

## Idioma do review (i18n)

O relatório de review é emitido no idioma escolhido para o projeto. A escolha é
feita **uma vez, na instalação**, e fica versionada junto ao repo.

- No `init` interativo, a CLI pergunta o idioma (1 = `pt-BR`, 2 = `English`, 3 = `Español`).
- Em CI/scripts use a flag: `npx pr-review-skill init --yes --lang en`.
- Sem flag e sem terminal interativo, o default é `pt-BR`.

A escolha é gravada em `.claude/skills/pr-review/pr-review.config.json`:

```json
{ "lang": "pt-BR" }
```

Esse arquivo é seu: o `update` **nunca** o sobrescreve (igual ao `PROJECT_PROFILE.md`).
Para mudar o idioma depois, edite o JSON à mão ou rode `init` de novo com
`--lang <code>` (ou `--force`). O `doctor` mostra o idioma configurado.

Apenas a **saída ao usuário** é traduzida — os arquivos internos da skill seguem
em pt-BR; trechos de código, nomes de arquivo e comandos não são traduzidos.

## Como funciona

```mermaid
flowchart TD
    A([revisar PR &lt;url&gt;]) --> B{PROJECT_PROFILE.md<br/>existe?}
    B -- não --> P[Profiling 1x:<br/>find *.md + docs,<br/>detecta stack/linters] --> C
    B -- sim --> C[Grounding:<br/>carrega docs obrigatórios<br/>ANTES do diff]
    C --> D[Identifica diff + spec vinculada]
    D --> E[5 passes isolados, um por vez]

    subgraph E1 [Passes especializados]
        direction LR
        F1[Correção] --> F2[Segurança] --> F3[Testes] --> F4[Spec] --> F5[Convenções]
    end
    E --> E1
    E1 --> G[Second pass:<br/>relê diff inteiro,<br/>tabela de cobertura]
    G --> H[Meta-review:<br/>audita citações,<br/>remove alucinações]
    H --> I{Confiança ≥ 80%?}
    I -- não --> J[Descarta<br/><i>exceto segurança →<br/>verificação sugerida</i>]
    I -- sim --> K[Relatório acionável:<br/>F1..Fn + cobertura +<br/>saldo + ações]
    J --> K
    K --> L([Humano decide:<br/>aprovar / mudanças / /fix])

    style A fill:#2563eb,color:#fff
    style L fill:#16a34a,color:#fff
    style H fill:#f59e0b,color:#000
    style K fill:#8b5cf6,color:#fff
```

O review segue um pipeline de 7 etapas, cada uma executada por um agente isolado:

### 1. Grounding (antes do diff)

Lê o `PROJECT_PROFILE.md` e carrega todos os docs marcados como `obrigatório` **antes** de olhar uma única linha do diff. Findings de convenção e arquitetura só podem citar esses docs — sem doc, sem finding. Docs marcados `sob demanda` declaram um **Escopo** (paths/globs) no profile e são carregados automaticamente quando o diff toca esse escopo — tornando-se citáveis para os arquivos que cobrem.

### 2. Identificação do diff e spec

Obtém o diff completo do PR e procura o ticket ou spec vinculado (link no PR, ID na branch/título). Se houver spec, o passe de rastreabilidade roda; se não houver, é marcado como "não verificável".

### 3. Cinco passes especializados (um por vez)

Cada passe roda isolado, com escopo e checklist próprios:

| Passe | Foco |
|---|---|
| **Correção** | Bugs, lógica incorreta, erros de runtime |
| **Segurança** | OWASP, injeção, exposição de dados, autenticação |
| **Testes** | Cobertura, casos faltando, testes frágeis |
| **Spec** | Diff bate com os requisitos do ticket, item a item (✅/❌/⬜), scope creep |
| **Convenções** | Padrões do projeto conforme os docs; linters configurados não geram comentário |

Cada passe recebe: diff, stack detectada, lista de linters a suprimir e os docs obrigatórios. Um passe não contamina o outro.

### 4. Second pass — cobertura completa

Relê o diff inteiro e monta uma tabela com **todos** os arquivos alterados. Todo arquivo "limpo" precisa de justificativa específica — `"parece ok"` é inválido. Lockfiles e arquivos gerados são marcados explicitamente como "gerado — não revisado".

### 5. Meta-review (anti-alucinação)

Um agente audita os findings dos outros antes de entregar:

- Reconferência de toda citação `arquivo:linha` contra o diff real
- Remoção de imports fantasmas, assinaturas inventadas e dead code sem evidência
- Emite um saldo obrigatório: `"N auditados, M removidos (motivos), P rebaixados a pergunta"`

### 6. Filtro de confiança ≥ 80%

Findings com confiança abaixo de 80% são descartados. **Exceção deliberada:** findings de segurança com confiança < 80% não somem — viram "verificação sugerida" com a pergunta exata a responder. Falso negativo de segurança tem custo assimétrico.

### 7. Relatório

Montado a partir de um template estruturado com: findings com IDs estáveis + **pilar gerador** + confiança + evidência + **âncora de comentário** (`arquivo:linha` + lado do diff) + **comentário sugerido** pronto para colar no PR + citação de doc; tabela de cobertura; rastreabilidade da spec; saldo de auditoria; uma checklist de **cobertura dos 7 pilares** (atesta que cada etapa rodou); e bloco de ações ao humano (aprovar / pedir mudanças / `/detalhar F1` / `/fix F1 F3`). A âncora diz exatamente **onde** postar cada comentário — a IA entrega, você posta.

## Os 7 Pilares

```mermaid
flowchart LR
    subgraph P1 ["① Especialização"]
        direction TB
        A1[6 agentes focados] --> A2[escopo + checklist<br/>próprios] --> A3[um não distrai<br/>o outro]
    end
    subgraph P2 ["② Grounding"]
        direction TB
        B1[docs do SEU repo<br/>antes do diff] --> B2[sem doc citável,<br/>sem finding] --> B3[regras são SUAS,<br/>não do modelo]
    end
    subgraph P3 ["③ Second Pass"]
        direction TB
        C1[relê o diff inteiro] --> C2[justifica cada<br/>arquivo limpo] --> C3["parece ok<br/>é inválido"]
    end
    subgraph P4 ["④ Precision &gt; Recall"]
        direction TB
        D1[confiança &lt; 80%<br/>é cortada] --> D2[cry wolf mata<br/>a adoção] --> D3[segurança vira<br/>verificação sugerida]
    end
    subgraph P5 ["⑤ Human-in-the-Loop"]
        direction TB
        E1[IA nunca aprova<br/>nem rejeita] --> E2[humano decide<br/>com 👍 e /fix] --> E3[decisão é<br/>sempre sua]
    end
    subgraph P6 ["⑥ Rastreabilidade"]
        direction TB
        F1[spec vs diff<br/>item a item] --> F2[✅ ❌ ⬜<br/>com evidência] --> F3[revisa a ENTREGA,<br/>não só o código]
    end
    subgraph P7 ["⑦ Meta-review"]
        direction TB
        G1[agente audita<br/>os achados] --> G2[remove imports<br/>fantasma] --> G3[IA revisando IA]
    end

    P1 ~~~ P2 ~~~ P3 ~~~ P4
    P5 ~~~ P6 ~~~ P7

    style P1 fill:#dbeafe,stroke:#2563eb
    style P2 fill:#dcfce7,stroke:#16a34a
    style P3 fill:#fef9c3,stroke:#ca8a04
    style P4 fill:#fee2e2,stroke:#dc2626
    style P5 fill:#f3e8ff,stroke:#8b5cf6
    style P6 fill:#ccfbf1,stroke:#0d9488
    style P7 fill:#ffedd5,stroke:#ea580c
```

| # | Pilar | O que garante |
|---|---|---|
| ① | **Especialização** | 6 agentes focados (5 passes + meta-review), cada um com escopo e checklist próprios — um não distrai o outro |
| ② | **Grounding** | os docs do SEU repo são carregados antes do diff; finding de convenção sem doc citável não é emitido |
| ③ | **Second Pass** | relê o diff inteiro e justifica, arquivo por arquivo, por que o que ficou limpo está limpo |
| ④ | **Precision > Recall** | findings com confiança < 80% são cortados; cry wolf mata a adoção (exceção: segurança vira verificação sugerida) |
| ⑤ | **Human-in-the-Loop** | a IA nunca aprova nem rejeita; o relatório termina oferecendo as ações a você |
| ⑥ | **Rastreabilidade** | diff verificado contra os critérios do ticket/spec, item a item (✅/❌/⬜), incluindo scope creep |
| ⑦ | **Meta-review** | um agente audita os achados dos outros: linhas inexistentes, APIs inventadas e regras sem fonte são removidas |

## Estrutura instalada

```
.claude/skills/pr-review/        # skill canônica (fonte de verdade única)
├── SKILL.md                     # orquestração do review
├── passes/                      # 5 passes especializados + meta-review
│   ├── correcao.md
│   ├── seguranca.md
│   ├── testes.md
│   ├── spec.md
│   ├── convencoes.md
│   └── meta-review.md
├── checklists/                  # armadilhas por linguagem
│   ├── go.md
│   ├── java.md
│   ├── javascript.md
│   ├── kotlin.md
│   ├── python.md
│   └── ruby.md
├── templates/                   # relatório e PROJECT_PROFILE
│   ├── relatorio.template.md
│   └── PROJECT_PROFILE.template.md
├── profiling.md                 # parametrização automática do projeto
├── pr-review.config.json        # idioma do review — seu, nunca sobrescrito
└── PROJECT_PROFILE.md           # gerado no 1º review — seu, nunca sobrescrito

.cursor/rules/pr-review.mdc                       # ponteiro → skill canônica
.github/instructions/pr-review.instructions.md    # ponteiro → skill canônica
```

O `PROJECT_PROFILE.md` registra stack, linters configurados e docs do projeto. O `update` **nunca** o sobrescreve — ele é seu.

## Linguagens suportadas

Go · Java · JavaScript/TypeScript · Kotlin · Python · Ruby

Cada linguagem tem um checklist próprio de armadilhas comuns carregado automaticamente a partir da stack detectada no `PROJECT_PROFILE.md`.

## Requisitos

- Node ≥ 18 (só para instalar/atualizar — o review roda na sua ferramenta de IA)

## Licença

MIT
