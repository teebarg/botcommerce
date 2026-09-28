# BotCommerce

A production-ready, full-stack e-commerce platform built with modern technologies and microservices architecture. Features an AI-powered customer support agent, real-time capabilities, and scalable infrastructure designed for high-performance online retail.

## Overview

BotCommerce is a comprehensive e-commerce solution comprising five integrated services:

- **Frontend**: TanStack Start storefront (React 19, TanStack Router/Query, Vite)
- **Backend API**: FastAPI service with PostgreSQL, Redis caching, and Meilisearch
- **Worker**: Async job processing (Arq) for indexing, notifications, and exports
- **AI Agent**: LangGraph-powered customer support with RAG capabilities
- **MCP Server**: Model Context Protocol server for AI integrations

The platform is designed for production deployment with Docker containerization, comprehensive monitoring, and multi-cloud storage support.

---

## Key Features

### Core E-Commerce
- **Product Management**: Full catalog with categories, collections, and variants
- **Search & Discovery**: Meilisearch-powered fast search with faceted filtering
- **Shopping Experience**: Persistent cart, wishlist, and bulk purchase support
- **Order Processing**: Complete order lifecycle from checkout to delivery tracking
- **Payment Integration**: Paystack integration with wallet system support
- **Customer Accounts**: JWT authentication with Clerk integration option
- **Reviews & Ratings**: Product reviews with moderation workflows
- **Coupon System**: Flexible discount codes with usage limits and expiration

### Advanced Capabilities
- **AI Customer Support**: LangGraph agent with RAG, intent classification, and escalation
- **Real-time Features**: WebSocket support for live updates and notifications
- **Web Push Notifications**: Browser push notifications for order updates
- **Multi-Storage**: Supabase, Cloudinary, and Cloudflare R2 support
- **SEO Optimization**: Auto-generated sitemaps and meta tags
- **Analytics**: Order analytics and customer activity tracking
- **CDN Integration**: Cloudflare CDN with automatic cache purging

### Developer Experience
- **Type Safety**: Full TypeScript (frontend) and strict Python typing (backend)
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Database Migrations**: Prisma ORM with version-controlled migrations
- **Docker Support**: Multi-stage Dockerfiles for production builds
- **Observability**: Sentry integration for error tracking
- **Testing**: Pytest for backend, Vitest for frontend

---

## Technology Stack

### Frontend (`app/`)
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TanStack Start | Full-stack framework with SSR |
| TanStack Router | File-based routing with type safety |
| TanStack Query | Server state management |
| Tailwind CSS 4 | Styling |
| Radix UI | Accessible component primitives |
| Vite | Build tool and dev server |
| pnpm | Package manager |

### Backend (`backend/`)
| Technology | Purpose |
|------------|---------|
| FastAPI | ASGI web framework |
| Python 3.11+ | Runtime |
| Prisma ORM | Database ORM |
| PostgreSQL | Primary database |
| Redis | Caching and session storage |
| Meilisearch | Full-text search engine |
| Arq | Async job queue |
| uv | Python package manager |
| Sentry | Error monitoring |

### AI Agent (`agent/`)
| Technology | Purpose |
|------------|---------|
| LangGraph | Agent orchestration |
| LangChain | LLM framework |
| Qdrant | Vector database for RAG |
| FastEmbed | Embedding generation |
| Langfuse | Observability and evaluation |
| Groq/Claude/Gemini | LLM providers |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Traefik | Reverse proxy and load balancing |
| Vercel | Frontend deployment |
| Cloudflare R2 | Object storage |
| Cloudinary | Media management |
| Supabase | Backend-as-a-service option |

---

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        FE[Frontend<br/>TanStack Start]
    end

    subgraph "API Gateway"
        TR[Traefik<br/>Reverse Proxy]
    end

    subgraph "Application Services"
        API[Backend API<br/>FastAPI]
        AGENT[AI Agent<br/>LangGraph]
        MCP[MCP Server<br/>FastMCP]
    end

    subgraph "Background Processing"
        WRK[Worker<br/>Arq Jobs]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        REDIS[(Redis)]
        MEILI[(Meilisearch)]
        QDRANT[(Qdrant<br/>Vector DB)]
    end

    subgraph "Storage"
        SUPA[Supabase]
        CLOUD[Cloudinary]
        CF[Cloudflare R2]
    end

    subgraph "External Services"
        PAY[Paystack]
        SENTRY[Sentry]
        LANGFUSE[Langfuse]
    end

    FE --> TR
    TR --> API
    TR --> AGENT
    TR --> MCP

    API --> PG
    API --> REDIS
    API --> MEILI
    API --> SUPA
    API --> CLOUD
    API --> CF
    API --> PAY
    API --> SENTRY
    API --> WRK

    AGENT --> QDRANT
    AGENT --> API
    AGENT --> LANGFUSE
    AGENT --> REDIS

    WRK --> REDIS
    WRK --> PG
    WRK --> SUPA
    WRK --> CLOUD

    MCP --> PG
