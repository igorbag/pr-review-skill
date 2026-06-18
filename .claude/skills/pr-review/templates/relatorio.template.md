# Relatório de Review — PR #<número> / <título>

> **Nota:** este relatório é informativo. A IA não aprova nem rejeita o PR (R15).
> A decisão final é sempre sua.

---

## TL;DR — Risco de impacto

**Risco geral do PR:** <🔴 Alto | 🟡 Médio | 🟢 Baixo>

<!-- = maior risco entre os findings sobreviventes; sem findings → 🟢 Baixo (R35).
     Escolha UMA linha de orientação conforme o risco geral: -->
> 🔴 **Alto** — revisão humana cuidadosa recomendada antes do merge.
> 🟡 **Médio** — vale ler os findings apontados antes de decidir.
> 🟢 **Baixo** — nada relevante encontrado; a seu critério, a revisão pode ser leve ou dispensável.

| Risco | Findings |
|---|---|
| 🔴 Alto | <nº> (<ex.: F1, F4>) |
| 🟡 Médio | <nº> (<ex.: F2>) |
| 🟢 Baixo | <nº> (<ex.: F3>) |

<!-- Se risco geral é 🟢 Baixo MAS o diff tocou paths sensíveis (auth, pagamentos,
     migrations) sem gerar finding, registre como nota — Baixo não é "ignore": -->
> **Nota:** <ex.: o diff altera `src/auth/session.js`; nenhum finding, mas confira você mesmo se for crítico.>

---

## Findings

<!-- Findings após meta-review e filtro de confiança ≥ 80%.
     Se nenhum finding sobreviveu, substitua toda esta seção por:
     "Nenhum problema encontrado no diff revisado." (R14)
-->

### F1 — <título curto do finding>

- **Passe:** <Correção | Segurança | Testes | Spec | Convenções>
- **Pilar:** <① Especialização | ② Grounding | ⑥ Rastreabilidade> <!-- pilar gerador, R28 — ④/③/⑤/⑦ NÃO geram finding -->
- **Risco de impacto:** <🔴 Alto | 🟡 Médio | 🟢 Baixo> <!-- consequência se passar; eixo separado da confiança, R35 -->
- **Âncora:** `<arquivo>:<linha>` — lado: <novo | antigo | contexto> <!-- onde postar o comentário no PR, R25 -->
- **Confiança:** <80–100>%
- **Evidência:**
  ```
  <trecho real do diff>
  ```
- **Descrição:** <o que está errado e por quê>
- **Comentário sugerido:** <!-- texto pronto p/ colar no PR, em {{LANG}}, dirigido ao autor; sem veredito (R26) -->
  > <comentário curto e acionável ao autor do PR>
- **Citação:** <doc do repo + seção — obrigatório para Convenções; opcional para os demais>

<!-- Repita o bloco para F2, F3, … -->

---

<!-- Verificações sugeridas de segurança (confiança < 80%, desvio D1).
     Omita esta seção se não houver nenhuma.
-->

## Verificações sugeridas (segurança, confiança < 80%)

- **VS1** — `<arquivo>:<linha>` — <suspeita>
  - Evidência: <o que foi visto no diff>
  - Pergunta a responder: <pergunta exata que confirma ou descarta>

---

## Cobertura do diff (second pass)

<!-- Todo arquivo alterado no diff aparece aqui, com justificativa específica (R9–R11).
     "parece ok" é inválido (R10). Arquivos gerados/lockfiles: "gerado — não revisado" (R11).
-->

| Arquivo | Status | Observação |
|---|---|---|
| `<arquivo>` | Limpo | <o que foi verificado: lógica de X, tratamento de erro em Y> |
| `<arquivo>` | Finding(s): F1, F2 | <resumo> |
| `<arquivo>` | Gerado — não revisado | <ex.: lockfile, protobuf gerado> |

---

## Rastreabilidade da spec

<!-- Omita esta seção inteira se não havia spec/ticket vinculado ao PR (R7). -->
<!-- Se não havia spec, substitua por: "Sem spec vinculada — rastreabilidade não verificável." -->

**Spec/ticket:** <link ou ID>

| Requisito | Status | Evidência |
|---|---|---|
| R1 — <texto> | ✅ | `arquivo:linha` |
| R2 — <texto> | ❌ | Esperado em <onde>; ausente no diff |
| R3 — <texto> | ⬜ | Não verificável: <motivo / ambíguo> |

**Scope creep** (mudanças no diff sem requisito correspondente):

- `<arquivo>:<linha>` — <descrição da mudança extra>
<!-- Se não houver scope creep: "Nenhum." -->

**Perguntas sobre requisitos ambíguos:**

- <pergunta exata ao humano>
<!-- Se não houver: "Nenhuma." -->

---

## Saldo de auditoria (meta-review)

<N> findings auditados, <M> removidos (<motivos>), <P> rebaixados a pergunta.

---

## Cobertura dos 7 pilares

<!-- Atesta que cada etapa rodou, com a evidência já produzida acima.
     NÃO invente comentário para os pilares de processo (③⑤⑦) — só confirme que ocorreram (R29–R30).
     Pilar não aplicável (ex.: ⑥ sem spec vinculada) → ⬜ com motivo.
-->

| # | Pilar | Status | Evidência |
|---|---|---|---|
| ① | Especialização | ✅ | <ex.: 5 passes rodados, um por vez> |
| ② | Grounding | ✅ | <ex.: 3 docs obrigatórios + docs sob demanda ativados: `docs/payments.md` ← `src/payments/x.js`> |
| ③ | Second Pass | ✅ | <ex.: tabela de cobertura com todos os N arquivos do diff> |
| ④ | Precision > Recall | ✅ | <ex.: 2 findings cortados <80%; 1 virou verificação sugerida> |
| ⑤ | Human-in-the-Loop | ✅ | <ex.: bloco de ações ao humano presente; nenhum veredito emitido> |
| ⑥ | Rastreabilidade | <✅ \| ⬜> | <ex.: spec verificada item a item / ⬜ sem spec vinculada> |
| ⑦ | Meta-review | ✅ | <ex.: N auditados, M removidos — ver saldo acima> |

---

## Próximos passos

Use o **risco geral** do TL;DR para calibrar o esforço: 🟢 Baixo permite uma revisão leve
ou dispensável a seu critério; 🟡 Médio pede leitura dos findings; 🔴 Alto pede revisão
cuidadosa antes do merge. O que você pode fazer agora:

- **Aprovar o PR** — se os findings acima não bloqueiam.
- **Pedir mudanças** — se um ou mais findings precisam ser resolvidos antes do merge.
- **Detalhar um finding** — peça `/detalhar F1` (ou o ID) para análise mais profunda.
- **Aplicar correções sugeridas** — peça `/fix F1 F3` para que a IA gere as alterações.
