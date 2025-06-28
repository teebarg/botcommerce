import redis
import json
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone
import uuid
from app.core.logging import logger
from app.core.config import settings
from typing import Dict, Optional

class RedisConnectionManager:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

        # Local connections for this server instance
        self.local_connections: Dict[str, WebSocket] = {}

        # Unique server ID to identify this instance
        self.server_id = str(uuid.uuid4())

        # Redis keys
        self.connections_key = "ws:connections"
        self.messages_key = f"ws:messages:{self.server_id}"  # Server-specific message queue
        self.broadcast_key = "ws:broadcast_messages"

        # Start message polling
        self._polling_task = None
        logger.info(f"Initialized Redis WebSocket manager for server {self.server_id}")

    def _start_polling(self):
        """Start polling for messages if not already started."""
        if self._polling_task is None or self._polling_task.done():
            self._polling_task = asyncio.create_task(self._poll_messages())

    async def _poll_messages(self):
        """Poll Redis for messages directed to this server."""
        while True:
            try:
                # Check for broadcast messages
                broadcast_message = self.redis_client.lpop(self.broadcast_key)
                if broadcast_message:
                    try:
                        data = json.loads(broadcast_message)
                        await self._handle_broadcast_message(data)
                    except json.JSONDecodeError:
                        logger.error(f"Invalid broadcast message format: {broadcast_message}")

                # Check for server-specific messages
                server_message = self.redis_client.lpop(self.messages_key)
                if server_message:
                    try:
                        data = json.loads(server_message)
                        await self._handle_server_message(data)
                    except json.JSONDecodeError:
                        logger.error(f"Invalid server message format: {server_message}")

                # Small delay to prevent busy polling
                await asyncio.sleep(0.1)

            except Exception as e:
                logger.error(f"Error in message polling: {e}")
                await asyncio.sleep(1)

    async def connect(self, user_id: str, websocket: WebSocket, metadata: Optional[dict] = None) -> bool:
        """Connect user and register in Redis."""
        try:
            await websocket.accept()

            # Start polling if not already started
            self._start_polling()

            # Store connection locally
            self.local_connections[user_id] = websocket

            # Register in Redis with this server's ID
            connection_data = {
                "server_id": self.server_id,
                "connected_at": datetime.utcnow().isoformat(),
                "metadata": metadata or {}
            }

            self.redis_client.hset(
                self.connections_key,
                user_id,
                json.dumps(connection_data)
            )

            logger.info(f"User {user_id} connected to server {self.server_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to connect user {user_id}: {e}")
            return False

    async def disconnect(self, user_id: str) -> None:
        """Disconnect user and clean up Redis."""
        try:
            if user_id in self.local_connections:
                websocket = self.local_connections[user_id]
                try:
                    await websocket.close()
                except:
                    pass
                del self.local_connections[user_id]

            # Remove from Redis
            self.redis_client.hdel(self.connections_key, user_id)

            logger.info(f"User {user_id} disconnected from server {self.server_id}")

        except Exception as e:
            logger.error(f"Error disconnecting user {user_id}: {e}")

    async def send_to_user(self, user_id: str, data: dict, message_type: str = "general") -> bool:
        """Send message to specific user (may be on different server)."""
        try:
            user_info = self.redis_client.hget(self.connections_key, user_id)
            if not user_info:
                logger.warning(f"User {user_id} not connected")
                return False

            user_data = json.loads(user_info)
            target_server = user_data["server_id"]

            message = {
                **data,
                "type": message_type,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "target_user": user_id
            }

            if target_server == self.server_id:
                return await self._send_local_message(user_id, message)
            else:
                target_queue = f"ws:messages:{target_server}"
                self.redis_client.rpush(target_queue, json.dumps(message))
                return True

        except Exception as e:
            logger.error(f"Failed to send message to user {user_id}: {e}")
            return False

    async def broadcast_to_all(self, data: dict, message_type: str = "general") -> int:
        """Broadcast to all connected users across all servers."""
        try:
            message = {
                **data,
                "type": message_type,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "broadcast": True
            }

            self.redis_client.rpush(self.broadcast_key, json.dumps(message))

            total_connections = self.redis_client.hlen(self.connections_key)
            return total_connections

        except Exception as e:
            logger.error(f"Failed to broadcast message: {e}")
            return 0

    async def _send_local_message(self, user_id: str, message: dict) -> bool:
        """Send message to user connected to this server."""
        if user_id not in self.local_connections:
            return False

        try:
            websocket = self.local_connections[user_id]
            await websocket.send_json(message)
            return True
        except WebSocketDisconnect:
            await self.disconnect(user_id)
            return False
        except Exception as e:
            logger.error(f"Failed to send local message to {user_id}: {e}")
            await self.disconnect(user_id)
            return False

    async def _handle_broadcast_message(self, message: dict) -> None:
        """Handle broadcast message - send to all local connections."""
        for user_id in list(self.local_connections.keys()):
            await self._send_local_message(user_id, message)

    async def _handle_server_message(self, message: dict) -> None:
        """Handle server-specific message."""
        target_user = message.get("target_user")
        if target_user and target_user in self.local_connections:
            await self._send_local_message(target_user, message)

    def get_connected_users(self) -> list:
        """Get all connected users across all servers."""
        return list(self.redis_client.hkeys(self.connections_key))

    def get_local_users(self) -> list:
        """Get users connected to this server."""
        return list(self.local_connections.keys())

    def get_connection_count(self) -> int:
        """Get total connections across all servers."""
        return self.redis_client.hlen(self.connections_key)

    async def handle_heartbeat_response(self, user_id: str) -> None:
        """Handle heartbeat response from client."""
        user_info = self.redis_client.hget(self.connections_key, user_id)
        if user_info:
            user_data = json.loads(user_info)
            user_data["last_heartbeat"] = datetime.now(timezone.utc).isoformat()
            self.redis_client.hset(self.connections_key, user_id, json.dumps(user_data))

    async def add_user_to_group(self, user_id: str, group_name: str) -> bool:
        """Add user to a group (stored in Redis)."""
        try:
            group_key = f"group:{group_name}"
            self.redis_client.sadd(group_key, user_id)

            # Also track which groups the user is in
            user_groups_key = f"user_groups:{user_id}"
            self.redis_client.sadd(user_groups_key, group_name)

            logger.info(f"Added user {user_id} to group {group_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to add user {user_id} to group {group_name}: {e}")
            return False

    async def remove_user_from_group(self, user_id: str, group_name: str) -> bool:
        """Remove user from a group."""
        try:
            group_key = f"group:{group_name}"
            self.redis_client.srem(group_key, user_id)

            user_groups_key = f"user_groups:{user_id}"
            self.redis_client.srem(user_groups_key, group_name)

            logger.info(f"Removed user {user_id} from group {group_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to remove user {user_id} from group {group_name}: {e}")
            return False

    async def broadcast_to_group(self, group_name: str, data: dict, message_type: str = "group") -> int:
        """Broadcast to all users in a specific group."""
        try:
            group_key = f"group:{group_name}"
            user_ids = self.redis_client.smembers(group_key)

            if not user_ids:
                logger.warning(f"Group {group_name} is empty or doesn't exist")
                return 0

            successful_sends = 0
            for user_id in user_ids:
                if await self.send_to_user(user_id, data, message_type):
                    successful_sends += 1

            return successful_sends

        except Exception as e:
            logger.error(f"Failed to broadcast to group {group_name}: {e}")
            return 0

    async def cleanup_disconnected_users(self) -> int:
        """Clean up users whose servers are no longer running."""
        try:
            all_connections = self.redis_client.hgetall(self.connections_key)
            cleaned_count = 0

            for user_id, connection_data in all_connections.items():
                try:
                    data = json.loads(connection_data)
                    server_id = data["server_id"]

                    server_queue = f"ws:messages:{server_id}"
                    queue_exists = self.redis_client.exists(server_queue)

                    if not queue_exists and server_id != self.server_id:
                        self.redis_client.hdel(self.connections_key, user_id)
                        cleaned_count += 1
                        logger.info(f"Cleaned up connection for user {user_id} from dead server {server_id}")

                except json.JSONDecodeError:
                    self.redis_client.hdel(self.connections_key, user_id)
                    cleaned_count += 1

            return cleaned_count

        except Exception as e:
            logger.error(f"Error cleaning up disconnected users: {e}")
            return 0


    async def promote_connection(self, old_id: str, new_id: str, metadata: Optional[dict] = None) -> bool:
        """
        Promote a WebSocket connection from a guest (IP) to an authenticated user.
        Need this to avoid closing/reconnecting the socket.
        """
        try:
            if old_id not in self.local_connections:
                logger.warning(f"No active connection for {old_id} to promote.")
                return False

            websocket = self.local_connections.pop(old_id)
            self.local_connections[new_id] = websocket

            self.redis_client.hdel(self.connections_key, old_id)

            connection_data = {
                "server_id": self.server_id,
                "connected_at": datetime.now(timezone.utc).isoformat(),
                "metadata": metadata or {}
            }
            self.redis_client.hset(
                self.connections_key,
                new_id,
                json.dumps(connection_data)
            )

            logger.info(f"Promoted connection from {old_id} to {new_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to promote connection from {old_id} to {new_id}: {e}")
            return False

manager = RedisConnectionManager()
