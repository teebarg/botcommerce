
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.logging import logger
from app.core import deps
import json, time, httpx

class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, WebSocket] = {}

    async def connect(self, id: str, websocket: WebSocket) -> None:
        """
        Establishes a WebSocket connection and adds it to the list of active connections.

        Parameters:
        - websocket: The WebSocket object representing the connection.

        Returns:
        - None
        """
        self.connections[id] = websocket
        logger.info(f"WebSocket connection established for user {id}")

    def disconnect(self, id: str) -> None:
        """
        Disconnects a WebSocket connection.

        Parameters:
        - websocket (WebSocket): The WebSocket connection to be disconnected.

        Returns:
        None
        """
        if id in self.connections:
            del self.connections[id]

    async def broadcast(self, id: str, data: dict, type: str = "general") -> None:
        """
        Broadcasts the given data to a specific connection.

        Args:
            id (str): The ID of the connection to which the data will be sent.
            data (dict): The data to be sent as a JSON object.
            type (str, optional): The type of the message. Defaults to "general".

        Returns:
            None
        """
        if id in self.connections:
            websocket = self.connections[id]
            await websocket.send_json({**data, "type": type})

    # broadcast all sessions
    async def broadcast_all(self, data: dict, type: str = "general"):
        """
        Broadcasts the given data to all active connections.

        Args:
            data (dict): The data to be sent as a JSON object.
            type (str, optional): The type of the message. Defaults to "general".
        Returns:
            None
        """
        try:
            for conn in self.connections.values():
                await conn.send_json({**data, "type": type})
        except Exception as e:
            logger.error(f"An error occurred in broadcast_all - {e}")


manager = ConnectionManager()

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
    await manager.broadcast_all({"users": sessions}, type="online-users")

@router.websocket("/")
async def websocket(ws: WebSocket, cache: deps.CacheService):
    """
    Handles the WebSocket endpoint.

    Args:
        id (str): User id.
        websocket (WebSocket): The WebSocket connection.

    Returns:
        None
    """
    await ws.accept()
    ip = ws.client.host
    key = f"session:{ip}"

    location = await get_city(ip)

    cache.hset(key, mapping={
        "type": "guest",
        "path": "/",
        "location": location,
        "updated_at": str(int(time.time()))
    })
    cache.expire(key, seconds=120)
    await broadcast_sessions(cache)

    try:
        while True:
            msg = await ws.receive_text()
            try:
                payload = json.loads(msg)
                if payload.get("type") == "init":
                    id = payload.get("id")
                    key = f"session:{id}"
                    cache.hset_field(key=key, field="type", value="user")
                    cache.hset_field(key=key, field="email", value=payload.get("email"))
                    cache.hset_field(key=key, field="updated_at", value=str(int(time.time())))
                    await manager.connect(id=id, websocket=ws)
                if payload.get("type") == "ping":
                    cache.hset_field(key=key, field="updated_at", value=str(int(time.time())))
                elif payload.get("type") == "path":
                    cache.hset_field(key=key, field="path", value=payload.get("path", "/"))
                cache.expire(key, seconds=120)
                await broadcast_sessions(cache)
            except Exception as e:
                logger.error(f"An error occurred in ws_presence - {e}")
                continue
    except WebSocketDisconnect as e:
        logger.error(f"An error occurred in WebSocketDisconnect except - {e}")
        manager.disconnect(websocket)


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


# @router.websocket("/notifications/test")
# async def websocket_endpoint(websocket: WebSocket):
#     await manager.connect(id="test", websocket=websocket)
#     try:
#         while True:
#             await relay_notifications("notifications")
#     except WebSocketDisconnect as e:
#         logger.error(f"An error occurred - {e}")
#         manager.disconnect(websocket)
