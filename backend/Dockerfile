# # ---------- STAGE 1: Builder ----------
# FROM python:3.11-slim AS builder
# WORKDIR /app

# # Copy uv (fast dependency installer)
# COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

# # Environment for uv
# ENV PATH="/app/.venv/bin:$PATH"
# ENV UV_COMPILE_BYTECODE=1
# ENV UV_LINK_MODE=copy
# ENV UV_HTTP_TIMEOUT=600

# # Copy only dependency metadata
# COPY pyproject.toml uv.lock ./

# # Install dependencies into a virtual env (.venv)
# RUN --mount=type=cache,target=/root/.cache/uv \
#     uv sync --frozen --no-dev


# # ---------- STAGE 2: Final Runtime ----------
# FROM python:3.11-slim AS runtime
# WORKDIR /app

# # Copy the virtualenv from builder (only compiled packages)
# COPY --from=builder /app/.venv /app/.venv
# ENV PATH="/app/.venv/bin:$PATH"
# ENV PYTHONPATH=/app

# COPY ./app /app/app

# CMD ["fastapi", "run", "--workers", "4", "app/main.py"]

# Stage 1: Fast Build Context
FROM beafdocker/fastapi-base:latest AS builder
WORKDIR /app
COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-dev --no-install-project

# Stage 2: Clean Runtime Context
FROM python:3.11-slim AS runner
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/.venv/bin:$PATH"

# Setup a secure non-root boundary
RUN addgroup --system fastapi && adduser --system --ingroup fastapi appuser

# Copy over ONLY the compiled environment and app source code
COPY --from=builder /app/.venv /app/.venv
COPY ./app /app/app

RUN chown -R appuser:fastapi /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
