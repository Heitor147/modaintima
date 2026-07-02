# Documentação Técnica — Sistema de Gestão de Moda Íntima

> **Status:** Snapshot de julho/2026  
> **Versão:** 1.0  
>
> **Progresso geral:** ✅ Autenticação, Produtos e Clientes implementados | ⏳ Estoque, Pedidos, Produção, Financeiro, Relatórios e Frontend em planejamento
> **Última atualização:** 2026-07-01

---

## 1. Stack Tecnológica

| Camada        | Tecnologia              | Status            |
|---------------|-------------------------|-------------------|
| Frontend      | React (pacote base)     | ⏳ Não iniciado     |
| Backend       | Node.js + Fastify       | ✅ Em uso          |
| Comunicação   | Axios                   | ⏳ Planejada        |
| Banco de dados| MySQL                   | ✅ Conectado      |
| ORM / Query   | mysql2 (queries brutas) | ✅ Em uso          |
| Autenticação  | JWT (@fastify/jwt)      | ✅ Implementada   |
| Hash de senha | bcryptjs                | ✅ Em uso (salt 10)|

---

## 2. Arquitetura

### 2.1 Visão Geral

```
Cliente (Frontend planejado)
      │
      │ HTTP/JSON via Axios
      ▼
Fastify (API REST)
      │
      ├─ Routes (wiring)
      ├─ Controllers (HTTP + validation)
      ├─ Services (business logic)
      └─ Repositories (SQL only)
      │
      │ mysql2 pool
      ▼
MySQL (banco de dados)
```

### 2.2 Padrão Arquitetural (Vertical Slice)

O backend passou a ser organizado por **feature**. Cada slice concentra as responsabilidades do seu módulo e reduz acoplamento entre áreas diferentes.

Fluxo de cada requisição:

```
Request HTTP
    ↓
Feature route
    ↓
Feature controller
    ↓
Feature service
    ↓
Feature repository
    ↓
MySQL
```

**Regra crítica:** cada feature é dona do seu fluxo completo. Controllers não acessam SQL diretamente; o acesso sempre passa por `service → repository` dentro da própria feature.

### 2.3 Comunicação Backend ↔ Banco de Dados

- **Driver:** `mysql2` com pool de conexões
- **Configuração:** `Backend/src/db/connection.js`
- **Status:** ✅ Validado via `Backend/src/db/test-connection.js`

---

## 3. Estado Atual da Implementação (julho/2026)

### 3.1 ✅ Implementado: Módulo de Autenticação

**Endpoints:**
```
POST   /auth/register       (público)  - Registro de novo usuário
POST   /auth/login          (público)  - Login com email + senha
POST   /auth/logout         (protegido)- Logout
GET    /auth/me             (protegido)- Dados do usuário autenticado
```

**Estrutura:**
```
Backend/src/features/auth/
├── auth.routes.js                      (wiring de rotas)
├── auth.controller.js                  (validação, chamadas à service)
├── auth.service.js                     (lógica de negócio)
└── auth.repository.js                  (SQL puro)
```

**Fluxo de exemplo (register):**
1. `POST /auth/register` → `auth.controller.register()` (valida JSON)
2. → `auth.service.register()` (hash de senha, cheque de email duplicado)
3. → `auth.repository.create()` (insere no banco)
4. → JWT gerado com expiração 24h
5. → Retorna token + dados do usuário

**Detalhes técnicos:**
- Senha: hash bcryptjs com salt factor 10
- JWT: expiração 24h, claims: `sub` (user ID), `email`, `perfil`
- Proteção de rotas: middleware Fastify JWT
- Validação: JSON Schema no Fastify

### 3.2 ✅ Implementado: Módulo de Produtos

**Endpoints:**
```
GET    /produtos          (público)    - Listagem de produtos
GET    /produtos/:id      (público)    - Detalhe de produto
POST   /produtos          (protegido)  - Criação
PUT    /produtos/:id      (protegido)  - Atualização
DELETE /produtos/:id      (protegido)  - Inativação (ativo=0)
```

**Estrutura:**
```
Backend/src/features/produtos/
├── produtos.routes.js                  (wiring de rotas)
├── produtos.controller.js              (HTTP + validação de input)
├── produtos.service.js                 (lógica de negócio)
└── produtos.repository.js              (SQL puro)
```

**Detalhes técnicos:**
- Campos implementados: nome, categoria, cor, tamanho, preco_custo, preco_venda, preco_unitario, estoque_minimo e ativo
- Exclusão lógica: DELETE marca `ativo = 0`
- Validação: rotas protegidas usam `app.authenticate`
- Repositório: operações de listar, buscar, criar, atualizar e inativar

