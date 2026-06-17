# Feature: init-ux

> Estende US-01 (installer-cli). Pilar: Adoção (P2) — reduzir fricção de entrada.
> Escopo: UX da saída do `npx pr-review-skill init`. Nenhuma mudança de comportamento
> de instalação (arquivos escritos, idempotência, config) — só apresentação.

## Resumo

Tornar a saída do `init` mais intuitiva: deixar claro **onde** foi instalado, mostrar
**progresso** item a item, e confirmar o **idioma** configurado. Estilo: cores ANSI +
ícones, com degradação graciosa em não-TTY/`NO_COLOR`. Resumo final com local, idioma,
contagem de arquivos e tempo decorrido. Cabeçalho lista ferramentas detectadas.

## Requisitos

- **R1** — No início, imprime cabeçalho `Instalando pr-review-skill em <repo>/` e a lista
  de ferramentas detectadas (ex.: "Detectado: Claude Code, Cursor").
- **R2** — Cada arquivo/alvo é exibido com ícone de status: `✓` escrito, `•` pulado
  (já existe). Caminho relativo legível.
- **R3** — Cores ANSI: verde p/ escrito, cinza p/ pulado, negrito no cabeçalho/resumo.
  Aplicadas **apenas** quando `process.stdout.isTTY` e `NO_COLOR` ausente. Caso
  contrário, texto puro (mesmas palavras, sem códigos de escape).
- **R4** — Bloco-resumo final com: `Local` (dir canônico), `Idioma` (rótulo legível +
  código), contagem (`N escritos, M pulados`) e `Tempo` decorrido (ex.: `0.3s`).
- **R5** — Próximos passos preservados (commit + primeiro review) — R4 do installer-cli.
- **R6** — Confirmação interativa e mensagem de cancelamento permanecem; `--yes` e
  não-TTY continuam sem perguntas.

## Invariantes preservadas

- Nenhuma mudança em quais arquivos são escritos, ordem, idempotência ou config.
- `update`/`doctor` não são tocados (mas o helper de cor pode ser reutilizado).
- Saída continua contendo o caminho canônico e `idioma: <lang>` (testes existentes).

## Critérios de aceitação

1. `init --yes` em TTY com cores → cabeçalho, ícones `✓`, resumo com local+idioma+tempo.
2. `init` com stdout não-TTY ou `NO_COLOR=1` → mesma informação, zero códigos ANSI.
3. Segunda execução sem `--force` → ícones `•` (pulado) e contagem reflete `0 escritos`.
4. Testes existentes (paths, `idioma: <lang>`) continuam passando.
