# 2Lang — единая точка входа: разработка (app/) и прод (deploy/, .flow/runbook.md).

SHELL := /bin/bash
NVM_DIR ?= $(HOME)/.nvm
APP := app

# npm-команды в app/ на версии Node из app/.nvmrc (та же, что у сборки на проде).
NPM = export NVM_DIR="$(NVM_DIR)"; \
	[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh" --no-use >/dev/null 2>&1; \
	cd $(APP) && { { command -v nvm >/dev/null 2>&1 && nvm use >/dev/null 2>&1; } || true; } && npm

.PHONY: help install dev build test lint typecheck check \
	deploy-prod rollback-prod status-prod smoke-prod nginx-prod

help: ## Список целей
	@grep -hE '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## npm ci
	@$(NPM) ci

dev: ## Dev-сервер Vite
	@$(NPM) run dev

build: ## Сборка PWA в app/dist
	@$(NPM) run build

test: ## Vitest
	@$(NPM) run test

lint: ## ESLint
	@$(NPM) run lint

typecheck: ## vue-tsc
	@$(NPM) run typecheck

check: typecheck lint test ## Проверка перед закрытием задачи и деплоем

deploy-prod: ## Выкатить на прод: REF=<коммит|тег> (по умолч. HEAD), SKIP_CHECKS=1 — без проверок
	@deploy/prod.sh deploy

rollback-prod: ## Прод: вернуть предыдущий релиз
	@deploy/prod.sh rollback

status-prod: ## Прод: живой релиз и список релизов
	@deploy/prod.sh status

smoke-prod: ## Прод: HTTP-смоук (EXPECT_SHA=<полный sha> — сверить версию)
	@deploy/prod.sh smoke

nginx-prod: ## Прод: выкатить конфиг deploy/nginx/ (после deploy-prod; sudo, откат при ошибке nginx -t)
	@deploy/prod.sh nginx
