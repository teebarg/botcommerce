from typing import List, Any, Callable, Optional
from datetime import datetime, timedelta
from functools import wraps

import json
from fastapi import Request
from app.redis_client import redis_client
from app.core.logging import get_logger
from app.services.websocket import manager

logger = get_logger(__name__)

DEFAULT_EXPIRATION = int(timedelta(days=7).total_seconds())

def handle_redis_errors(default: Any = None):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                logger.error(f"[Redis] error in {func.__name__}: {str(e)}")
                return default
        return wrapper
    return decorator

class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
            
        if isinstance(o, bytes):
            try:
                # Attempt to decode standard text bytes safely
                return o.decode('utf-8')
            except UnicodeDecodeError:
                # If it's true binary data (e.g. encrypted files or image blobs), stringify it or hex encode it
                return o.hex()
                
        # Check if object actually has a __dict__ before accessing it
        if hasattr(o, '__dict__'):
            return o.__dict__
        return str(o)


async def set_session(session_id: str, data: dict, ttl=60 * 60 * 24 * 30):
    await redis_client.setex(f"session:{session_id}", ttl, json.dumps(data))

async def get_session(session_id: str):
    data = await redis_client.get(f"session:{session_id}")
    return json.loads(data) if data else None

async def delete_session(session_id: str):
    await redis_client.delete(f"session:{session_id}")
