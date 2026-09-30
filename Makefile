SHELL := /bin/bash
.DEFAULT_GOAL := help

# Versiones fijadas de las herramientas (único lugar; el CI usa estos mismos targets).
GITLEAKS_IMAGE   := zricethezav/gitleaks:v8.30.1
HADOLINT_IMAGE   := hadolint/hadolint:v2.15.1
SHELLCHECK_IMAGE := koalaman/shellcheck:v0.11.0

COMPOSE  := docker compose
export COMPOSE
# Repo auth hermano (los tests de la imagen piden un token con su usuario semilla).
AUTH_DIR ?= ../auth
export AUTH_DIR
API_DIR  ?= ../api

.PHONY: help env install dev test lint build audit secrets-scan network up down logs test-web lint-docker stack e2e e2e-browsers

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

env: ## Crea .env desde .env.example (no sobrescribe)
	@if [ -e .env ]; then echo "env: .env ya existe; bórralo si quieres regenerarlo" >&2; exit 1; fi
	@cp .env.example .env && echo "env: .env creado"

install: ## Instala las dependencias exactas de package-lock.json
	npm ci

dev: ## Vite en 127.0.0.1 con proxy /auth → auth-svc y /api → api (requiere .env y los repos auth y api levantados)
	npm run dev

test: ## Tests (Vitest + Testing Library + MSW)
	npm test

lint: ## oxlint + chequeo de tipos + shellcheck + hadolint
	npm run lint
	$(MAKE) lint-docker

lint-docker: ## shellcheck + hadolint
	docker run --rm -v "$(CURDIR):/mnt" -w /mnt $(SHELLCHECK_IMAGE) -x test/*.sh scripts/*.sh
	docker run --rm -v "$(CURDIR):/mnt" -w /mnt $(HADOLINT_IMAGE) hadolint Dockerfile

network: ## Crea la red Docker compartida con auth y api (si no existe)
	@set -a && . "$(abspath .env)" && set +a && scripts/ensure-network.sh "$$SHARED_NETWORK" "$$SHARED_NETWORK_SUBNET"

up: network ## Construye y levanta la imagen web (nginx) en 127.0.0.1:WEB_HOST_PORT
	$(COMPOSE) up -d --build --wait

down: ## Detiene la imagen web
	$(COMPOSE) down

logs: ## Logs de la imagen web
	$(COMPOSE) logs --no-color

test-web: up ## Tests de la imagen web (los de proxy necesitan auth y api levantados)
	@test/web.sh

build: ## Build de producción en dist/
	npm run build

audit: ## npm audit de las dependencias de producción (severidad alta o mayor)
	npm audit --omit=dev --audit-level=high

secrets-scan: ## Busca secretos en el historial de git (gitleaks)
	docker run --rm -v "$(CURDIR):/repo" $(GITLEAKS_IMAGE) git --no-banner --redact /repo

e2e-browsers: ## Instala Chromium para Playwright (con dependencias del sistema en CI)
	npx playwright install $(if $(CI),--with-deps) chromium

stack: ## Levanta auth, api y la imagen web, en ese orden (repos hermanos)
	$(MAKE) -C $(AUTH_DIR) up
	$(MAKE) -C $(API_DIR) up
	$(MAKE) up

e2e: ## Playwright contra la imagen web con los 3 repos levantados (make stack)
	@set -a && . "$(abspath .env)" && set +a && \
	E2E_BASE_URL="http://127.0.0.1:$$WEB_HOST_PORT" E2E_USER=alice E2E_EXPECT_LOG="$$WEB_LOG_JWT" \
	E2E_PASSWORD="$$(sed -n 's/^LDAP_SEED_USER_PASSWORD=//p' $(AUTH_DIR)/.env)" npx playwright test
