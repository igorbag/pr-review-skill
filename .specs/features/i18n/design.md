# Design: i18n

## Componentes tocados

```
bin/cli.js          → parseArgs: --lang <code> (valida contra SUPPORTED_LANGS → exit 2)
src/lib/paths.js    → CONFIG_FILENAME, SUPPORTED_LANGS, DEFAULT_LANG, LANG_LABELS
src/lib/skillfs.js  → guard: nunca copia pr-review.config.json (igual PROFILE)
src/commands/init.js→ resolve lang (flag→prompt→default) + grava config.json
src/commands/update.js → preserva config.json byte-a-byte (igual PROFILE)
src/commands/doctor.js → reporta config + idioma
skill/SKILL.md      → passo: ler config.json, emitir relatório no idioma
README.md           → seção i18n
```

## paths.js (novas exports)

```js
export const CONFIG_FILENAME = 'pr-review.config.json';
export const SUPPORTED_LANGS = ['pt-BR', 'en', 'es'];
export const DEFAULT_LANG = 'pt-BR';
export const LANG_LABELS = { 'pt-BR': 'Português (pt-BR)', en: 'English', es: 'Español' };
```

## Resolução do idioma (init.js)

```
writeConfig = configAbsent || force || langFlagPresent
shouldPrompt = TTY && !yes && writeConfig && !langFlagPresent
lang =
  langFlag (já validado)            // 1
  || (shouldPrompt ? promptLang())  // 2  (vazio → DEFAULT_LANG)
  || readExistingLang(config)       // 3  (se existe, para reportar)
  || DEFAULT_LANG                   // 4
if (writeConfig) write({ lang })
else skip (preserva escolha manual)
```

- `langFlag` validado em `parseArgs` (lança → exit 2 em código inválido).
- Config gravado com `JSON.stringify({ lang }, null, 2) + '\n'`.

## update.js

Estende a lógica defensiva existente do PROFILE para também preservar
`CONFIG_FILENAME`: lê antes do `copySkill(force)`, restaura depois. (Na prática
`copySkill` já não toca o config pela guard de skillfs, mas a restauração é
defensiva e simétrica ao profile.)

## skillfs.js

`copySkill` pula `path.basename(relpath) === CONFIG_FILENAME` além do PROFILE.
(O config nunca está em `skill/`, mas a guard documenta a invariante.)

## SKILL.md (consumo)

Na seção 0 (pré-condição), antes do grounding: ler
`<canonicalDir>/pr-review.config.json`. Se ausente → `lang = pt-BR`. Registrar
`{{LANG}}`. Na seção 7 (Relatório): o relatório final — títulos, rótulos de
seção e texto dos findings — é escrito em `{{LANG}}`, preservando a estrutura do
`relatorio.template.md`. Citações de código/diff e nomes de arquivo não são
traduzidos.

## Não-objetivos

- Traduzir os arquivos internos da skill (passes/template).
- i18n da própria CLI (mensagens do installer permanecem pt-BR).
