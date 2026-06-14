# Checklist — Python

> Use durante o passe correspondente. Cada item é verificável contra o diff.
> Itens cobertos por ruff, flake8, black ou mypy configurados no profile são suprimidos automaticamente.

---

## Correção

- `except:` ou `except Exception:` sem re-raise e sem log — exceção engolida silenciosamente.
- `except Exception as e: pass` — ignora qualquer falha; use `except SpecificError`.
- Argumento padrão mutável (`def f(x=[])`, `def f(x={})`) — compartilhado entre chamadas; use `None` + inicialização no corpo.
- `is` / `is not` usado para comparar valores (strings, inteiros fora de `-5..256`, floats) em vez de `==` / `!=`.
- Comparação com `None` usando `==` em vez de `is None` / `is not None`.
- Variável de loop de compreensão vazando para o escopo externo em Python 2 — não se aplica a Python 3, mas confirme versão mínima.
- `open()` sem `with` — arquivo não fechado em caso de exceção.
- Leitura de arquivo inteiro com `f.read()` sem limite em endpoint que recebe upload.
- `str` concatenado em loop com `+=` sobre lista grande — O(n²); use `"".join(lista)`.
- Fatia de lista usada como cópia rasa quando cópia profunda é necessária.

## Segurança

- `eval()` / `exec()` com input derivado de dados externos — execução de código arbitrário.
- `pickle.loads()` / `pickle.load()` com dados não confiáveis — desserialização arbitrária.
- `subprocess.shell=True` com argumento construído de input externo — injeção de shell.
- Query SQL montada com `%` ou `.format()` em vez de parâmetros (`?`, `%s`) — SQL injection.
- `yaml.load()` sem `Loader=yaml.SafeLoader` — execução de código YAML.
- Chave, senha ou token hardcoded em string literal ou constante de módulo.
- `hashlib.md5()` / `hashlib.sha1()` para hash de senha ou MAC — use `bcrypt`, `argon2` ou `hashlib.sha256` com salt adequado.
- `secrets` não usado onde `random` seria inseguro (tokens, senhas, nonces).
- `tempfile.mktemp()` (deprecated, race condition) em vez de `tempfile.mkstemp()`.
- Deserialização de JSON sem validação de schema quando a fonte é externa.

## Tipagem e contratos

- Type hint declarado como não-nullable mas corpo não garante não-None — contrato mentido.
- `Any` em type hint de função pública sem justificativa — perda de segurança de tipo.
- `cast()` do `typing` sem comentário explicando por que o tipo inferido está errado.
- Função que retorna `Optional[T]` sem que o chamador trate o caso `None`.
- `TypedDict` com campos `total=False` onde campos obrigatórios são esperados — KeyError em runtime.

## Testes

- `unittest.TestCase` com `assert` nativo em vez de `self.assert*` — falha silenciosa em alguns runners.
- Fixture de pytest sem `yield` quando cleanup é necessário — recursos não liberados.
- Mock sem `assert_called_once_with` / `assert_called_with` quando o argumento importa.
- Patch de módulo feito no caminho errado (`patch("original.module.X")` em vez de `patch("tested_module.X")`).
- Teste que modifica variável global ou estado de módulo sem restaurar ao fim.
- `time.sleep` em teste — use `freezegun` ou mock de `datetime` para testes de tempo.

## Convenções

- Import de `*` em módulo de produção (`from x import *`) — polui namespace, dificulta rastreamento.
- Import circular entre módulos — sintoma de acoplamento; reestruture ou use import local.
- Função com mais de um nível de indentação de `try/except` aninhados — extraia funções auxiliares.
- `global` ou `nonlocal` em função de produção sem necessidade clara — prefira retornar valor.
- `print()` em código de produção que deveria usar `logging`.
- Classe que herda de `object` explicitamente em Python 3 — desnecessário.
- Uso de `%`-formatting ou `.format()` onde f-string seria mais legível (Python 3.6+).
