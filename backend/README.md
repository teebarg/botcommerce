# 🛒 Revoque E-commerce Backend API

A comprehensive, modern e-commerce backend built with **FastAPI**, **Prisma**, and **PostgreSQL**. Features complete store management, user authentication, payment processing, and real-time notifications.

[![Python Version](https://img.shields.io/badge/python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.114+-green.svg)](https://fastapi.tiangolo.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-purple.svg)](https://prisma.io)

---

## 🚀 Features

### Core E-commerce
- **Product Management**: Catalog, categories, brands, collections, variants
- **Order Processing**: Cart management, checkout, order tracking, status updates
- **User Management**: Authentication, profiles, addresses, wallet system
- **Payment Integration**: Multiple payment gateways, transaction processing
- **Reviews & Ratings**: Customer feedback, product reviews

### Advanced Features
- **Real-time Notifications**: WebSockets, push notifications, email alerts
- **Search & Discovery**: MeiliSearch integration, advanced filtering
- **Content Management**: CMS, galleries, carousels, FAQs
- **Analytics & Insights**: User interactions, activity tracking
- **Multi-vendor Support**: Brand management, store settings
- **Coupon System**: Discount codes, promotions, loyalty programs

### Technical Features
- **FastAPI**: Modern async API with automatic validation & documentation
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **JWT Authentication**: Secure user authentication & authorization
- **Redis**: Caching, session management, and pub/sub
- **File Storage**: Cloudinary integration for media assets
- **WebSocket Support**: Real-time communication
- **Docker Ready**: Containerized deployment setup

## 🛠️ Technology Stack

- **Backend**: FastAPI, Python 3.10+
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for caching and sessions
- **Search**: MeiliSearch for product search
- **Storage**: Cloudinary for media files
- **Authentication**: JWT with bcrypt password hashing
- **Notifications**: Email, push notifications, WebSockets
- **File Processing**: PDF generation with ReportLab
- **Monitoring**: Sentry for error tracking
- **Package Manager**: UV for fast dependency management

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL database
- Redis server
- UV (recommended package manager)

### 1. Clone & Install
```bash
git clone https://github.com/teebarg/botcommerce
cd backend
uv sync
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your database URLs and API keys
```

### 3. Database Setup
```bash
# Generate Prisma client
uv run prisma generate

# Run database migrations
uv run prisma migrate dev

# Seed database (optional)
uv run prisma db seed
```

### 4. Start the Application
```bash
# Development mode with hot reload
uv run uvicorn app.api.main:app --reload --host 0.0.0.0 --port 4030

# Production mode
uv run uvicorn app.api.main:app --host 0.0.0.0 --port 4030
```

The API will be available at **http://localhost:4030**

## 📚 API Documentation

- **Swagger UI**: http://localhost:4030/docs
- **ReDoc**: http://localhost:4030/redoc
- **OpenAPI Schema**: http://localhost:4030/openapi.json

---

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── main.py              # FastAPI app and router setup
│   │   └── routes/              # API endpoint modules
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── users.py         # User management
│   │       ├── product.py       # Product operations
│   │       ├── cart.py          # Shopping cart
│   │       ├── order.py         # Order management
│   │       ├── payment.py       # Payment processing
│   │       ├── reviews.py       # Product reviews
│   │       ├── notification.py  # Notification system
│   │       ├── websocket.py     # WebSocket handlers
│   │       └── ...              # 25+ route modules
│   ├── core/
│   │   ├── config.py            # Application configuration
│   │   ├── security.py          # Security utilities
│   │   ├── deps.py              # Dependency injection
│   │   └── notifications/       # Notification system
│   ├── models/                  # Pydantic models
│   ├── services/                # Business logic
│   └── utils/                   # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.py                 # Database seeding
├── scripts/                    # Utility scripts
├── pyproject.toml              # UV configuration
├── Dockerfile                  # Docker configuration
└── .env.example               # Environment template
```