### 3.3 ✅ Implementado: Módulo de Clientes

**Endpoints:**
```
GET    /clientes          (público)    - Listagem de clientes
GET    /clientes/:id      (público)    - Detalhe de cliente
POST   /clientes          (protegido)  - Criação
PUT    /clientes/:id      (protegido)  - Atualização
DELETE /clientes/:id      (protegido)  - Inativação (ativo=0)
```

**Estrutura:**
```
Backend/src/features/clientes/
├── clientes.routes.js                  (wiring de rotas)
├── clientes.controller.js              (HTTP + validação de input)
├── clientes.service.js                 (lógica de negócio)
└── clientes.repository.js              (SQL puro)
```

**Detalhes técnicos:**
- Campos implementados: nome, cpf, telefone, email, endereco e ativo
- CPF e email possuem tratamento de duplicidade no repositório
- Exclusão lógica: DELETE marca `ativo = 0`
- Validação: criação e atualização exigem `nome` e `cpf`

### 3.4 ⏳ Planejado: Módulos Operacionais

Os seguintes módulos ainda não foram implementados no código atual:

#### Estoque
- RF01: Registro de entradas/saídas
- RF02: Consulta de saldo atual
- RF03: Alerta de estoque mínimo
- RF04: Ajustes manuais de inventário

#### Pedidos / Vendas
- RF05: Criação de pedidos vinculados a cliente
- RF06: Múltiplos itens por pedido (produto + quantidade)
- RF07: Ciclo de status (Aguardando → Em produção → Pronto → Entregue / Cancelado)
- RF08: Forma e status de pagamento
- RF09: Cancelamento com registro de motivo

#### Produção / Costura
- RF10: Criar ordens de produção vinculadas a pedidos
- RF11: Atribuir responsável e prazo
- RF12: Acompanhar status (Pendente → Em andamento → Concluída)
- RF13: Registro de data de conclusão real

#### Financeiro
- RF14: Receitas automáticas ao fechar pedido + despesas manuais
- RF15: Categorização de despesas
- RF16: Saldo do período (receitas − despesas)
- RF17: Status de pagamento (Pendente / Pago / Atrasado)

#### Relatórios
- RF18: Vendas por período
- RF19: Produtos mais vendidos
- RF20: Clientes com maior volume
- RF21: Fluxo de caixa
- RF22: Produção por status/responsável

---

## 4. Estrutura de Pastas

### 4.1 Backend (Real + Alvo)

```
Backend/
├── requests.http                       # ✅ Coleção de requisições manuais
├── sql/
│   └── create_schema_and_seed.sql      # ✅ Schema do banco e dados iniciais
│
├── src/
│   ├── server.js                       # ✅ Fastify setup, plugins, erro handler
│   ├── package.json                    # ✅ Dependências
│   ├── .env                            # ✅ Variáveis de ambiente
│   ├── .env.example                    # ✅ Exemplo de env
│   │
│   ├── config/
│   │   └── env.js                      # ✅ Validação de variáveis de ambiente
│   │
│   ├── features/                       # Vertical slices por módulo
│   │   ├── auth/
│   │   │   ├── auth.routes.js          # ✅ Wiring do módulo
│   │   │   ├── auth.controller.js      # ✅ HTTP + validação de input
│   │   │   ├── auth.service.js         # ✅ Regras de negócio
│   │   │   └── auth.repository.js      # ✅ SQL puro do módulo
│   │   ├── clientes/
│   │   │   ├── clientes.routes.js      # ✅ Wiring do módulo
│   │   │   ├── clientes.controller.js  # ✅ HTTP + validação de input
│   │   │   ├── clientes.service.js     # ✅ Regras de negócio
│   │   │   └── clientes.repository.js  # ✅ SQL puro do módulo
│   │   └── produtos/
│   │       ├── produtos.routes.js      # ✅ Wiring do módulo
│   │       ├── produtos.controller.js  # ✅ HTTP + validação de input
│   │       ├── produtos.service.js     # ✅ Regras de negócio
│   │       └── produtos.repository.js  # ✅ SQL puro do módulo
│   │
│   ├── middlewares/
│   │   └── auth.js                     # ✅ JWT cookie settings + authenticate hook
│   │
│   ├── db/
│   │   ├── connection.js               # ✅ Pool de conexão MySQL
│   │   ├── transaction.js              # ✅ Utilitários de transação
│   │   └── test-connection.js          # ✅ Script de teste de conexão
│   │
│   ├── scripts/
│   │   └── test-login.js               # ✅ Script auxiliar de autenticação
│   │
│   ├── routes/                         # Legado/compatibilidade durante migração
│   ├── controllers/                    # Legado/compatibilidade durante migração
│   ├── services/                       # Legado/compatibilidade durante migração
│   └── repositories/                   # Legado/compatibilidade durante migração
│
├── test/
│   └── integration_tests.sh            # ⏳ Testes de integração
│
└── node_modules/                       # Gerenciado por npm
```

