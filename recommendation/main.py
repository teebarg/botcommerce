from fastapi import FastAPI, HTTPException, BackgroundTasks
from contextlib import asynccontextmanager
import numpy as np

from datetime import datetime
import logging
from db import database

from models import RecommendationResponse, RecommendationRequest
from services.recommendation import RecommendationEngine
from config import settings
import redis.asyncio as redis
from deps import RecommendationClient
from meilisearch import Client
from services.product_hydrator import ProductHydrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀connecting to dbs......:")
    await database.connect()
    logger.info("✅ ~ connected to pyscopg......:")
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_client.ping()
        app.state.redis = redis_client
        logger.info("✅ ~ connected to redis......:")
        meilisearch_client = Client(settings.MEILI_HOST, settings.MEILI_MASTER_KEY, timeout=1.5)
        app.state.meilisearch = meilisearch_client
        logger.info("✅ ~ connected to meilisearch......:")
        recommendation_engine = RecommendationEngine()
        await recommendation_engine.load_data_from_db()
        await recommendation_engine.update_models()
        app.state.recommendation_engine = recommendation_engine
        logger.info("Recommendation service started successfully")
    except Exception as e:
        logger.error(f"❌ ~ failed to connect to recommendation service......: {e}")
    yield
    await database.disconnect()


app = FastAPI(title="Recommendation Service", prefix="/api/recommendation", lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Recommendation Service", "status": "running"}

@app.get("/health")
async def health_check(recommendation: RecommendationClient):
    return {
        "status": "healthy",
        "models_last_updated": recommendation.model_last_updated,
        "total_products": len(recommendation.products_data),
        "total_users": len(recommendation.user_profiles)
    }

@app.post("/recommendations")
async def get_recommendations(request: RecommendationRequest) -> RecommendationResponse:
    """Get personalized recommendations for a user"""
    try:
        if request.recommendation_type == "collaborative":
            recommendations = app.state.recommendation_engine.get_collaborative_recommendations(
                request.user_id, request.num_recommendations
            )
        elif request.recommendation_type == "content":
            recommendations = app.state.recommendation_engine.get_content_based_recommendations(
                request.user_id, request.num_recommendations
            )
        else:
            recommendations = app.state.recommendation_engine.get_hybrid_recommendations(
                request.user_id, request.num_recommendations
            )

        product_ids = [r['product_id'] for r in recommendations]
        product_hydrator = ProductHydrator(app.state.redis, app.state.meilisearch)
        recommendations = await product_hydrator.hydrate_products(product_ids=product_ids)

        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=recommendations,
            recommendation_type=request.recommendation_type,
            generated_at=datetime.now()
        )

    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@app.post("/update-models")
async def trigger_model_update(background_tasks: BackgroundTasks):
    """Manually trigger model update"""
    background_tasks.add_task(update_models_background)
    return {"message": "Model update triggered"}

async def update_models_background():
    """Background task to update models"""
    try:
        await app.state.recommendation_engine.load_data_from_db()
        await app.state.recommendation_engine.update_models()
        logger.info("Models updated via manual trigger")
    except Exception as e:
        logger.error(f"Error in manual model update: {str(e)}")

@app.get("/similar-products/{product_id}")
async def get_similar_products(product_id: int, num_recommendations: int = 5):
    """Get products similar to a given product"""
    try:
        if not app.state.recommendation_engine.item_features_matrix:
            raise HTTPException(status_code=503, detail="Content features not available")

        product_ids = app.state.recommendation_engine.item_features_matrix['product_ids']

        if product_id not in product_ids:
            raise HTTPException(status_code=404, detail="Product not found")

        product_idx = product_ids.index(product_id)
        similarities = app.state.recommendation_engine.item_similarity_matrix[product_idx]

        # Get most similar products
        similar_indices = np.argsort(similarities)[-num_recommendations-1:-1][::-1]

        recommendations = []
        for idx in similar_indices:
            similar_product_id = product_ids[idx]
            if similar_product_id in app.state.recommendation_engine.products_data:
                product_data = app.state.recommendation_engine.products_data[similar_product_id]
                recommendations.append({
                    'product_id': similar_product_id,
                    'similarity_score': float(similarities[idx]),
                    'name': product_data['name'],
                    'price': product_data['price'],
                    'ratings': product_data['ratings']
                })

        product_ids = [r['product_id'] for r in recommendations]
        product_hydrator = ProductHydrator(app.state.redis, app.state.meilisearch)
        recommendations = await product_hydrator.hydrate_products(product_ids=product_ids)

        return {
            "product_id": product_id,
            "similar_products": recommendations,
            "generated_at": datetime.now()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting similar products: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get similar products")
