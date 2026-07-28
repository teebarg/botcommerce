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


# ---------- STAGE 2: Final Runtime ----------
FROM python:3.11-slim AS runtime
WORKDIR /app

# Copy the virtualenv from builder (only compiled packages)
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app

COPY ./app /app