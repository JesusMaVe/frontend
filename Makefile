SHELL := /bin/bash
.DEFAULT_GOAL := help

# Versiones fijadas de las herramientas (único lugar; el CI usa estos mismos targets).
GITLEAKS_IMAGE := zricethezav/gitleaks:v8.30.1

.PHONY: help env install dev test lint build audit secrets-scan

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

lint: ## oxlint + chequeo de tipos
	npm run lint

build: ## Build de producción en dist/
	npm run build

audit: ## npm audit de las dependencias de producción (severidad alta o mayor)
	npm audit --omit=dev --audit-level=high

secrets-scan: ## Busca secretos en el historial de git (gitleaks)
	docker run --rm -v "$(CURDIR):/repo" $(GITLEAKS_IMAGE) git --no-banner --redact /repo
