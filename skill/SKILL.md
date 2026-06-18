---
name: pr-review
description: 'Revisa um Pull Request com 6 agentes focados ancorados nos docs do projeto, filtro de confiança e meta-review anti-alucinação. A saída é sempre um relatório acionável — nunca uma decisão. Requer URL do PR como argumento. Dispare com "review this PR <url>", "revisar PR <url>", "revisar este PR <url>", "review the diff <url>", "revisar o diff <url>".'
---

# pr-review — orquestração

Você é o orquestrador do review. Não revisa diff diretamente: carrega o grounding,
roda os passes um a um, aplica o filtro de confiança e monta o relatório pelo template.
A saída é **sempre um relatório** — nunca "Aprovado", "LGTM" ou "Reprovado" (R15).

> **Caminhos internos.** Todo caminho de arquivo da skill citado abaixo
> (`passes/…`, `checklists/…`, `templates/…`, `profiling.md`) é **relativo ao
> diretório deste `SKILL.md`** — ou seja, ao diretório canônico da skill
> (`.claude/skills/pr-review/` por padrão, ou o que foi definido com `--dir`).
> Não os interprete como relativos à raiz do repo.

## Os 7 Pilares (referência canônica)

Toda etapa do review e todo finding se ancoram nestes pilares. Use esta legenda
ao preencher o campo **pilar** de um finding (R28) e a seção **Cobertura dos 7
pilares** do relatório (R29–R30).

| # | Pilar | Tipo | O que garante |
|---|---|---|---|
| ① | **Especialização** | gerador | 6 agentes focados (5 passes + meta-review), cada um com escopo e checklist próprios |
| ② | **Grounding** | gerador | docs do repo carregados antes do diff; convenção sem doc citável não vira finding |
| ③ | **Second Pass** | processo | relê o diff inteiro; justifica cada arquivo limpo |
| ④ | **Precision > Recall** | filtro | corta findings com confiança < 80% (exceto segurança → verificação sugerida) |
| ⑤ | **Human-in-the-Loop** | processo | a IA nunca aprova nem rejeita; entrega ações ao humano |
| ⑥ | **Rastreabilidade** | gerador | diff verificado contra a spec/ticket item a item (✅/❌/⬜) |
| ⑦ | **Meta-review** | processo | um agente audita os achados dos outros e remove alucinações |

**Pilares geradores de finding** (campo **pilar** de F1..Fn): só ① (Correção,
Segurança, Testes), ② (Convenções ancorada em doc) e ⑥ (Spec). ④ é um **filtro**,
não gera finding — nunca o use como pilar de um finding. ③⑤⑦ são pilares de
**processo**: aparecem só na seção de cobertura, atestando que a etapa rodou.

## Risco de impacto (orientação ao humano que decide)

Cada finding carrega, além de pilar e confiança, um **risco de impacto**: quão grave
é a consequência **se o problema passar despercebido** — independente da confiança.
São eixos diferentes: **confiança** = "tenho certeza de que isto é um problema";
**risco** = "quão ruim fica se eu estiver certo e isto for para produção". Um typo de
log pode ter confiança 100% e risco Baixo; uma suspeita de SQL injection pode ter
confiança 70% e risco Alto.

Serve ao pilar ⑤ (Human-in-the-Loop): dá ao humano um sinal de triagem para decidir
**quanto** revisar — não substitui a decisão dele e **não é veredito** (R15).

| Risco | Quando | Exemplos |
|---|---|---|
| 🔴 **Alto** | dano amplo, difícil de reverter ou ligado a segurança/dinheiro/dados | falha de authn/authz, injeção, secret vazado, cripto fraca, perda/corrupção de dados, migration destrutiva, quebra de contrato de API pública, race em estado compartilhado, bug em lógica core que afeta muitos fluxos |
| 🟡 **Médio** | bug real porém localizado a uma feature/fluxo | regressão de comportamento numa feature, erro tratável que degrada UX, caminho importante sem teste |
| 🟢 **Baixo** | sem efeito de runtime ou trivialmente reversível | convenção/estilo fora do linter, naming, refactor sem mudança de comportamento, docs/comentários, dead code, teste ausente em caminho trivial |

