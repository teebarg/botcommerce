from app.security import call_internal_backend


async def generate_and_send_invoice(ctx, order_number: int) -> dict:
    path: str = f"/internal/orders/{order_number}/generate-invoice"
    return await call_internal_backend(
        path=path,
        label=f"Invoice generation for order {order_number}",
    )
