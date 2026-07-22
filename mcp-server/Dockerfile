FROM beafdocker/fastapi-base:latest

WORKDIR /app

COPY pyproject.toml uv.lock* ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

EXPOSE 8000

CMD ["uv", "run", "-m", "app.main"]