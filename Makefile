PROJECT_SLUG = shop
DOCKER_HUB = beafdocker
DOCKER_COMPOSE = docker compose

# Image tags using the unified namespace variables
API_IMAGE := $(DOCKER_HUB)/shop-api
AGENT_IMAGE := $(DOCKER_HUB)/shop-agent

VERSION ?= latest
GIT_SHA := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Default service context fallback
s ?= app

# ==========================================
# Core Docker Compose Engine Rules
# ==========================================
.PHONY: build
build:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) --profile dev build

build-no-cache:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) --profile dev build --no-cache

.PHONY: up
up:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) --profile dev up

.PHONY: up-backend
up-backend:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) --profile backend-only up

.PHONY: update
update:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) up -d --force-recreate $(s)

.PHONY: update-all
update-all:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) -profile dev up -d --force-recreate

.PHONY: stop
stop:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) down

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) down -v --remove-orphans

.PHONY: prune
prune:
	docker system prune -f --volumes
	docker builder prune -f

# ==========================================
# Debugging
# ==========================================
.PHONY: logs
logs:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) logs -f $(s)

.PHONY: bash
bash:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) /bin/bash

.PHONY: install
install:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) uv pip install $(package)

.PHONY: prep
prep:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec shop-api ./scripts/prestart.sh

.PHONY: lint-backend
lint-backend:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) ./scripts/lint.sh

.PHONY: test-backend
test-backend:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) ./scripts/test.sh

.PHONY: uv-lock
uv-lock:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec $(s) uv lock --check

# ==========================================
# Database & Prisma Layer Actions
# ==========================================
.PHONY: dpf
dpf:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec shop-api uv run prisma format

.PHONY: dpg
dpg:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec shop-api uv run prisma generate

.PHONY: dpm
dpm:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec shop-api uv run prisma migrate dev

.PHONY: db-reset
db-reset:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec shop-api prisma migrate reset --force

.PHONY: seed
seed:
	$(DOCKER_COMPOSE) -p $(PROJECT_SLUG) exec shop-api uv run python app/seed.py

# ==========================================
# Repomix Source Context for AI
# ==========================================
.PHONY: fctx bctx actx ctx-all
fctx:
	@cd app && npx repomix

bctx:
	@cd backend && npx repomix

actx:
	@cd agent && npx repomix

ctx-all: fctx bctx actx

# ==========================================
# Production Testing
# ==========================================
.PHONY: test-prod build-all build-api build-agent push-all push-api push-agent

test-prod:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up --build

# Build APIs
build-all: build-api build-agent

build-api:
	docker build --platform=linux/amd64 \
		-f backend/Dockerfile \
		-t $(API_IMAGE):latest \
		-t $(API_IMAGE):$(VERSION) \
		-t $(API_IMAGE):$(GIT_SHA) \
		./backend

build-agent:
	docker build --platform=linux/amd64 \
		-f agent/Dockerfile \
		-t $(AGENT_IMAGE):latest \
		-t $(AGENT_IMAGE):$(VERSION) \
		-t $(AGENT_IMAGE):$(GIT_SHA) \
		./agent

# Push Operations
push-all: push-api push-agent

push-api:
	docker push $(API_IMAGE):latest
	docker push $(API_IMAGE):$(VERSION)
	docker push $(API_IMAGE):$(GIT_SHA)

push-agent:
	docker push $(AGENT_IMAGE):latest
	docker push $(AGENT_IMAGE):$(VERSION)
	docker push $(AGENT_IMAGE):$(GIT_SHA)

# ==========================================
# Interactive Systems Help Desk Documentation
# ==========================================
.PHONY: help
help:
	@echo "Available commands:"
	@echo ""
	@echo "  -- Docker / Compose Engine --"
	@echo "  make build              - Build all development containers"
	@echo "  make up                 - Build and bring up all development containers"
	@echo "  make update s=<service> - Force recreate specific service container (default s=app)"
	@echo "  make stop               - Stop and remove runtime environment"
	@echo "  make clean              - Pure state wipe (deletes containers, volumes, orphans)"
	@echo ""
	@echo "  -- Active Local Development --"
	@echo "  make logs s=<service>   - Stream logs for target service context (default s=app)"
	@echo "  make bash s=<service>   - Open interactive container terminal prompt"
	@echo "  make install s=<svc> package=<pkg> - Synchronize an explicit 'uv' library target"
	@echo "  make prep               - Execute API database connection prestart verification"
	@echo ""
	@echo "  -- Testing & Lint Integrity Validation --"
	@echo "  make lint-backend s=<svc> - Execute linter validations against Python codeblocks"
	@echo "  make test-backend s=<svc> - Trigger system orchestration suite validations"
	@echo ""
	@echo "  -- Prisma Engine Management --"
	@echo "  make dpf s=<service>    - Run code styling validations over your Schema format"
	@echo "  make dpg s=<service>    - Force execution compilation for your internal ORM Client"
	@echo "  make dpm s=<service>    - Deploy dynamic structural delta migrations"
	@echo ""
	@echo "  -- Repomix Vector Context Capture for AI --"
	@echo "  make fctx               - Generate structural snapshot package for Frontend (App)"
	@echo "  make bctx               - Generate structural snapshot package for Backend (Shop API)"
	@echo "  make actx               - Generate structural snapshot package for Core Agent engine"
	@echo "  make ctx-all            - Execute full-stack multi-repo capture workflow"
	@echo ""
	@echo "  -- Production Deployments & Registry Distribution --"
	@echo "  make test-prod          - Build and execute complete local Multi-Stage deployment run"
	@echo "  make ss                 - Build and push shop-api backend image to Docker Hub"
	@echo "  make dbs                - Build backend Docker image for linux/amd64 platform locally"
	@echo "  make dps                - Push compiled backend variants to active workspace repository"
	@echo "  make sa                 - Build and push agent-api image to Docker Hub repository"
	@echo "  make dba                - Build core agent engine image layout container architecture"
	@echo "  make dpa                - Push active agent image build structures out to Docker Hub"