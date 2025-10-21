FROM python:3.11-slim

WORKDIR /app

# Ref: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

# Place executables in the environment at the front of the path
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#using-the-environment
ENV PATH="/app/.venv/bin:$PATH"

# Compile bytecode
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#compiling-bytecode
ENV UV_COMPILE_BYTECODE=1

# uv Cache
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#caching
ENV UV_LINK_MODE=copy
ENV UV_HTTP_TIMEOUT=600

# Copy only dependency files first (to cache efficiently)
COPY pyproject.toml uv.lock ./

# Install dependencies (no dev, no bytecode overhead)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

ENV PYTHONPATH=/app

# COPY ./pyproject.toml /app/

COPY ./ /app

# Sync the project
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
# RUN --mount=type=cache,target=/root/.cache/uv \
#     uv sync

CMD ["fastapi", "run", "--workers", "4", "main.py"]
