# ==========================================
# STAGE 1: The Build & Model Download Environment
# ==========================================
FROM beafdocker/fastapi-base:latest AS builder

ENV FASTEMBED_CACHE_PATH=/app/models
WORKDIR /app

COPY pyproject.toml uv.lock* ./

# Compile production-only Python dependencies into /app/.venv
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Bake the embedding weights into the builder image cache layer
RUN uv run python -c "from fastembed import TextEmbedding; TextEmbedding('sentence-transformers/all-MiniLM-L6-v2', cache_dir='/app/models')"


# ==========================================
# STAGE 2: The Slim Production Runtime
# ==========================================
FROM python:3.11-slim AS runner

# ONNX Runtime optimization flags for CPU-bound container inference
ENV FASTEMBED_CACHE_PATH=/app/models \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    OMP_NUM_THREADS=2

WORKDIR /app

# Grab the lean UV binary for runtime script executions
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY --from=builder /app/.venv /app/.venv

COPY --from=builder /app/models /app/models

COPY ./app ./app

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]