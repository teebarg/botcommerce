from fastapi import Depends, HTTPException
from app.core.deps import verify_session


async def require_user(session=Depends(verify_session)):
    return session


def _get_roles(user):
    roles = user.get("roles", [])

    if roles is None:
        return []

    if not isinstance(roles, list):
        return [roles]

    return roles


async def require_admin(session=Depends(verify_session)):
    user = session.get("user")
    roles = _get_roles(user)
    if not any(role in ["admin"] for role in roles):
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges"
        )

    return user


async def require_super_admin(session=Depends(verify_session)):
    user = session.get("user")
    roles = _get_roles(user)

    if "super-admin" not in roles:
        raise HTTPException(
            status_code=403,
            detail="Super admin required"
        )

    return user