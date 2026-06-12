# ==========================================
# STAGE 1: The Build Environment
# ==========================================
FROM beafdocker/fastapi-base:latest AS builder

WORKDIR /app

# Install Node.js purely to run the Prisma generator engine
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock* ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

COPY prisma ./prisma
ENV PRISMA_USE_GLOBAL_NODE=true

RUN uv run prisma generate


# ==========================================
# STAGE 2: The Slim Runtime Environment
# ==========================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Copy the lean UV binary so we can execute scripts seamlessly
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Bring over only the compiled virtual environment from the builder
COPY --from=builder /app/.venv /app/.venv

# Copy your production application source code
COPY ./app ./app

# Set optimization flags for Python production performance
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
