
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.logging import logger
import json, time
from app.services.websocket import manager
from app.redis_client import redis_client

router = APIRouter()

@router.websocket("/")
async def websocket(ws: WebSocket) -> None:
    """
    Handles the WebSocket endpoint with RedisConnectionManager.

    Args:
        ws (WebSocket): The WebSocket connection.

    Returns:
        None
    """
    app_session_id: str = ws.query_params.get("session_id")
    user_id = None

    if not await manager.connect(app_session_id, ws, metadata={
        "ip": ws.client.host,
        "type": "guest",
        "location": "Unknown",
        "path": "/",
        "updated_at": str(int(time.time()))
    }):
        return

    await manager.broadcast_sessions()

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
                        if await manager.promote_connection(old_id=app_session_id, new_id=user_id, metadata={
                            "type": "user",
                            "email": email or "Unknown",
                            "location": "Unknown",
                            "path": "/",
                            "updated_at": str(int(time.time()))
                        }):
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
                    await manager.handle_heartbeat_field(user_id=user_id or app_session_id, field="updated_at", value=str(int(time.time())))

                elif message_type == "path":
                    await manager.handle_heartbeat_field(user_id=user_id or app_session_id, field="path", value=payload.get("path", "/"))

                await manager.broadcast_sessions()

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
        await manager.disconnect(user_id or app_session_id)
        await manager.broadcast_sessions()
