from typing import Annotated

from fastapi import Depends

from services.redis import get_redis_dependency, CacheService
from services.recommendation import get_recommendation_dependency, RecommendationEngine

RedisClient = Annotated[CacheService, Depends(get_redis_dependency)]

RecommendationClient = Annotated[RecommendationEngine, Depends(get_recommendation_dependency)]
