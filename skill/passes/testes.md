# Passe: Testes

Agente focado na **cobertura e qualidade dos testes** do diff. Roda isolado: carrega só este
arquivo, emite findings candidatos, devolve o controle.

## Escopo

- Código de produção novo/alterado sem teste correspondente quando o repo tem suíte de testes.
- Caminho crítico alterado (branch de erro, regra de negócio) sem caso que o exercite.
- Teste que não asserta nada de relevante, ou que testa o mock e não o comportamento.
- Teste alterado para "passar" mascarando regressão (asserção enfraquecida/removida sem motivo).
- Caso de borda óbvio do código novo sem cobertura (vazio, nulo, limite, erro).
- Teste flaky introduzido: dependência de tempo, ordem, estado global, rede real.

## Fora de lane (NÃO faça)

- **Não** comente correção, segurança, spec ou estilo — outros passes.
- **Não** exija teste para código trivial (getter, DTO, constante) nem para arquivos gerados.
- **Não** comente cobertura de código fora do diff.
- **Não** invente o nome de um teste que "deveria existir" sem checar a suíte real do repo.

## Consulte a checklist da linguagem (R8)

Para cada stack do profile, carregue `skill/checklists/<lang>.md` e aplique a seção de testes
(framework de teste do projeto, padrões de mock, convenção de nome/arquivo de teste).

## Rubrica de confiança (0–100%)

- **90–100%** — lacuna clara: lógica nova relevante no diff, nenhum teste a cobre (e o repo
  tem suíte de testes onde caberia).
- **80–89%** — provável lacuna; depende de saber se há teste fora do diff (assuma o que o diff mostra).
- **< 80%** — não dá para afirmar sem ver a suíte completa. **Descarte** (R12) ou vire pergunta.

## Formato de saída (findings candidatos)

```
- arquivo:linha — <lacuna ou problema de teste>
  Lado: <novo | antigo | contexto>          ← onde postar o comentário no PR (R25)
  Evidência: <trecho do diff: o que mudou sem teste / asserção enfraquecida>
  Confiança: <0–100>%
  Comentário sugerido: <texto curto ao autor do PR, pronto p/ colar (R26)>
  Citação: <doc de testes do repo, se a regra (ex.: "todo handler precisa de teste") vier de doc obrigatório>
```

Exigência de teste que venha de **convenção de projeto** só com citação de doc obrigatório (R3);
sem doc citável, no máximo pergunta. Itens cobertos por gate de cobertura/linter do repo: suprima (R4).
