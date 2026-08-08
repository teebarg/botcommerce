FROM beafdocker/fastapi-base:latest AS builder

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# ---------- STAGE 2: Final Runtime ----------
FROM python:3.11-slim AS runtime
WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app

COPY ./app /app/app

EXPOSE 10000
CMD ["sh", "-c", "python app/health_server.py & exec arq app.task.WorkerSettings"]


# # ---------- STAGE 1: Builder ----------
# FROM beafdocker/fastapi-base:latest AS builder

# WORKDIR /app

# # Copy lockfiles from the worker folder (since build context is repo root)
# COPY worker/pyproject.toml worker/uv.lock ./

# RUN --mount=type=cache,target=/root/.cache/uv \
#     uv sync --frozen --no-install-project --no-dev

# # ---------- STAGE 2: Final Runtime ----------
# FROM python:3.11-slim AS runtime
# WORKDIR /app

# # Copy virtualenv from builder
# COPY --from=builder /app/.venv /app/.venv
# ENV PATH="/app/.venv/bin:$PATH"
# ENV PYTHONPATH=/app

# # 1. Copy shared core library
# COPY core/ /app/core/

# # 2. Copy worker code (worker/app -> /app/app)
# COPY worker/app /app/app

# EXPOSE 10000

# CMD ["sh", "-c", "python app/health_server.py & exec arq app.task.WorkerSettings"]