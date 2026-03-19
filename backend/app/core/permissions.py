from fastapi import Depends, HTTPException
from app.core.deps import verify_session


async def require_user(session=Depends(verify_session)):
    return session


async def require_admin(session=Depends(verify_session)):
    roles = session.get("roles")
    if not any(role in ["admin"] for role in roles):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges"
        )

    return session


async def require_super_admin(session=Depends(verify_session)):
    roles = session.get("roles")

    if "super-admin" not in roles:
        raise HTTPException(
            status_code=403,
            detail="Super admin required"
        )

    return session