# Documentação Técnica — Sistema de Gestão de Moda Íntima

> **Status:** Snapshot de maio/2026  
> **Versão:** 1.0  
> **Última atualização:** 2026-05-13
>
> **Progresso geral:** ✅ Autenticação implementada | ⏳ Módulos operacionais em planejamento

---

## 1. Stack Tecnológica

| Camada        | Tecnologia              | Status            |
|---------------|-------------------------|-------------------|
| Frontend      | React + Vite            | Setup básico       |
| Backend       | Node.js + Fastify       | ✅ Produção       |
| Comunicação   | Axios                   | ⏳ Próxima fase    |
| Banco de dados| MySQL                   | ✅ Conectado      |
| ORM / Query   | mysql2 (queries brutas) | ✅ Em uso          |
| Autenticação  | JWT (jsonwebtoken)      | ✅ Implementada   |
| Hash de senha | bcryptjs                | ✅ Em uso (salt 10)|

---

## 2. Arquitetura

### 2.1 Visão Geral

```
Cliente (React SPA)
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

### 2.2 Padrão Arquitetural (MVC + Repository)

Fluxo de cada requisição:

```
Request HTTP
    ↓
Routes/ (apenas wiring, sem lógica)
    ↓
Controllers/ (validação de payload JSON, chamada para service, formatação de resposta)
    ↓
Services/ (regras de negócio, transações, validações)
    ↓
Repositories/ (SQL puro, sem lógica)
    ↓
MySQL
```

**Regra crítica:** Controllers **nunca** acessam SQL diretamente. Todo acesso ao banco passa por: `Service → Repository`

### 2.3 Comunicação Backend ↔ Banco de Dados

- **Driver:** `mysql2` com pool de conexões
- **Configuração:** `Backend/src/db/connection.js`
- **Status:** ✅ Validado via `Backend/src/db/test-connection.js`

---

## 3. Estado Atual da Implementação (maio/2026)

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
Backend/src/
├── controllers/authController.js       (validação, chamadas à service)
├── services/authService.js             (lógica de negócio)
├── services/authHelper.js              (funções auxiliares)
├── repositories/usuariosRepository.js  (SQL puro)
└── routes/auth.js                      (wiring de rotas)
```

**Fluxo de exemplo (register):**
1. `POST /auth/register` → `authController.register()` (valida JSON)
2. → `authService.register()` (hash de senha, cheque de email duplicado)
3. → `usuariosRepository.create()` (insere no banco)
4. → JWT gerado com expiração 24h
5. → Retorna token + dados do usuário

**Detalhes técnicos:**
- Senha: hash bcryptjs com salt factor 10
- JWT: expiração 24h, claims: `sub` (user ID), `email`, `perfil`
- Proteção de rotas: middleware Fastify JWT
- Validação: JSON Schema no Fastify

### 3.2 ⏳ Planejado: Módulos Operacionais

Os seguintes módulos **ainda não foram implementados**:

#### Estoque
- RF01: Cadastro de produtos (nome, categoria, cor, tamanho, preço custo/venda)
- RF02: Registro de entradas/saídas
- RF03: Consulta de saldo atual
- RF04: Alerta de estoque mínimo
- RF05: Inativação de produtos

#### Pedidos / Vendas
- RF06: Criação de pedidos vinculados a cliente
- RF07: Múltiplos itens por pedido (produto + quantidade)
- RF08: Ciclo de status (Aguardando → Em produção → Pronto → Entregue / Cancelado)
- RF09: Forma e status de pagamento
- RF10: Cancelamento com registro de motivo

#### Clientes (CRM)
- RF11: Cadastro (nome, telefone, email, endereço)
- RF12: Histórico de pedidos por cliente
- RF13: Observações sobre cliente
- RF14: Inativação de cliente

#### Produção / Costura
- RF15: Criar ordens de produção vinculadas a pedidos
- RF16: Atribuir responsável e prazo
- RF17: Acompanhar status (Pendente → Em andamento → Concluída)
- RF18: Registro de data de conclusão real

#### Financeiro
- RF19: Receitas (automáticas ao fechar pedido) + despesas manuais
- RF20: Categorização de despesas
- RF21: Saldo do período (receitas − despesas)
- RF22: Status de pagamento (Pendente / Pago / Atrasado)

