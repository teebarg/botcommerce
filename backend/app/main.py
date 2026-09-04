import asyncio
import time
from contextlib import asynccontextmanager
from typing import Any
from xml.etree.ElementTree import Element, SubElement, tostring

import redis.asyncio as redis
import sentry_sdk
from arq.connections import ArqRedis
from fastapi import BackgroundTasks, FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.decorators import limit
from app.core.dependencies.cache import ArqDep, CdnDep
from app.core.logging import get_logger
from app.lib.cache import add_cache_headers
from app.models.generic import BulkPurchaseCreate, ContactFormCreate, NewsletterCreate
from app.prisma_client import DbDep, prisma
from app.services.cache import L1Cache, run_l1_invalidation_listener
from app.services.websocket import manager

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug("🚀starting servers......:")
    await prisma.connect()

    app.state.redis = redis.from_url(
        settings.REDIS_URL, decode_responses=True, max_connections=10)
    app.state.l1_cache = L1Cache(max_size=5000, ttl=60.0)

    await manager.start()

    listener_task = asyncio.create_task(
        run_l1_invalidation_listener(app.state.redis, app.state.l1_cache)
    )

    app.state.arq_pool = ArqRedis.from_url(
        settings.BROKER_URL,
        decode_responses=True,
        max_connections=10,
    )

    yield

    if manager.cleanup_task:
        manager.cleanup_task.cancel()
    await prisma.disconnect()

    listener_task.cancel()
    await app.state.redis.close()

if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(title="Botcommerce", redirect_slashes=False,
              openapi_url="/api/openapi.json", version="0.1.0", lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = err["loc"][-1]
        errors.append(f"{field}: {err['msg']}")

    return JSONResponse(
        status_code=422,
        content={"detail": " | ".join(errors)},
    )

# # Custom middleware to capture the client host
# class ClientHostMiddleware(BaseHTTPMiddleware):
#     async def dispatch(self, request, call_next):
#         client_host = request.client.host
#         # Attach the client host to the request state
#         request.state.client_host = client_host
#         print(f"Client host: {client_host}")  # Log the client IP
#         return await call_next(request)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )


class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        duration_ms = round(duration * 1000, 2)
        logger.debug(f"{request.method} {request.url.path} - {duration_ms}ms")

        return response


app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")
app.add_middleware(TimingMiddleware)
app.middleware("http")(add_cache_headers)
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=600,
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.head("/")
@app.get("/")
async def root():
    return {"message": "This is root"}


class PurgeCdn(BaseModel):
    key: str


@app.post("/api/test-arq")
async def test_arq(queue: ArqDep) -> dict[str, Any]:
    # await queue.enqueue_job(
    #     "user_register",
    #     user_id=1,
    # )
    return {"message": "ok"}


@app.post("/api/purge-cdn")
async def purge_cdn(cdn_srv: CdnDep, data: PurgeCdn) -> dict[str, Any]:
    await cdn_srv.purge_cloudfare(data.key)
    return {"message": "ok"}


@app.head("/api/health")
@app.get("/api/health")
async def health(db: DbDep) -> dict[str, Any]:
    postgres_ok = await db.execute_raw("SELECT 1;")
    redis_ok = True
    is_healthy = postgres_ok and redis_ok
    payload = {
        "status": "healthy" if is_healthy else "unhealthy",
        "infrastructure": {
            "postgres": "connected" if postgres_ok else "disconnected",
            "redis": "connected" if redis_ok else "disconnected",
        }
    }
    return payload


@app.post("/api/contact-form")
async def contact_form(queue: ArqDep, data: ContactFormCreate):
    await queue.enqueue_job(
        "contact_form",
        name=data.name, email=data.email, phone=data.phone or "", message=data.message
    )
    return {"message": "Message sent successfully"}


@app.post("/api/newsletter")
async def newsletter(queue: ArqDep, data: NewsletterCreate):
    await queue.enqueue_job("process_newsletter", email=data.email)
    return {"message": "Email sent successfully"}


@app.post("/api/bulk-purchase")
async def bulk_purchase(queue: ArqDep, data: BulkPurchaseCreate):
    await queue.enqueue_job(
        "process_bulk_purchase",
        name=data.name, email=data.email, phone=data.phone or "", message=data.message, bulkType=data.bulkType, quantity=data.quantity,
    )
    return {"message": "Bulk purchase inquiry submitted successfully"}


class ErrorPayload(BaseModel):
    message: str
    source: str | None = None
    stack: str | None = None
    scenario: str | None = None


@app.post("/api/log-error")
@limit("5/minute")
async def log_error(payload: ErrorPayload, request: Request, background_tasks: BackgroundTasks):
    client_ip = request.client.host if request.client else "Unknown IP"
    user_agent = request.headers.get("user-agent", "Unknown UA")

    slack_message = (
        f"*Message:* {payload.message}\n"
        f"*Source:* {payload.source or 'N/A'}\n"
        f"*Stack:* ```{payload.stack or 'N/A'}```\n"
        f"*Scenario:* {payload.scenario or 'N/A'}\n"
        f"*Client:* {client_ip} ({user_agent})\n"
    )

    async def send_slack_task():
        logger.critical(slack_message)
    background_tasks.add_task(send_slack_task)
    return {"message": "Error logged successfully"}


@app.get("/api/sitemap.xml", response_class=Response)
async def generate_sitemap(request: Request, db: DbDep):
    redis = request.app.state.redis
    base_url: str = settings.FRONTEND_HOST.rstrip("/")

    cached_sitemap = await redis.get("sitemap")
    if cached_sitemap:
        return Response(content=cached_sitemap, media_type="application/xml")

    products = await db.query_raw(
        'SELECT slug FROM "products" WHERE active = true'
    )
    categories = await db.query_raw(
        'SELECT slug FROM "categories"'
    )
    collections = await db.query_raw(
        'SELECT slug FROM "collections"'
    )

    urlset = Element(
        "urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    home = SubElement(urlset, "url")
    SubElement(home, "loc").text = f"{base_url}/"

    for collection in collections:
        url = SubElement(urlset, "url")
        SubElement(
            url, "loc").text = f"{base_url}/collections/{collection['slug']}"

    for category in categories:
        url = SubElement(urlset, "url")
        SubElement(
            url, "loc").text = f"{base_url}/collections?cat_ids={category['slug']}"

    for product in products:
        url = SubElement(urlset, "url")
        SubElement(url, "loc").text = f"{base_url}/products/{product['slug']}"

    xml_content = tostring(urlset, encoding="utf-8", method="xml")
    xml_declaration = b'<?xml version="1.0" encoding="UTF-8"?>\n'
    full_sitemap = xml_declaration + xml_content

    await redis.setex("sitemap", 3600, full_sitemap)

    return Response(content=full_sitemap, media_type="application/xml")
