import asyncio, time
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone, timedelta
from app.core.logging import logger
from typing import Dict, Optional

class InMemoryWebSocketManager:
    def __init__(self, idle_timeout_seconds: int = 60 * 5) -> None:
        self.connections: Dict[str, WebSocket] = {}
        self.heartbeats: Dict[str, Dict] = {}
        self.idle_timeout = timedelta(seconds=idle_timeout_seconds)
        self.cleanup_task = None

    async def start(self) -> None:
        """Start background tasks (like idle cleanup)."""
        if not self.cleanup_task:
            self.cleanup_task = asyncio.create_task(self._idle_cleanup_loop())

    async def register(self, user_id: str, websocket: WebSocket) -> None:
        """Register an already-accepted WebSocket under a new ID."""
        self.connections[str(user_id)] = websocket

    async def connect(self, user_id: str, websocket: WebSocket, metadata: Optional[dict] = None) -> bool:
        try:
            await websocket.accept()
            self.connections[str(user_id)] = websocket
            self.heartbeats[str(user_id)] = metadata
            logger.debug(f"✅ User {user_id} connected.")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to establish WebSocket connection for {user_id}: {e}")
            return False

    async def disconnect(self, user_id: str) -> None:
        if user_id in self.connections:
            try:
                await self.connections[str(user_id)].close()
            except:
                pass
            try:
                del self.connections[str(user_id)]
                self.heartbeats.pop(str(user_id), None)
            except Exception as e:
                logger.error(f"❌ Failed to disconnect user {user_id}: {e}")
            logger.debug(f"👋 User {user_id} disconnected.")

    async def send_to_user(self, user_id: str, data: dict, message_type: str = "general") -> bool:
        if user_id not in self.connections:
            logger.warning(f"⚠️ User {user_id} not connected.")
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

    async def handle_heartbeat(self, user_id: str, metadata: Dict) -> None:
        """Update the last seen heartbeat timestamp."""
        if user_id in self.heartbeats:
            self.heartbeats[user_id] = metadata

    async def handle_heartbeat_field(self, user_id: str, field: str, value: str) -> None:
        """Update the heartbeat field."""
        if str(user_id) in self.heartbeats:
            try:
                self.heartbeats[str(user_id)][field] = value
            except Exception as e:
                logger.error(f"Failed to update heartbeat field {field} for user {user_id}: {e}")


    async def broadcast_sessions(self):
        sessions = []
        for key, data in self.heartbeats.items():
            sessions.append({
                "id": key,
                "type": data.get("type", "guest"),
                "email": data.get("email", "Unknown"),
                "location": data.get("location", "Unknown"),
                "path": data.get("path", "/"),
                "last_seen": int(time.time()) - int(data.get("updated_at", 0))
            })

        await manager.broadcast_to_all({"users": sessions}, "online-users")

    async def promote_connection(self, old_id: str, new_id: str, metadata: Dict) -> bool:
        if old_id not in self.connections:
            return False

        self.connections[str(new_id)] = self.connections.pop(old_id)
        old_metadata = self.heartbeats.pop(old_id, {})
        self.heartbeats[str(new_id)] = {**old_metadata, **metadata}

        logger.debug(f"🔁 Promoted connection from {old_id} → {new_id}")
        return True

    async def _idle_cleanup_loop(self):
        while True:
            now = int(time.time())
            to_disconnect = [
                user_id for user_id, data in self.heartbeats.items()
                if isinstance(data, dict) and
                (now - int(data.get("updated_at", now))) > self.idle_timeout.seconds
            ]

            for user_id in to_disconnect:
                logger.debug(f"⏳ Disconnecting idle user {user_id}")
                await self.disconnect(user_id)

            await asyncio.sleep(60)


manager = InMemoryWebSocketManager()
