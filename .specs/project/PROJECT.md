# pr-review-skill

## Visão

Reviews de PR assistidos por IA confiáveis o suficiente para o time **agir sobre eles**, reduzindo tempo de review sem introduzir ruído de falsos positivos que destrói a confiança na ferramenta.

Distribuído como pacote npm (`npx pr-review-skill init`) que instala uma skill canônica versionada no repo do usuário, com adapters para Claude Code, Cursor e GitHub Copilot.

> Fonte: `docs/us.md` v1.0.0 — épico, 12 user stories, framework "Os 7 Pilares do Review Confiável com IA".

## Os 7 Pilares (framework norteador)

| # | Pilar | Resumo |
|---|---|---|
| 1 | Especialização | 6 agentes focados, escopo/checklist próprios, um não distrai o outro |
| 2 | Grounding | 7+ docs carregados antes do diff; regras do PROJETO, nunca conhecimento geral |
| 3 | Second Pass | Relê o diff inteiro, lista o que NÃO comentou, justifica o limpo |
| 4 | Precision > Recall | Limiar 80% de confiança; se incerto, skip — cry wolf = zero confiança |
| 5 | Human-in-the-Loop | IA nunca aprova/rejeita; humano decide via 👍 e `/fix` |
| 6 | Rastreabilidade | Spec vs diff, checklist ✅/❌/⬜ item a item com second pass; revisa a ENTREGA |
| 7 | Meta-review | Agente dedicado a hallucinations, phantom imports — IA revisando IA |

Fundação: skill versionada no repo como fonte de verdade única — docs são a lei.

**Desvio deliberado único** (registrado em STATE.md): findings de segurança com confiança < 80% são rebaixados a "verificação sugerida" em vez de descartados — custo de falso negativo de segurança é assimétrico.

## Personas

- **Dev** — autor do PR ou revisor; usa Claude Code, Cursor ou Copilot no dia a dia
- **Tech Lead** — define convenções, mantém docs, decide o que entra no repo
- **Mantenedor** — publica e evolui o pacote npm

## Objetivos mensuráveis

1. Zero findings sem citação verificável (doc do repo ou arquivo:linha do diff real)
2. Findings emitidos têm confiança ≥ 80%; relatório informa saldo de auditoria do meta-review
3. Instalação em um comando, idempotente, sem perda de configuração no update
4. Relatório nunca decide pelo humano — sempre termina oferecendo ações

## Não-objetivos

- Aprovar/rejeitar PRs automaticamente
- Substituir linters/formatters (itens cobertos por eles não geram comentário)
- Configuração manual extensa — parametrização é automática (PROJECT_PROFILE.md gerado)

## Features

| Feature | Stories | Prioridade |
|---|---|---|
| [review-engine](../features/review-engine/spec.md) | US-04…US-10 | P0 + P1 |
| [project-profiling](../features/project-profiling/spec.md) | US-03 | P2 |
| [installer-cli](../features/installer-cli/spec.md) | US-01, US-02, US-11, US-12 | P2 + P3 |
