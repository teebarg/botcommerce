#! /usr/bin/env bash

set -e
set -x

# Run migrations
prisma generate
prisma migrate dev
