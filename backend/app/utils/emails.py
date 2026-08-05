from app.core.utils import EmailData, render_email_template
from datetime import datetime
from app.services.shop_settings import ShopSettingsService
from app.utils.metadata import merge_metadata
from typing import Optional
from app.core.config import settings
from app.models.order import Order
from app.models.user import User
from app.models.coupon import Coupon


async def generate_invoice_email(
    order: Order, 
    user: User, 
    service: ShopSettingsService
) -> EmailData:
    header_title = "Your order has been processed successfully"
    template_name = "paid_invoice.html"
    description = "Your order has been processed"
    bank_details = None

    if order.payment_method == "CASH_ON_DELIVERY":
        template_name = "pickup_invoice.html"
        header_title = "Your order has been processed"
        description = "Your order has been processed"
        bank_details = await service.get_bank_details()
        
    elif order.payment_status == "PENDING":
        header_title = "Your order is pending payment"
        template_name = "pending_invoice.html"
        description = "Your order is pending payment"
        bank_details = await service.get_bank_details()
        
    elif order.payment_status == "FAILED":
        header_title = "Your order payment failed"
        template_name = "failed_invoice.html"
        description = "Your order payment failed"

    metadata_context = await merge_metadata(service, {"description": description})

    html_content = render_email_template(
        template_name=template_name,
        context={
            "order": order,
            "user": user,
            "current_year": datetime.now().year,
            "header_title": header_title,
            "cta_url": f"order/confirmed/{order.order_number}",
            "cta_text": "View Order",
            "bank_details": bank_details,
            **metadata_context
        },
    )
    return EmailData(html_content=html_content, subject=f"Order Confirmation for {order.order_number}")


async def generate_payment_receipt(
    order: Order, 
    user: User, 
    service: ShopSettingsService
) -> EmailData:
    metadata_context = await merge_metadata(service, {"description": ""})
    
    html_content = render_email_template(
        template_name="payment_receipt.html",
        context={
            "order": order,
            "user": user,
            "current_year": datetime.now().year,
            **metadata_context
        },
    )
    return EmailData(html_content=html_content, subject="Payment Receipt")


async def generate_contact_form_email(
    name: str, 
    email: str, 
    phone: str, 
    message: str, 
    service: ShopSettingsService
) -> EmailData:
    metadata_context = await merge_metadata(service, {"description": "New Contact Email"})
    
    html_content = render_email_template(
        template_name="contact_form.html",
        context={
            "name": name,
            "email": email,
            "phone": phone,
            "message": message,
            "current_year": datetime.now().year,
            **metadata_context
        },
    )
    return EmailData(html_content=html_content, subject="New Contact Email")


async def generate_bulk_purchase_email(
    name: str, 
    email: str, 
    phone: str, 
    bulkType: str, 
    service: ShopSettingsService,
    quantity: Optional[str] = None, 
    message: Optional[str] = None
) -> EmailData:
    metadata_context = await merge_metadata(service, {"description": "New Bulk Purchase Inquiry"})
    
    html_content = render_email_template(
        template_name="bulk_purchase.html",
        context={
            "name": name,
            "email": email,
            "phone": phone,
            "bulkType": bulkType,
            "quantity": quantity or "Not specified",
            "message": message or "No additional details provided",
            "current_year": datetime.now().year,
            **metadata_context
        },
    )
    return EmailData(html_content=html_content, subject="New Bulk Purchase Inquiry")


async def generate_newsletter_email(
    email: str, 
    service: ShopSettingsService
) -> EmailData:
    metadata_context = await merge_metadata(service, {"description": "Welcome to our newsletter"})
    
    html_content = render_email_template(
        template_name="newsletter.html",
        context={
            "email": email,
            "unsubscribe_link": "",
            "current_year": datetime.now().year,
            **metadata_context
        },
    )
    return EmailData(html_content=html_content, subject="Welcome to our newsletter")


async def generate_referral_cashback_email(
    order: Order, 
    coupon_owner: User, 
    service: ShopSettingsService
) -> EmailData:
    header_title = "You just got paid!"
    description = "Your order has been processed"
    metadata_context = await merge_metadata(service, {"description": description})

    html_content = render_email_template(
        template_name="referral_cashback_email.html",
        context={
            "referral": coupon_owner.first_name,
            "cash_back": order.discount_amount,
            "order_value": order.subtotal,
            "referred": order.user.first_name if order.user else "",
            "created_at": order.created_at,
            "current_year": datetime.now().year,
            "header_title": header_title,
            "cta_url": "account/referrals",
            "cta_text": "View My Wallet",
            **metadata_context
        },
    )
    return EmailData(html_content=html_content, subject="You just got paid!")


async def generate_welcome_email(
    email_to: str, 
    first_name: str, 
    coupon: Coupon, 
    service: ShopSettingsService
) -> EmailData:
    shop_name: Optional[str] = await service.get("shop_name")
    metadata_context = await merge_metadata(service, {"description": ""})

    html_content: str = render_email_template(
        template_name="welcome.html",
        context={
            "first_name": first_name,
            "email": email_to,
            "current_year": datetime.now().year,
            "coupon": coupon,
            "header_title": "Welcome Gift Inside! 🎁",
            "header_subtitle": f"We're excited to have you here, {first_name}!!",
            "cta_url": "collections",
            "cta_text": "Start Shopping",
            **metadata_context
        },
    )
    return EmailData(html_content=html_content, subject=f"Welcome to {shop_name or 'our shop'}")


async def generate_abandoned_cart_email(
    cart_data: dict, 
    user_email: str, 
    service: ShopSettingsService,
    user_name: Optional[str] = None
) -> EmailData:
    metadata_context = await merge_metadata(service, {"description": "Complete your purchase"})
    
    html_content = render_email_template(
        template_name="abandoned_cart.html",
        context={
            "user_name": user_name or "Customer",
            "user_email": user_email,
            "cart": cart_data,
            "cart_link": f"{settings.FRONTEND_HOST}/cart",
            "current_year": datetime.now().year,
            **metadata_context
        },
    )
    return EmailData(html_content=html_content, subject="Don't forget your items!")


