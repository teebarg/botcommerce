# import json
# import logging
# # from langchain.schema import HumanMessage, AIMessage
# from langchain_core.messages import HumanMessage, AIMessage
# # from langchain.memory import ConversationBufferWindowMemory
# from langchain_classic.memory import ConversationBufferWindowMemory
# import redis as redis_client

# logger = logging.getLogger(__name__)

# # Keep last N exchanges in context (controls token usage)
# MEMORY_WINDOW_SIZE = 10
# SESSION_TTL_SECONDS = 60 * 60 * 2  # 2 hours


# def get_redis() -> redis_client.Redis:
#     from app.config import get_settings
#     settings = get_settings()
#     return redis_client.from_url(settings.REDIS_URL, decode_responses=True)


# def _redis_key(session_id: str) -> str:
#     return f"chat_history:{session_id}"

# def load_memory_from_redis(session_id: str) -> ConversationBufferWindowMemory:
#     """
#     Load chat history from Redis and return a LangChain memory object.
#     If no history exists, returns fresh memory.
#     """
#     memory = ConversationBufferWindowMemory(
#         k=MEMORY_WINDOW_SIZE,
#         memory_key="chat_history",
#         return_messages=True,
#         input_key="input",
#         output_key="output",
#     )

#     try:
#         r = get_redis()
#         raw = r.get(_redis_key(session_id))

#         if raw:
#             history = json.loads(raw)
#             for msg in history:
#                 if msg["role"] == "human":
#                     memory.chat_memory.add_message(HumanMessage(content=msg["content"]))
#                 elif msg["role"] == "ai":
#                     memory.chat_memory.add_message(AIMessage(content=msg["content"]))
#             logger.debug(f"Loaded {len(history)} messages for session {session_id}")

#     except Exception as e:
#         logger.warning(f"Could not load memory from Redis for {session_id}: {e}")

#     return memory


# def save_memory_to_redis(session_id: str, memory: ConversationBufferWindowMemory) -> None:
#     """Persist updated memory back to Redis with TTL."""
#     try:
#         r = get_redis()
#         messages = memory.chat_memory.messages

#         serialized = []
#         for msg in messages:
#             if isinstance(msg, HumanMessage):
#                 serialized.append({"role": "human", "content": msg.content})
#             elif isinstance(msg, AIMessage):
#                 serialized.append({"role": "ai", "content": msg.content})

#         r.setex(
#             _redis_key(session_id),
#             SESSION_TTL_SECONDS,
#             json.dumps(serialized),
#         )
#         logger.debug(f"Saved {len(serialized)} messages for session {session_id}")

#     except Exception as e:
#         logger.warning(f"Could not save memory to Redis for {session_id}: {e}")


# def clear_session(session_id: str) -> None:
#     """Delete a session's memory (useful for testing or user logout)."""
#     try:
#         r = get_redis()
#         r.delete(_redis_key(session_id))
#         logger.info(f"Cleared session: {session_id}")
#     except Exception as e:
#         logger.warning(f"Could not clear session {session_id}: {e}")

import json
import logging
from typing import Optional

import redis
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)

from app.config import get_settings

logger = logging.getLogger(__name__)

# Message type → class mapping for deserialisation
_MESSAGE_TYPES = {
    "human": HumanMessage,
    "ai": AIMessage,
    "system": SystemMessage,
    "tool": ToolMessage,
}


def _get_redis() -> redis.Redis:
    settings = get_settings()
    return redis.from_url(settings.REDIS_URL, decode_responses=True)


def _serialise(messages: list[BaseMessage]) -> str:
    """Convert a list of BaseMessages to a JSON string."""
    data = []
    for msg in messages:
        entry: dict = {"type": msg.type, "content": msg.content}
        # Preserve tool_calls on AIMessages (needed for LangGraph tool routing)
        if isinstance(msg, AIMessage) and msg.tool_calls:
            entry["tool_calls"] = msg.tool_calls
        # Preserve tool message metadata
        if isinstance(msg, ToolMessage):
            entry["tool_call_id"] = msg.tool_call_id
            entry["name"] = getattr(msg, "name", None)
        data.append(entry)
    return json.dumps(data)


def _deserialise(raw: str) -> list[BaseMessage]:
    """Rebuild BaseMessage objects from a JSON string."""
    messages = []
    for entry in json.loads(raw):
        msg_type = entry.get("type", "human")
        content = entry.get("content", "")
        cls = _MESSAGE_TYPES.get(msg_type, HumanMessage)

        if msg_type == "ai":
            msg = AIMessage(
                content=content,
                tool_calls=entry.get("tool_calls", []),
            )
        elif msg_type == "tool":
            msg = ToolMessage(
                content=content,
                tool_call_id=entry.get("tool_call_id", ""),
                name=entry.get("name", ""),
            )
        else:
            msg = cls(content=content)

        messages.append(msg)
    return messages


def load_messages_from_redis(session_id: str) -> list[BaseMessage]:
    """Return the stored message history for a session, or [] if none."""
    try:
        r = _get_redis()
        settings = get_settings()
        key = f"chat:{session_id}:messages"
        raw = r.get(key)
        if not raw:
            return []
        return _deserialise(raw)
    except Exception as e:
        logger.warning(f"[Memory] Could not load messages for {session_id}: {e}")
        return []


def save_messages_to_redis(
    session_id: str,
    messages: list[BaseMessage],
    ttl_seconds: int = 3600,
) -> None:
    """Persist a message list to Redis with a TTL."""
    try:
        r = _get_redis()
        key = f"chat:{session_id}:messages"
        r.setex(key, ttl_seconds, _serialise(messages))
    except Exception as e:
        logger.warning(f"[Memory] Could not save messages for {session_id}: {e}")


def clear_session(session_id: str) -> None:
    """Delete all stored messages for a session."""
    try:
        r = _get_redis()
        r.delete(f"chat:{session_id}:messages")
        logger.info(f"[Memory] Cleared session {session_id}")
    except Exception as e:
        logger.warning(f"[Memory] Could not clear session {session_id}: {e}")