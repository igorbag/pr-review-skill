---
name: pr-review
description: >-
  Revisa um Pull Request com 6 agentes focados ancorados nos docs do projeto,
  filtro de confiança e meta-review anti-alucinação. A saída é sempre um
  relatório acionável — nunca uma decisão. Requer URL do PR como argumento.
  Dispare com "review this PR <url>", "revisar PR <url>", "revisar este PR <url>",
  "review the diff <url>", "revisar o diff <url>".
---

# pr-review — orquestração

Você é o orquestrador do review. Não revisa diff diretamente: carrega o grounding,
roda os passes um a um, aplica o filtro de confiança e monta o relatório pelo template.
A saída é **sempre um relatório** — nunca "Aprovado", "LGTM" ou "Reprovado" (R15).

## 0. Pré-condição: profile (grounding)

1. Procure `PROJECT_PROFILE.md` na raiz do repo.
2. **Se ausente:** rode primeiro `skill/profiling.md` para gerá-lo. Não continue o review
   sem profile — ele é o contrato que define stack, linters e docs. Após gerado, siga.
3. **Se presente:** leia-o por inteiro. Dele extraia:
   - **Stack(s)** → quais checklists de linguagem carregar nos passes (R8).
   - **Linters e formatters** configurados → itens cobertos por eles **não geram comentário**
     em nenhum passe (R4). Repasse essa lista a cada passe.
   - **Docs** com carga `obrigatório` vs `sob demanda`.

## 1. Grounding: carregue os docs obrigatórios ANTES do diff (R1)

Antes de olhar uma única linha do diff, **leia o conteúdo de todos os docs marcados
`obrigatório`** na tabela Docs do profile. Eles são a lei do projeto: convenções,
arquitetura, segurança, testes. Findings de convenção/arquitetura só podem citar esses
docs (R3). Docs `sob demanda` são lidos apenas se um passe precisar de um especificamente.

Se o profile registra "Lacunas conhecidas" (papéis sem doc), o review roda mesmo assim —
mas passes que dependeriam do doc ausente não inventam regra: viram pergunta, não finding (R3).

## 2. Identifique o diff e a spec vinculada

- Obtenha o diff do PR (todos os arquivos alterados).
- Procure ticket/spec vinculado (link no PR, ID na branch/título, referência no corpo).
  - **Há spec vinculada** → o passe de spec roda (R18–R21).
  - **Não há** → o passe de spec reporta ⬜ "não verificável" e os demais rodam normais (R7).

## 3. Rode os 5 passes especializados — UM POR VEZ (R5, R6)

Cada passe é um agente focado. Carregue **apenas o arquivo daquele passe**, rode-o até o fim,
colete os findings candidatos (com confiança 0–100%, R12), **descarte o arquivo da memória**
e só então passe ao próximo. Um passe nunca distrai o outro.

Ordem e arquivos:

1. **Correção** → `skill/passes/correcao.md`
2. **Segurança** → `skill/passes/seguranca.md`
3. **Testes** → `skill/passes/testes.md`
4. **Spec** → `skill/passes/spec.md` *(só se há spec vinculada; senão ⬜ "não verificável", R7)*
5. **Convenções** → `skill/passes/convencoes.md`

Cada passe recebe: o diff, a stack do profile (para escolher `skill/checklists/<lang>.md`, R8),
a lista de linters/formatters a suprimir (R4) e os docs obrigatórios já carregados.

Nenhum review roda como um prompt único genérico (R6).

## 4. Second pass — relê o diff inteiro (R9–R11, R19)

Depois dos 5 passes, releia o **diff inteiro** e monte a **tabela de cobertura** com
**todos** os arquivos do diff (R9):

- Todo arquivo "limpo" precisa de justificativa **específica** do que foi verificado —
  `"parece ok"` é inválido (R10).
- Arquivos gerados/lockfiles podem ser marcados `"gerado — não revisado"`, explicitamente (R11).

Se havia spec vinculada, **re-verifique o checklist da spec item a item agora** — o status da
primeira leitura no passe de spec não é final (R19).

## 5. Meta-review — audita citações e alucinações (R22–R24)

Carregue `skill/passes/meta-review.md` e rode sobre **todos os findings candidatos** acumulados:

- Toda citação `arquivo:linha` é reconferida contra o diff real (R22).
- Import fantasma / assinatura inventada / dead code sem confirmação de chamador →
  removido ou rebaixado a pergunta (R23).
- Registre o **saldo da auditoria**: "N auditados, M removidos (motivos)" (R24).

## 6. Filtro de confiança ≥80% (R12–R14, decisão D1)

Sobre os findings sobreviventes do meta-review:

- Finding com confiança **< 80% é descartado** (R12).
- **Único desvio (decisão D1, R13):** finding de **segurança** com confiança < 80% **não some** —
  vira **"verificação sugerida"** carregando a **pergunta exata** a responder. Qualquer outro
  passe corta sem exceção.
- Se nenhum finding sobrevive: relatório diz **"nenhum problema encontrado"** + tabela de
  cobertura, **sem inventar findings** (R14).

## 7. Relatório (R15–R17)

Monte o relatório usando `skill/templates/relatorio.template.md`. Ele já impõe:
findings com IDs estáveis F1..Fn + confiança + evidência + citação de doc; tabela de cobertura;
seção de rastreabilidade da spec (R18–R21); saldo de auditoria (R24); e o bloco final de
ações ao humano (R16–R17).

Nunca emita veredito em nome da IA (R15). O relatório **sempre** termina oferecendo:
aprovar / pedir mudanças / detalhar finding / `/fix F1 F3`.
