#!/bin/bash

uv run python health_server.py &
uv run celery -A app.celery_app worker --loglevel=info --concurrency=1
