# Checklist — Go

> Use durante o passe correspondente. Cada item é verificável contra o diff.
> Itens cobertos por golangci-lint configurado no profile são suprimidos automaticamente.

---

## Correção

- Erro retornado por função ignorado sem `_` explícito — verifique se o silêncio é intencional e justificado.
- `err` reatribuído com `:=` dentro de bloco quando variável homônima existe no escopo externo — shadowing silencioso.
- Slice ou map inicializado como `nil` e depois escrito sem `make` — panic em runtime.
- Retorno de variável de loop por ponteiro (`&v` dentro de `for _, v := range`) — todos apontam para o mesmo endereço.
- Conversão de `int` para `int32`/`int16` sem checagem de overflow em caminhos críticos.
- Comparação de `error` com `==` em vez de `errors.Is` quando a cadeia de wrap importa.
- `errors.As` usado com tipo não-ponteiro — nunca faz match.
- Função que retorna `(T, error)` retornando valor não-zero junto com erro — contrato ambíguo para o chamador.
- Struct com campos exportados e `json:"-"` ou `yaml:"-"` usados incorretamente — dados sensíveis expostos ou campos obrigatórios omitidos.

## Segurança

- Input externo interpolado diretamente em query SQL sem `?` / `$N` — SQL injection.
- `fmt.Sprintf` / concatenação usada para montar queries — mesma classe de risco.
- Chave ou segredo hardcoded em string literal ou constante.
- `os/exec.Command` com argumento construído a partir de input externo sem sanitização.
- `http.ListenAndServe` exposto sem TLS em serviço não-local.
- Uso de `crypto/md5` ou `crypto/sha1` para propósito criptográfico (hash de senha, MAC).
- `math/rand` usado onde `crypto/rand` é necessário (tokens, nonces, IDs de segurança).
- `ioutil.ReadAll` / `io.ReadAll` sem limite de tamanho em endpoint de upload ou streaming.

## Goroutines e concorrência

- Goroutine disparada sem mecanismo de espera (`sync.WaitGroup`, canal, `errgroup`) — leak potencial.
- `defer wg.Done()` ausente ou colocado após código que pode retornar antes.
- Variável compartilhada entre goroutines sem mutex ou canal — data race.
- `sync.Mutex` copiado por valor após primeiro uso — comportamento indefinido.
- Canal criado mas nunca fechado quando consumidores esperam pelo fechamento para terminar.
- `select` sem `default` em goroutine que deve ser não-bloqueante.
- `context.WithCancel` sem `defer cancel()` — goroutine e recursos não liberados.
- Contexto não propagado para chamadas de I/O (DB, HTTP, gRPC) dentro de handler.

## Defer e recursos

- `defer` dentro de loop — execução adiada até o fim da função, não da iteração; use função auxiliar.
- `rows.Close()` sem `defer` ou fora do caminho de erro — connection leak.
- `resp.Body.Close()` ausente ou só no caminho feliz — body e conexão não liberados.
- Arquivo aberto com `os.Open`/`os.Create` sem `defer f.Close()`.

## Testes

- Teste sem `t.Parallel()` em suite que poderia paralelizar — suíte lenta desnecessariamente.
- `t.Fatal` / `t.FailNow` chamado de goroutine filha — panic em vez de falha de teste.
- Asserção sem mensagem descritiva quando o valor esperado não é óbvio.
- Mock ou stub de interface não verifica que todos os métodos esperados foram chamados.
- Teste de integração sem cleanup (`t.Cleanup`, `defer`) — estado vaza entre testes.
- Subteste (`t.Run`) com nome não determinístico — dificulta reruns de falha específica.

## Convenções

- Pacote nomeado com underscore ou letra maiúscula — viola `gofmt` e convenção Go.
- Exported type/function sem comentário de documentação quando é API pública.
- Constantes de erro definidas como `string` em vez de tipo `error` customizado — difícil de comparar.
- `init()` com efeitos colaterais visíveis — difícil de testar e de rastrear ordem de inicialização.
- Interface com mais de 3–4 métodos definida no pacote produtor em vez de no consumidor.
- Uso de `interface{}` / `any` onde um tipo concreto ou genérico seria expresso — perda de segurança de tipo.
