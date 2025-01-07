import json
from datetime import datetime

from app.core.deps import Notification
from app.core import deps
from app.core.decorators import limit
from fastapi import FastAPI, HTTPException, Request
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings

from app.core.utils import (
    generate_contact_form_email,
    generate_newsletter_email,
    send_email,
)
from app.models.generic import ContactFormCreate, NewsletterCreate
from app.services.cache import CacheService

app = FastAPI(title=settings.PROJECT_NAME, openapi_url="/api/openapi.json")

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
    return {"message": "Hello World from UV"}


@app.get("/api/health-check")
async def health_check():
    return {"message": "Server is running"}


@app.post("/api/contact-form")
async def contact_form(data: ContactFormCreate):
    # Send download link
    email_data = generate_contact_form_email(
        name=data.name, email=data.email, phone=data.phone, message=data.message
    )
    send_email(
        email_to=settings.ADMIN_EMAIL,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return {"message": "Message sent successfully"}


@app.post("/api/newsletter")
async def newsletter(data: NewsletterCreate):
    # Send download link
    email_data = generate_newsletter_email(
        email=data.email,
    )
    send_email(
        email_to=settings.ADMIN_EMAIL,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return {"message": "Email sent successfully"}


@app.post("/api/log-error")
@limit("2/minute")
async def log_error(error: dict, notification: Notification, redis: deps.CacheService, request: Request):
    # Add a timestamp to the error
    error["timestamp"] = datetime.utcnow().isoformat()
    
    # Send the error to Slack
    slack_message = {
        "text": f"🚨 *Error Logged* 🚨\n"
                f"*Message:* {error.get('message', 'N/A')}\n"
                f"*Source:* {error.get('source', 'N/A')}\n"
                f"*Timestamp:* {error['timestamp']}\n"
                f"*Stack:* {error.get('stack', 'N/A')}"
    }
    notification.send_notification(
        channel_name="slack",
        slack_message=slack_message
    )


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


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        return obj.isoformat() if isinstance(obj, datetime) else super().default(obj)


app.json_encoder = CustomJSONEncoder
