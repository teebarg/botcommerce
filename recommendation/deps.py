from typing import Annotated

from fastapi import Depends
from redis import Redis

from services.redis import get_redis_dependency
from services.recommendation import get_recommendation_dependency, RecommendationEngine

RedisClient = Annotated[Redis, Depends(get_redis_dependency)]

RecommendationClient = Annotated[RecommendationEngine, Depends(get_recommendation_dependency)]