```

### Service Communication

- **Frontend → Backend**: HTTP/REST via TanStack Query
- **Frontend → Agent**: WebSocket for real-time chat
- **Backend → Worker**: Redis-backed job queue (Arq)
- **Agent → Backend**: HTTP API calls for order/product data
- **All Services → PostgreSQL**: Direct connection via Prisma
- **All Services → Redis**: Shared caching and pub/sub

---

## Project Structure

```
botcommerce/
├── app/                    # TanStack Start frontend
│   ├── src/
│   │   ├── routes/         # File-based routing
│   │   ├── components/     # React components
│   │   ├── server/         # Server actions (createServerFn)
│   │   └── utils/          # Utilities and API client
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                # FastAPI backend service
│   ├── app/
│   │   ├── api/            # API routers
│   │   ├── core/           # Config, security, logging
│   │   ├── models/         # Pydantic models
│   │   ├── schemas/        # Request/response schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/     # Migration files
│   ├── pyproject.toml
│   └── Dockerfile
│
├── worker/                 # Async job processor
│   ├── app/
│   │   ├── tasks/          # Background jobs
│   │   ├── services/       # Task-specific services
│   │   └── task.py         # Arq worker setup
│   ├── pyproject.toml
│   └── Dockerfile
│
├── agent/                  # AI customer support
│   ├── app/
│   │   ├── agent/          # LangGraph agent logic
│   │   ├── rag/            # RAG pipeline
│   │   ├── observability/  # Langfuse integration
│   │   └── main.py         # FastAPI endpoints
│   ├── data/               # Training data
│   ├── pyproject.toml
│   └── Dockerfile
│
├── mcp-server/             # Model Context Protocol server
│   ├── app/
│   │   ├── tools/          # MCP tools
│   │   └── main.py
│   └── pyproject.toml
│
├── core/                   # Shared utilities
│   ├── db/                 # Database models
│   ├── cache/              # Caching utilities
│   ├── storage/            # Storage abstraction
│   └── repositories/      # Data access layer
│
├── docker-compose.yml      # Development infrastructure
├── Makefile                # Development commands
└── README.md
```

---

## Installation & Local Setup

### Prerequisites

- **Node.js** 18+
- **pnpm** 10+
- **Python** 3.11+
- **uv** (Python package manager)
- **Docker** & Docker Compose (for infrastructure)

### Environment Setup

Create environment files in each service directory:

#### `backend/.env`
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shop

# Redis
REDIS_URL=redis://localhost:6379/0
BROKER_URL=redis://localhost:6379/0

# Meilisearch
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=your-master-key
MEILI_PRODUCTS_INDEX=products

# Frontend
FRONTEND_HOST=http://localhost:5173
BACKEND_CORS_ORIGINS=["http://localhost:5173"]

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=3000

# Storage (choose one)
DEFAULT_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Payment
PAYSTACK_SECRET_KEY=your-paystack-secret

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

#### `app/.env`
```bash
API_URL=http://localhost:8000
VITE_BASE_URL=http://localhost:5173
VITE_CONTACT_EMAIL=contact@example.com
```

#### `agent/.env`
```bash
# LLM Providers
GROQ_API_KEY=your-groq-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-key

# Backend API
API_BASE_URL=http://localhost:8000

# Observability
LANGFUSE_SECRET_KEY=your-langfuse-secret
LANGFUSE_PUBLIC_KEY=your-langfuse-public
LANGFUSE_HOST=https://cloud.langfuse.com

# Redis
BROKER_URL=redis://localhost:6379/0
```

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/teebarg/botcommerce
cd botcommerce
```

2. **Install backend dependencies**
```bash
cd backend
uv sync
cd ..
```

3. **Install frontend dependencies**
```bash
cd app
pnpm install
cd ..
```

