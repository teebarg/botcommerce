FROM beafdocker/fastapi-base:latest AS builder

ENV FASTEMBED_CACHE_PATH=/app/models
WORKDIR /app

COPY pyproject.toml uv.lock* ./

# Compile production-only Python dependencies into /app/.venv
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Bake the embedding weights into the builder image cache layer
RUN uv run python -c "from fastembed import TextEmbedding; TextEmbedding('BAAI/bge-small-en-v1.5', cache_dir='/app/models')"


# ==========================================
# STAGE 2: The Slim Production Runtime
# ==========================================
FROM python:3.11-slim AS runner

ENV FASTEMBED_CACHE_PATH=/app/models
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app

# ONNX Runtime optimization flags for CPU-bound container inference
ENV OMP_NUM_THREADS=2

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/models /app/models

COPY ./app /app/app