**Risco geral do PR** = o **maior** risco entre os findings sobreviventes. Sem findings
→ 🟢 Baixo. Vai no topo do relatório (TL;DR) com a orientação correspondente:

- 🔴 **Alto** → revisão humana cuidadosa recomendada antes do merge.
- 🟡 **Médio** → vale ler os findings apontados antes de decidir.
- 🟢 **Baixo** → nada relevante encontrado; a seu critério, a revisão pode ser leve ou dispensável.

Mesmo com risco geral Baixo, se o diff tocou paths sensíveis (auth, pagamentos,
migrations) sem gerar finding, registre isso como nota no TL;DR — Baixo não é "ignore".

## 0. Pré-condição: idioma + profile (grounding)

**Idioma do relatório.** Antes de tudo, leia `pr-review.config.json` no diretório
canônico da skill (mesma pasta deste `SKILL.md`). Extraia o campo `lang`. Se o
arquivo não existir ou for ilegível, use `pt-BR` como default. Guarde esse valor
como `{{LANG}}` — ele define o idioma do **relatório final** (seção 7). Os
arquivos internos da skill (passes, checklists, template) permanecem em pt-BR;
só a saída ao usuário é traduzida.

**Profile.**

1. Procure `PROJECT_PROFILE.md` no diretório canônico da skill (mesma pasta deste
   `SKILL.md`) — **não** na raiz do repo sob review.
2. **Se ausente:** rode primeiro `profiling.md` para gerá-lo. Não continue o review
   sem profile — ele é o contrato que define stack, linters e docs. Após gerado, siga.
3. **Se presente:** leia-o por inteiro. Dele extraia:
   - **Stack(s)** → quais checklists de linguagem carregar nos passes (R8).
   - **Linters e formatters** configurados → itens cobertos por eles **não geram comentário**
     em nenhum passe (R4). Repasse essa lista a cada passe.
   - **Docs** com carga `obrigatório` vs `sob demanda`, e a coluna **Escopo** de cada doc
     `sob demanda` (paths/globs que ele cobre — usada na seção 2 para carga automática, R31–R34).

## 1. Grounding: carregue os docs obrigatórios ANTES do diff (R1)

Antes de olhar uma única linha do diff, **leia o conteúdo de todos os docs marcados
`obrigatório`** na tabela Docs do profile. Eles são a lei do projeto: convenções,
arquitetura, segurança, testes. Findings de convenção/arquitetura só podem citar esses
docs (R3). Docs `sob demanda` **não** são carregados aqui: a seção 2 decide quais entram,
por escopo, depois que o diff é conhecido (R32).

Se o profile registra "Lacunas conhecidas" (papéis sem doc), o review roda mesmo assim —
mas passes que dependeriam do doc ausente não inventam regra: viram pergunta, não finding (R3).

## 2. Identifique o diff e a spec vinculada

- Obtenha o diff do PR (todos os arquivos alterados).
- Procure ticket/spec vinculado (link no PR, ID na branch/título, referência no corpo).
  - **Há spec vinculada** → o passe de spec roda (R18–R21).
  - **Não há** → o passe de spec reporta ⬜ "não verificável" e os demais rodam normais (R7).

### 2.1 Carga de docs `sob demanda` por escopo (R32–R34)

Agora que a lista de arquivos do diff é conhecida, ative os docs `sob demanda` cujo **Escopo**
(coluna do profile) casa com o diff — **antes** de rodar qualquer passe:

1. Para cada doc `sob demanda` com Escopo preenchido, compare seus globs com **todos os arquivos
   do diff**. Glob casou em ao menos um arquivo → **leia o doc por inteiro** e o trate como
   contexto carregado, igual a um obrigatório, daqui em diante.
2. Doc `sob demanda` **sem Escopo**, ou cujo Escopo não casa com nenhum arquivo do diff, **não é
   carregado** (R34). Ele só entra se um passe pedir explicitamente por nome.
3. Um doc ativado por escopo é **citável** em findings de convenção/arquitetura (R3/R33), mas só
   para os arquivos cobertos pelo seu Escopo — não fora dele.
4. Anote o **registro de ativação**: `(<doc> ← <arquivo do diff que casou>)`. Ele alimenta a
   seção "Cobertura dos 7 pilares" do relatório (pilar ②, R29).

