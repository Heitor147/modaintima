#!/usr/bin/env bash
# Integration smoke tests (manual / CI friendly)


# Allow configuring the target server via PORT or BASE_URL. Default PORT=3000.
PORT=${PORT:-3000}
BASE_URL=${BASE_URL:-http://localhost:${PORT}}

echo "Using BASE_URL=$BASE_URL"

echo "Checking DB health..."
curl -sS "$BASE_URL/health/db" -w "\nHTTP_STATUS:%{http_code}\n"

echo "Checking auth/login with seed user..."
# Ajuste o email/senha conforme o seed em Backend/sql/create_schema_and_seed.sql
curl -sS -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"seed@example.com","password":"password123"}' -w "\nHTTP_STATUS:%{http_code}\n"

echo "Done"

# Nota: para importar o SQL explicitando a porta do MySQL (default 3306):
# mysql -h localhost -P 3306 -u $DB_USER -p $DB_NAME < Backend/sql/create_schema_and_seed.sql
