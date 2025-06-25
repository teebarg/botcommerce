
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.logging import logger
from app.core import deps

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
        await websocket.accept()
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
        Broadcasts the given data to all active connections.

        Args:
            data (dict): The data to be sent as a JSON object.

        Returns:
            None
        """
        if id in self.connections:
            websocket = self.connections[id]
            await websocket.send_json({**data, "type": type})


manager = ConnectionManager()

router = APIRouter()


async def broadcast_online_users():
    keys = await redis_client.keys("online:*")
    user_list = [k.replace("online:", "") for k in keys]
    manager.broadcast("online-users", {"users": user_list}, type="online-users")
    # for conn in active_connections:
    #     await conn.send_json({"event": "online-users", "users": user_list})

@router.websocket("/ws")
async def ws_presence(websocket: WebSocket, cache: deps.CacheService):
    await websocket.accept()
    username = websocket.cookies.get("username")
    ip = websocket.client.host
    user_id = username or f"guest:{ip}"

    key = f"online:{user_id}"
    cache.set(key, "online", ex=60)
    await broadcast_online_users()

    try:
        while True:
            await websocket.receive_text()  # keep alive
            await cache.expire(key, 60)
    except WebSocketDisconnect:
        cache.delete(key)
        await broadcast_online_users()

# WebSocket route for clients to listen for real-time updates
@router.websocket("/{id}/")
async def websocket(id: str, websocket: WebSocket):
    """
    Handles the WebSocket endpoint.

    Args:
        id (str): User id.
        websocket (WebSocket): The WebSocket connection.

    Returns:
        None
    """
    await manager.connect(id=id, websocket=websocket)
    try:
        while True:
            await websocket.receive_text()  # WebSocket remains open
    except WebSocketDisconnect:
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
