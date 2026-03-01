# Stage 1: Build & Model Preparation
FROM python:3.11-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/venv \
    FASTEMBED_CACHE_PATH=/app/models

WORKDIR /app

# Install dependencies only
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Copy source and sync project
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Bake model into image — script avoids inline python -c indentation issues.
RUN . /venv/bin/activate && python scripts/download_model.py

# Stage 2: Final Runtime
FROM python:3.11-slim

WORKDIR /app/agent

# Copy virtual environment and baked models from builder
COPY --from=builder /venv /venv
COPY --from=builder /app /app/agent

USER root
RUN chmod -R 777 /app/agent/models

ENV PATH="/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FASTEMBED_CACHE_PATH="/app/agent/models" \
    PYTHONPATH="/app/agent"

USER 1000

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]