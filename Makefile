PROJECT_SLUG = shop
APP_NAME = $(PROJECT_SLUG)-backend
DOCKER_HUB = beafdocker
DOCKER_COMPOSE = docker compose

.PHONY: build
build:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) build

.PHONY: up
up:
# 	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) up --build
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) up

.PHONY: update
update:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) up -d

.PHONY: stop
stop:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) down


.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f $(service)

.PHONY: bash
bash:
	$(DOCKER_COMPOSE) exec $(SERVICE) /bin/bash


.PHONY: install
install:
	$(DOCKER_COMPOSE) exec $(SERVICE) pip install $(package)

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans


.PHONY: lint-backend
lint-backend:
	@cd backend && ./scripts/lint.sh

.PHONY: test-backend
test-backend:
	@cd backend && ./scripts/test.sh

.PHONY: prep
prep:
	@cd backend && ./scripts/prestart.sh

.PHONY: prep-docker
prep-docker:
	docker exec shop-backend ./scripts/prestart.sh

.PHONY: serve-agent
serve-agent:
	@cd agent; uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload --workers 4

.PHONY: serve-backend
serve-backend:
	@cd backend; uvicorn app.main:app --host 0.0.0.0 --reload --workers 4

.PHONY: serve-app
serve-app:
	@cd app; pnpm dev

.PHONY: sync
sync:
	@cd backend; uv sync && source .venv/bin/activate

.PHONY: dev
dev:
	make -j 3 serve-backend serve-app serve-agent

.PHONY: deploy
deploy:
	vercel deploy --prod

.PHONY: scaffold
scaffold:
	@cd scripts && python scaffold.py run -n $(name)

.PHONY: stage
stage: docker-build docker-push
	@$(MAKE) -s docker-build docker-push

.PHONY: docker-build
docker-build:
	@cd backend && docker buildx build --platform linux/amd64 -t $(DOCKER_HUB)/$(APP_NAME):latest -t $(DOCKER_HUB)/$(APP_NAME):$(shell git rev-parse HEAD) . --push

.PHONY: docker-push
docker-push:
	@docker push $(DOCKER_HUB)/$(APP_NAME):latest
	@docker push $(DOCKER_HUB)/$(APP_NAME):$(shell git rev-parse HEAD)

.PHONY: activate-env-windows
activate-env-windows:
	.venv\Scripts\Activate.ps1

.PHONY: activate-env
activate-env:
	source .venv/bin/activate

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make dev         - Run the development server"
	@echo "  make build       - Build the production application"
	@echo "  make start       - Start the production server"
	@echo "  make lint        - Run linter"
	@echo "  make test        - Run e2e tests"
	@echo "  make prettier    - Run prettier"
	@echo "  make docker-dev  - Run the development server in Docker"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-up   - Start Docker containers"
	@echo "  make docker-down - Stop Docker containers"
