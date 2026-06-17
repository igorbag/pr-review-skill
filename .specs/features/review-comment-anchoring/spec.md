# Feature: review-comment-anchoring

> Estende [review-engine](../review-engine/spec.md) · Prioridade: P1
> Pilares cobertos: 1, 2, 5, 6 (reforça âncora de comentário, grounding sob demanda e cobertura explícita dos 7 pilares)
> Namespace de requisitos: continua o do review-engine (R1–R24 já usados pelos arquivos da skill); esta feature adiciona **R25–R34**.

## Resumo

Três melhorias no motor de review, sem mudar a natureza da saída (continua relatório, nunca decisão — R15):

1. **Âncora de comentário** — cada finding diz ao Tech Lead **onde** postar o comentário no PR
   (arquivo:linha, lado do diff) e entrega um **texto sugerido** pronto para colar.
2. **7 pilares explícitos** — cada finding é marcado com o pilar que o gerou e o relatório fecha
   com uma checklist de **cobertura dos 7 pilares** (atesta que cada etapa rodou, sem inventar
   comentário para os pilares de processo).
3. **Doc `sob demanda` por escopo** — docs marcados `sob demanda` no `PROJECT_PROFILE.md` ganham
   um **Escopo** (paths/globs). Quando o diff toca esse escopo, o doc é carregado como contexto
   **antes dos passes**, deterministicamente — não fica a critério vago de um passe.

**Decisões do usuário (discuss):**
- DA1 — Formato "onde comentar": **bloco âncora por finding** (não seção separada, não `suggestion` GitHub).
- DA2 — 7 pilares: **tag de pilar no finding + checklist de cobertura no fim** (não reorganizar o relatório por pilar).
- DA3 — Gatilho do doc sob demanda: **path/escopo do doc** (coluna Escopo no profile; casa contra os arquivos do diff).

## Requisitos

### A. Âncora de comentário (pilar 5 — onde o humano age) — P1

- **R25** — Cada finding no relatório inclui campo **Âncora**: `arquivo:linha` + **lado do diff**
  (`novo` para linha adicionada, `antigo` para removida, `contexto` para linha inalterada) onde o
  comentário deve ser postado no PR.
- **R26** — Cada finding inclui **Comentário sugerido**: texto curto, em `{{LANG}}`, redigido como
  comentário de revisor para o autor do PR (não como descrição interna do finding). Não inclui veredito (R15).
- **R27** — A âncora aponta para uma linha **presente no diff**; o meta-review reconfere (extensão de R22).
  Finding cuja âncora não resolve numa linha real do diff é rebaixado a pergunta ou removido (R23).

### B. Cobertura explícita dos 7 pilares (pilar 1) — P1

- **R28** — Cada finding é marcado com o **pilar gerador** (①Especialização — via passe / ②Grounding /
  ④Precision / ⑥Rastreabilidade). A tag fica visível no bloco do finding, junto do passe.
- **R29** — O relatório inclui a seção **Cobertura dos 7 pilares**: checklist ①–⑦ com `✅`/`⬜` e
  nota curta de evidência (ex.: "5 passes rodados", "3 docs carregados", "2 findings cortados <80%",
  "1 finding removido"). Pilar não aplicável (ex.: ⑥ sem spec vinculada) → `⬜` + motivo.
- **R30** — A checklist **não inventa comentário** para os pilares de processo (③ Second Pass,
  ⑤ Human-in-the-Loop, ⑦ Meta-review); apenas atesta que a etapa rodou, com a evidência já produzida
  no relatório (tabela de cobertura, bloco de ações, saldo de auditoria).

### C. Doc `sob demanda` carregado por escopo (pilar 2) — P1

- **R31** — A tabela **Docs** do `PROJECT_PROFILE.md` ganha a coluna **Escopo**: para cada doc
  `sob demanda`, lista os paths/globs/módulos que ele cobre (ex.: `src/payments/**`). Docs
  `obrigatório` podem deixar o Escopo vazio (são sempre carregados).
- **R32** — No grounding, **após identificar o diff** (SKILL §2), todo doc `sob demanda` cujo Escopo
  casa com **algum arquivo do diff** é carregado como contexto **antes de rodar os passes** —
  determinístico, não a critério do passe. O relatório registra quais docs sob demanda foram ativados e por qual arquivo.
- **R33** — Doc `sob demanda` carregado por escopo conta como **doc citável** para findings de
  convenção/arquitetura (R3) nos arquivos cobertos por ele — mesma força de um doc obrigatório, no escopo dele.
- **R34** — Doc `sob demanda` **sem Escopo declarado**, ou cujo Escopo não casa com o diff, **não é
  carregado** automaticamente; permanece disponível só se um passe pedir explicitamente. O
  `profiling.md` preenche o Escopo ao classificar docs como `sob demanda`.

## Impacto em arquivos (visão de execução)

```
skill/templates/PROJECT_PROFILE.template.md  → coluna Escopo na tabela Docs (R31)
skill/profiling.md                           → preencher Escopo p/ docs sob demanda (R31, R34)
skill/SKILL.md                               → §1/§2 carga sob demanda por escopo (R32–R34);
                                                §7 relatório com âncora + pilar + cobertura (R25–R30)
skill/templates/relatorio.template.md        → bloco de finding ganha Âncora + Comentário sugerido + Pilar;
                                                nova seção "Cobertura dos 7 pilares" (R25–R30, R32)
skill/passes/{correcao,seguranca,testes,         → cada finding candidato emite Lado do diff +
  convencoes}.md                                  Comentário sugerido (R25–R26); tag de pilar implícita no passe
skill/passes/spec.md                         → rastreabilidade já é pilar ⑥; sem mudança de âncora
skill/passes/meta-review.md                  → reconfere a âncora resolve numa linha do diff (R27)
.claude/skills/pr-review/**                  → espelho sincronizado byte-a-byte com skill/
README.md / README.en.md / README.es.md      → etapa 7 do pipeline descreve âncora + cobertura dos 7 pilares;
                                                nota da coluna Escopo no grounding
```

## Fora de escopo

- Postar o comentário automaticamente no provedor git — a skill **entrega** a âncora e o texto;
  quem posta é o humano (mantém pilar 5; alinha com "Fora de escopo" do review-engine).
- Reorganizar o relatório inteiro por pilar (DA2 descartou).
- Formato `suggestion` do GitHub (DA1 descartou).
- Inferência de escopo por menção textual/símbolo no diff (DA3 escolheu só path/glob).

## Critérios de aceitação da feature

1. Review de PR de teste produz cada finding com **Âncora** (arquivo:linha + lado) e **Comentário
   sugerido** em `{{LANG}}`, além do **Pilar**.
2. Relatório fecha com **Cobertura dos 7 pilares** (①–⑦), cada um `✅`/`⬜` com evidência curta;
   pilar de processo atestado sem comentário inventado (R30).
3. Profile com doc `sob demanda` + Escopo `src/x/**`; PR que toca `src/x/a.js` → o doc é carregado
   antes dos passes e o relatório registra a ativação (R32). PR que **não** toca o escopo → doc não carregado (R34).
4. Finding de convenção citando um doc `sob demanda` ativado por escopo é **válido** (R33).
5. Finding com âncora apontando para linha inexistente no diff → meta-review rebaixa/remove (R27).
6. `.claude/skills/pr-review/**` permanece byte-a-byte igual a `skill/**` após as mudanças.
