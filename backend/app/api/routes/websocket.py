
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.logging import logger
import json, time
from app.services.websocket import manager
from app.services.session_store import session_store, SessionStore
from app.redis_client import redis_client

router = APIRouter()

async def broadcast_sessions(session_store: SessionStore):
    sessions = []
    all_sessions = session_store.get_all_with_prefix("session:")
    for key, data in all_sessions.items():
        sessions.append({
            "id": key.replace("session:", ""),
            "type": data.get("type", "guest"),
            "email": data.get("email", "Unknown"),
            "location": data.get("location", "Unknown"),
            "path": data.get("path", "/"),
            "last_seen": int(time.time()) - int(data.get("updated_at", 0))
        })

    await manager.broadcast_to_all({"users": sessions}, "online-users")

@router.websocket("/")
async def websocket(ws: WebSocket) -> None:
    """
    Handles the WebSocket endpoint with RedisConnectionManager.

    Args:
        ws (WebSocket): The WebSocket connection.

    Returns:
        None
    """
    ip: str = ws.client.host
    app_session_id: str = ws.query_params.get("session_id")
    session_key: str = f"session:{app_session_id}"
    user_id = None

    session_store.set(session_key, {
        "type": "guest",
        "path": "/",
        "location": "Unknown",
        "updated_at": str(int(time.time()))
    })

    if not await manager.connect(app_session_id, ws, metadata={"ip": ip, "location": "Unknown"}):
        logger.error(f"Failed to establish WebSocket connection for {app_session_id}")
        return

    await broadcast_sessions(session_store)

    try:
        while True:
            msg = await ws.receive_text()
            try:
                payload = json.loads(msg)
                message_type = payload.get("type")

                if message_type == "init":
                    user_id = payload.get("id")
                    email = payload.get("email")

                    if user_id:
                        user_session_key: str = f"session:{user_id}"
                        session_store.set(user_session_key, {
                            "type": "user",
                            "email": email or "Unknown",
                            "location": "Unknown",
                            "path": "/",
                            "updated_at": str(int(time.time()))
                    })

                        if await manager.promote_connection(old_id=app_session_id, new_id=user_id):
                            session_id = await redis_client.get(f"chat_session:{app_session_id}")
                            if session_id:
                                await redis_client.set(f"chat_user:{session_id}", user_id)
                                await redis_client.delete(f"chat_session:{app_session_id}")
                                logger.info(f"Updated chat mapping {session_id} → {user_id}")
                        else:
                            await manager.register(user_id=user_id, websocket=ws)
                            logger.debug(f"Promotion failed, registered {user_id} directly")
                            continue

                elif message_type == "ping":
                    await manager.handle_heartbeat(user_id if user_id else app_session_id)

                elif message_type == "path":
                    path = payload.get("path", "/")
                    session_store.update_field(
                        f"session:{user_id or app_session_id}", "path", path
                    )

                session_store.update_field(
                    f"session:{user_id or app_session_id}", "updated_at", str(int(time.time()))
                )

                await broadcast_sessions(session_store)

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {msg}")
                continue
            except Exception as e:
                logger.error(f"An error occurred processing message: {e}")
                continue

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id or app_session_id}")
    except Exception as e:
        logger.error(f"Unexpected error in websocket handler: {e}")
    finally:
        final_key = f"session:{user_id or app_session_id}"
        await manager.disconnect(user_id or app_session_id)
        session_store.delete(final_key)
        await broadcast_sessions(session_store)
