import numpy as np
from typing import List
from fastapi import APIRouter, Depends
from typing import List, Dict, Optional
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


# class DemoCollaborativeRecommender:
#     def __init__(self):
#         # Demo: pretend we have a user-item matrix
#         self.user_item_matrix = np.random.rand(10, 20)

#     def recommend(self, user_id: int, top_k: int = 5) -> List[str]:
#         # Demo: recommend top_k items with highest scores for the user
#         if user_id >= self.user_item_matrix.shape[0]:
#             user_id = 0  # fallback
#         scores = self.user_item_matrix[user_id]
#         top_items = np.argsort(scores)[-top_k:][::-1]
#         return [f"product_{i}" for i in top_items] 


class RecommendationEngine:
    def __init__(self):
        self.user_item_matrix = None
        self.item_features = None
        self.model_cache = {}
    
    async def get_collaborative_recommendations(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[Dict]:
        """Collaborative filtering recommendations"""
        # Get user interaction history
        interactions = await get_user_interactions(user_id)
        
        # Build user-item matrix
        user_item_df = await self._build_user_item_matrix()
        
        # Calculate user similarity
        user_similarities = cosine_similarity(user_item_df)
        
        # Get recommendations based on similar users
        recommendations = self._get_similar_user_recommendations(
            user_id, user_similarities, user_item_df, limit
        )
        
        return recommendations
    
    async def get_content_based_recommendations(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[Dict]:
        """Content-based recommendations using product features"""
        # Get user's purchase/view history
        user_products = await get_user_product_history(user_id)
        
        # Get product features (categories, brands, descriptions)
        product_features = await self._get_product_features()
        
        # Calculate product similarity
        tfidf = TfidfVectorizer(stop_words='english')
        feature_matrix = tfidf.fit_transform(product_features['combined_features'])
        
        # Find similar products
        recommendations = self._get_content_similar_products(
            user_products, feature_matrix, limit
        )
        
        return recommendations
