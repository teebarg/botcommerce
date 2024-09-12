# Variables
PROJECT_SLUG := botcommerce
APP_NAME := $(PROJECT_SLUG)-backend
PORT := 4032

YELLOW=$(shell tput -Txterm setaf 3)

# Targets
build:
	docker build -t $(APP_NAME) .

run:
	docker run -p $(PORT):8000 --name $(APP_NAME) -v /Users/user/Documents/gigs/niyi/lab/botcommerce/backend:/app:ro $(APP_NAME)

stop:
	docker stop $(APP_NAME)
	docker rm $(APP_NAME)

dev:
	uvicorn main:app --host 0.0.0.0 --port $(PORT)  --reload

format:
	black .
	ruff check --fix .

test:
	POSTGRES_SERVER=null PROJECT_NAME=null FIRST_SUPERUSER_FIRSTNAME=null FIRST_SUPERUSER_LASTNAME=null FIRST_SUPERUSER=email@email.com FIRST_SUPERUSER_PASSWORD=null python -m pytest
