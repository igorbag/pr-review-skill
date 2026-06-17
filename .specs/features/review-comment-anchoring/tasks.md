# Tasks: review-comment-anchoring

Ordem: profile/grounding (C) → relatório/âncora (A+B) → passes → meta-review → espelho → READMEs.

- [x] **T1 — Escopo no profile (R31)** · `skill/templates/PROJECT_PROFILE.template.md`
  - Coluna **Escopo** na tabela Docs; exemplo de glob num doc `sob demanda`.
  - Done when: template tem 4 colunas (Doc | Papel | Carga | Escopo) + comentário explicando.

- [x] **T2 — Profiling preenche Escopo (R31, R34)** · `skill/profiling.md`
  - Passo 3/5: ao marcar doc `sob demanda`, registrar paths/globs que ele cobre.
  - Done when: profiling instrui a preencher Escopo e nota que sem Escopo o doc não auto-carrega.

- [x] **T3 — Carga sob demanda por escopo (R32–R34)** · `skill/SKILL.md` §1/§2
  - Após identificar o diff, casar Escopo dos docs `sob demanda` contra arquivos do diff; carregar os que casam antes dos passes; tornar citáveis (R33).
  - Done when: §1/§2 descrevem o casamento determinístico e o registro da ativação.

- [x] **T4 — Relatório: âncora + comentário + pilar + cobertura (R25–R30)** · `skill/templates/relatorio.template.md`
  - Bloco de finding ganha **Pilar**, **Âncora** (arquivo:linha + lado), **Comentário sugerido**.
  - Nova seção **Cobertura dos 7 pilares** (①–⑦ ✅/⬜ + evidência); nota de docs sob demanda ativados.
  - Done when: template renderiza um finding completo e a seção de cobertura.

- [x] **T5 — SKILL §7 monta âncora/cobertura (R25–R30, R32)** · `skill/SKILL.md` §7
  - Instruir o orquestrador a compor âncora/comentário/pilar e a seção de cobertura; registrar docs sob demanda ativados.
  - Done when: §7 referencia os novos campos do template.

- [x] **T6 — Passes emitem Lado + Comentário sugerido (R25–R26)** · `skill/passes/{correcao,seguranca,testes,convencoes}.md`
  - Formato de saída ganha `Lado:` e `Comentário sugerido:`. spec.md inalterado (pilar ⑥, sem âncora de linha única).
  - Done when: 4 passes têm os campos novos no bloco de formato.

- [x] **T7 — Meta-review reconfere âncora (R27)** · `skill/passes/meta-review.md`
  - R22 estendido: a Âncora resolve numa linha do diff; senão rebaixa/remove.
  - Done when: meta-review cita a checagem da âncora.

- [x] **T8 — Sincronizar espelho** · `.claude/skills/pr-review/**`
  - Copiar arquivos alterados de `skill/` para o espelho; `diff -rq` limpo.
  - Done when: `diff -rq skill .claude/skills/pr-review` vazio.

- [x] **T9 — READMEs (pt/en/es)** · `README.md` `README.en.md` `README.es.md`
  - Etapa 7 do pipeline: âncora + comentário sugerido + cobertura dos 7 pilares; nota da coluna Escopo no grounding.
  - Done when: as 3 traduções descrevem as novas capacidades de forma equivalente.

- [x] **T10 — Verificar + STATE** · `npm test`, `.specs/project/STATE.md`
  - `npm test` verde (não deve quebrar — mudança é conteúdo de skill, não CLI). Registrar DA1–DA3 em STATE.
  - Done when: testes passam, espelho sincronizado, STATE atualizado.
