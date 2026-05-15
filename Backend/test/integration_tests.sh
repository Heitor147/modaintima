#!/usr/bin/env bash
set -euo pipefail

# Integration smoke tests (manual / CI friendly)

# Allow configuring the target server via PORT or BASE_URL. Default PORT=3000.
PORT=${PORT:-3000}
BASE_URL=${BASE_URL:-http://localhost:${PORT}}

cleanup() {
  if [[ -n "${PRODUTO_ID:-}" ]]; then
    curl -sS -X DELETE "$BASE_URL/produtos/$PRODUTO_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN" >/dev/null || true
  fi
}
trap cleanup EXIT

request() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local headers=()

  if [[ -n "${AUTH_TOKEN:-}" ]]; then
    headers+=("-H" "Authorization: Bearer $AUTH_TOKEN")
  fi

  if [[ -n "$body" ]]; then
    headers+=("-H" "Content-Type: application/json")
    curl -sS -X "$method" "$BASE_URL$path" "${headers[@]}" -d "$body"
  else
    curl -sS -X "$method" "$BASE_URL$path" "${headers[@]}"
  fi
}

json_get() {
  node -e "let input=''; process.stdin.on('data', chunk => input += chunk); process.stdin.on('end', () => { const data = JSON.parse(input); const value = process.argv[1].split('.').reduce((acc, key) => acc && acc[key], data); if (typeof value === 'undefined' || value === null) process.exit(1); process.stdout.write(String(value)); });" "$1"
}

echo "Using BASE_URL=$BASE_URL"

echo "Checking DB health..."
HEALTH_RESPONSE=$(curl -sS "$BASE_URL/health/db")
echo "$HEALTH_RESPONSE"

if [[ "$(printf '%s' "$HEALTH_RESPONSE" | json_get db)" != "ok" ]]; then
  echo "Health check failed"
  exit 1
fi

echo "Registering test user..."
TEST_EMAIL="produto.teste.$(date +%s)@example.com"
REGISTER_RESPONSE=$(request POST /auth/register "{\"email\":\"$TEST_EMAIL\",\"name\":\"Teste Produtos\",\"password\":\"123456\",\"passwordConfirm\":\"123456\"}")
echo "$REGISTER_RESPONSE"
AUTH_TOKEN=$(printf '%s' "$REGISTER_RESPONSE" | json_get token)

if [[ -z "$AUTH_TOKEN" ]]; then
  echo "Failed to obtain auth token"
  exit 1
fi

echo "Listing products..."
LIST_RESPONSE=$(request GET /produtos)
echo "$LIST_RESPONSE"

if ! printf '%s' "$LIST_RESPONSE" | node -e "let input=''; process.stdin.on('data', chunk => input += chunk); process.stdin.on('end', () => { const data = JSON.parse(input); const produtos = Array.isArray(data.produtos) ? data.produtos : null; if (!produtos) process.exit(1); });"; then
  echo "Product list did not return the expected payload"
  exit 1
fi

echo "Creating product..."
CREATE_RESPONSE=$(request POST /produtos "{\"nome\":\"Camiseta Basica\",\"categoria\":\"Camisetas\",\"cor\":\"Preto\",\"tamanho\":\"M\",\"preco_custo\":25.5,\"preco_venda\":49.9,\"preco_unitario\":49.9,\"estoque_minimo\":10,\"ativo\":1}")
echo "$CREATE_RESPONSE"
PRODUTO_ID=$(printf '%s' "$CREATE_RESPONSE" | json_get produto.id)

if [[ -z "$PRODUTO_ID" ]]; then
  echo "Failed to create product"
  exit 1
fi

echo "Fetching created product..."
GET_RESPONSE=$(curl -sS "$BASE_URL/produtos/$PRODUTO_ID")
echo "$GET_RESPONSE"

if [[ "$(printf '%s' "$GET_RESPONSE" | json_get produto.nome)" != "Camiseta Basica" ]]; then
  echo "Created product not returned correctly"
  exit 1
fi

echo "Updating product..."
UPDATE_RESPONSE=$(request PUT "/produtos/$PRODUTO_ID" "{\"nome\":\"Camiseta Basica Premium\",\"categoria\":\"Camisetas\",\"cor\":\"Preto\",\"tamanho\":\"M\",\"preco_custo\":28,\"preco_venda\":54.9,\"preco_unitario\":54.9,\"estoque_minimo\":8,\"ativo\":1}")
echo "$UPDATE_RESPONSE"

UPDATED_GET_RESPONSE=$(curl -sS "$BASE_URL/produtos/$PRODUTO_ID")
echo "$UPDATED_GET_RESPONSE"

if [[ "$(printf '%s' "$UPDATED_GET_RESPONSE" | json_get produto.nome)" != "Camiseta Basica Premium" ]]; then
  echo "Product update did not persist"
  exit 1
fi

echo "Removing product..."
DELETE_RESPONSE=$(request DELETE "/produtos/$PRODUTO_ID")
echo "$DELETE_RESPONSE"

if [[ "$(printf '%s' "$DELETE_RESPONSE" | json_get message)" != "Produto inativado com sucesso" ]]; then
  echo "Product delete did not succeed"
  exit 1
fi

echo "Done"

# Nota: para importar o SQL explicitando a porta do MySQL (default 3306):
# mysql -h localhost -P 3306 -u $DB_USER -p $DB_NAME < Backend/sql/create_schema_and_seed.sql
