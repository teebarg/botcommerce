# RFT Python Service

[![Python Version](https://img.shields.io/badge/python-3.11-blue.svg)](https://python.org)

## Introduction

This is a FastAPI project built with Python 3.11. FastAPI is a modern, fast, web framework for building APIs with Python based on standard Python type hints. This project serves as a starting point for building scalable and high-performance APIs.

## Features

- FastAPI-based API with automatic validation, serialization, and documentation
- Python 3.11 with type hinting for enhanced code readability and maintainability
- Asynchronous support to handle high-concurrency scenarios
- Built-in Swagger UI and ReDoc for API documentation
- JWT authentication (Optional, if your project needs authentication)
- Dockerized setup for easy deployment (Optional)

## Requirements

- Python 3.11
- Pip (package manager)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/teebarg/botcommerce
cd botcommerce
```

2. Create a virtual environment (optional but recommended):

```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

3. Install the dependencies:

```bash
pip install -r requirements.txt

```

## Configuration

The project includes a config.py file where you can configure various settings, such as database connection, JWT secret key, etc.

## Run the Application
To run the FastAPI application, use the following command:

```bash
uvicorn main:app --reload

```

main is the name of the main module (e.g., the filename without the .py extension).
app is the name of the FastAPI application instance.
The API will be available at <http://localhost:8000>.

## API Documentation

Swagger UI: <http://localhost:4030/docs>
ReDoc: <http://localhost:4030/redoc>

 sudo lsof -t -i tcp:8000 | xargs kill -9