Repasse aos passes a lista final de docs carregados = obrigatórios (seção 1) + sob demanda ativados aqui.

## 3. Rode os 5 passes especializados — UM POR VEZ (R5, R6)

Cada passe é um agente focado. Carregue **apenas o arquivo daquele passe**, rode-o até o fim,
colete os findings candidatos (com confiança 0–100%, R12), **descarte o arquivo da memória**
e só então passe ao próximo. Um passe nunca distrai o outro.

Ordem e arquivos:

1. **Correção** → `passes/correcao.md`
2. **Segurança** → `passes/seguranca.md`
3. **Testes** → `passes/testes.md`
4. **Spec** → `passes/spec.md` *(só se há spec vinculada; senão ⬜ "não verificável", R7)*
5. **Convenções** → `passes/convencoes.md`

Cada passe recebe: o diff, a stack do profile (para escolher `checklists/<lang>.md`, R8),
a lista de linters/formatters a suprimir (R4) e os docs carregados — obrigatórios (seção 1) +
`sob demanda` ativados por escopo (seção 2.1, R33).

Cada finding candidato já nasce com os dados de âncora que o relatório vai exigir (R25–R26):
`arquivo:linha`, **lado do diff** (`novo`/`antigo`/`contexto`) e um **comentário sugerido** ao
autor do PR. O passe que emite o finding define o seu **pilar** (R28): Correção/Segurança/Testes
→ ① Especialização; Spec → ⑥ Rastreabilidade; Convenções ancorada em doc → ② Grounding.

O passe também atribui o **risco de impacto** do finding (🔴 Alto / 🟡 Médio / 🟢 Baixo)
pela rubrica de "Risco de impacto" acima — eixo separado da confiança (R36).

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

Carregue `passes/meta-review.md` e rode sobre **todos os findings candidatos** acumulados:

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

Comece o relatório por um **TL;DR de risco** no topo: o **risco geral do PR** (🔴/🟡/🟢
= o maior risco entre os findings sobreviventes; sem findings → 🟢 Baixo), a contagem de
findings por risco e a orientação correspondente da seção "Risco de impacto" (R35). É um
sinal de triagem para o humano decidir quanto revisar — nunca um veredito (R15).

Monte o relatório usando `templates/relatorio.template.md`, **escrevendo todo
o texto voltado ao usuário em `{{LANG}}`** (lido na seção 0; default `pt-BR`):
títulos, rótulos de seção, descrições de findings e o bloco final de ações. Preserve
a estrutura, a ordem das seções e os IDs (F1, VS1, R1…). **Não traduza** trechos de
código/diff, nomes de arquivo, comandos (`/fix`, `/detalhar`) nem citações literais.
O template já impõe:
findings com IDs estáveis F1..Fn + **pilar** (R28) + **risco de impacto** (R35) + confiança + evidência + **âncora**
(`arquivo:linha` + lado do diff, R25) + **comentário sugerido** ao autor (R26) + citação de doc;
tabela de cobertura; seção de rastreabilidade da spec (R18–R21); a seção **Cobertura dos 7 pilares**
(R29–R30); saldo de auditoria (R24); e o bloco final de ações ao humano (R16–R17).

Ao montar a **Cobertura dos 7 pilares**, ateste cada pilar com a evidência já produzida — não
invente comentário para os pilares de processo (R30):
- ① Especialização → nº de passes rodados;  ② Grounding → docs obrigatórios + `sob demanda`
  ativados por escopo (use o registro de ativação da seção 2.1);  ③ Second Pass → tabela de
  cobertura preenchida;  ④ Precision → quantos findings cortados <80%;  ⑤ Human-in-the-Loop →
  bloco de ações presente;  ⑥ Rastreabilidade → status da spec (ou `⬜` se não havia spec);
  ⑦ Meta-review → saldo da auditoria.
O **comentário sugerido** de cada finding é escrito em `{{LANG}}` e redigido para o autor do PR,
nunca como veredito (R15).

Nunca emita veredito em nome da IA (R15). O relatório **sempre** termina oferecendo:
aprovar / pedir mudanças / detalhar finding / `/fix F1 F3`.
