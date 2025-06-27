
from fastapi import WebSocket
from app.core.logging import logger
from asyncio import Lock

class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, WebSocket] = {}
        self.lock = Lock()

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
        Broadcasts the given data to a specific connection.

        Args:
            id (str): The ID of the connection to which the data will be sent.
            data (dict): The data to be sent as a JSON object.
            type (str, optional): The type of the message. Defaults to "general".

        Returns:
            None
        """
        print(self.connections)
        print(id)
        print(data)
        print(type)
        print(self.connections.get(id))
        print("----------------")
        # try:
        #     for conn in self.connections.values():
        #         await conn.send_json({**data, "type": type})
        # except Exception as e:
        #     logger.error(f"An error occurred in broadcast_all - {e}")
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
        print(self.connections)
        try:
            for conn in self.connections.values():
                await conn.send_json({**data, "type": type})
        except Exception as e:
            logger.error(f"An error occurred in broadcast_all - {e}")


manager = ConnectionManager()