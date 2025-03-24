#! /usr/bin/env bash

set -e
set -x

# Seed initial data in DB
python app/seed.py
