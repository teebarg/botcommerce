FROM beafdocker/fastapi-base:latest AS builder

WORKDIR /app

COPY worker/pyproject.toml worker/uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# ---------- STAGE 2: Final Runtime ----------
FROM python:3.11-slim AS runtime
WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app

COPY core/ /app/core/
# COPY ./app /app/app
COPY worker/app /app/app

EXPOSE 10000

CMD ["sh", "-c", "python app/health_server.py & exec arq app.task.WorkerSettings"]
