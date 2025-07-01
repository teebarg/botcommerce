
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.logging import logger
from app.core import deps
import json, time, httpx
from app.services.websocket import manager

router = APIRouter()


async def get_city(ip: str) -> str:
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"https://ipapi.co/{ip}/city")
            return res.text.strip()
    except Exception as e:
        logger.error(f"An error occurred in get_city - {e}")
        return "Unknown"

async def broadcast_sessions(cache: deps.CacheService):
    """Broadcast current session data to all connected users."""
    keys = cache.keys("session:*")
    sessions = []
    for key in keys:
        data = cache.hgetall(key)
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
async def websocket(ws: WebSocket, cache: deps.CacheService):
    """
    Handles the WebSocket endpoint with RedisConnectionManager.

    Args:
        ws (WebSocket): The WebSocket connection.
        cache (CacheService): Cache service dependency.

    Returns:
        None
    """
    ip = ws.client.host
    session_key = f"session:{ip}"
    user_id = None
    # location = "Nigeria"
    location = await get_city(ip)

    # Create initial guest session
    cache.hset(session_key, mapping={
        "type": "guest",
        "path": "/",
        "location": location,
        "updated_at": str(int(time.time()))
    })
    cache.expire(session_key, seconds=120)

    if not await manager.connect(ip, ws, metadata={"ip": ip, "location": location}):
        logger.error(f"Failed to establish WebSocket connection for IP {ip}")
        return

    await broadcast_sessions(cache)

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
                        # Create new user session
                        user_session_key = f"session:{user_id}"
                        cache.hset(user_session_key, mapping={
                            "type": "user",
                            "email": email or "Unknown",
                            "location": location,
                            "path": "/",
                            "updated_at": str(int(time.time()))
                        })
                        cache.expire(user_session_key, seconds=120)

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
                    cache.hset_field(key=session_key, field="updated_at", value=str(int(time.time())))

                    if user_id:
                        await manager.handle_heartbeat_response(user_id)
                    else:
                        await manager.handle_heartbeat_response(ip)

                elif message_type == "path":
                    path = payload.get("path", "/")
                    cache.hset_field(key=session_key, field="path", value=path)

                cache.expire(session_key, seconds=120)
                await broadcast_sessions(cache)

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
        if user_id:
            await manager.disconnect(user_id)
            cache.delete(f"session:{user_id}")
        else:
            await manager.disconnect(ip)
            cache.delete(f"session:{ip}")

        await broadcast_sessions(cache)
