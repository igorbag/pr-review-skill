# pr-review-skill — Especificação de Produto (User Stories)

> Versão 1.0.0 · Documento único: épico, rastreabilidade dos 7 Pilares, 12 user stories
> com critérios de aceite e priorização. Fonte do framework: "Os 7 Pilares do Review
> Confiável com IA".

---

## Rastreabilidade — 7 Pilares → User Stories

| # | Pilar (requisito da imagem) | Stories | Cobertura |
|---|---|---|---|
| 1 | Especialização — 6 agentes focados, escopo/checklist próprios, um não distrai o outro | US-05, US-10 | ✅ total |
| 2 | Grounding — 7+ docs antes do diff, nunca conhecimento geral, regras são SUAS | US-03, US-04 | ✅ total |
| 3 | Second Pass — relê o diff inteiro, lista o que NÃO comentou, justifica o limpo | US-06 | ✅ total |
| 4 | Precision > Recall — limiar 80%, se incerto skip, cry wolf = zero confiança | US-07 | ✅ com 1 desvio documentado* |
| 5 | Human-in-the-Loop — nunca aprova/rejeita, humano decide via 👍 e /fix | US-08 | ✅ total |
| 6 | Rastreabilidade — spec vs diff, checklist ✅/❌/⬜ item a item com second pass, revisa a ENTREGA | US-09 (+US-06) | ✅ total |
| 7 | Meta-review — agente dedicado a hallucinations, phantom imports, IA revisando IA | US-10 | ✅ total |
| — | Fundação — skill versionada no repo como fonte de verdade, docs são a lei | US-02, US-04 | ✅ total |
| — | Banner — falsos positivos = desenvolvedores confiam e agem | Épico | ✅ total |

\* **Desvio deliberado (US-07):** a imagem manda "se incerto, skip" sem exceção; esta spec
rebaixa achados de **segurança** com confiança < 80% para "verificação sugerida" em vez de
descartá-los, porque o custo de um falso negativo de segurança é assimétrico. É o único
desvio do framework e está declarado no critério de aceite correspondente.

---

**Épico:** Como time de desenvolvimento, queremos reviews de PR assistidos por IA que
sejam confiáveis o suficiente para agir sobre eles, para reduzir o tempo de review sem
introduzir ruído de falsos positivos que destrói a confiança na ferramenta.

**Personas:**
- **Dev** — autor do PR ou revisor; usa Claude Code, Cursor ou Copilot no dia a dia
- **Tech Lead** — define convenções, mantém docs e decide o que entra no repo
- **Mantenedor** — publica e evolui o pacote npm

---

## Instalação e setup

### US-01 — Instalar via npx
**Como** Dev, **quero** instalar a skill com um único comando (`npx pr-review-skill init`)
**para** não precisar copiar arquivos manualmente nem ler documentação de setup.

Critérios de aceite:
- [ ] `npx pr-review-skill init` detecta as ferramentas presentes (`.claude/`, `.cursor/`, `.github/`) e sugere os alvos
- [ ] `--yes` instala sem nenhuma pergunta (uso em CI/onboarding script)
- [ ] Rodar duas vezes não sobrescreve nada sem `--force` (idempotente)
- [ ] Ao final, exibe os próximos passos (commit + primeiro review)

### US-02 — Fonte de verdade única entre ferramentas
**Como** Tech Lead, **quero** que Cursor e Copilot apontem para a mesma skill canônica
versionada no repo **para** que uma atualização valha para todo o time em todas as
ferramentas, sem drift.

Critérios de aceite:
- [ ] Conteúdo da skill existe em exatamente um diretório do repo
- [ ] Adapters (.cursor/rules, .github/instructions) são ponteiros com o caminho canônico reescrito conforme `--dir`
- [ ] `git log` do diretório canônico conta a história das regras de review do time

### US-03 — Parametrização automática do projeto
**Como** Dev, **quero** que no primeiro review a skill descubra sozinha minha stack e
onde estão meus docs **para** não ter que configurar nada à mão.

Critérios de aceite:
- [ ] Detecta linguagem/stack pelos manifests (build.gradle, go.mod, pyproject.toml, package.json...), inclusive monorepo com múltiplos módulos
- [ ] Varre docs/, README, CONTRIBUTING, ADRs e regras de agente existentes, classificando cada doc por papel
- [ ] Pergunta ao usuário apenas o que não conseguiu inferir, agrupado em uma única mensagem
- [ ] Gera `PROJECT_PROFILE.md` versionável, com docs marcados como `obrigatório` ou `sob demanda`
- [ ] Lacunas (docs inexistentes) ficam registradas no profile, não bloqueiam o uso

---

## Execução do review

### US-04 — Review ancorado nos docs do projeto (Grounding)
**Como** Tech Lead, **quero** que todo finding de convenção/arquitetura cite o doc do
repo que o sustenta **para** que o review aplique as NOSSAS regras, não opiniões
genéricas do modelo.

Critérios de aceite:
- [ ] Docs `obrigatório` do profile são carregados antes do diff, sempre
- [ ] Piso de grounding (pilar 2: "7+ docs"): quando o repo possui 7+ docs relevantes, o profile mapeia ao menos os principais papéis (arquitetura, convenções, segurança, testes) como `obrigatório`; menos que isso é registrado em "Lacunas conhecidas"
- [ ] Finding de convenção sem doc citável não é emitido (vira no máximo pergunta ao usuário)
- [ ] Itens cobertos por linter/formatter configurado não geram comentário

