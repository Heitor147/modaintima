-- Schema mínimo para ambiente de desenvolvimento
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed mínimo: substituir `SENHA_HASH_AQUI` pelo hash bcrypt real
-- Para gerar um hash localmente, rode por exemplo:
-- node -e "console.log(require('bcryptjs').hashSync('password123', 10))"

INSERT INTO usuarios (email, nome, senha_hash)
VALUES ('seed@example.com', 'Usuário Seed', '2b$12$kC352yr6owxP.h3zQiZI.evXjKLhije8adj4n5l3i2JWmlCX0F5LW')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
