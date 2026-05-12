# Documentação Técnica — Sistema de Gestão de Moda Íntima

## 1. Stack Tecnológica

| Camada        | Tecnologia              |
|---------------|-------------------------|
| Frontend      | React + Vite            |
| Backend       | Node.js + Fastify       |
| Comunicação   | Axios                   |
| Banco de dados| MySQL                   |
| ORM / Query   | mysql2 (queries brutas) |
| Autenticação  | JWT (jsonwebtoken)      |
| Hash de senha | bcrypt                  |

---

## 2. Arquitetura

```
Cliente (React)
      │
      │ HTTP/JSON via Axios
      ▼
Fastify (API REST)
      │
      │ mysql2 pool
      ▼
MySQL (banco de dados)
```

O frontend é uma SPA desacoplada do backend. Toda comunicação é feita via API REST com JSON. O token JWT é armazenado no frontend (localStorage ou memória) e enviado no header `Authorization: Bearer <token>` em cada requisição.

---

## 3. Estrutura de Pastas

### Backend

```
backend/
├── src/
│   ├── controllers/       # Recebe req/res, valida input, chama service
│   │   ├── auth.controller.js
│   │   ├── produtos.controller.js
│   │   ├── estoque.controller.js
│   │   ├── clientes.controller.js
│   │   ├── pedidos.controller.js
│   │   ├── producao.controller.js
│   │   └── financeiro.controller.js
│   │
│   ├── services/          # Regras de negócio
│   │   ├── produtos.service.js
│   │   ├── estoque.service.js
│   │   ├── clientes.service.js
│   │   ├── pedidos.service.js
│   │   ├── producao.service.js
│   │   └── financeiro.service.js
│   │
│   ├── repository/        # Único ponto de acesso ao banco
│   │   ├── produtos.repository.js
│   │   ├── estoque.repository.js
│   │   ├── clientes.repository.js
│   │   ├── pedidos.repository.js
│   │   ├── producao.repository.js
│   │   └── financeiro.repository.js
│   │
│   ├── routes/            # Registro de rotas por módulo
│   │   ├── auth.routes.js
│   │   ├── produtos.routes.js
│   │   ├── estoque.routes.js
│   │   ├── clientes.routes.js
│   │   ├── pedidos.routes.js
│   │   ├── producao.routes.js
│   │   └── financeiro.routes.js
│   │
│   ├── db/
│   │   └── connection.js  # Pool de conexão mysql2
│   │
│   └── server.js          # Instância Fastify, plugins, registro de rotas
│
├── .env
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── pages/             # Uma pasta por módulo
│   │   ├── Estoque/
│   │   ├── Pedidos/
│   │   ├── Clientes/
│   │   ├── Producao/
│   │   ├── Financeiro/
│   │   └── Relatorios/
│   │
│   ├── components/        # Componentes reutilizáveis
│   ├── services/          # Funções Axios por módulo (api calls)
│   ├── hooks/             # Custom hooks
│   ├── context/           # AuthContext (token JWT)
│   ├── routes/            # React Router (rotas protegidas)
│   └── main.jsx
│
└── package.json
```

---

## 4. Banco de Dados

### 4.1 Tabelas

#### `usuarios`
| Campo       | Tipo         | Descrição                  |
|-------------|--------------|----------------------------|
| id          | INT PK AI    |                            |
| nome        | VARCHAR(100) |                            |
| email       | VARCHAR(150) | único                      |
| senha_hash  | VARCHAR(255) | hash bcrypt                |
| criado_em   | DATETIME     | default: NOW()             |

---

#### `produtos`
| Campo          | Tipo                                              | Descrição             |
|----------------|---------------------------------------------------|-----------------------|
| id             | INT PK AI                                         |                       |
| nome           | VARCHAR(100)                                      |                       |
| categoria      | ENUM('calcinha','sutia','body','camisola','outro') |                       |
| cor            | VARCHAR(50)                                       |                       |
| tamanho        | VARCHAR(10)                                       | ex: P, M, G, GG       |
| preco_custo    | DECIMAL(10,2)                                     |                       |
| preco_venda    | DECIMAL(10,2)                                     |                       |
| estoque_minimo | INT                                               | default: 0            |
| ativo          | TINYINT(1)                                        | default: 1            |
| criado_em      | DATETIME                                          | default: NOW()        |

---

#### `estoque`
| Campo       | Tipo                    | Descrição                        |
|-------------|-------------------------|----------------------------------|
| id          | INT PK AI               |                                  |
| produto_id  | INT FK → produtos.id    |                                  |
| tipo        | ENUM('entrada','saida') |                                  |
| quantidade  | INT                     |                                  |
| motivo      | VARCHAR(255)            | ex: compra, venda, ajuste        |
| referencia  | VARCHAR(100)            | ex: pedido #42 (opcional)        |
| criado_em   | DATETIME                | default: NOW()                   |

