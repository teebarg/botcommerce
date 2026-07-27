PROJECT_SLUG = shop
DOCKER_USER ?= beafdocker
API_IMAGE := $(DOCKER_USER)/shop-api
AGENT_IMAGE := $(DOCKER_USER)/shop-agent

IMAGE_TAG := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")

DOCKER_COMPOSE = docker compose -p $(PROJECT_SLUG)

# ==========================================
# Core Docker Compose Engine Rules
# ==========================================
.PHONY: build
build:
	$(DOCKER_COMPOSE) build $(s)

build-no-cache:
	$(DOCKER_COMPOSE) build --no-cache $(s)

.PHONY: up
up:
	$(DOCKER_COMPOSE) up

.PHONY: update
update:
	$(DOCKER_COMPOSE) up -d --force-recreate $(s)

.PHONY: stop
stop:
	$(DOCKER_COMPOSE) down

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans

.PHONY: prune
prune:
	docker system prune -f --volumes
	docker builder prune -f

# ==========================================
# Debugging
# ==========================================
.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f $(s)

.PHONY: bash
bash:
	$(DOCKER_COMPOSE) exec $(s) /bin/bash

.PHONY: install
install:
	$(DOCKER_COMPOSE) exec $(s) uv pip install $(package)

.PHONY: prep
prep:
	$(DOCKER_COMPOSE) exec shop-api ./scripts/prestart.sh

.PHONY: lint-backend
lint-backend:
	$(DOCKER_COMPOSE) exec $(s) ./scripts/lint.sh

.PHONY: test-backend
test-backend:
	$(DOCKER_COMPOSE) exec $(s) ./scripts/test.sh

.PHONY: uv-lock
uv-lock:
	$(DOCKER_COMPOSE) exec $(s) uv lock --check

# ==========================================
# Database & Prisma Layer Actions
# ==========================================
.PHONY: dpf
dpf:
	$(DOCKER_COMPOSE) exec shop-api uv run prisma format

.PHONY: dpg
dpg:
	$(DOCKER_COMPOSE) exec shop-api uv run prisma generate

.PHONY: dpm
dpm:
	$(DOCKER_COMPOSE) exec shop-api uv run prisma migrate dev

.PHONY: db-reset
db-reset:
	$(DOCKER_COMPOSE) exec shop-api prisma migrate reset --force

.PHONY: seed
seed:
	$(DOCKER_COMPOSE) exec shop-api uv run python app/seed.py

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

mcptx:
	@cd mcp-server && npx repomix

ctx-all: fctx bctx actx mcptx

# ==========================================
# Production Testing
# ==========================================
.PHONY: build-all build-api build-agent push-all push-api push-agent

# Build APIs
build-all: build-api build-agent

build-api:
	docker build --platform=linux/amd64 \
		-f backend/Dockerfile \
		-t $(API_IMAGE):latest \
		-t $(API_IMAGE):$(IMAGE_TAG) \
		./backend

build-agent:
	docker build --platform=linux/amd64 \
		-f agent/Dockerfile \
		-t $(AGENT_IMAGE):latest \
		-t $(AGENT_IMAGE):$(IMAGE_TAG) \
		./agent

# Push Operations
push-all: push-api push-agent

push-api:
	docker push $(API_IMAGE):latest
	docker push $(API_IMAGE):$(IMAGE_TAG)

push-agent:
	docker push $(AGENT_IMAGE):latest
	docker push $(AGENT_IMAGE):$(IMAGE_TAG)


.PHONY: run-api-local
run-api-local:
	docker run --rm -it \
		--platform linux/amd64 \
		--network dev-net \
		-p 8000:8000 \
		--env-file backend/.env \
		$(API_IMAGE):$(IMAGE_TAG) \
		uvicorn app.main:app --host 0.0.0.0 --port 8000

.PHONY: run-agent-local
run-agent-local:
	docker run --rm -it \
		--platform linux/amd64 \
		--network dev-net \
		-p 8001:8000 \
		--env-file agent/.env \
		$(AGENT_IMAGE):$(IMAGE_TAG) \
		uvicorn app.main:app --host 0.0.0.0 --port 8000

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