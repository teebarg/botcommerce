
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

    # Use the new broadcast method
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
    # Get client IP for initial session tracking
    ip = ws.client.host
    session_key = f"session:{ip}"
    user_id = None  # Will be set when user sends init message

    # Get location for this IP
    location = "Nigeria"
    # location = await get_city(ip)

    # Create initial guest session
    cache.hset(session_key, mapping={
        "type": "guest",
        "path": "/",
        "location": location,
        "updated_at": str(int(time.time()))
    })
    cache.expire(session_key, seconds=120)

    # Connect as guest initially (using IP as temporary ID)
    if not await manager.connect(ip, ws, metadata={"ip": ip, "location": location}):
        logger.error(f"Failed to establish WebSocket connection for IP {ip}")
        return

    # Broadcast updated sessions
    await broadcast_sessions(cache)

    try:
        while True:
            msg = await ws.receive_text()
            logger.info(f"🚀 Received message: {msg}")

            try:
                payload = json.loads(msg)
                message_type = payload.get("type")

                if message_type == "init":
                    # User is authenticating, upgrade from guest to user session
                    user_id = payload.get("id")
                    email = payload.get("email")

                    if user_id:
                        # Disconnect the guest connection
                        # await manager.disconnect(ip)

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

                        # Connect as authenticated user
                        # if await manager.connect(user_id, ws, metadata={
                        #     "ip": ip,
                        #     "email": email,
                        #     "location": location
                        # }):
                        #     session_key = user_session_key
                        #     logger.info(f"User {user_id} authenticated and connected")
                        # else:
                        #     logger.error(f"Failed to connect user {user_id}")
                        #     continue

                        # Promote the existing connection from IP → user_id
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
                    # Handle heartbeat/ping
                    current_user = user_id if user_id else ip
                    cache.hset_field(key=session_key, field="updated_at", value=str(int(time.time())))

                    # Update heartbeat in connection manager
                    if user_id:
                        await manager.handle_heartbeat_response(user_id)
                    else:
                        await manager.handle_heartbeat_response(ip)

                elif message_type == "path":
                    # Update current path
                    path = payload.get("path", "/")
                    cache.hset_field(key=session_key, field="path", value=path)

                elif message_type == "join_group":
                    # Handle group joining
                    group_name = payload.get("group")
                    if group_name and user_id:
                        await manager.add_user_to_group(user_id, group_name)
                        logger.info(f"User {user_id} joined group {group_name}")

                elif message_type == "leave_group":
                    # Handle group leaving
                    group_name = payload.get("group")
                    if group_name and user_id:
                        await manager.remove_user_from_group(user_id, group_name)
                        logger.info(f"User {user_id} left group {group_name}")

                # Extend session expiry and broadcast updates
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
        # Clean up connection
        if user_id:
            await manager.disconnect(user_id)
            cache.delete(f"session:{user_id}")
        else:
            await manager.disconnect(ip)
            cache.delete(f"session:{ip}")

        # Broadcast updated sessions after cleanup
        await broadcast_sessions(cache)

# async def get_city(ip: str) -> str:
#     try:
#         async with httpx.AsyncClient() as client:
#             res = await client.get(f"https://ipapi.co/{ip}/city")
#             return res.text.strip()
#     except Exception as e:
#         logger.error(f"An error occurred in get_city - {e}")
#         return "Unknown"

# async def broadcast_sessions(cache: deps.CacheService):
#     keys = cache.keys("session:*")
#     sessions = []
#     for key in keys:
#         data = cache.hgetall(key)
#         sessions.append({
#             "id": key.replace("session:", ""),
#             "type": data.get("type", "guest"),
#             "email": data.get("email", "Unknown"),
#             "location": data.get("location", "Unknown"),
#             "path": data.get("path", "/"),
#             "last_seen": int(time.time()) - int(data.get("updated_at", 0))
#         })
#     await manager.broadcast_all({"users": sessions}, type="online-users")

# @router.websocket("/")
# async def websocket(ws: WebSocket, cache: deps.CacheService):
#     """
#     Handles the WebSocket endpoint.

#     Args:
#         id (str): User id.
#         websocket (WebSocket): The WebSocket connection.

#     Returns:
#         None
#     """
#     await ws.accept()
#     ip = ws.client.host
#     key = f"session:{ip}"

#     location = await get_city(ip)

#     cache.hset(key, mapping={
#         "type": "guest",
#         "path": "/",
#         "location": location,
#         "updated_at": str(int(time.time()))
#     })
#     cache.expire(key, seconds=120)
#     await broadcast_sessions(cache)

#     try:
#         while True:
#             msg = await ws.receive_text()
#             print("🚀 ~ msg:", msg)
#             try:
#                 payload = json.loads(msg)
#                 if payload.get("type") == "init":
#                     id = payload.get("id")
#                     key = f"session:{id}"
#                     cache.hset_field(key=key, field="type", value="user")
#                     cache.hset_field(key=key, field="email", value=payload.get("email"))
#                     cache.hset_field(key=key, field="updated_at", value=str(int(time.time())))
#                     await manager.connect(id=id, websocket=ws)
#                 if payload.get("type") == "ping":
#                     cache.hset_field(key=key, field="updated_at", value=str(int(time.time())))
#                 elif payload.get("type") == "path":
#                     cache.hset_field(key=key, field="path", value=payload.get("path", "/"))
#                 cache.expire(key, seconds=120)
#                 await broadcast_sessions(cache)
#             except Exception as e:
#                 logger.error(f"An error occurred in ws_presence - {e}")
#                 continue
#     except WebSocketDisconnect as e:
#         logger.error(f"An error occurred in WebSocketDisconnect except - {e}")
#         manager.disconnect(websocket)


# async def relay_notifications(queue_name: str):
#     try:
#         connection = await aio_pika.connect_robust(settings.RABBITMQ_HOST)
#         channel = await connection.channel()
#         queue = await channel.declare_queue(queue_name)
#         async for message in queue:
#             await manager.broadcast(
#                 id="test", data={"message": message.body.decode()}, type=queue.name
#             )
#             # await message.ack()
#     except Exception as e:
#         logger.error(f"An error occurred in relay_notifications - {e}")
