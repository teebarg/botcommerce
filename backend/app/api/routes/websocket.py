
from fastapi import APIRouter, WebSocket, WebSocketDisconnect


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
