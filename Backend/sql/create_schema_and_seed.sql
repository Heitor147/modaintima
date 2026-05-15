-- Schema mínimo para ambiente de desenvolvimento
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) NULL,
  cor VARCHAR(100) NULL,
  tamanho VARCHAR(50) NULL,
  preco_custo DECIMAL(10,2) NULL,
  preco_venda DECIMAL(10,2) NULL,
  preco_unitario DECIMAL(10,2) NULL,
  estoque_minimo INT NOT NULL DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE produtos
  MODIFY COLUMN nome VARCHAR(255) NOT NULL,
  MODIFY COLUMN categoria VARCHAR(255) NULL,
  MODIFY COLUMN cor VARCHAR(100) NULL,
  MODIFY COLUMN tamanho VARCHAR(50) NULL,
  MODIFY COLUMN preco_custo DECIMAL(10,2) NULL,
  MODIFY COLUMN preco_venda DECIMAL(10,2) NULL,
  MODIFY COLUMN preco_unitario DECIMAL(10,2) NULL,
  MODIFY COLUMN estoque_minimo INT NOT NULL DEFAULT 0,
  MODIFY COLUMN ativo TINYINT(1) NOT NULL DEFAULT 1,
  MODIFY COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Seed mínimo: substituir `SENHA_HASH_AQUI` pelo hash bcrypt real
-- Para gerar um hash localmente, rode por exemplo:
-- node -e "console.log(require('bcryptjs').hashSync('password123', 10))"

INSERT INTO usuarios (email, nome, senha_hash)
VALUES ('seed@example.com', 'Usuário Seed', '2b$12$kC352yr6owxP.h3zQiZI.evXjKLhije8adj4n5l3i2JWmlCX0F5LW')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
