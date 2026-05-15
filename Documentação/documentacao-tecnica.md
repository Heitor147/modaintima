# Documentação Técnica — Sistema de Gestão de Moda Íntima

> **Status:** Snapshot de maio/2026  
> **Versão:** 1.0  
> **Última atualização:** 2026-05-15
>
> **Progresso geral:** ✅ Autenticação e produtos implementados | ⏳ Demais módulos em planejamento

---

## 1. Stack Tecnológica

| Camada          | Tecnologia                    | Status                     |
|-----------------|-------------------------------|----------------------------|
| Frontend        | React + Vite                  | Setup básico               |
| Backend         | Node.js + Fastify             | ✅ Em uso                  |
| Comunicação     | HTTP/JSON                     | ✅ Em uso                  |
| Banco de dados   | MySQL                        | ✅ Conectado               |
| ORM / Query     | mysql2                        | ✅ Em uso                  |
| Autenticação    | @fastify/jwt                  | ✅ Implementada            |
| Hash de senha   | bcryptjs                      | ✅ Em uso (salt 10)        |
| Observabilidade | Fastify logger + correlation id | ✅ Em uso                |

---

## 2. Arquitetura

### 2.1 Visão Geral

```
Cliente HTTP (REST client ou frontend futuro)
      │
    │ HTTP/JSON
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
Services/ (regras de negócio e validações)
    ↓
Repositories/ (SQL puro, sem lógica)
    ↓
MySQL
```

**Regra crítica:** Controllers **nunca** acessam SQL diretamente. Todo acesso ao banco passa por: `Service → Repository`

### 2.3 Comunicação Backend ↔ Banco de Dados

- **Driver:** `mysql2/promise` com pool de conexões
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

### 3.2 ✅ Implementado: Módulo de Produtos

**Endpoints:**
```
GET    /produtos           (público)   - Lista produtos
GET    /produtos/:id       (público)   - Busca produto por ID
POST   /produtos           (protegido) - Cria produto
PUT    /produtos/:id       (protegido) - Atualiza produto
DELETE /produtos/:id       (protegido) - Inativa produto (soft delete)
```

**Estrutura:**
```
Backend/src/
├── controllers/produtosController.js   (validação, chamadas à service)
├── services/produtosService.js         (lógica de negócio)
├── repositories/produtosRepository.js  (SQL puro)
└── routes/produtos.js                  (wiring de rotas)
```

**Detalhes técnicos:**
- Exclusão lógica: `ativo = 0`
- Campos suportados no schema atual: `nome`, `categoria`, `cor`, `tamanho`, `preco_custo`, `preco_venda`, `preco_unitario`, `estoque_minimo`, `ativo`
- Validação: ID numérico maior que zero e obrigatoriedade de `nome`

### 3.3 ✅ Utilitários de suporte

- `GET /health/db` para validar conexão com o banco
- `Backend/src/db/test-connection.js` para smoke test da conexão MySQL
- `Backend/src/scripts/test-login.js` para teste manual do fluxo de login

### 3.4 ⏳ Planejado: Módulos Operacionais

Os seguintes módulos **ainda não foram implementados**:

#### Estoque
- RF06: Registro de entradas/saídas vinculadas a um produto
- RF07: Consulta de saldo atual por produto
- RF08: Alerta de estoque mínimo
- RF09: Histórico de movimentações
- RF10: Ajuste manual de inventário

#### Pedidos / Vendas
- RF11: Criação de pedidos vinculados a cliente
- RF12: Múltiplos itens por pedido (produto + quantidade)
- RF13: Ciclo de status (Aguardando → Em produção → Pronto → Entregue / Cancelado)
- RF14: Forma e status de pagamento
- RF15: Cancelamento com registro de motivo

#### Clientes (CRM)
- RF16: Cadastro (nome, telefone, email, endereço)
- RF17: Histórico de pedidos por cliente
- RF18: Observações sobre cliente
- RF19: Inativação de cliente

#### Produção / Costura
- RF20: Criar ordens de produção vinculadas a pedidos
- RF21: Atribuir responsável e prazo
- RF22: Acompanhar status (Pendente → Em andamento → Concluída)
- RF23: Registro de data de conclusão real

#### Financeiro
- RF24: Receitas (automáticas ao fechar pedido) + despesas manuais
- RF25: Categorização de despesas
- RF26: Saldo do período (receitas − despesas)
- RF27: Status de pagamento (Pendente / Pago / Atrasado)

#### Relatórios
- RF28: Vendas por período
- RF29: Produtos mais vendidos
- RF30: Clientes com maior volume
- RF31: Fluxo de caixa
- RF32: Produção por status/responsável

---

## 4. Estrutura de Pastas

### 4.1 Backend (Atual)

