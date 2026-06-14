# Tasks: i18n

| # | Tarefa | Arquivos | Done when | Req |
|---|---|---|---|---|
| T1 | Constantes de idioma | `src/lib/paths.js` | exporta CONFIG_FILENAME, SUPPORTED_LANGS, DEFAULT_LANG, LANG_LABELS | R3,R4 |
| T2 | Guard no copy | `src/lib/skillfs.js` | copySkill pula CONFIG_FILENAME | R5 |
| T3 | Flag --lang + validação | `bin/cli.js` | parseArgs aceita --lang, valida, USAGE atualizado | R1 |
| T4 | Resolução + escrita do config | `src/commands/init.js` | grava config conforme regra de resolução; prompt interativo | R2,R3,R4 |
| T5 | Preservação no update | `src/commands/update.js` | config byte-a-byte após update | R6 |
| T6 | doctor reporta idioma | `src/commands/doctor.js` | mostra config + lang | R7 |
| T7 | Consumo na skill | `skill/SKILL.md` | passo de leitura do config + emissão no idioma | R8 |
| T8 | README | `README.md` | seção i18n | R9 |
| T9 | Testes | `test/cli.test.js` | R1–R7 cobertos, npm test verde | R10 |

Ordem: T1 → T2/T3 → T4 → T5/T6 → T7/T8 → T9.
