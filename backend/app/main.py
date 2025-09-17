import asyncio
import sentry_sdk
import time
from contextlib import asynccontextmanager
from xml.etree.ElementTree import Element, SubElement, tostring

from app.api.main import api_router
from app.core.config import settings
from app.core.decorators import limit
from app.core.utils import (generate_contact_form_email,
                            generate_newsletter_email, send_email, generate_bulk_purchase_email)
from app.models.generic import ContactFormCreate, NewsletterCreate, BulkPurchaseCreate
from app.prisma_client import prisma as db
from fastapi import BackgroundTasks, FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from app.services.websocket import manager
from app.services.meilisearch import get_or_create_index
from app.redis_client import redis_client

from app.core.logging import get_logger
from fastapi.responses import JSONResponse
from app.consumer import RedisStreamConsumer
from app.core.db import database
import firebase_admin
from firebase_admin import credentials

STREAM_NAME = "EVENT_STREAMS"
GROUP_NAME = "notifications"
CONSUMER_NAME = "notif-api-worker"

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug("🚀starting servers......:")
    if not firebase_admin._apps:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key": settings.FIREBASE_PRIVATE_KEY,
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token",
        })

        firebase_admin.initialize_app(
            cred,
            {"storageBucket": f"{settings.FIREBASE_PROJECT_ID}.appspot.com"}
        )
    await database.connect()
    await db.connect()

    await redis_client.ping()
    app.state.redis = redis_client

    try:
        await redis_client.xgroup_create(STREAM_NAME, GROUP_NAME, id="0", mkstream=True)
    except Exception:
        pass

    consumer = RedisStreamConsumer(
        redis_client, STREAM_NAME, GROUP_NAME, CONSUMER_NAME)
    await consumer.start()

    yield

    await consumer.stop()
    await db.disconnect()
    await redis_client.close()
    await database.disconnect()

if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(title="Botcommerce",
              openapi_url="/api/openapi.json", lifespan=lifespan)

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
        logger.info(f"{request.method} {request.url.path} - {duration_ms}ms")

        return response


app.add_middleware(TimingMiddleware)

if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": "This is root"}


@app.get("/api/health")
async def health():
    user = await db.user.find_unique(
        where={"id": 1}
    )
    redis_res = await app.state.redis.ping()
    meilisearch_res = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
    return {"message": "Server is running", "redis": redis_res, "meilisearch": meilisearch_res, "user": {"id": user.id, "email": user.email}}


