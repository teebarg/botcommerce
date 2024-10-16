from typing import Dict

# import aio_pika
from fastapi import APIRouter, WebSocket, WebSocketDisconnect


class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}

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


# async def consume_events():
#     try:
#         connection = await aio_pika.connect_robust(f"amqp://{settings.RABBITMQ_HOST}")
#         channel = await connection.channel()
#         queue = await channel.declare_queue("auth_queue")

#         async with queue.iterator() as queue_iter:
#             async for message in queue_iter:
#                 async with message.process():
#                     event = json.loads(message.body)
#                     key = event.get("event")
#                     if key == "login":
#                         with Session(engine) as db:
#                             obj_in = event.get("content", {})
#                             try:
#                                 if model := db.exec(
#                                     select(User).where(
#                                         User.email == obj_in.get("email")
#                                     )
#                                 ).first():
#                                     model.sqlmodel_update(obj_in)
#                                 else:
#                                     # If the record doesn't exist, create a new record
#                                     model = User(**obj_in)
#                                     db.add(model)

#                                 db.commit()
#                             except Exception as e:
#                                 logger.error(f"Error creating or updating user {e}")
#                                 raise Exception(e) from e
#                     elif key == "new_user":
#                         await manager.broadcast(
#                             id="nK12eRTbo",
#                             data=event.get("content", {}),
#                             type="registration",
#                         )
#     except Exception as e:
#         logger.error(e)
