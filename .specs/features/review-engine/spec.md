# Feature: review-engine

> Stories: US-04, US-05, US-06, US-07, US-08, US-09, US-10 · Prioridade: P0 (US-04/07/08/10) + P1 (US-05/06/09)
> Pilares cobertos: 1, 2, 3, 4, 5, 6, 7

## Resumo

O motor de review: conteúdo da skill canônica (prompts, checklists, formato de relatório)
que orquestra 6 agentes focados sobre o diff de um PR, ancorado nos docs do projeto via
`PROJECT_PROFILE.md`, com filtro de confiança, second pass, rastreabilidade da entrega e
meta-review anti-hallucination. A saída é sempre um relatório — nunca uma decisão.

**Dependência:** consome o contrato do `PROJECT_PROFILE.md` (ver
[project-profiling/spec.md](../project-profiling/spec.md)). Pode ser desenvolvido com um
profile escrito à mão.

## Requisitos

### Grounding (US-04 · pilar 2) — P0

- **R1** — Docs marcados `obrigatório` no profile são carregados antes do diff, sempre, em todo review.
- **R2** — Piso de grounding: quando o repo possui 7+ docs relevantes, o profile mapeia ao menos os papéis principais (arquitetura, convenções, segurança, testes) como `obrigatório`; menos que isso fica registrado em "Lacunas conhecidas" do profile.
- **R3** — Finding de convenção/arquitetura sem doc citável do repo **não é emitido**; vira no máximo pergunta ao usuário.
- **R4** — Itens cobertos por linter/formatter configurado no repo não geram comentário.

### Passes especializados (US-05 · pilar 1) — P1

- **R5** — Cada passe tem escopo e checklist próprios, em arquivo próprio, carregado um por vez (um passe não distrai o outro).
- **R6** — Nenhum review roda como prompt único genérico: são 6 agentes focados — 5 passes (correção, segurança, testes, spec, convenções) + meta-review (R16–R18).
- **R7** — Passe de spec só roda quando há ticket/spec vinculado ao PR; ausência vira ⬜ "não verificável" no relatório.
- **R8** — Checklists cobrem armadilhas por linguagem (err ignorado em Go, `!!` em Kotlin, `except: pass` em Python, …), selecionadas pela stack do profile.

### Second Pass / cobertura (US-06 · pilar 3) — P1

- **R9** — Relatório inclui tabela de cobertura com **todos** os arquivos do diff.
- **R10** — Todo arquivo "limpo" tem justificativa específica do que foi verificado; "parece ok" é inválido.
- **R11** — Arquivos gerados/lockfiles podem ser marcados "gerado — não revisado", explicitamente.

### Filtro de confiança (US-07 · pilar 4) — P0

- **R12** — Cada finding recebe confiança 0–100% antes do relatório; < 80% é descartado.
- **R13** — *Desvio documentado (decisão D1 em STATE.md):* segurança < 80% vira "verificação sugerida" com a pergunta exata a responder, em vez de sumir. Único desvio do framework; qualquer outro passe corta sem exceção.
- **R14** — Diff sem problemas relevantes gera "nenhum problema encontrado" + tabela de cobertura, sem findings inventados.

### Human-in-the-Loop (US-08 · pilar 5) — P0

- **R15** — Relatório nunca contém "Aprovado", "LGTM", "Reprovado" ou equivalente em nome da IA.
- **R16** — Todo relatório termina oferecendo as ações ao humano: aprovar / pedir mudanças / detalhar finding / gerar fix.
- **R17** — Findings têm IDs estáveis (F1, F2…) referenciáveis em comandos como `/fix F1 F3`.

### Rastreabilidade da entrega (US-09 · pilar 6) — P1

- **R18** — Requisitos da spec/ticket numerados (R1, R2…) com status ✅/❌/⬜ e evidência arquivo:linha.
- **R19** — O checklist da spec é re-verificado item a item durante o second pass; status da primeira leitura não é final.
- **R20** — Mudanças fora da spec (scope creep) são listadas para ciência do humano.
- **R21** — Requisito ambíguo vira pergunta ou ⬜, nunca interpretação unilateral cobrada do código.

### Meta-review (US-10 · pilar 7) — P0

- **R22** — Toda citação arquivo:linha é reconferida contra o diff real antes do relatório final.
- **R23** — Findings de import fantasma / assinatura inventada / dead code sem confirmação de chamador são removidos ou rebaixados a pergunta.
- **R24** — Relatório informa o saldo da auditoria: "N auditados, M removidos (motivos)".

## Fluxo (visão de execução)

```
PROJECT_PROFILE.md → carrega docs obrigatórios (R1)
        │
        ▼
5 passes focados, um por vez (R5–R8)
  correção · segurança · testes · spec (R18–R21) · convenções (R3–R4)
        │  findings candidatos com confiança (R12)
        ▼
Second pass: relê diff inteiro, monta cobertura (R9–R11), re-verifica spec (R19)
        ▼
Meta-review: audita citações e alucinações (R22–R24)
        ▼
Filtro ≥80% + desvio de segurança (R12–R14)
        ▼
Relatório: findings F1..Fn + cobertura + saldo de auditoria + ações ao humano (R15–R17)
```

## Fora de escopo

- Aprovação/rejeição automática de PR
- Postar comentários direto no provedor git (v1 entrega relatório no chat/arquivo)
- Reproduzir checagens de linter/formatter (R4)

## Critérios de aceitação da feature

1. Review de um PR de teste com profile mínimo produz relatório com todas as seções: findings com ID+confiança, tabela de cobertura completa, saldo de auditoria, bloco de ações.
2. Injetar finding falso (linha inexistente) num passe → meta-review remove e contabiliza no saldo.
3. PR limpo → "nenhum problema encontrado" + cobertura, zero findings.
4. PR sem spec vinculada → passe de spec reporta ⬜ "não verificável", demais passes rodam normais.