```
Backend/
├── requests.http
├── sql/
│   └── create_schema_and_seed.sql      # ✅ Schema do banco e dados iniciais
│
├── src/
│   ├── server.js                       # ✅ Fastify setup, plugins, erro handler
│   ├── package.json                    # ✅ Dependências
│   ├── .env.example                    # ✅ Exemplo de env
│   ├── .gitignore
│   │
│   ├── config/
│   │   └── env.js                      # ✅ Validação de variáveis de ambiente
│   │
│   ├── controllers/                    # HTTP + validação de input
│   │   ├── authController.js           # ✅ Autenticação
│   │   └── produtosController.js       # ✅ Produtos
│   │
│   ├── services/                       # Business logic + validações
│   │   ├── authService.js              # ✅ Autenticação
│   │   ├── authHelper.js               # ✅ Funções auxiliares
│   │   └── produtosService.js          # ✅ Produtos
│   │
│   ├── repositories/                   # SQL puro (sem lógica)
│   │   ├── usuariosRepository.js       # ✅ Usuários
│   │   └── produtosRepository.js       # ✅ Produtos
│   │
│   ├── routes/                         # Wiring apenas (sem business logic)
│   │   ├── auth.js                     # ✅ Autenticação
│   │   └── produtos.js                 # ✅ Produtos
│   │
│   └── db/
│       ├── connection.js               # ✅ Pool de conexão MySQL
│       ├── transaction.js              # ✅ Utilitários de transação
│       └── test-connection.js          # ✅ Script de teste de conexão
│   └── scripts/
│       └── test-login.js               # ✅ Script de teste de login
│
├── test/
│   └── integration_tests.sh            # ⏳ Testes de integração
│
└── package-lock.json
```

### 4.2 Frontend (Atual)

```
Frontend/
└── package.json                        # Apenas manifesto de dependências
```

---

## 5. Banco de Dados

### 5.1 Tabelas Implementadas

#### `usuarios` ✅
| Campo       | Tipo         | Atributos                |
|-------------|--------------|--------------------------|
| id          | INT          | PK, AUTO_INCREMENT       |
| email       | VARCHAR(255) | UNIQUE, NOT NULL         |
| nome        | VARCHAR(255) | NOT NULL                 |
| senha_hash  | VARCHAR(255) | NOT NULL                 |
| created_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP|
| perfil      | VARCHAR(50)  | Não existe no schema atual |
| ativo       | TINYINT(1)   | Não existe no schema atual |

---

### 5.2 Tabelas Planejadas

#### `produtos` ⏳
| Campo          | Tipo                | Atributos     |
|----------------|---------------------|---------------|
| id             | INT                 | PK, AI        |
| nome           | VARCHAR(255)        | NOT NULL      |
| categoria      | VARCHAR(255)        | NULL          |
| cor            | VARCHAR(100)        | NULL          |
| tamanho        | VARCHAR(50)         | NULL          |
| preco_custo    | DECIMAL(10,2)       |               |
| preco_venda    | DECIMAL(10,2)       |               |
| preco_unitario | DECIMAL(10,2)       | NULL          |
| estoque_minimo | INT                 | DEFAULT 0     |
| ativo          | TINYINT(1)          | DEFAULT 1     |
| criado_em      | TIMESTAMP           | DEFAULT CURRENT_TIMESTAMP |

#### Tabelas Planejadas no Roadmap

- `estoque`
- `clientes`
- `pedidos`
- `pedido_itens`
- `producao`
- `financeiro`

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

# Testar fluxo de login manual
node scripts/test-login.js

# Iniciar servidor em desenvolvimento
npm run dev

# Servidor será executado na porta definida em .env (exemplo: http://localhost:3000)
```

### 6.2 Frontend

```bash
cd Frontend

# Instalar dependências do manifesto atual
npm install

# O frontend ainda não possui scaffold de aplicação nem script de desenvolvimento
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

**RN01** — O login usa JWT com expiração de 24h  
**RN02** — O cadastro de usuário gera hash bcryptjs com salt 10  
**RN03** — Produtos são inativados com `ativo = 0` em vez de exclusão física  
**RN04** — Rotas de leitura de produtos são públicas; criação, edição e inativação exigem autenticação  
**RN05** — Não há, no estado atual, módulos de estoque, pedidos, clientes, produção ou financeiro

---

## 9. Roadmap de Implementação

| Fase | Módulo      | Estimativa | Status   |
|------|-------------|------------|----------|
| 1    | Auth        | ✅ Completo | ✅ Done  |
| 2    | Produtos    | ✅ Completo | ✅ Done  |
| 3    | Estoque     | ~5 dias    | ⏳ To-do |
| 4    | Clientes    | ~3 dias    | ⏳ To-do |
| 5    | Pedidos     | ~8 dias    | ⏳ To-do |
| 6    | Produção    | ~5 dias    | ⏳ To-do |
| 7    | Financeiro  | ~5 dias    | ⏳ To-do |
| 8    | Relatórios  | ~5 dias    | ⏳ To-do |
| 9    | Frontend    | sem scaffold | ⏳ To-do |
| 10   | Testes      | ~5 dias    | ⏳ To-do |

---

## 10. Variáveis de Ambiente

### Backend (.env)

```
PORT=3000
JWT_SECRET=sua_chave_secreta_super_segura_aqui_aqui
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=modaintima
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

Ainda não existe arquivo `.env` no frontend atual.

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
