# ---------- STAGE 1: Builder ----------
FROM python:3.11-slim AS builder
WORKDIR /app

# Copy uv (fast dependency installer)
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

# Environment for uv
ENV PATH="/app/.venv/bin:$PATH"
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_HTTP_TIMEOUT=600

# Copy only dependency metadata
COPY pyproject.toml uv.lock ./

# Install dependencies into a virtual env (.venv)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# ---------- STAGE 2: Final Runtime ----------
FROM python:3.11-slim AS runtime
WORKDIR /app

# Copy the virtualenv from builder (only compiled packages)
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app

# Copy only your source code (no tests, docs, etc.)
COPY ./ /app

# Run the FastAPI app with a single worker on Render's expected port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