### US-05 — Passes especializados
**Como** Dev, **quero** que o review rode em passes focados (correção, segurança,
testes, spec, convenções) **para** que cada dimensão receba atenção dedicada em vez de
um julgamento genérico e raso.

Critérios de aceite:
- [ ] Cada passe tem escopo e checklist próprios, em arquivo próprio, carregado um por vez
- [ ] Nenhum review roda como prompt único genérico: são 6 agentes focados — 5 passes (correção, segurança, testes, spec, convenções) + o agente de meta-review (US-10)
- [ ] Passe de spec só roda quando há ticket/spec vinculado; ausência vira ⬜ "não verificável" no relatório
- [ ] Checklists cobrem armadilhas por linguagem (err ignorado em Go, `!!` em Kotlin, `except: pass` em Python...)

### US-06 — Cobertura total com justificativa (Second Pass)
**Como** Dev, **quero** ver, arquivo por arquivo, o que a IA verificou e por que
considerou limpo **para** confiar que ela olhou o diff inteiro e não só os trechos salientes.

Critérios de aceite:
- [ ] Relatório inclui tabela de cobertura com todos os arquivos do diff
- [ ] Todo arquivo "limpo" tem justificativa específica do que foi verificado ("parece ok" é inválido)
- [ ] Arquivos gerados/lockfiles podem ser marcados "gerado — não revisado", explicitamente

### US-07 — Filtro de confiança (Precision > Recall)
**Como** Dev, **quero** que achados com confiança < 80% sejam cortados **para** não
gastar tempo refutando falsos positivos — cry wolf mata a adoção.

Critérios de aceite:
- [ ] Cada finding recebe confiança 0–100% antes do relatório; < 80% é descartado
- [ ] Desvio documentado do pilar 4 ("se incerto, skip"): segurança < 80% vira "verificação sugerida" com a pergunta exata a responder, em vez de sumir — falso negativo de segurança tem custo assimétrico. Único desvio do framework; qualquer outro passe corta sem exceção
- [ ] Diff sem problemas relevantes gera "nenhum problema encontrado" + tabela de cobertura, sem findings inventados

### US-08 — Decisão sempre humana (Human-in-the-Loop)
**Como** Tech Lead, **quero** que a IA nunca aprove nem rejeite um PR **para** que a
responsabilidade pela decisão permaneça com o time.

Critérios de aceite:
- [ ] Relatório nunca contém "Aprovado", "LGTM", "Reprovado" ou equivalente em nome da IA
- [ ] Todo relatório termina oferecendo as ações ao humano (aprovar / pedir mudanças / detalhar finding / gerar fix)
- [ ] Findings têm IDs estáveis (F1, F2...) referenciáveis em comandos como `/fix F1 F3`

### US-09 — Rastreabilidade da entrega
**Como** Tech Lead, **quero** o diff verificado contra os critérios do ticket/spec,
item a item, **para** revisar a ENTREGA — incluindo o que falta e o que veio a mais —
e não apenas a qualidade do código.

Critérios de aceite:
- [ ] Requisitos da spec numerados (R1, R2...) com status ✅/❌/⬜ e evidência arquivo:linha
- [ ] O checklist da spec é re-verificado item a item durante o second pass (pilar 6: "checklist com second pass") — status atribuído na primeira leitura não é final
- [ ] Mudanças fora da spec (scope creep) são listadas para ciência do humano
- [ ] Requisito ambíguo vira pergunta ou ⬜, nunca interpretação unilateral cobrada do código

### US-10 — Meta-review anti-hallucination
**Como** Dev, **quero** que a IA audite os próprios achados antes de entregar **para**
não receber comentários sobre linhas inexistentes, APIs inventadas ou regras que nenhum
doc contém.

Critérios de aceite:
- [ ] Toda citação de arquivo:linha é reconferida contra o diff real
- [ ] Findings de import fantasma / assinatura inventada / dead code sem confirmação de chamador são removidos ou rebaixados a pergunta
- [ ] Relatório informa o saldo da auditoria: "N auditados, M removidos (motivos)"

---

## Manutenção

### US-11 — Atualizar sem perder configuração
**Como** Dev, **quero** atualizar a skill (`npx pr-review-skill@latest update`) sem
perder meu `PROJECT_PROFILE.md` **para** acompanhar melhorias sem reconfigurar o projeto.

Critérios de aceite:
- [ ] `update` sobrescreve os arquivos da skill e nunca toca no PROJECT_PROFILE.md
- [ ] Adapters não são tocados pelo `update` (regeneráveis com `init --force`)
- [ ] Saída orienta revisar o `git diff` antes de commitar

### US-12 — Diagnóstico da instalação
**Como** Dev, **quero** um comando `doctor` **para** ver rapidamente o que está
instalado, onde, e o que falta (ex.: profile ainda não gerado).

Critérios de aceite:
- [ ] Lista skill canônica, adapters e PROJECT_PROFILE.md com presente/ausente
- [ ] Sai com instrução do próximo passo quando algo essencial falta

---

## Priorização sugerida

| Prioridade | Stories | Racional |
|---|---|---|
| P0 (núcleo de confiança) | US-04, US-07, US-08, US-10 | Sem grounding + precisão + decisão humana + anti-hallucination, o produto não cumpre a promessa |
| P1 (qualidade do review) | US-05, US-06, US-09 | Profundidade e cobertura |
| P2 (adoção) | US-01, US-02, US-03 | Fricção zero de entrada |
| P3 (ciclo de vida) | US-11, US-12 | Relevante a partir da v1.0.1 |

Nota: P0–P2 já estão implementadas na v1.0.0; a tabela serve para orientar testes de
aceitação e a ordem de validação com o time.
