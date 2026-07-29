FROM python:3.11-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1

COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Runtime image
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

COPY . .
# RUN chmod +x start_worker.sh

EXPOSE 10000
# CMD ["./start_worker.sh"]
CMD ["sh", "-c", "uv run python app/health_server.py & exec uv run arq app.task.WorkerSettings"]
