import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone, timedelta
from app.core.logging import logger
from typing import Dict, Optional

class InMemoryWebSocketManager:
    def __init__(self, idle_timeout_seconds: int = 60 * 5):
        self.connections: Dict[str, WebSocket] = {}
        self.heartbeats: Dict[str, datetime] = {}
        self.idle_timeout = timedelta(seconds=idle_timeout_seconds)
        self.cleanup_task = None

    async def start(self):
        """Start background tasks (like idle cleanup)."""
        if not self.cleanup_task:
            self.cleanup_task = asyncio.create_task(self._idle_cleanup_loop())

    async def connect(self, user_id: str, websocket: WebSocket, metadata: Optional[dict] = None) -> bool:
        try:
            await websocket.accept()
            self.connections[user_id] = websocket
            self.heartbeats[user_id] = datetime.now(timezone.utc)
            logger.info(f"✅ User {user_id} connected.")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect user {user_id}: {e}")
            return False

    async def disconnect(self, user_id: str) -> None:
        if user_id in self.connections:
            try:
                await self.connections[user_id].close()
            except:
                pass
            del self.connections[user_id]
            self.heartbeats.pop(user_id, None)
            logger.info(f"👋 User {user_id} disconnected.")

    async def send_to_user(self, user_id: str, data: dict, message_type: str = "general") -> bool:
        if user_id not in self.connections:
            return False

        message = {
            **data,
            "type": message_type,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        try:
            await self.connections[user_id].send_json(message)
            return True
        except WebSocketDisconnect:
            await self.disconnect(user_id)
            return False
        except Exception as e:
            logger.error(f"❌ Failed to send message to {user_id}: {e}")
            await self.disconnect(user_id)
            return False

    async def broadcast_to_all(self, data: dict, message_type: str = "broadcast") -> int:
        message = {
            **data,
            "type": message_type,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        sent = 0
        for user_id in list(self.connections.keys()):
            if await self.send_to_user(user_id, message, message_type=message_type):
                sent += 1

        return sent

    def get_connected_users(self) -> list:
        return list(self.connections.keys())

    def get_connection_count(self) -> int:
        return len(self.connections)

    async def handle_heartbeat(self, user_id: str) -> None:
        """Update the last seen heartbeat timestamp."""
        if user_id in self.heartbeats:
            self.heartbeats[user_id] = datetime.now(timezone.utc)

    async def promote_connection(self, old_id: str, new_id: str, metadata: Optional[dict] = None) -> bool:
        if old_id not in self.connections:
            return False

        self.connections[new_id] = self.connections.pop(old_id)
        self.heartbeats[new_id] = self.heartbeats.pop(old_id, datetime.now(timezone.utc))
        logger.info(f"🔁 Promoted connection from {old_id} → {new_id}")
        return True

    async def _idle_cleanup_loop(self):
        while True:
            now = datetime.now(timezone.utc)
            to_disconnect = [
                user_id for user_id, last_seen in self.heartbeats.items()
                if now - last_seen > self.idle_timeout
            ]

            for user_id in to_disconnect:
                logger.info(f"⏳ Disconnecting idle user {user_id}")
                await self.disconnect(user_id)

            await asyncio.sleep(10)


manager = InMemoryWebSocketManager()
