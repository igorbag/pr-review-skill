# Roadmap

> Prioridade vinda de `docs/us.md` §Priorização. Ordem de implementação inverte a de
> adoção: o núcleo de confiança (P0) vem antes da fricção de entrada (P2), porque sem
> ele o produto não cumpre a promessa.

## M1 — Núcleo de confiança (P0)

Feature: **review-engine** (parcial)

| Story | Título | Status |
|---|---|---|
| US-04 | Review ancorado nos docs do projeto (Grounding) | ⬜ |
| US-07 | Filtro de confiança (Precision > Recall) | ⬜ |
| US-08 | Decisão sempre humana (Human-in-the-Loop) | ⬜ |
| US-10 | Meta-review anti-hallucination | ⬜ |

Gate: sem grounding + precisão + decisão humana + anti-hallucination, nada mais avança.

## M2 — Qualidade do review (P1)

Feature: **review-engine** (completa)

| Story | Título | Status |
|---|---|---|
| US-05 | Passes especializados (6 agentes) | ⬜ |
| US-06 | Cobertura total com justificativa (Second Pass) | ⬜ |
| US-09 | Rastreabilidade da entrega (spec vs diff) | ⬜ |

## M3 — Adoção (P2)

Features: **project-profiling**, **installer-cli** (parcial)

| Story | Título | Status |
|---|---|---|
| US-01 | Instalar via npx | ⬜ |
| US-02 | Fonte de verdade única entre ferramentas | ⬜ |
| US-03 | Parametrização automática do projeto | ⬜ |

## M4 — Ciclo de vida (P3, pós v1.0.0)

Feature: **installer-cli** (completa)

| Story | Título | Status |
|---|---|---|
| US-11 | Atualizar sem perder configuração | ⬜ |
| US-12 | Diagnóstico da instalação (`doctor`) | ⬜ |

## Dependências entre features

```
review-engine (M1) ──► review-engine (M2)
        │
        └── consome PROJECT_PROFILE.md gerado por project-profiling (M3)
                                              │
installer-cli init (M3) ── instala skill que contém review-engine
        │
        └──► installer-cli update/doctor (M4)
```

Nota: review-engine pode ser desenvolvida/testada antes do installer usando um
PROJECT_PROFILE.md escrito à mão — o contrato do profile (definido em
project-profiling/spec.md) é a interface entre as duas.
