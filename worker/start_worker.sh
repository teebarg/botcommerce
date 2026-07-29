#!/bin/bash

# echo '📍 CURRENT DIR:'
# pwd

# echo '📂 FILES:'
# find . -maxdepth 3

# printf "Starting health server...\n"
uv run python app/health_server.py &
uv run arq app.task.WorkerSettings
