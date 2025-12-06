PROJECT_SLUG = shop
APP_NAME = $(PROJECT_SLUG)-backend
DOCKER_HUB = beafdocker
DOCKER_COMPOSE = docker compose

.PHONY: build
build:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) build

.PHONY: up
up:
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

.PHONY: lint-frontend
lint-frontend:
	@cd frontend && npm run lint

.PHONY: lint
lint:
	@$(MAKE) -s lint-backend
	@$(MAKE) -s lint-frontend

.PHONY: test-frontend
test-frontend:
	@cd frontend && npm run test:unit

.PHONY: test-backend
test-backend:
	@cd backend && ./scripts/test.sh

.PHONY: test
test:
	@$(MAKE) -s test-frontend
	@$(MAKE) -s test-backend

.PHONY: prep
prep:
	@cd backend && ./scripts/prestart.sh

.PHONY: prep-docker
prep-docker:
	docker exec shop-backend ./scripts/prestart.sh

.PHONY: serve-backend
serve-backend:
	@cd backend; uvicorn app.main:app --host 0.0.0.0 --reload --workers 4

.PHONY: serve-frontend
serve-frontend:
	@cd frontend; npm run dev-https


.PHONY: serve-app
serve-app:
	@cd app; pnpm dev

.PHONY: sync
sync:
	@cd backend; uv sync && source .venv/bin/activate

.PHONY: dev
dev:
	make -j 2 serve-backend serve-app

.PHONY: deploy
deploy:
	vercel deploy --prod

.PHONY: scaffold
scaffold:
	@cd scripts && python scaffold.py run -n $(name)

.PHONY: pre-commit
pre-commit:
	npx concurrently --kill-others-on-fail --prefix "[{name}]" --names "frontend:lint,frontend:build,backend:lint,backend:test" \
	--prefix-colors "bgRed.bold.white,bgGreen.bold.white,bgBlue.bold.white,bgMagenta.bold.white" \
    "cd frontend && npm run lint:check" \
    "cd frontend && npm run build" \
	"cd backend && ./scripts/lint.sh" \
	"cd backend && ./scripts/test.sh"

.PHONY: pre-commit-docker
pre-commit-docker:
	npx concurrently --kill-others-on-fail --prefix "[{name}]" --names "frontend:lint,frontend:test,frontend:build,backend:lint,backend:test" \
	--prefix-colors "bgRed.bold.white,bgGreen.bold.white,bgBlue.bold.white,bgMagenta.bold.white" \
    "docker exec shop-frontend-1 npm run lint:check" \
    "docker exec shop-frontend-1 npm run test:unit" \
    "docker exec shop-frontend-1 npm run build" \
	"docker exec shop-backend-1 ./scripts/lint.sh" \
	"docker exec shop-backend-1 ./scripts/test.sh"

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