---

#### `clientes`
| Campo       | Tipo         | Descrição        |
|-------------|--------------|------------------|
| id          | INT PK AI    |                  |
| nome        | VARCHAR(100) |                  |
| telefone    | VARCHAR(20)  |                  |
| email       | VARCHAR(150) |                  |
| endereco    | TEXT         |                  |
| observacoes | TEXT         |                  |
| ativo       | TINYINT(1)   | default: 1       |
| criado_em   | DATETIME     | default: NOW()   |

---

#### `pedidos`
| Campo            | Tipo                                                            | Descrição        |
|------------------|-----------------------------------------------------------------|------------------|
| id               | INT PK AI                                                       |                  |
| cliente_id       | INT FK → clientes.id                                            |                  |
| status           | ENUM('aguardando','em_producao','pronto','entregue','cancelado') | default: aguardando |
| forma_pagamento  | ENUM('pix','dinheiro','cartao','outro')                         |                  |
| status_pagamento | ENUM('pendente','pago','atrasado')                              | default: pendente |
| motivo_cancelamento | VARCHAR(255)                                                 | nullable         |
| total            | DECIMAL(10,2)                                                   | calculado        |
| criado_em        | DATETIME                                                        | default: NOW()   |
| atualizado_em    | DATETIME                                                        |                  |

---

#### `itens_pedido`
| Campo      | Tipo               | Descrição         |
|------------|--------------------|-------------------|
| id         | INT PK AI          |                   |
| pedido_id  | INT FK → pedidos.id|                   |
| produto_id | INT FK → produtos.id|                  |
| quantidade | INT                |                   |
| preco_unit | DECIMAL(10,2)      | preço no momento da venda |

---

#### `producao`
| Campo           | Tipo                                      | Descrição      |
|-----------------|-------------------------------------------|----------------|
| id              | INT PK AI                                 |                |
| pedido_id       | INT FK → pedidos.id                       |                |
| responsavel     | VARCHAR(100)                              |                |
| status          | ENUM('pendente','em_andamento','concluida')| default: pendente |
| prazo_estimado  | DATE                                      |                |
| data_conclusao  | DATE                                      | nullable       |
| observacoes     | TEXT                                      |                |
| criado_em       | DATETIME                                  | default: NOW() |

---

#### `financeiro`
| Campo       | Tipo                        | Descrição                       |
|-------------|-----------------------------|---------------------------------|
| id          | INT PK AI                   |                                 |
| tipo        | ENUM('receita','despesa')   |                                 |
| descricao   | VARCHAR(255)                |                                 |
| categoria   | VARCHAR(100)                | ex: venda, matéria-prima        |
| valor       | DECIMAL(10,2)               |                                 |
| status      | ENUM('pendente','pago','atrasado') | default: pendente        |
| pedido_id   | INT FK → pedidos.id         | nullable (receitas automáticas) |
| data        | DATE                        |                                 |
| criado_em   | DATETIME                    | default: NOW()                  |

---

### 4.2 Relacionamentos

```
usuarios         (standalone)
produtos         (standalone)
estoque          → produtos
clientes         (standalone)
pedidos          → clientes
itens_pedido     → pedidos, produtos
producao         → pedidos
financeiro       → pedidos (opcional)
```

### 4.3 Script de Criação MySQL