### 4.2 Frontend (Real + Alvo)

```
Frontend/
└── package.json                        # ✅ Pacote base React
```

Ainda não há `src/`, Vite, variáveis de ambiente ou scripts de execução no frontend.

---

## 5. Banco de Dados

### 5.1 Tabelas Implementadas

#### `usuarios` ✅
| Campo      | Tipo         | Atributos                 |
|------------|--------------|---------------------------|
| id         | INT          | PK, AUTO_INCREMENT        |
| email      | VARCHAR(255) | UNIQUE, NOT NULL          |
| nome       | VARCHAR(255) | NOT NULL                  |
| senha_hash | VARCHAR(255) | NOT NULL                  |
| created_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP |

> Observação: o código de autenticação ainda aceita `perfil` e `ativo` quando essas colunas existem, mas elas não fazem parte do schema atual.

#### `produtos` ✅
| Campo          | Tipo          | Atributos                |
|----------------|--------------|--------------------------|
| id             | INT          | PK, AUTO_INCREMENT       |
| nome           | VARCHAR(255) | NOT NULL                 |
| categoria      | VARCHAR(255) | NULL                     |
| cor            | VARCHAR(100) | NULL                     |
| tamanho        | VARCHAR(50)  | NULL                     |
| preco_custo    | DECIMAL(10,2)| NULL                     |
| preco_venda    | DECIMAL(10,2)| NULL                     |
| preco_unitario | DECIMAL(10,2)| NULL                     |
| estoque_minimo | INT          | NOT NULL DEFAULT 0       |
| ativo          | TINYINT(1)   | NOT NULL DEFAULT 1       |
| criado_em      | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP |

#### `clientes` ✅
| Campo      | Tipo          | Atributos                |
|------------|--------------|--------------------------|
| id         | INT          | PK, AUTO_INCREMENT       |
| nome       | VARCHAR(255) | NOT NULL                 |
| cpf        | VARCHAR(14)  | NULL, UNIQUE             |
| telefone   | VARCHAR(50)  | NULL                     |
| email      | VARCHAR(255) | NULL, UNIQUE             |
| endereco   | VARCHAR(500) | NULL                     |
| ativo      | TINYINT(1)   | NOT NULL DEFAULT 1       |
| criado_em  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP |

### 5.2 Tabelas Planejadas

#### `estoque` ⏳
| Campo      | Tipo     | Atributos                  |
|------------|----------|----------------------------|
| id         | INT      | PK, AI                     |
| produto_id | INT      | FK → produtos.id           |
| tipo       | ENUM     | entrada ou saida           |
| quantidade | INT      |                            |
| motivo     | VARCHAR  | compra, venda, ajuste      |
| criado_em  | DATETIME | DEFAULT NOW()              |

#### `pedidos` ⏳
| Campo            | Tipo     | Atributos                       |
|------------------|----------|---------------------------------|
| id               | INT      | PK, AI                          |
| cliente_id       | INT      | FK → clientes.id                |
| status           | ENUM     | aguardando, em_producao, pronto, entregue, cancelado |
| forma_pagamento  | ENUM     | pix, dinheiro, cartao           |
| status_pagamento | ENUM     | pendente, pago, atrasado        |
| total            | DECIMAL  | Calculado                       |
| criado_em        | DATETIME | DEFAULT NOW()                   |

#### `pedido_itens` ⏳
| Campo      | Tipo    | Atributos           |
|------------|---------|---------------------|
| id         | INT     | PK, AI              |
| pedido_id  | INT     | FK → pedidos.id     |
| produto_id | INT     | FK → produtos.id    |
| quantidade | INT     |                     |
| preco_unit | DECIMAL | Preço no momento    |

#### `producao` ⏳
| Campo          | Tipo     | Atributos                       |
|----------------|----------|---------------------------------|
| id             | INT      | PK, AI                          |
| pedido_id      | INT      | FK → pedidos.id                 |
| responsavel    | VARCHAR  |                                 |
| status         | ENUM     | pendente, em_andamento, concluida |
| prazo_estimado | DATE     |                                 |
| data_conclusao | DATE     | Nullable                        |
| criado_em      | DATETIME | DEFAULT NOW()                   |

