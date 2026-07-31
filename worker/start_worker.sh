#!/bin/bash

uv run python app/health_server.py &
uv run arq app.task.WorkerSettings