#### Relatórios
- RF23: Vendas por período
- RF24: Produtos mais vendidos
- RF25: Clientes com maior volume
- RF26: Fluxo de caixa
- RF27: Produção por status/responsável

---

## 4. Estrutura de Pastas

### 4.1 Backend (Real + Alvo)

```
Backend/
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
│   ├── controllers/                    # HTTP + validação de input
│   │   ├── authController.js           # ✅ Autenticação
│   │   ├── produtosController.js       # ⏳ A implementar
│   │   ├── estoqueController.js        # ⏳ A implementar
│   │   ├── clientesController.js       # ⏳ A implementar
│   │   ├── pedidosController.js        # ⏳ A implementar
│   │   ├── producaoController.js       # ⏳ A implementar
│   │   └── financeiroController.js     # ⏳ A implementar
│   │
│   ├── services/                       # Business logic + validações
│   │   ├── authService.js              # ✅ Autenticação
│   │   ├── authHelper.js               # ✅ Funções auxiliares
│   │   ├── produtosService.js          # ⏳ A implementar
│   │   ├── estoqueService.js           # ⏳ A implementar
│   │   ├── clientesService.js          # ⏳ A implementar
│   │   ├── pedidosService.js           # ⏳ A implementar
│   │   ├── producaoService.js          # ⏳ A implementar
│   │   └── financeiroService.js        # ⏳ A implementar
│   │
│   ├── repositories/                   # SQL puro (sem lógica)
│   │   ├── usuariosRepository.js       # ✅ Usuários
│   │   ├── produtosRepository.js       # ⏳ A implementar
│   │   ├── estoqueRepository.js        # ⏳ A implementar
│   │   ├── clientesRepository.js       # ⏳ A implementar
│   │   ├── pedidosRepository.js        # ⏳ A implementar
│   │   ├── producaoRepository.js       # ⏳ A implementar
│   │   └── financeiroRepository.js     # ⏳ A implementar
│   │
│   ├── routes/                         # Wiring apenas (sem business logic)
│   │   ├── auth.js                     # ✅ Autenticação
│   │   ├── produtos.js                 # ⏳ A implementar
│   │   ├── estoque.js                  # ⏳ A implementar
│   │   ├── clientes.js                 # ⏳ A implementar
│   │   ├── pedidos.js                  # ⏳ A implementar
│   │   ├── producao.js                 # ⏳ A implementar
│   │   └── financeiro.js               # ⏳ A implementar
│   │
│   └── db/
│       ├── connection.js               # ✅ Pool de conexão MySQL
│       ├── transaction.js              # ✅ Utilitários de transação
│       └── test-connection.js          # ✅ Script de teste de conexão
│
├── test/
│   └── integration_tests.sh            # ⏳ Testes de integração
│
└── node_modules/                       # Gerenciado por npm
```

### 4.2 Frontend (Real + Alvo)

```
Frontend/
├── package.json                        # ⏳ Setup (React, Vite)
├── vite.config.js                      # ⏳ Configuração Vite
├── .env                                # ⏳ API URL, etc
│
└── src/
    ├── main.jsx                        # ⏳ Entry point
    ├── App.jsx                         # ⏳ Root component
    │
    ├── pages/                          # Uma página por módulo
    │   ├── Login.jsx                   # ⏳ Tela de login
    │   ├── Dashboard.jsx               # ⏳ Tela inicial
    │   ├── Estoque/
    │   │   ├── ListaProdutos.jsx       # ⏳ Listagem
    │   │   ├── FormProduto.jsx         # ⏳ Cadastro/edição
    │   │   └── MovimentacoesEstoque.jsx
    │   ├── Pedidos/
    │   ├── Clientes/
    │   ├── Producao/
    │   ├── Financeiro/
    │   └── Relatorios/
    │
    ├── components/                     # Componentes reutilizáveis
    │   ├── Header.jsx                  # ⏳ Cabeçalho
    │   ├── Sidebar.jsx                 # ⏳ Menu lateral
    │   ├── Form/
    │   ├── Table/
    │   └── Modal/
    │
    ├── services/                       # API clients
    │   ├── api.js                      # ⏳ Instância Axios
    │   ├── authService.js              # ⏳ Chamadas auth
    │   ├── produtosService.js          # ⏳ Chamadas produtos
    │   └── ...
    │
    ├── hooks/                          # Custom hooks
    │   ├── useAuth.js                  # ⏳ Autenticação
    │   ├── useFetch.js                 # ⏳ Fetch genérico
    │   └── ...
    │
    ├── context/                        # Context API (estado global)
    │   └── AuthContext.jsx             # ⏳ Contexto de autenticação
    │
    └── styles/                         # Estilos
        ├── index.css                   # ⏳ Estilos globais
        └── variables.css               # ⏳ Variáveis (cores, espaçamentos)
```

