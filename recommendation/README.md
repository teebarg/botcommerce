# Recommendation Service

This is a FastAPI-based microservice for product recommendations.

## Setup

```bash
cd backend/recommendation_service
python -m venv .venv
. .venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```

## Run Locally

```bash
uvicorn main:app --reload --port 8001
```

## Docker

```bash
docker build -t recommendation_service .
docker run -p 8001:8001 recommendation_service
```

## API

- `GET /recommend?user_id=123` — Returns a list of recommended product IDs for the user. 