#### `financeiro` ⏳
| Campo      | Tipo     | Atributos                    |
|------------|----------|------------------------------|
| id         | INT      | PK, AI                       |
| tipo       | ENUM     | receita ou despesa           |
| descricao  | VARCHAR  |                              |
| categoria  | VARCHAR  | venda, matéria-prima, etc    |
| valor      | DECIMAL  |                              |
| status     | ENUM     | pendente, pago, atrasado     |
| pedido_id  | INT      | FK → pedidos.id (nullable)   |
| criado_em  | DATETIME | DEFAULT NOW()                |

---

## 6. Como Executar

### 6.1 Backend

```bash
cd Backend/src

# Instalar dependências
npm install

# Definir variáveis de ambiente
cp .env.example .env
# editar .env com dados do banco MySQL

# Testar conexão com banco
node db/test-connection.js

# Iniciar servidor em desenvolvimento
npm run dev

# Servidor será executado em: http://localhost:3000 (ou porta definida em .env)
```

### 6.2 Frontend

```bash
cd Frontend

# Instalar dependências base
npm install

# Ainda não existe app executável, Vite ou arquivo .env no frontend
```

---

## 7. Convenções de Código

### 7.1 Nomes de Arquivo

- **Controllers:** `nome.controller.js` (ex: `produtos.controller.js`)
- **Services:** `nome.service.js` (ex: `produtos.service.js`)
- **Repositories:** `nome.repository.js` (ex: `produtos.repository.js`)
- **Routes:** `nome.routes.js` (ex: `produtos.routes.js`)

### 7.2 Nomes de Função

- Controllers, Services, Repositories: camelCase (ex: `findByEmail`, `createProduct`)
- Arquivo de rotas: export nomeado (ex: `export async function produtosRoutes(app)`)

### 7.3 Padrão de Resposta HTTP

**Sucesso (2xx):**
```json
{
    "message": "Descrição do sucesso",
    "cliente": { ... }
}
```

**Erro (4xx/5xx):**
```json
{
  "error": "BadRequest" ou "NotFound" ou "InternalServerError",
  "message": "Descrição legível do erro",
  "details": null
}
```

### 7.4 Estrutura de Validação de Rotas

Usar JSON Schema no Fastify:
```javascript
app.post('/endpoint', { schema: { body: {...} } }, handler)
```

---

## 8. Regras de Negócio

### 8.1 Regras já cobertas no código

- Autenticação com registro, login, logout e consulta do usuário autenticado
- Produtos com CRUD e inativação lógica (`ativo = 0`)
- Clientes com CRUD e inativação lógica (`ativo = 0`)

### 8.2 Regras planejadas

(Vide arquivo `requisitos.md` para detalhes completos)

**RN01** — Um pedido só pode ser criado para cliente ativo  
**RN02** — Ao confirmar pedido, estoque é decrementado automaticamente  
**RN03** — Ao cancelar pedido, estoque é restaurado  
**RN04** — Pedido com status `Entregue` não pode ser editado  
**RN05** — Ao fechar pedido (`Entregue`), uma receita é gerada no financeiro  
**RN06** — Produtos inativados não aparecem na seleção de novos pedidos  
**RN07** — Não é permitido excluir produtos, clientes ou pedidos — apenas inativar/cancelar

---

## 9. Roadmap de Implementação

| Fase | Módulo      | Estimativa | Status   |
|------|-------------|------------|----------|
| 1    | Auth        | ✅ Completo | ✅ Done  |
| 2    | Produtos    | ✅ Completo | ✅ Done  |
| 3    | Estoque     | ~5 dias    | ⏳ To-do |
| 4    | Clientes    | ✅ Completo | ✅ Done  |
| 5    | Pedidos     | ~8 dias    | ⏳ To-do |
| 6    | Produção    | ~5 dias    | ⏳ To-do |
| 7    | Financeiro  | ~5 dias    | ⏳ To-do |
| 8    | Relatórios  | ~5 dias    | ⏳ To-do |
| 9    | Frontend    | ~20 dias   | ⏳ To-do |
| 10   | Testes      | ~5 dias    | ⏳ To-do |

---

## 10. Variáveis de Ambiente

### Backend (.env)

```
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=moda_intima

JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRATION=24h

LOG_LEVEL=debug
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

---

## 11. Referências

- [Fastify Docs](https://www.fastify.io/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)

---

**Última atualização:** 2026-05-13  
**Responsável:** Heitor Henrique Sampaio Chagas
**Próxima revisão:** Quando novo módulo for implementado