---

## 5. Banco de Dados

### 5.1 Tabelas Implementadas

#### `usuarios` ✅
| Campo       | Tipo         | Atributos                |
|-------------|--------------|--------------------------|
| id          | INT          | PK, AUTO_INCREMENT       |
| email       | VARCHAR(150) | UNIQUE, NOT NULL         |
| nome        | VARCHAR(100) | NOT NULL                 |
| senha_hash  | VARCHAR(255) | NOT NULL                 |
| perfil      | VARCHAR(50)  | DEFAULT 'usuario'        |
| ativo       | TINYINT(1)   | DEFAULT 1                |
| criado_em   | DATETIME     | DEFAULT CURRENT_TIMESTAMP|

---

### 5.2 Tabelas Planejadas

#### `produtos` ⏳
| Campo          | Tipo                | Atributos     |
|----------------|---------------------|---------------|
| id             | INT                 | PK, AI        |
| nome           | VARCHAR(100)        | NOT NULL      |
| categoria      | VARCHAR(50)         | ex: calcinha, sutiã |
| cor            | VARCHAR(50)         |               |
| tamanho        | VARCHAR(10)         | P, M, G, GG   |
| preco_custo    | DECIMAL(10,2)       |               |
| preco_venda    | DECIMAL(10,2)       |               |
| estoque_minimo | INT                 | DEFAULT 0     |
| ativo          | TINYINT(1)          | DEFAULT 1     |
| criado_em      | DATETIME            | DEFAULT NOW() |

#### `estoque` ⏳
| Campo      | Tipo     | Atributos                  |
|------------|----------|----------------------------|
| id         | INT      | PK, AI                     |
| produto_id | INT      | FK → produtos.id           |
| tipo       | ENUM     | 'entrada' ou 'saida'       |
| quantidade | INT      |                            |
| motivo     | VARCHAR  | ex: compra, venda, ajuste  |
| criado_em  | DATETIME | DEFAULT NOW()              |

#### `clientes` ⏳
| Campo       | Tipo         | Atributos        |
|-------------|--------------|------------------|
| id          | INT          | PK, AI           |
| nome        | VARCHAR(150) | NOT NULL         |
| telefone    | VARCHAR(20)  |                  |
| email       | VARCHAR(150) |                  |
| endereco    | TEXT         |                  |
| observacoes | TEXT         |                  |
| ativo       | TINYINT(1)   | DEFAULT 1        |
| criado_em   | DATETIME     | DEFAULT NOW()    |

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
| tipo       | ENUM     | 'receita' ou 'despesa'       |
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

# Instalar dependências
npm install

# Definir variáveis de ambiente
cp .env.example .env
# editar .env com URL da API backend

# Iniciar dev server
npm run dev

# Será executado em: http://localhost:5173 (porta padrão Vite)
```

---

## 7. Convenções de Código

### 7.1 Nomes de Arquivo

- **Controllers:** `nomeController.js` (ex: `produtosController.js`)
- **Services:** `nomeService.js` (ex: `produtosService.js`)
- **Repositories:** `nomeRepository.js` (ex: `produtosRepository.js`)
- **Routes:** `nome.js` (ex: `produtos.js`)

### 7.2 Nomes de Função

- Controllers, Services, Repositories: camelCase (ex: `findByEmail`, `createProduct`)
- Arquivo de rotas: export nomeado (ex: `export async function produtosRoutes(app)`)

### 7.3 Padrão de Resposta HTTP

**Sucesso (2xx):**
```json
{
  "data": { ... },
  "message": "Descrição do sucesso"
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
| 2    | Produtos    | ~5 dias    | ⏳ To-do |
| 3    | Estoque     | ~5 dias    | ⏳ To-do |
| 4    | Clientes    | ~3 dias    | ⏳ To-do |
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
