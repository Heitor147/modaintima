# Acesso ao banco no Backend

O pool MySQL é criado em `src/db/connection.js` e decorado no Fastify como `app.db` em `src/server.js`.

- Em handlers Fastify: use `req.server.db`.
- Em service/repository: importe `src/db/connection.js` para usar o mesmo pool compartilhado.
