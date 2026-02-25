import json
import logging
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema import HumanMessage, AIMessage
# from langchain_core.messages import HumanMessage, AIMessage
import redis as redis_client

logger = logging.getLogger(__name__)

# Keep last N exchanges in context (controls token usage)
MEMORY_WINDOW_SIZE = 10
SESSION_TTL_SECONDS = 60 * 60 * 2  # 2 hours


def get_redis() -> redis_client.Redis:
    from app.config import get_settings
    settings = get_settings()
    return redis_client.from_url(settings.redis_url, decode_responses=True)


def _redis_key(session_id: str) -> str:
    return f"chat_history:{session_id}"


def load_memory_from_redis(session_id: str) -> ConversationBufferWindowMemory:
    """
    Load chat history from Redis and return a LangChain memory object.
    If no history exists, returns fresh memory.
    """
    memory = ConversationBufferWindowMemory(
        k=MEMORY_WINDOW_SIZE,
        memory_key="chat_history",
        return_messages=True,
        input_key="input",
        output_key="output",
    )

    try:
        r = get_redis()
        raw = r.get(_redis_key(session_id))

        if raw:
            history = json.loads(raw)
            for msg in history:
                if msg["role"] == "human":
                    memory.chat_memory.add_message(HumanMessage(content=msg["content"]))
                elif msg["role"] == "ai":
                    memory.chat_memory.add_message(AIMessage(content=msg["content"]))
            logger.debug(f"Loaded {len(history)} messages for session {session_id}")

    except Exception as e:
        logger.warning(f"Could not load memory from Redis for {session_id}: {e}")

    return memory


def save_memory_to_redis(session_id: str, memory: ConversationBufferWindowMemory) -> None:
    """Persist updated memory back to Redis with TTL."""
    try:
        r = get_redis()
        messages = memory.chat_memory.messages

        serialized = []
        for msg in messages:
            if isinstance(msg, HumanMessage):
                serialized.append({"role": "human", "content": msg.content})
            elif isinstance(msg, AIMessage):
                serialized.append({"role": "ai", "content": msg.content})

        r.setex(
            _redis_key(session_id),
            SESSION_TTL_SECONDS,
            json.dumps(serialized),
        )
        logger.debug(f"Saved {len(serialized)} messages for session {session_id}")

    except Exception as e:
        logger.warning(f"Could not save memory to Redis for {session_id}: {e}")


def clear_session(session_id: str) -> None:
    """Delete a session's memory (useful for testing or user logout)."""
    try:
        r = get_redis()
        r.delete(_redis_key(session_id))
        logger.info(f"Cleared session: {session_id}")
    except Exception as e:
        logger.warning(f"Could not clear session {session_id}: {e}")
