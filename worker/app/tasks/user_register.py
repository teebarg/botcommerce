from app.security import call_internal_backend


async def user_register(ctx, user_id: int) -> dict:
    """
    arq job: delegates the welcome pipeline (coupon issuance + welcome email).
    """
    return await call_internal_backend(
        path=f"/internal/user/{user_id}/welcome",
        label=f"Welcome pipeline for user {user_id}",
    )
