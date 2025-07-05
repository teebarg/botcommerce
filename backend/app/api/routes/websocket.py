
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.logging import logger
import json, time, httpx
from app.services.websocket import manager
from app.services.session_store import session_store, SessionStore

router = APIRouter()


async def get_city(ip: str) -> str:
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"https://ipapi.co/{ip}/city")
            return res.text.strip()
    except Exception as e:
        logger.error(f"An error occurred in get_city - {e}")
        return "Unknown"

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
async def websocket(ws: WebSocket):
    """
    Handles the WebSocket endpoint with RedisConnectionManager.

    Args:
        ws (WebSocket): The WebSocket connection.

    Returns:
        None
    """
    ip = ws.client.host
    session_key = f"session:{ip}"
    user_id = None
    location = await get_city(ip)

    session_store.set(session_key, {
        "type": "guest",
        "path": "/",
        "location": location if location else "Unknown",
        "updated_at": str(int(time.time()))
    })

    if not await manager.connect(ip, ws, metadata={"ip": ip, "location": location}):
        logger.error(f"Failed to establish WebSocket connection for IP {ip}")
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
                        user_session_key = f"session:{user_id}"
                        session_store.set(user_session_key, {
                            "type": "user",
                            "email": email or "Unknown",
                            "location": location if location else "Unknown",
                            "path": "/",
                            "updated_at": str(int(time.time()))
                        })

                        if await manager.promote_connection(ip, user_id, metadata={
                            "ip": ip,
                            "email": email,
                            "location": location
                        }):
                            logger.info(f"Promoted connection from {ip} to {user_id}")
                        else:
                            logger.error(f"Failed to promote connection from {ip} to {user_id}")
                            continue

                elif message_type == "ping":
                    await manager.handle_heartbeat(user_id if user_id else ip)

                elif message_type == "path":
                    path = payload.get("path", "/")
                    session_store.update_field(
                        f"session:{user_id or ip}", "path", path
                    )

                session_store.update_field(
                    f"session:{user_id or ip}", "updated_at", str(int(time.time()))
                )

                await broadcast_sessions(session_store)

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {msg}")
                continue
            except Exception as e:
                logger.error(f"An error occurred processing message: {e}")
                continue

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id or ip}")
    except Exception as e:
        logger.error(f"Unexpected error in websocket handler: {e}")
    finally:
        final_key = f"session:{user_id or ip}"
        await manager.disconnect(user_id or ip)
        session_store.delete(final_key)
        await broadcast_sessions(session_store)
