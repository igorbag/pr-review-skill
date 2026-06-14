# Checklist — Ruby

> Use durante o passe correspondente. Cada item é verificável contra o diff.
> Itens cobertos por RuboCop configurado no profile são suprimidos automaticamente.

---

## Correção

- `rescue Exception` — captura `SignalException`, `Interrupt`, `NoMemoryError`; use `rescue StandardError` ou classe específica.
- `rescue` sem identificação da classe de exceção — equivale a `rescue StandardError`, mas implícito e difícil de rastrear.
- Variável de bloco reutilizando nome do escopo externo — shadowing silencioso.
- `||=` usado em campo que pode ser legitimamente `false` ou `nil` — ambos disparam reatribuição; use `defined?` ou ivar checado explicitamente.
- `defined?(@var)` vs `@var.nil?` — confirme qual semântica é necessária (variável existente vs valor nil).
- `Array(nil)` retorna `[]` — comportamento correto ou mascaramento de bug?
- Comparação de `Float` com `==` — imprecisão de ponto flutuante; use margem de tolerância.
- `Kernel#Integer()` vs `String#to_i` — `to_i` retorna 0 para input inválido; `Integer()` lança `ArgumentError`.

## Segurança

- `eval` / `instance_eval` / `class_eval` com input externo — execução de código arbitrário.
- `send` / `public_send` com método derivado de params HTTP — chamada de método arbitrário.
- Atributos permitidos em `strong_parameters` mais amplos do que o necessário (mass assignment via `permit!` ou lista excessiva).
- Query ActiveRecord montada com interpolação de string (`where("name = '#{params[:name]}'")`) — SQL injection; use `where("name = ?", params[:name])`.
- `YAML.load` com dados não confiáveis (Ruby < 4) — use `YAML.safe_load`.
- Chave, token ou senha hardcoded em initializer, config ou migration.
- `render inline:` com template derivado de input externo — XSS / injeção de ERB.
- Cookie sensível sem `httponly: true` e `secure: true`.

## Monkey patching e metaprogramação

- `class String` / `class Integer` (ou qualquer classe nativa) reaberta em código de produção sem namespace — efeito global; prefira módulo de extensão com `refinements`.
- `method_missing` implementado sem `respond_to_missing?` correspondente — `respond_to?` mente.
- `define_method` / `class_eval` com string gerada a partir de input externo — injeção de código.
- `alias_method_chain` (Rails legado) em código novo — use `Module#prepend`.

## Testes

- `before(:all)` / `after(:all)` (RSpec) para setup que modifica estado global — vaza entre exemplos; prefira `before(:each)`.
- Stub / mock sem `expect(...).to receive(...)` quando a chamada é parte do comportamento testado.
- `allow_any_instance_of` — frágil e dificulta refatoração; prefira injeção de dependência.
- Teste que acessa banco de dados real sem `DatabaseCleaner` ou `use_transactional_fixtures`.
- `FactoryBot` com `create` onde `build` ou `build_stubbed` seria suficiente — teste lento desnecessariamente.
- `sleep` em teste para aguardar operação assíncrona — use mocks ou helpers de espera.

## Convenções

- `nil?` check explícito antes de `.present?` / `.blank?` (Rails) — redundante.
- `&.` (operador safe-navigation) encadeado mais de duas vezes — indício de Law of Demeter violada.
- `rescue` em linha (`do_something rescue nil`) — ignora silenciosamente qualquer erro.
- Retorno explícito `return` no meio de método quando o último valor seria suficiente — não-idiomático.
- `puts` / `p` em código de produção — substitua por logger.
- Método com mais de ~10 linhas de lógica condicional aninhada — extraia responsabilidades.
- Símbolo vs string como chave de hash misturados (`{ foo: 1, "bar" => 2 }`) — escolha um padrão e mantenha.
- Uso de `Hash#fetch` sem bloco de default em hash de configuração — `KeyError` não tratado.