4. **Install worker dependencies** (optional)
```bash
cd worker
uv sync
cd ..
```

5. **Install agent dependencies** (optional)
```bash
cd agent
uv sync
cd ..
```

6. **Run database migrations**
```bash
cd backend
uv run prisma migrate dev
uv run prisma generate
cd ..
```

7. **Seed the database** (optional)
```bash
cd backend
uv run python app/seed.py
cd ..
```

---

## Running the Application

### Option 1: Docker Compose (Recommended)

Start all infrastructure services:
```bash
make up
```

This starts:
- PostgreSQL
- Redis
- Meilisearch
- Backend API (http://localhost:8000)
- Worker
- Agent (http://localhost:8001)
- MCP Server (http://localhost:8787)
- Traefik dashboard (http://localhost)

Then run the frontend separately:
```bash
cd app
pnpm dev
```

Access the application at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- Agent: http://localhost:8001
- Traefik: http://localhost

### Option 2: Local Development

Run services in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd app
pnpm dev
```

**Terminal 3 - Worker** (optional):
```bash
cd worker
uv run arq app.task.WorkerSettings
```

**Terminal 4 - Agent** (optional):
```bash
cd agent
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Make Commands

| Command | Description |
|---------|-------------|
| `make up` | Start Docker Compose services |
| `make stop` | Stop Docker Compose services |
| `make logs s=<service>` | View service logs |
| `make bash s=<service>` | Open shell into service |
| `make dpm` | Run Prisma migration |
| `make dpg` | Generate Prisma client |
| `make seed` | Seed database with sample data |
| `make build-all` | Build all Docker images |
| `make push-all` | Push images to registry |

---

## API Overview

The backend API follows RESTful conventions under `/api/*`.

### Core Endpoints

| Route Group | Description |
|-------------|-------------|
| `/api/auth/*` | Authentication (JWT, refresh tokens) |
| `/api/users/*` | User management, profiles |
| `/api/product/*` | Product CRUD, search, variants |
| `/api/category/*` | Category hierarchy, home page products |
| `/api/collection/*` | Product collections, curation |
| `/api/cart/*` | Shopping cart management |
| `/api/order/*` | Order lifecycle, status updates |
| `/api/payment/*` | Payment processing, webhooks |
| `/api/coupon/*` | Discount codes, validation |
| `/api/reviews/*` | Product reviews, ratings |
| `/api/chat/*` | Customer support conversations |
| `/api/wallet/*` | User wallet transactions |
| `/api/notification/*` | Push notification subscriptions |

### Key Endpoints

**Health Check:**
```http
GET /api/health
```

**Authentication:**
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

**Products:**
```http
GET /api/product/
GET /api/product/{id}
GET /api/product/search?q=query
```

**Cart:**
```http
GET /api/cart/
POST /api/cart/items
DELETE /api/cart/items/{id}
```

**Orders:**
```http
POST /api/order/
GET /api/order/{id}
POST /api/order/{id}/pay
```

**AI Chat:**
```http
POST /api/chat/
```

Interactive API documentation available at `/api/docs` (Swagger UI).

---

## Performance & Scalability

### Caching Strategy

- **L1 Cache**: In-memory cache (5000 items, 60s TTL) for frequently accessed data
- **Redis**: Distributed caching for sessions, cart data, and API responses
- **CDN**: Cloudflare CDN for static assets with automatic purging
- **Database Query Optimization**: Prisma with connection pooling

### Async Processing

- **Arq Worker**: Background jobs for:
  - Email notifications
  - Search indexing (Meilisearch)
  - PDF generation (invoices, reports)
  - Image processing (thumbnails, optimization)
  - Data exports

### Database

- **Connection Pooling**: Prisma-managed connection pool
- **Indexing**: Strategic indexes on frequently queried fields
- **Read Replicas**: Supported via PostgreSQL configuration

### Search

- **Meilisearch**: Sub-50ms search response times
- **Faceted Search**: Category, price range, attribute filtering
- **Typo Tolerance**: Configurable fuzzy matching

### Horizontal Scaling

- **Stateless Services**: All services designed for horizontal scaling
- **Load Balancing**: Traefik for service discovery and load balancing
- **Container Orchestration**: Docker Compose for dev, Kubernetes-ready

---

## Security Features

### Authentication & Authorization

- **JWT Tokens**: Access tokens with configurable expiration
- **Refresh Tokens**: Secure token rotation
- **Password Hashing**: bcrypt with salt
- **Role-Based Access**: Admin and customer roles
- **Clerk Integration**: Optional auth provider

### API Security

- **CORS**: Configurable origin allowlist
- **Rate Limiting**: Per-endpoint rate limits
- **Input Validation**: Pydantic v2 schema validation
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: Input sanitization and CSP headers

### Data Protection

- **Environment Variables**: Sensitive data in env files (gitignored)
- **Secret Management**: Support for secret managers
- **HTTPS Enforcement**: Traefik automatic TLS
- **Cookie Security**: HttpOnly, Secure, SameSite cookies

### Monitoring & Alerting

- **Sentry Integration**: Error tracking and performance monitoring
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Slack Alerts**: Critical error notifications
- **Health Checks**: `/api/health` endpoint for orchestration

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `BROKER_URL` | Yes | Redis URL for Arq broker |
| `MEILI_HOST` | Yes | Meilisearch instance URL |
| `MEILI_MASTER_KEY` | Yes | Meilisearch master key |
| `SECRET_KEY` | Yes | JWT signing secret |
| `FRONTEND_HOST` | Yes | Frontend URL for CORS |
| `BACKEND_CORS_ORIGINS` | Yes | JSON array of allowed origins |
| `PAYSTACK_SECRET_KEY` | No | Paystack payment gateway |
| `SENTRY_DSN` | No | Sentry error tracking |
| `DEFAULT_STORAGE_PROVIDER` | No | Storage backend (supabase/cloudinary/r2) |

### Frontend (`app/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | Yes | Backend API base URL |
| `VITE_BASE_URL` | No | Frontend base URL |
| `VITE_CONTACT_EMAIL` | No | Contact email for UI |

### Agent (`agent/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes* | Groq API key (or other LLM) |
| `QDRANT_URL` | Yes | Qdrant vector database URL |
| `QDRANT_API_KEY` | Yes | Qdrant API key |
| `API_BASE_URL` | Yes | Backend API URL |
| `BROKER_URL` | Yes | Redis URL for session storage |
| `LANGFUSE_PUBLIC_KEY` | No | Langfuse observability |
| `LANGFUSE_SECRET_KEY` | No | Langfuse observability |

*One LLM provider key required (Groq, Anthropic, or Google)

---

## Deployment

### Production Build

**Backend:**
```bash
make build-api
```

**Frontend:**
```bash
cd app
pnpm build
```

**Agent:**
```bash
make build-agent
```

**Worker:**
```bash
make build-worker
```

### Docker Registry

Push images to registry:
```bash
make push-all
```

### Vercel Deployment (Frontend)

The frontend is configured for Vercel deployment via `vercel.json`:
- Automatic builds from Git
- Edge network caching
- Environment variable management

### Production Considerations

1. **Database**: Use managed PostgreSQL (RDS, Neon, Supabase)
2. **Redis**: Use managed Redis (ElastiCache, Upstash)
3. **Storage**: Configure production storage credentials
4. **SSL/TLS**: Enable HTTPS via Traefik or cloud provider
5. **Monitoring**: Configure Sentry with production DSN
6. **Backups**: Enable automated database backups
7. **CDN**: Configure Cloudflare for global distribution

---

## Future Improvements

### Planned Features

- **Multi-tenancy**: Support for multiple storefronts
- **Internationalization**: Multi-language support
- **Advanced Analytics**: Customer behavior analytics dashboard
- **Inventory Management**: Real-time stock tracking
- **Shipping Integration**: Multiple shipping providers
- **Tax Calculation**: Automated tax by region
- **Mobile Apps**: React Native mobile applications
- **Marketplace**: Third-party seller support

### Technical Enhancements

- **GraphQL API**: Alternative to REST for complex queries
- **Event Sourcing**: Audit trail and event replay
- **Micro-Frontends**: Modular frontend architecture
- **API Gateway**: Kong or AWS API Gateway integration
- **Kubernetes**: Production orchestration manifests
- **CI/CD**: GitHub Actions workflows for automated testing and deployment

---

## Contributing

Contributions are welcome. Please ensure:
- Code passes linting (`make lint-backend`, `cd app && pnpm lint`)
- Tests pass (`make test-backend`, `cd app && pnpm test`)
- Commits follow conventional commit format
- Documentation is updated for new features

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

For issues, questions, or contributions, please open an issue on GitHub.
