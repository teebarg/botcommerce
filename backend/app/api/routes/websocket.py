import json
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from app.core.logging import logger
from app.services.cache import CacheService
from app.services.websocket import manager

router = APIRouter()

MAX_SESSION_ID_LEN = 64
MAX_PATH_LEN = 200


async def _authenticated_session(ws: WebSocket) -> dict | None:
    """The logged-in session behind this socket, from the session cookie.

    Identity is never taken from the client's own message: a client could otherwise
    claim any user id (or admin status) and receive that user's realtime events.
    """
    session_id = ws.cookies.get("session_id")
    if not session_id:
        return None
    try:
        return await CacheService(ws.app.state.redis).get_session(session_id)
    except Exception as e:
        logger.error(f"WebSocket session lookup failed: {e}")
        return None


@router.websocket("/")
async def websocket(ws: WebSocket) -> None:
    """Realtime channel: cache-invalidation pushes for everyone, online-users for admins."""
    app_session_id: str | None = ws.query_params.get("session_id")
    if not app_session_id or len(app_session_id) > MAX_SESSION_ID_LEN:
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id: str | None = None

    if not await manager.connect(app_session_id, ws, metadata={
        "ip": ws.client.host if ws.client else "unknown",
        "type": "guest",
        "location": "Unknown",
        "path": "/",
        "updated_at": str(int(time.time()))
    }):
        return

    try:
        redis = ws.app.state.redis
    except AttributeError as err:
        logger.error(f"Redis client not found in app.state. Check lifespan setup. {err}")
        await ws.close(code=status.WS_1011_INTERNAL_ERROR)
        return

    manager.schedule_sessions_broadcast()

    try:
        while True:
            msg = await ws.receive_text()
            try:
                payload = json.loads(msg)
                message_type = payload.get("type")

                if message_type == "init":
                    session = await _authenticated_session(ws)
                    if not session or not session.get("id"):
                        continue  # not logged in: stay a guest

                    user_id = str(session["id"])
                    metadata = {
                        "type": "user",
                        "email": session.get("email") or "Unknown",
                        "is_admin": "admin" in (session.get("roles") or []),
                        "location": "Unknown",
                        "path": "/",
                        "updated_at": str(int(time.time()))
                    }
                    if await manager.promote_connection(old_id=app_session_id, new_id=user_id, metadata=metadata):
                        chat_session_id = await redis.get(f"chat_session:{app_session_id}")
                        if chat_session_id:
                            await redis.set(f"chat_user:{chat_session_id}", user_id)
                            await redis.delete(f"chat_session:{app_session_id}")
                            logger.debug(f"Updated chat mapping {chat_session_id} → {user_id}")
                    else:
                        await manager.register(user_id=user_id, websocket=ws)
                        logger.debug(f"Promotion failed, registered {user_id} directly")
                    manager.schedule_sessions_broadcast()
                    continue

                elif message_type == "ping":
                    await manager.handle_heartbeat_field(user_id=user_id or app_session_id, field="updated_at", value=str(int(time.time())))

                elif message_type == "path":
                    path = str(payload.get("path", "/"))[:MAX_PATH_LEN]
                    await manager.handle_heartbeat_field(user_id=user_id or app_session_id, field="path", value=path)

            except json.JSONDecodeError:
                logger.error("Invalid JSON received on websocket")
                continue
            except Exception as e:
                logger.error(f"An error occurred processing message: {e}")
                continue

    except WebSocketDisconnect:
        logger.debug(f"WebSocket disconnected for user {user_id or app_session_id}")
    except Exception as e:
        logger.debug(f"Unexpected error in websocket handler: {e}")
    finally:
        await manager.disconnect(user_id or app_session_id)
        manager.schedule_sessions_broadcast()
