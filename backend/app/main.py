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
from fastapi import BackgroundTasks, FastAPI, Request, Response, Depends, Query
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from prisma.enums import Role
from app.core.deps import get_current_superuser
from typing import Literal, Optional
from datetime import timedelta, datetime

@asynccontextmanager
async def lifespan(app: FastAPI):
    # app.state.redis_client.ping()
    print("🚀 ~ connecting to prisma......:")
    await db.connect()
    print("🚀 ~ connecting to prisma......: done")
    yield
    await db.disconnect()

app = FastAPI(title="E-Shop", openapi_url="/api/openapi.json",
              lifespan=lifespan)

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
        # Record start time
        start_time = time.time()

        # Process the request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Format for pretty printing (milliseconds with 2 decimal places)
        duration_ms = round(duration * 1000, 2)

        # Log the request method, path, and duration
        logger.info(f"{request.method} {request.url.path} - {duration_ms}ms")

        return response

# Add the timing middleware only in development
# if app.debug:  # If you have a way to detect dev environment
#     app.add_middleware(TimingMiddleware)


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


# Root path
@app.get("/")
async def root():
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
        email_data = await generate_newsletter_email(
            email=data.email,
        )
        shop_email = await db.shopsettings.find_unique(where={"key": "shop_email"})
        send_email(
            email_to=shop_email.value,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    background_tasks.add_task(send_email_task)
    return {"message": "Email sent successfully"}


@app.post("/api/log-error")
@limit("10/minute")
async def log_error(error: dict, notification: deps.Notification):
    # Send the error to Slack
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

    # Try to get sitemap from cache first
    cached_sitemap = cache.get("sitemap")
    if cached_sitemap:
        return Response(content=cached_sitemap, media_type="application/xml")

    # If not in cache, fetch from database
    products = await db.product.find_many()
    categories = await db.category.find_many()
    collections = await db.collection.find_many()

    urlset = Element(
        "urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # Add the home page
    home = SubElement(urlset, "url")
    SubElement(home, "loc").text = f"{base_url}/"
    SubElement(home, "priority").text = "1.0"
    SubElement(home, "changefreq").text = "daily"

    # Add collections pages
    for collection in collections:
        url = SubElement(urlset, "url")
        SubElement(
            url, "loc").text = f"{base_url}/collections/{collection.slug}"
        SubElement(url, "priority").text = "0.9"
        SubElement(url, "changefreq").text = "monthly"

    # Add category pages
    for category in categories:
        url = SubElement(urlset, "url")
        SubElement(
            url, "loc").text = f"{base_url}/collections?cat_ids={category.slug}"
        SubElement(url, "priority").text = "0.8"
        SubElement(url, "changefreq").text = "monthly"

    # Add product pages
    for product in products:
        url = SubElement(urlset, "url")
        SubElement(url, "loc").text = f"{base_url}/product/{product.slug}"
        SubElement(url, "priority").text = "0.6"
        SubElement(url, "changefreq").text = "weekly"

    sitemap = tostring(urlset, encoding="utf-8", method="xml")

    # Cache the sitemap for 1 hour (3600 seconds)
    cache.set("sitemap", sitemap, expire=3600)

    return Response(content=sitemap, media_type="application/xml")


@app.get("/api/stats", dependencies=[Depends(get_current_superuser)])
async def admin_dashboard_stats():
    # Count orders
    orders_count = await db.order.count()

    # Sum total revenue manually
    orders = await db.order.find_many()
    total_revenue = sum(order.total for order in orders if order.total is not None)

    # Count products
    products_count = await db.product.count()

    # Count customers (manual filter since aggregate where is unsupported)
    users = await db.user.find_many(where={"role": Role.CUSTOMER})
    customers_count = len(users)

    return {
        "orders_count": orders_count,
        "total_revenue": total_revenue,
        "products_count": products_count,
        "customers_count": customers_count,
    }

@app.get("/api/stats/trends", dependencies=[Depends(get_current_superuser)])
async def stats_trends(
    range: Literal["day", "week", "month"] = Query("day"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    # now = datetime.utcnow()
    now = datetime.now()
    start = start_date or now - timedelta(days=30)
    end = end_date or now

    previous_start = start - (end - start)
    previous_end = start

    group_by = {
        "day": "%Y-%m-%d",
        "week": "%Y-%W",
        "month": "%Y-%m"
    }[range]

    def group(items, field):
        counts = {}
        for item in items:
            key = item.created_at.strftime(field)
            counts[key] = counts.get(key, 0) + 1
        return counts

    # Fetch current period data
    current_orders = await db.order.find_many(where={"created_at": {"gte": start, "lte": end}})
    current_signups = await db.user.find_many(where={"role": Role.CUSTOMER, "created_at": {"gte": start, "lte": end}})

    # Fetch previous period data
    prev_orders = await db.order.find_many(where={"created_at": {"gte": previous_start, "lt": previous_end}})
    prev_signups = await db.user.find_many(where={"role": Role.CUSTOMER, "created_at": {"gte": previous_start, "lt": previous_end}})

    # Grouped data for charts
    order_grouped = group(current_orders, group_by)
    signup_grouped = group(current_signups, group_by)
    keys = sorted(set(order_grouped.keys()) | set(signup_grouped.keys()))
    trends = [
        {
            "date": key,
            "orders": order_grouped.get(key, 0),
            "signups": signup_grouped.get(key, 0)
        }
        for key in keys
    ]

    # Fetch summary stats
    total_orders = len(current_orders)
    prev_orders_count = len(prev_orders)

    total_customers = len(current_signups)
    prev_customers_count = len(prev_signups)

    products_count = await db.product.count()

    # Revenue (assume order.total exists)
    current_revenue = sum(order.total for order in current_orders if order.total)
    prev_revenue = sum(order.total for order in prev_orders if order.total)

    # Growth helper
    def growth(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)

    summary = {
        "totalRevenue": current_revenue,
        "totalOrders": total_orders,
        "totalProducts": products_count,
        "totalCustomers": total_customers,
        "revenueGrowth": growth(current_revenue, prev_revenue),
        "ordersGrowth": growth(total_orders, prev_orders_count),
        "productsGrowth": 0.0,  # You could implement this if needed
        "customersGrowth": growth(total_customers, prev_customers_count),
    }

    return {
        "summary": summary,
        "trends": trends
    }

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
