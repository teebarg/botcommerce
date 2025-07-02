import logging
import time
from contextlib import asynccontextmanager
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring

from app.api.main import api_router
from app.core import deps
from app.core.config import settings
from app.core.decorators import limit
from app.core.utils import (generate_contact_form_email,
                            generate_newsletter_email, send_email)
from app.models.generic import ContactFormCreate, NewsletterCreate
from app.prisma_client import prisma as db
from fastapi import BackgroundTasks, FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime
from app.services.websocket import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 ~ connecting to prisma......:")
    await db.connect()
    logger.info("🚀 ~ connecting to prisma......: done")

    yield
    await db.disconnect()

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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")


class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        duration_ms = round(duration * 1000, 2)
        logger.info(f"{request.method} {request.url.path} - {duration_ms}ms")

        return response


app.add_middleware(TimingMiddleware)

# Set all CORS enabled origins
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
    await db.user.find_unique(
        where={"id": 1}
    )
    return {"message": "Server is running"}


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


@app.post("/api/log-error")
@limit("10/minute")
async def log_error(error: dict, notification: deps.Notification):
    slack_message = {
        "text": f"🚨 *Error Logged* 🚨\n"
        f"*Message:* {error.get('message', 'N/A')}\n"
        f"*Source:* {error.get('source', 'N/A')}\n"
        f"*Timestamp:* {datetime.now().isoformat()}\n"
        f"*Stack:* {error.get('stack', 'N/A')}"
    }
    notification.send_notification(
        channel_name="slack",
        slack_message=slack_message
    )


@app.get("/sitemap.xml", response_class=Response)
async def generate_sitemap(cache: deps.CacheService):
    base_url = settings.FRONTEND_HOST

    cached_sitemap = cache.get("sitemap")
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

    cache.set("sitemap", sitemap, expire=3600)

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