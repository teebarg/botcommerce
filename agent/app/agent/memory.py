from functools import lru_cache
import json
from app.logging import get_logger
import redis
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)

from app.config import settings

logger = get_logger(__name__)

# Message type → class mapping for deserialisation
_MESSAGE_TYPES = {
    "human": HumanMessage,
    "ai": AIMessage,
    "system": SystemMessage,
    "tool": ToolMessage,
}

@lru_cache(maxsize=1)
def _get_redis() -> redis.Redis:
    return redis.from_url(settings.REDIS_URL, decode_responses=True, max_connections=20)


def _normalise_content(content) -> str:
    """
    Always reduce content to a plain string before serialising.
    Handles:
      - str  → returned as-is
      - list of content blocks (Gemini/Anthropic style)
        e.g. [{"type": "text", "text": "..."}, ...]
      - anything else → str()
    This prevents list-content AIMessages being reconstructed from Redis
    and confusing the LLM into emitting raw JSON tool calls.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                parts.append(block.get("text", ""))
            else:
                parts.append(str(block))
        return "\n".join(p for p in parts if p)
    return str(content)


def _serialise(messages: list[BaseMessage]) -> str:
    """Convert a list of BaseMessages to a JSON string."""
    data = []
    for msg in messages:
        content = _normalise_content(msg.content)
        entry: dict = {"type": msg.type, "content": content}
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
        if not isinstance(content, str):
            content = _normalise_content(content)

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
        elif msg_type == "human":
            msg = HumanMessage(content=content)
        elif msg_type == "system":
            msg = SystemMessage(content=content)
        else:
            msg = HumanMessage(content=content)

        messages.append(msg)
    return messages


def load_messages_from_redis(session_id: str) -> list[BaseMessage]:
    """Return the stored message history for a session, or [] if none."""
    try:
        r = _get_redis()
        key = f"chat:{session_id}:messages"
        raw = r.get(key)
        if not raw:
            return []
        messages = _deserialise(raw)
        return [
            m for m in messages
            if not isinstance(m, ToolMessage)
            and not (isinstance(m, AIMessage) and m.tool_calls)
        ]
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
        clean = [
            m for m in messages
            if not isinstance(m, ToolMessage)
            and not (isinstance(m, AIMessage) and m.tool_calls)
        ]
        r = _get_redis()
        key = f"chat:{session_id}:messages"
        r.setex(key, ttl_seconds, _serialise(clean))
    except Exception as e:
        logger.warning(f"[Memory] Could not save messages for {session_id}: {e}")


def clear_session(session_id: str) -> None:
    """Delete all stored messages for a session."""
    try:
        r = _get_redis()
        r.delete(f"chat:{session_id}:messages")
        logger.debug(f"[Memory] Cleared session {session_id}")
    except Exception as e:
        logger.warning(f"[Memory] Could not clear session {session_id}: {e}")