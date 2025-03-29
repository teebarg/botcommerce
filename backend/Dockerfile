# FROM python:3.11-slim-buster as builder

# # Set environment variables
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1

# # Create and set the working directory
# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     libffi-dev \
#     python3-dev \
#     libssl-dev

# # Copy the requirements.txt file to the container
# COPY requirements.base.txt .
# COPY requirements.dev.txt .

# # Install the project dependencies
# RUN pip install -r requirements.dev.txt

# # Install uvicorn explicitly
# RUN pip install uvicorn

# # Copy the entire project to the container's working directory
# COPY . .

# # Expose port 8000 (the port your FastAPI app is listening on)
# EXPOSE 8000

# # Copy your Bash script into the container
# COPY prestart.sh /usr/local/bin/
# COPY test.sh /usr/local/bin/

# # Make the script executable (if needed)
# RUN chmod +x /usr/local/bin/prestart.sh
# RUN chmod +x /usr/local/bin/test.sh

# # Run your existing command and then the Bash script
# CMD ["sh", "-c", "/usr/local/bin/prestart.sh && python -m uvicorn main:app --host 0.0.0.0 --reload"]

FROM python:3.10

ENV PYTHONUNBUFFERED=1

WORKDIR /app/

# Install uv
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

# Install dependencies
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

ENV PYTHONPATH=/app

COPY ./scripts /app/scripts

COPY ./pyproject.toml ./uv.lock ./alembic.ini /app/

COPY ./app /app/app

# Sync the project
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#intermediate-layers
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync

RUN prisma generate

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