@app.post("/api/contact-form")
async def contact_form(background_tasks: BackgroundTasks, data: ContactFormCreate):
    async def send_email_task():
        email_data = await generate_contact_form_email(
            name=data.name, email=data.email, phone=data.phone, message=data.message
        )

        shop_email = await db.shopsettings.find_unique(where={"key": "shop_email"})
        send_email(
            email_to=shop_email.value,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    background_tasks.add_task(send_email_task)
    return {"message": "Message sent successfully"}


@app.post("/api/newsletter")
async def newsletter(background_tasks: BackgroundTasks, data: NewsletterCreate):
    async def send_email_task():
        try:
            email_data = await generate_newsletter_email(
                email=data.email,
            )
            shop_email = await db.shopsettings.find_unique(where={"key": "shop_email"})
            if not shop_email:
                logger.error("Shop email not found")
                return
            send_email(
                email_to=shop_email.value,
                subject=email_data.subject,
                html_content=email_data.html_content,
            )
        except Exception as e:
            logger.error(f"Failed to send newsletter email: {e}")
    background_tasks.add_task(send_email_task)
    return {"message": "Email sent successfully"}


@app.post("/api/bulk-purchase")
async def bulk_purchase(background_tasks: BackgroundTasks, data: BulkPurchaseCreate):
    async def send_email_task():
        try:
            email_data = await generate_bulk_purchase_email(
                name=data.name,
                email=data.email,
                phone=data.phone,
                bulkType=data.bulkType,
                quantity=data.quantity,
                message=data.message,
            )
            shop_email = await db.shopsettings.find_unique(where={"key": "shop_email"})
            if not shop_email:
                logger.error("Shop email not found")
                return
            send_email(
                email_to=shop_email.value,
                subject=email_data.subject,
                html_content=email_data.html_content,
            )
        except Exception as e:
            logger.error(f"Failed to send bulk purchase email: {e}")
    background_tasks.add_task(send_email_task)
    return {"message": "Bulk purchase inquiry submitted successfully"}


@app.post("/api/log-error")
@limit("5/minute")
async def log_error(error: dict, request: Request):
    slack_message = (
        f"*Message:* {error.get('message', 'N/A')}\n"
        f"*Source:* {error.get('source', 'N/A')}\n"
        f"*Stack:* {error.get('stack', 'N/A')}\n"
        f"*Scenario:* {error.get('scenario', 'N/A')}\n"
    )
    logger.critical(slack_message)


@app.get("/api/sitemap.xml", response_class=Response)
async def generate_sitemap(request: Request):
    redis = request.app.state.redis
    base_url = settings.FRONTEND_HOST

    cached_sitemap = await redis.get("sitemap")
    if cached_sitemap:
        return Response(content=cached_sitemap, media_type="application/xml")

    products = await db.product.find_many()
    categories = await db.category.find_many()
    collections = await db.collection.find_many()

    urlset = Element(
        "urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    home = SubElement(urlset, "url")
    SubElement(home, "loc").text = f"{base_url}/"
    SubElement(home, "priority").text = "1.0"
    SubElement(home, "changefreq").text = "daily"

    for collection in collections:
        url = SubElement(urlset, "url")
        SubElement(
            url, "loc").text = f"{base_url}/collections/{collection.slug}"
        SubElement(url, "priority").text = "0.9"
        SubElement(url, "changefreq").text = "monthly"

    for category in categories:
        url = SubElement(urlset, "url")
        SubElement(
            url, "loc").text = f"{base_url}/collections?cat_ids={category.slug}"
        SubElement(url, "priority").text = "0.8"
        SubElement(url, "changefreq").text = "monthly"

    for product in products:
        url = SubElement(urlset, "url")
        SubElement(url, "loc").text = f"{base_url}/product/{product.slug}"
        SubElement(url, "priority").text = "0.6"
        SubElement(url, "changefreq").text = "weekly"

    sitemap = tostring(urlset, encoding="utf-8", method="xml")

    await redis.setex("sitemap", 3600, sitemap)

    return Response(content=sitemap, media_type="application/xml")


# @app.post("/api/test-notification")
# async def update_order():
#     connection = await aio_pika.connect_robust(settings.RABBITMQ_HOST)
#     channel = await connection.channel()
#     message = "Order 1 status: 10"
#     # Declaring queue
#     queue = await channel.declare_queue("notifications")
#     await channel.default_exchange.publish(
#         aio_pika.Message(body=message.encode()), routing_key=queue.name
#     )
#     return {"message": "Order status update sent"}

# @app.on_event("startup")
# async def listen_for_notifications():
#     connection = await aio_pika.connect_robust(settings.RABBITMQ_HOST)
#     channel = await connection.channel()

#     # Listen to order updates
#     order_queue = await channel.declare_queue("notifications-1")
#     asyncio.create_task(process_updates(order_queue))


# async def process_updates(queue):
#     async for message in queue:
#         async with message.process():
#             order_data = message.body.decode()
#             connection = await aio_pika.connect_robust(settings.RABBITMQ_HOST)
#             channel = await connection.channel()
#             product_queue = await channel.declare_queue("product_update")
#             await channel.default_exchange.publish(
#                 aio_pika.Message(body=order_data.encode()),
#                 routing_key=product_queue.name,
#             )


@app.on_event("startup")
async def start_websocket_manager():
    await manager.start()


@app.post("/api/notify-order")
async def notify_order(order_id: int):
    formatted_text = f"New order received: {order_id}\nsecond line"
    logger.publish(formatted_text, extra={"channel": "orders"})
    return {"message": f"Order notification sent for order {order_id}"}


# R2_BUCKET = "myshop-images"
# R2_ENDPOINT = "https://id.r2.cloudflarestorage.com"
# R2_ACCESS_KEY = "key"
# R2_SECRET_KEY = "secret"

# s3 = boto3.client(
#     "s3",
#     endpoint_url=R2_ENDPOINT,
#     aws_access_key_id=R2_ACCESS_KEY,
#     aws_secret_access_key=R2_SECRET_KEY,
# )


# @app.post("/r2/signed-url")
# async def get_signed_url(filename: str, content_type: str):
#     try:
#         key = f"products/{filename}"
#         url = s3.generate_presigned_url(
#             "put_object",
#             Params={
#                 "Bucket": R2_BUCKET,
#                 "Key": key,
#                 "ContentType": content_type,
#                 "ACL": "public-read"
#             },
#             ExpiresIn=3600,  # 1 hour
#         )
#         public_url = f"https://pub-id.r2.dev/{R2_BUCKET}/{key}"
#         return {"signedUrl": url, "publicUrl": public_url, "path": key}
#     except Exception as e:
#         raise HTTPException(500, str(e))

# @app.delete("/r2/delete")
# async def delete_file(path: str):
#     try:
#         s3.delete_object(Bucket=R2_BUCKET, Key=path)
#         return {"message": "deleted"}
#     except Exception as e:
#         raise HTTPException(500, str(e))
