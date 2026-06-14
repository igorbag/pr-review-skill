# PROJECT_PROFILE

<!-- Gerado automaticamente no primeiro review. Edite à mão sempre que necessário.
     `npx pr-review-skill update` NUNCA sobrescreve este arquivo. -->

## Stack

- Linguagem: JavaScript (ESM, `"type": "module"`), Node ≥ 18
- Framework: nenhum (CLI Node puro; só `node:` builtins)
- Build: nenhum (sem step de build); testes via `node --test`

## Linters e formatters

- nenhum configurado (sem ESLint, Prettier, Biome ou .editorconfig no repo)
  → o review **não** suprime comentários de estilo por ferramenta; mesmo assim,
  estilo só vira finding se ancorado em doc obrigatório (R3).

## Docs

| Doc | Papel | Carga |
|---|---|---|
| `CLAUDE.md` | convenções + arquitetura | obrigatório |
| `README.md` | onboarding | obrigatório |
| `.specs/project/PROJECT.md` | produto | sob demanda |
| `.specs/project/ROADMAP.md` | produto | sob demanda |
| `.specs/project/STATE.md` | arquitetura (decisões D1–D8) | obrigatório |
| `docs/us.md` | produto (user stories) | sob demanda |
| `.specs/features/*/spec.md` | produto (specs por feature) | sob demanda |

## Lacunas conhecidas

- sem doc de segurança (sem `SECURITY.md` nem threat model) — passe de segurança
  roda sem regra de projeto citável; suspeitas viram pergunta, não finding (R3).
- sem guia de testes dedicado — convenção de teste inferida de `CLAUDE.md`
  (seção "Test structure": `node:test`, temp dirs, R1–Rn nas descrições).
