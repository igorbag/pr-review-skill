# Checklist — Kotlin

> Use durante o passe correspondente. Cada item é verificável contra o diff.
> Itens cobertos por ktlint ou Detekt configurados no profile são suprimidos automaticamente.

---

## Correção

- `!!` (non-null assertion) em produção sem comentário explicando por que o valor nunca é null — NPE silencioso em runtime.
- `lateinit var` acessado antes de inicialização — `UninitializedPropertyAccessException` em runtime.
- `lateinit var` em campo que poderia ser `val` com inicialização lazy (`by lazy`) — mutabilidade desnecessária.
- `by lazy` sem `LazyThreadSafetyMode.NONE` em contexto single-thread ou sem sincronização adequada em multi-thread.
- `data class` herdando de outra `data class` — `equals`/`hashCode` do pai não considera propriedades do filho.
- `equals` sobrescrito sem sobrescrever `hashCode` (ou vice-versa) — contrato de `Any` violado.
- Comparação de `String` com `==` onde o contrato de igualdade estrutural é correto em Kotlin — ok, mas confirme que não é identidade de referência Java sendo buscada.
- `when` sem ramo `else` sobre tipo não-sealed — comportamento silencioso em novos valores.
- `copy()` de `data class` com propriedade mutável (lista, mapa) — cópia rasa; mudanças no original afetam a cópia.
- Uso de `Array` em vez de `List`/`Collection` em API pública — variância e nullability mais difíceis de controlar.

## Segurança

- Chave, senha ou token hardcoded em string literal ou objeto companion.
- `String.format` / interpolação `${}` usada para montar query SQL sem prepared statement.
- Input externo passado para `ProcessBuilder` / `Runtime.exec` sem sanitização.
- Serialização/desserialização de classe arbitrária sem validação de tipo (Jackson `enableDefaultTyping` habilitado).
- Dependência anotada `@Suppress("UNCHECKED_CAST")` em caminho que processa dados externos.

## Coroutines

- `runBlocking` chamado em thread principal (Android main thread ou servidor NIO) — bloqueia o dispatcher.
- `GlobalScope.launch` / `GlobalScope.async` — escopo não estruturado; cancellation e erro não propagam.
- `async` sem `await` no mesmo escopo — exceção engolida silenciosamente.
- `launch` sem tratamento de exceção — `CoroutineExceptionHandler` ausente em escopo raiz.
- `withContext(Dispatchers.IO)` dentro de loop que poderia ser paralelizado com `async`/`awaitAll`.
- `flow` com `collect` em escopo que não sobrevive ao ciclo de vida adequado (Android: sem `lifecycleScope` / `repeatOnLifecycle`).
- Cancelamento de coroutine não cooperativo — lógica sem checagem de `isActive` em loop longo.
- `delay(0)` usado como yield — prefira `yield()` explícito.

## Testes

- Teste de coroutine sem `runTest` (ou `runBlockingTest` legado) — tempo real consumido em `delay`.
- Mock sem verificação de que métodos suspensos foram chamados a quantidade correta de vezes.
- `StateFlow` / `SharedFlow` testado sem `turbine` ou coleta explícita — assertions sobre estado transitório.
- Teste que depende de `GlobalScope` — não cancela ao fim do teste; interfere em outros.

## Convenções

- `object` companion com `@JvmStatic` desnecessário em código puro Kotlin — complexidade sem benefício.
- `sealed class` com subclasses em arquivos separados do mesmo pacote sem razão de organização clara.
- Função de extensão sobre tipo de terceiro adicionada em arquivo de produção — prefira arquivo dedicado de extensões.
- `apply` / `also` / `let` / `run` aninhados mais de dois níveis — dificulta rastreamento de `it`/`this`.
- `@Suppress` sem comentário explicando o motivo da supressão.
- Uso de `java.util.Date` / `Calendar` em código novo — prefira `java.time.*` ou kotlinx-datetime.
- Parâmetro nullable (`T?`) em função que poderia usar valor padrão (`= null`) sem tratar null no corpo.
