#!/usr/bin/env bash

set -e
set -x

coverage run --source=app -m pytest
coverage report --show-missing
coverage html --title "${@-coverage}"

POSTGRES_SERVER=null PROJECT_NAME=null FIRST_SUPERUSER_FIRSTNAME=null FIRST_SUPERUSER_LASTNAME=null FIRST_SUPERUSER=email@email.com FIRST_SUPERUSER_PASSWORD=null python -m pytest
