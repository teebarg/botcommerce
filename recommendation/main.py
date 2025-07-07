from fastapi import FastAPI, BackgroundTasks
import numpy as np
import json
import redis.asyncio as redis
from config import settings

app = FastAPI(title="Recommendation Service", prefix="/api/recommendation")

# recommender = DemoCollaborativeRecommender()

# @app.get("/recommend", response_model=List[str])
# def recommend(user_id: int = Query(..., description="User ID for recommendations")):
#     return recommender.recommend(user_id)


redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


@app.post("/train")
async def train_model(background_tasks: BackgroundTasks):
    """Train recommendation models"""
    # This would typically run as a scheduled job
    background_tasks.add_task(retrain_recommendation_models)
    return {"status": "training started"}

@app.get("/user/{user_id}")
async def get_user_recommendations(
    user_id: str,
    limit: int = 10,
    strategy: str = "hybrid"
):
    """Get recommendations for a user"""
    
    # Check Redis cache first
    cache_key = f"recommendations:{user_id}:{strategy}:{limit}"
    cached_recs = await redis_client.get(cache_key)
    
    if cached_recs:
        return json.loads(cached_recs)
    
    engine = RecommendationEngine()
    
    if strategy == "collaborative":
        recommendations = await engine.get_collaborative_recommendations(user_id, limit)
    elif strategy == "content":
        recommendations = await engine.get_content_based_recommendations(user_id, limit)
    else:  # hybrid
        collab_recs = await engine.get_collaborative_recommendations(user_id, limit//2)
        content_recs = await engine.get_content_based_recommendations(user_id, limit//2)
        recommendations = merge_recommendations(collab_recs, content_recs)
    
    # Cache results for 1 hour
    await redis_client.setex(cache_key, 3600, json.dumps(recommendations))
    
    return recommendations
