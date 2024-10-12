import json
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.activities import router as activities_router
from api.address import router as address_router
from api.brand import router as brand_router
from api.cart import router as cart_router
from api.collection import router as collection_router
from api.order import router as order_router
from api.product import router as product_router
from api.tag import router as tag_router
from api.users import router as user_router

# from api.websocket import consume_events
from api.websocket import router as websocket_router
from core.config import settings
from core.utils import (
    generate_contact_form_email,
    generate_newsletter_email,
    send_email,
)
from models.generic import ContactFormCreate, NewsletterCreate

app = FastAPI(title=settings.PROJECT_NAME, openapi_url="/api/openapi.json")

# Mount the routers under their respective paths

app.include_router(
    websocket_router,
    prefix="/api/ws",
    tags=["Websockets"],
)

app.include_router(
    user_router,
    prefix="/api/users",
    tags=["users"],
)

app.include_router(
    product_router,
    prefix="/api/product",
    tags=["products"],
)

app.include_router(
    collection_router,
    prefix="/api/collection",
    tags=["collections"],
)

app.include_router(
    tag_router,
    prefix="/api/tag",
    tags=["tags"],
)

app.include_router(
    brand_router,
    prefix="/api/brand",
    tags=["brands"],
)

app.include_router(
    cart_router,
    prefix="/api/cart",
    tags=["carts"],
)

app.include_router(
    address_router,
    prefix="/api/address",
    tags=["addresses"],
)

app.include_router(
    activities_router,
    prefix="/api/activities",
    tags=["activities"],
)

app.include_router(
    order_router,
    prefix="/api/order",
    tags=["orders"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # See https://github.com/pydantic/pydantic/issues/7186 for reason of using rstrip
        str(origin).rstrip("/")
        for origin in settings.BACKEND_CORS_ORIGINS
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root path
@app.get("/")
async def root():
    return {"message": "Hello World!!!"}


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


# @app.on_event("startup")
# async def startup_event():
#     import asyncio

#     loop = asyncio.get_event_loop()
#     loop.create_task(consume_events())


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


app.json_encoder = CustomJSONEncoder
