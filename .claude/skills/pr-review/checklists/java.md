# Checklist — Java

> Use durante o passe correspondente. Cada item é verificável contra o diff.
> Itens cobertos por Checkstyle, PMD ou SpotBugs configurados no profile são suprimidos automaticamente.

---

## Correção

- `equals()` sobrescrito sem sobrescrever `hashCode()` (ou vice-versa) — contrato de `Object` violado; comportamento indefinido em `HashMap`/`HashSet`.
- `equals()` comparando com `==` internamente em vez de comparar campos — sempre retorna `false` entre instâncias distintas.
- `NullPointerException` possível: acesso a campo ou método de referência que pode ser `null` sem checagem prévia ou uso de `Optional`.
- `Optional.get()` sem `Optional.isPresent()` — lança `NoSuchElementException`; use `orElse`, `orElseGet` ou `orElseThrow`.
- `String` comparada com `==` em vez de `.equals()` — identidade de referência, não igualdade de valor.
- Autoboxing/unboxing de `Integer`/`Long`/`Double` nulos — `NullPointerException` silencioso na desempacotagem.
- Coleção modificada durante iteração sem uso de `Iterator.remove()` — `ConcurrentModificationException`.
- Cast sem `instanceof` prévio — `ClassCastException` em runtime.
- Retorno de coleção mutável interna de getter (`return this.items`) — encapsulamento quebrado; retorne cópia ou `Collections.unmodifiableList`.
- Comparação de `float`/`double` com `==` — imprecisão de ponto flutuante; use margem de tolerância ou `BigDecimal`.

## Segurança

- Query SQL montada com concatenação de `String` — SQL injection; use `PreparedStatement` com `?`.
- Input externo passado para `Runtime.exec()` / `ProcessBuilder` sem sanitização — injeção de comando.
- `ObjectInputStream.readObject()` com dados de origem não confiável — desserialização arbitrária (gadget chains).
- Chave, senha ou token hardcoded em campo `static final` ou `String` literal.
- `MessageDigest` com `MD5` ou `SHA-1` para hash de senha ou MAC — use `SHA-256` no mínimo ou `bcrypt`/`PBKDF2` para senhas.
- `Math.random()` onde `SecureRandom` é necessário (tokens, sessões, IDs de segurança).
- `HttpURLConnection`/`HttpClient` sem validação de certificado (`TrustAllCerts`) em produção.
- Dados sensíveis logados via `System.out.println` ou logger sem mascaramento.

## Concorrência

- `SimpleDateFormat` compartilhado como campo estático ou de instância entre threads — não thread-safe; use `DateTimeFormatter` (imutável) ou `ThreadLocal`.
- `HashMap`/`ArrayList` compartilhado entre threads sem sincronização — use `ConcurrentHashMap`/`CopyOnWriteArrayList` ou `Collections.synchronized*`.
- `synchronized` em método com escopo mais amplo que o necessário — contenção desnecessária; prefira `ReentrantLock` ou bloco `synchronized` menor.
- `volatile` ausente em variável booleana de flag lida/escrita por múltiplas threads.
- `wait()`/`notify()` fora de bloco `synchronized` — `IllegalMonitorStateException`.
- Thread criada com `new Thread()` em vez de `ExecutorService` — ciclo de vida não gerenciado.
- `CompletableFuture` sem tratamento de exceção (`exceptionally`, `handle`) — falha silenciosa.

## Recursos

- `InputStream`/`OutputStream`/`Connection`/`Statement`/`ResultSet` abertos sem `try-with-resources` — resource leak.
- `close()` chamado apenas no caminho feliz, omitido em bloco `catch` — leak em caso de erro.
- `finally` com `return` ou `throw` — suprime exceção original.

## Testes

- `assertEquals` com argumento esperado e atual invertidos — mensagem de falha enganosa.
- Teste que captura `Exception` genérica para assertions — falhas não relacionadas passam despercebidas.
- `@Test` em método que lança exceção verificada sem `assertThrows` ou `@Test(expected=)` — teste sempre verde.
- Mock sem verificação de interações (`verify(mock).metodo(...)`) quando o comportamento do mock importa.
- Teste de integração sem rollback de transação ou limpeza de banco — estado vaza entre testes.

## Convenções

- Classe utilitária com construtor público — deve ser `private` ou a classe `final` com construtor privado.
- Campo mutável público (`public T field`) em vez de getter/setter — encapsulamento quebrado.
- `instanceof` seguido de cast sem `pattern matching` disponível (Java 16+) — verbosidade desnecessária.
- Uso de `java.util.Date` / `Calendar` em código novo — prefira `java.time.*`.
- `@SuppressWarnings("unchecked")` sem comentário explicando o cast inseguro.
- Método com mais de ~30 linhas sem extração de responsabilidades — sinal de violação de SRP.
