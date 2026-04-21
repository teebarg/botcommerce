PROJECT_SLUG = shop
DOCKER_HUB = beafdocker
DOCKER_COMPOSE = docker compose

.PHONY: build
build:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) build

.PHONY: up
up:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) up --build

.PHONY: update
update:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) up -d --force-recreate $(s)

.PHONY: stop
stop:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) down

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) logs -f $(s)

.PHONY: bash
bash:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) /bin/bash

.PHONY: install
install:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) uv pip install $(package)

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) down -v --remove-orphans

.PHONY: lint-backend
lint-backend:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) ./scripts/lint.sh

.PHONY: test-backend
test-backend:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) ./scripts/test.sh

.PHONY: prep
prep:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec shop-api ./scripts/prestart.sh

# Frontend
.PHONY: fe-dev
fe-dev:
	@cd app && pnpm dev

.PHONY: ss
ss: dbs dps
	@$(MAKE) -s dbs dps

.PHONY: dbs
dbs:
	@cd backend && docker buildx build --platform linux/amd64 -t $(DOCKER_HUB)/$(PROJECT_SLUG)-backend:latest -t $(DOCKER_HUB)/$(PROJECT_SLUG)-backend:$(shell git rev-parse HEAD) . --push

.PHONY: dps
dps:
	@docker push $(DOCKER_HUB)/$(PROJECT_SLUG)-backend:latest
	@docker push $(DOCKER_HUB)/$(PROJECT_SLUG)-backend:$(shell git rev-parse HEAD)

.PHONY: sa
sa: dba dpa
	@$(MAKE) -s dba dpa

.PHONY: dba
dba:
	@cd agent && docker buildx build --platform linux/amd64 -t $(DOCKER_HUB)/$(PROJECT_SLUG)-agent:latest -t $(DOCKER_HUB)/$(PROJECT_SLUG)-agent:$(shell git rev-parse HEAD) . --push

.PHONY: dpa
dpa:
	@docker push $(DOCKER_HUB)/$(PROJECT_SLUG)-agent:latest
	@docker push $(DOCKER_HUB)/$(PROJECT_SLUG)-agent:$(shell git rev-parse HEAD)


.PHONY: activate-env-windows
activate-env-windows:
	.venv\Scripts\Activate.ps1

.PHONY: activate-env
activate-env:
	source .venv/bin/activate

# prisma helpers
.PHONY: dpf
dpf:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) prisma format

.PHONY: dpg
dpg:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) prisma generate

.PHONY: dpm
dpm:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) prisma migrate dev


.PHONY: help
help:
	@echo "Available commands:"
	@echo ""
	@echo "  -- Docker / Compose --"
	@echo "  make build              - Build all Docker containers"
	@echo "  make up                 - Build and start all containers"
	@echo "  make update s=<service> - Force recreate a specific service"
	@echo "  make stop               - Stop and remove containers"
	@echo "  make clean              - Stop containers, remove volumes and orphans"
	@echo ""
	@echo "  -- Development --"
	@echo "  make logs s=<service>   - Tail logs (omit s= for all services)"
	@echo "  make bash s=<service>   - Open bash shell in a service"
	@echo "  make install s=<svc> package=<pkg> - Install a uv package in a service"
	@echo "  make prep               - Run prestart script in shop-api"
	@echo "  make fe-dev             - Run frontend dev server (pnpm)"
	@echo ""
	@echo "  -- Testing & Linting --"
	@echo "  make lint-backend s=<service>  - Run lint script in a service"
	@echo "  make test-backend s=<service>  - Run test script in a service"
	@echo ""
	@echo "  -- Prisma --"
	@echo "  make dpf s=<service>    - Format Prisma schema"
	@echo "  make dpg s=<service>    - Generate Prisma client"
	@echo "  make dpm s=<service>    - Run Prisma migrations (dev)"
	@echo ""
	@echo "  -- Deploy / Push --"
	@echo "  make ss                 - Build and push backend image (shop-backend)"
	@echo "  make dbs                - Build backend Docker image for linux/amd64"
	@echo "  make dps                - Push backend image to Docker Hub"
	@echo "  make sa                 - Build and push agent image (shop-agent)"
	@echo "  make dba                - Build agent Docker image for linux/amd64"
	@echo "  make dpa                - Push agent image to Docker Hub"
	@echo ""
	@echo "  -- Environment --"
	@echo "  make activate-env               - Activate venv (Linux/macOS)"
	@echo "  make activate-env-windows       - Activate venv (Windows PowerShell)"