#!/usr/bin/env bash
# Tests de la imagen web (nginx) levantada con compose. Los de proxy necesitan auth y api arriba.
set -u
cd "$(dirname "$0")/.." || exit 1
# shellcheck source=test/lib.sh
. test/lib.sh
load_env

read -ra DC <<< "${COMPOSE:?COMPOSE no definida (usa make test-web)}"
WEB="http://127.0.0.1:${WEB_HOST_PORT}"
AUTH_ENV=${AUTH_DIR:-../auth}/.env
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
header() { curl -s -D - -o /dev/null "$1" | tr -d '\r'; }

echo "web: estáticos"
check_output "sirve la app" '<title>Mis favoritos</title>' curl -s "$WEB/"
check_output "fallback SPA en /dashboard" '<title>Mis favoritos</title>' curl -s "$WEB/dashboard"
check_output "fallback SPA en /items/new" '<title>Mis favoritos</title>' curl -s "$WEB/items/new"
check_output "CSP estricta" "^[Cc]ontent-[Ss]ecurity-[Pp]olicy: default-src 'self'" header "$WEB/"
check_output "nosniff" '^[Xx]-[Cc]ontent-[Tt]ype-[Oo]ptions: nosniff' header "$WEB/"
check_output "index.html sin caché" '^[Cc]ache-[Cc]ontrol: no-cache' header "$WEB/"
asset=$(curl -s "$WEB/" | grep -oE '/assets/[^"]+\.js' | head -1)
check "hay un asset con hash" test -n "$asset"
check_output "assets con caché larga" 'immutable' header "$WEB$asset"
check_output "los assets también llevan CSP" '^[Cc]ontent-[Ss]ecurity-[Pp]olicy' header "$WEB$asset"
check_no_output "no expone la versión de nginx" '^[Ss]erver: nginx/' header "$WEB/"
check_output "puerto publicado solo en 127.0.0.1" '^127\.0\.0\.1:' "${DC[@]}" port web "$NGINX_PORT"
check_output "corre como non-root" '^101' docker inspect -f '{{.Config.User}}' "$("${DC[@]}" ps -q web)"

echo "web: proxy a auth-svc y api (red compartida)"
PW=$(sed -n 's/^LDAP_SEED_USER_PASSWORD=//p' "$AUTH_ENV")
TOKEN=$(curl -s -X POST "$WEB/auth/token" -H 'Content-Type: application/json' \
  -d "{\"username\":\"alice\",\"password\":\"$PW\"}" | sed -nE 's/.*"token":"([^"]+)".*/\1/p')
check "POST /auth/token devuelve un JWT" test -n "$TOKEN"
check_output "GET /api/items sin token → 401" '^401$' code "$WEB/api/items"
check_output "GET /api/items con token → 200" '^200$' code -H "Authorization: Bearer $TOKEN" "$WEB/api/items"
check_no_output "el log de nginx no tiene el token" "${TOKEN:-sin-token}" "${DC[@]}" logs web
# auth-svc debe ver la IP del cliente (X-Forwarded-For de nginx), no la de nginx: si no, el
# rate limit por IP sería uno solo para todos.
auth_svc=$(docker ps -q -f label=com.docker.compose.project=auth -f label=com.docker.compose.service=auth-svc)
last_login_ip() { docker logs --since 1m "$auth_svc" 2>&1 | grep '"login correcto"' | tail -1 | sed -nE 's/.*"ip":"([^"]+)".*/\1/p'; }
check "auth-svc registra una IP de cliente" test -n "$(last_login_ip)"
web_ip=$(docker inspect -f "{{(index .NetworkSettings.Networks \"$SHARED_NETWORK\").IPAddress}}" "$("${DC[@]}" ps -q web)")
check_output "nginx tiene la IP fija de WEB_PROXY_IP" "^${WEB_PROXY_IP}\$" echo "$web_ip"
check "esa IP de cliente no es la de nginx ($web_ip)" test -n "$web_ip" -a "$(last_login_ip)" != "$web_ip"

summary
