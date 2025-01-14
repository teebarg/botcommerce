from datetime import timedelta
from typing import Any

from redis import Redis

from app.core.config import settings
from app.core.logging import logger

# Initialize Redis client
redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    ssl=True,
    decode_responses=True,
)


class CacheService:
    def __init__(self, redis: Redis):
        self.redis = redis

    def set(
        self,
        key: str,
        value: Any,
        expire: int | None = timedelta(hours=24),
    ) -> bool:
        """
        Set a key-value pair in cache
        Args:
            key: Cache key
            value: Value to store
            expire: Time in seconds after which the key will expire
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            return self.redis.set(key, value, ex=expire)
        except Exception as e:
            logger.error(f"Error setting cache: {str(e)}")
            return False

    def get(self, key: str) -> str | None:
        """
        Get value from cache by key
        Args:
            key: Cache key
        Returns:
            Optional[str]: Value if exists, None otherwise
        """
        try:
            return self.redis.get(key)
        except Exception as e:
            logger.error(f"Error getting from cache: {str(e)}")
            return None

    def delete(self, key: str) -> bool:
        """
        Delete a key from cache
        Args:
            key: Cache key to delete
        Returns:
            bool: True if deleted, False otherwise
        """
        try:
            return bool(self.redis.delete(key))
        except Exception as e:
            logger.error(f"Error deleting from cache: {str(e)}")
            return False

    def exists(self, key: str) -> bool:
        """
        Check if a key exists in cache
        Args:
            key: Cache key to check
        Returns:
            bool: True if exists, False otherwise
        """
        try:
            return bool(self.redis.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache existence: {str(e)}")
            return False

    def clear(self) -> bool:
        """
        Clear all keys from the current database
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            return bool(self.redis.flushdb())
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
            return False

    def delete_pattern(self, pattern: str) -> bool:
        """
        Delete all keys matching a pattern
        Args:
            pattern: Pattern to match keys against (e.g., "product:*")
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            cursor = 0
            while True:
                cursor, keys = self.redis.scan(cursor, pattern, 100)
                if keys:
                    self.redis.delete(*keys)
                if cursor == 0:
                    break
            return True
        except Exception as e:
            logger.error(f"Error deleting pattern from cache: {str(e)}")
            return False

    def incr(self, key: str) -> int:
        """
        Increment the value of a key by 1
        Args:
            key: Cache key
        Returns:
            int: New value after increment
        """
        try:
            return self.redis.incr(key)
        except Exception as e:
            logger.error(f"Error incrementing cache key: {str(e)}")
            return 0

    def expire(self, key: str, seconds: int) -> bool:
        """
        Set expiration time for a key
        Args:
            key: Cache key
            seconds: Time in seconds until expiration
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            return self.redis.expire(key, seconds)
        except Exception as e:
            logger.error(f"Error setting expiration: {str(e)}")
            return False


# Dependencies
async def get_cache_service():
    return CacheService(redis_client)