```sql
-- ============================================================
-- SCHEMA: lingerie / moda íntima
-- ============================================================

CREATE DATABASE IF NOT EXISTS moda_intima
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci;

USE moda_intima;

-- ------------------------------------------------------------
-- USUARIOS
-- ------------------------------------------------------------
CREATE TABLE usuarios (
      id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
      nome        VARCHAR(100)    NOT NULL,
      email       VARCHAR(150)    NOT NULL UNIQUE,
      senha_hash  VARCHAR(255)    NOT NULL,
      perfil      ENUM('admin','vendas','producao','financeiro') NOT NULL DEFAULT 'vendas',
      ativo       TINYINT(1)      NOT NULL DEFAULT 1,
      criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- CLIENTES
-- ------------------------------------------------------------
CREATE TABLE clientes (
      id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
      nome        VARCHAR(150)    NOT NULL,
      cpf         VARCHAR(14)     UNIQUE,
      email       VARCHAR(150),
      telefone    VARCHAR(20),
      endereco    TEXT,
      criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- PRODUTOS
-- ------------------------------------------------------------
CREATE TABLE produtos (
      id              INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
      nome            VARCHAR(150)    NOT NULL,
      categoria       ENUM('calcinha','sutia','body','camisola','conjunto','outro') NOT NULL,
      cor             VARCHAR(50)     NOT NULL,
      tamanho         VARCHAR(10)     NOT NULL,
      preco_unitario  DECIMAL(10,2)   NOT NULL,
      ativo           TINYINT(1)      NOT NULL DEFAULT 1,
      criado_em       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- ESTOQUE  (movimentações, não saldo direto)
-- ------------------------------------------------------------
CREATE TABLE estoque (
      id               INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
      produto_id       INT UNSIGNED    NOT NULL,
      tipo             ENUM('entrada','saida','ajuste') NOT NULL,
      quantidade       INT             NOT NULL,
      motivo           VARCHAR(255),
      referencia_tipo  ENUM('pedido','producao','manual'),
      referencia_id    INT UNSIGNED,
      usuario_id       INT UNSIGNED,
      criado_em        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (produto_id)  REFERENCES produtos(id),
      FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)
);

-- View auxiliar: saldo atual por produto
CREATE VIEW vw_estoque_atual AS
SELECT
      p.id          AS produto_id,
      p.nome,
      p.categoria,
      p.cor,
      p.tamanho,
      SUM(
            CASE e.tipo
                  WHEN 'entrada' THEN  e.quantidade
                  WHEN 'saida'   THEN -e.quantidade
                  WHEN 'ajuste'  THEN  e.quantidade
            END
      ) AS saldo
FROM produtos p
LEFT JOIN estoque e ON e.produto_id = p.id
GROUP BY p.id, p.nome, p.categoria, p.cor, p.tamanho;

-- ------------------------------------------------------------
-- PEDIDOS
-- ------------------------------------------------------------
CREATE TABLE pedidos (
      id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
      cliente_id    INT UNSIGNED    NOT NULL,
      usuario_id    INT UNSIGNED,
      status        ENUM('aberto','producao','pronto','entregue','cancelado') NOT NULL DEFAULT 'aberto',
      total         DECIMAL(10,2)   NOT NULL DEFAULT 0,
      observacoes   TEXT,
      criado_em     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      fechado_em    DATETIME,

      FOREIGN KEY (cliente_id)  REFERENCES clientes(id),
      FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)
);

-- ------------------------------------------------------------
-- ITENS_PEDIDO
-- ------------------------------------------------------------
CREATE TABLE itens_pedido (
      id              INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
      pedido_id       INT UNSIGNED    NOT NULL,
      produto_id      INT UNSIGNED    NOT NULL,
      quantidade      INT             NOT NULL,
      preco_unitario  DECIMAL(10,2)   NOT NULL,
      subtotal        DECIMAL(10,2)   GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,

      FOREIGN KEY (pedido_id)   REFERENCES pedidos(id),
      FOREIGN KEY (produto_id)  REFERENCES produtos(id)
);

-- ------------------------------------------------------------
-- PRODUCAO
-- ------------------------------------------------------------
CREATE TABLE producao (
      id              INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
      pedido_id       INT UNSIGNED    NOT NULL UNIQUE,
      status          ENUM('pendente','em_producao','concluido','cancelado') NOT NULL DEFAULT 'pendente',
      responsavel_id  INT UNSIGNED,
      observacoes     TEXT,
      iniciado_em     DATETIME,
      concluido_em    DATETIME,
      criado_em       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (pedido_id)       REFERENCES pedidos(id),
      FOREIGN KEY (responsavel_id)  REFERENCES usuarios(id)
);

-- ------------------------------------------------------------
-- FINANCEIRO
-- ------------------------------------------------------------
CREATE TABLE financeiro (
      id              INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
      pedido_id       INT UNSIGNED    NOT NULL UNIQUE,
      tipo            ENUM('receita','despesa') NOT NULL DEFAULT 'receita',
      valor           DECIMAL(10,2)   NOT NULL,
      descricao       VARCHAR(255),
      registrado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER $$

-- 1. Seta fechado_em quando pedido vira 'entregue'
CREATE TRIGGER trg_pedido_fechar
BEFORE UPDATE ON pedidos
FOR EACH ROW
BEGIN
      IF NEW.status = 'entregue' AND OLD.status != 'entregue' THEN
            SET NEW.fechado_em = NOW();
      END IF;
END$$

-- 2. Registra receita no financeiro automaticamente
CREATE TRIGGER trg_pedido_receita
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
      IF NEW.status = 'entregue' AND OLD.status != 'entregue' THEN
            INSERT INTO financeiro (pedido_id, tipo, valor, descricao)
            VALUES (
                  NEW.id,
                  'receita',
                  NEW.total,
                  CONCAT('Receita automática — Pedido #', NEW.id)
            );
      END IF;
END$$
 
-- 3. Baixa estoque quando item é adicionado a um pedido
CREATE TRIGGER trg_item_saida_estoque
AFTER INSERT ON itens_pedido
FOR EACH ROW
BEGIN
      INSERT INTO estoque (produto_id, tipo, quantidade, motivo, referencia_tipo, referencia_id)
      VALUES (NEW.produto_id, 'saida', NEW.quantidade, 'Saída por pedido', 'pedido', NEW.pedido_id);
END$$

DELIMITER ;
```

