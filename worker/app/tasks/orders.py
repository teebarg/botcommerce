from app.security import call_internal_backend

async def order_created(ctx, order_id: int) -> dict:
    """
    arq job: delegates referral order creation side effects to the backend's
    internal endpoint.
    """
    return await call_internal_backend(
        path=f"/internal/orders/{order_id}/process-created",
        label=f"Order creation pipeline for {order_id}",
    )

async def process_referral(ctx, order_id: int) -> dict:
    """
    arq job: delegates referral cashback processing to the backend's
    internal endpoint. Idempotent on the backend side (self-referral guard
    + existing-wallet-transaction check), so safe to retry.
    """
    return await call_internal_backend(
        path=f"/internal/orders/{order_id}/process-referral",
        label=f"Referral processing for order {order_id}",
    )

async def generate_and_send_invoice(ctx, order_number: int) -> dict:
    path: str = f"/internal/orders/{order_number}/generate-invoice"
    return await call_internal_backend(
        path=path,
        label=f"Invoice generation for order {order_number}",
    )
