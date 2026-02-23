from app.redis_client import redis_client as r
# import redis
import json

# r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def get_session_memory(session_id: str):
    data = r.get(session_id)
    return json.loads(data) if data else []

def save_session_memory(session_id: str, messages) -> None:
    r.set(session_id, json.dumps(messages), ex=3600)