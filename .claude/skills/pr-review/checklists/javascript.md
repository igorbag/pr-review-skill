# Checklist — JavaScript / TypeScript

> Use durante o passe correspondente. Cada item é verificável contra o diff.
> Itens cobertos por ESLint, Prettier ou Biome configurados no profile são suprimidos automaticamente.

---

## Correção

- `Promise` retornada por função assíncrona não tratada (`floating promise`) — erro silencioso; adicione `await` ou `.catch()`.
- `await` ausente dentro de bloco `try/catch` — exceção da Promise não é capturada pelo `catch`.
- `async` em função que não contém `await` — wrapper desnecessário; retorno vira `Promise<T>` implícita.
- `Promise.all` sem tratamento de rejeição individual — uma falha cancela todas; considere `Promise.allSettled` quando tolerância a falha parcial é necessária.
- `==` / `!=` em vez de `===` / `!==` — coerção de tipo implícita; use igualdade estrita.
- `typeof x === "object"` sem checagem de `null` antes de acessar propriedades — `null` é `"object"`.
- Acesso a índice de array sem verificação de bounds quando tamanho não é garantido.
- Mutação de parâmetro de objeto dentro de função — efeito colateral inesperado para o chamador.
- `parseInt` sem radix (`parseInt("08")` → `0` em engines antigas) — sempre passe `10`.
- `for...in` sobre array — itera chaves enumeráveis, não apenas índices; use `for...of` ou `.forEach`.

## TypeScript

- Tipo `any` em código novo sem comentário justificando — anula type-checking; use `unknown` com narrowing.
- `as T` (type assertion) aplicado a valor externo (resposta de API, JSON) sem validação em runtime — contrato mentido ao compilador.
- `!` (non-null assertion) em valor que pode ser `null`/`undefined` em runtime — NPE equivalente.
- Interface com todos os campos opcionais (`?`) quando campos obrigatórios existem logicamente — use `Required<>` ou separe tipos.
- Enum numérico onde string enum seria mais legível e seguro em serialização/log.
- `@ts-ignore` / `@ts-expect-error` sem comentário explicando o motivo — silencia erros legítimos.
- Retorno de `Promise<void>` onde `Promise<never>` (throw garantido) seria mais preciso.
- Uso de `Function` como tipo em vez de assinatura explícita — perda de segurança.

## Segurança

- `innerHTML` / `outerHTML` / `document.write` com conteúdo derivado de dados externos — XSS.
- `eval()` / `new Function(string)` com input externo — execução de código arbitrário.
- Query SQL / NoSQL montada por concatenação ou template literal com input externo — injeção.
- Chave, token ou senha hardcoded em código-fonte ou arquivo de configuração commitado.
- `JSON.parse` sem `try/catch` sobre input externo — throw não tratado.
- `prototype` ou `__proto__` manipulados a partir de dados externos — prototype pollution.
- `window.location` ou `history.pushState` recebendo URL de input externo sem validação — open redirect.
- Cookie sensível sem flags `HttpOnly`, `Secure`, `SameSite` adequadas.

## Testes

- `it` / `test` assíncrono sem `async`/`await` ou retorno da Promise — falha ignorada pelo runner.
- `expect.assertions(N)` ausente em teste assíncrono com ramificações condicionais — assert nunca executado passa.
- Mock global (`jest.mock`, `vi.mock`) sem `afterEach(() => jest.restoreAllMocks())` — vaza estado entre testes.
- Snapshot test sem revisão do diff ao aprovar mudança — snapshot desatualizado aceito sem crítica.
- `setTimeout` / `setInterval` em teste sem `jest.useFakeTimers()` — teste lento e flaky.
- Teste que depende de ordem de execução de outros testes — isolamento quebrado.

## Convenções

- `var` em código novo — use `const` por padrão, `let` quando necessário.
- `console.log` / `console.error` em código de produção — substitua por logger configurável.
- `require()` misturado com `import/export` em projeto ESM — confusão de módulos.
- Callback hell (mais de 2 níveis de `then` aninhados) — refatore com `async/await`.
- `Object.assign({}, obj)` onde spread `{ ...obj }` seria mais idiomático (ES2018+).
- Ausência de `return` explícito em arrow function de múltiplas linhas — retorna `undefined` silenciosamente.
- Desestruturação com renomear implícito (`const { a: b } = obj`) sem comentário quando o nome original é opaco.