Pontos de atenção do script:

**`estoque` como ledger** — o saldo real fica na view `vw_estoque_atual`, garantindo rastreabilidade das movimentações.

**`itens_pedido.preco_unitario`** — o valor é um snapshot do momento da venda para preservar o histórico.

**`financeiro` dispara só em `'entregue'`** — se o gatilho de receita precisar acontecer em outro status, basta ajustar os dois triggers relacionados.

**`producao` com `UNIQUE` em `pedido_id`** — o modelo força relação 1:1 entre pedido e ordem de produção.

**FK polimórfica em `estoque`** — `referencia_tipo` + `referencia_id` não recebem FK formal porque o MySQL não suporta esse padrão nativamente.

---

## 5. Endpoints da API

Todas as rotas (exceto `/auth/login`) exigem header:
```
Authorization: Bearer <token>
```

### Auth
| Método | Rota         | Descrição       |
|--------|--------------|-----------------|
| POST   | /auth/login  | Login, retorna JWT |

### Produtos
| Método | Rota              | Descrição                  |
|--------|-------------------|----------------------------|
| GET    | /produtos         | Listar todos (ativos)      |
| GET    | /produtos/:id     | Buscar por ID              |
| POST   | /produtos         | Criar produto              |
| PUT    | /produtos/:id     | Editar produto             |
| PATCH  | /produtos/:id/inativar | Inativar produto      |

### Estoque
| Método | Rota                    | Descrição                   |
|--------|-------------------------|-----------------------------|
| GET    | /estoque                | Saldo atual por produto     |
| GET    | /estoque/:produto_id/historico | Movimentações do produto |
| POST   | /estoque/entrada        | Registrar entrada           |
| POST   | /estoque/saida          | Registrar saída manual      |

### Clientes
| Método | Rota                    | Descrição                  |
|--------|-------------------------|----------------------------|
| GET    | /clientes               | Listar todos               |
| GET    | /clientes/:id           | Buscar por ID              |
| GET    | /clientes/:id/pedidos   | Histórico de pedidos       |
| POST   | /clientes               | Criar cliente              |
| PUT    | /clientes/:id           | Editar cliente             |
| PATCH  | /clientes/:id/inativar  | Inativar cliente           |

### Pedidos
| Método | Rota                          | Descrição                     |
|--------|-------------------------------|-------------------------------|
| GET    | /pedidos                      | Listar todos                  |
| GET    | /pedidos/:id                  | Buscar por ID (com itens)     |
| POST   | /pedidos                      | Criar pedido                  |
| PATCH  | /pedidos/:id/status           | Atualizar status              |
| PATCH  | /pedidos/:id/cancelar         | Cancelar pedido               |

### Produção
| Método | Rota                        | Descrição                    |
|--------|-----------------------------|------------------------------|
| GET    | /producao                   | Listar ordens                |
| GET    | /producao/:id               | Buscar por ID                |
| POST   | /producao                   | Criar ordem de produção      |
| PUT    | /producao/:id               | Editar ordem                 |
| PATCH  | /producao/:id/status        | Atualizar status             |

### Financeiro
| Método | Rota              | Descrição                   |
|--------|-------------------|-----------------------------|
| GET    | /financeiro       | Listar transações           |
| GET    | /financeiro/saldo | Saldo do período (query params: de, ate) |
| POST   | /financeiro       | Criar despesa manual        |
| PUT    | /financeiro/:id   | Editar transação            |

### Relatórios
| Método | Rota                        | Descrição                          |
|--------|-----------------------------|------------------------------------|
| GET    | /relatorios/vendas          | Vendas por período                 |
| GET    | /relatorios/produtos        | Produtos mais vendidos             |
| GET    | /relatorios/clientes        | Clientes com maior volume          |
| GET    | /relatorios/fluxo-caixa     | Fluxo de caixa por período         |
| GET    | /relatorios/producao        | Ordens por status e responsável    |

---

## 6. Autenticação

- Login via `POST /auth/login` com `{ email, senha }`
- Backend valida senha com bcrypt e retorna `{ token }` (JWT assinado com secret do `.env`)
- Expiração padrão: 8h
- Frontend armazena o token e injeta via Axios interceptor em todas as requisições
- Rotas protegidas no Fastify via hook `preHandler` com verificação do token

---

## 7. Variáveis de Ambiente (`.env`)

```env
PORT=3333
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=moda_intima
JWT_SECRET=sua_chave_secreta
```
