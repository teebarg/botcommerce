import os
import uuid
from datetime import datetime
from app.services.pdf import generate_pdf_invoice
from core.utils import format_date, format_naira
from core.logging import get_logger

logger = get_logger(__name__)

async def build_and_upload_invoice(ctx, order) -> dict:
    settings = ctx["settings"]
    storage = ctx["storage"]
    try:
        output_path: str = f"/tmp/{order.id}.pdf"
        order_payload = {
            "company_name": settings.get("shop_name"),
            "company_address": f"{settings.get('shop_name')}<br/>{settings.get('address')}",
            "invoice_no": order.order_number,
            "date": format_date(order.created_at),
            "order_id": order.order_number,
            "customer_name": f"{order.user.first_name} {order.user.last_name}",
            "customer_address": f"{order.shipping_address.address_1}<br/>{order.shipping_address.city}, {order.shipping_address.state}" if order.shipping_address else f"",
            "items": [{"name": item.name, "qty": item.quantity, "price": format_naira(item.variant.price), "total": format_naira(item.quantity * item.variant.price)} for item in order.order_items],
            "discount": format_naira(order.discount_amount) if order.discount_amount else None,
            "shipping_fee": format_naira(order.shipping_fee) if order.shipping_fee else None,
            "subtotal": format_naira(order.subtotal),
            "tax": format_naira(order.tax),
            "total": format_naira(order.total),
        }

        generate_pdf_invoice(order_payload, output_path)
        with open(output_path, "rb") as f:
            pdf_bytes = f.read()
        timestamp: str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename: str = f"invoices/invoice_{order.order_number}_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"

        result = storage.upload_file(
            filename=filename,
            bytes_data=pdf_bytes,
            content_type="application/pdf"
        )
        if not result:
            raise Exception("Failed to upload invoice to storage")
        public_url = storage.get_public_url(filename=filename)
        return public_url
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise e
    finally:
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
