from fastapi import Request

from typing import List, Dict
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from datetime import datetime
import logging
from collections import defaultdict
from db import database
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RecommendationEngine:
    def __init__(self):
        logger.info("RecommendationEngine initialized")
        self.user_item_matrix = None
        self.item_features_matrix = None
        self.item_similarity_matrix = None
        self.user_similarity_matrix = None
        self.products_data = {}
        self.user_profiles = {}
        self.interaction_weights = {
            'VIEW': 1.0,
            'CART_ADD': 2.0,
            'PURCHASE': 3.0,
            'WISHLIST': 1.5
        }
        self.model_last_updated = None
        self.svd_model = None
        self.tfidf_vectorizer = None

    async def load_data_from_db(self):
        """Load and preprocess data from database"""
        try:
            async with database.pool.acquire() as conn:
                products_query = """
                    SELECT p.id, p.name, p.ratings, p.features, b.name as brand_name,
                           ARRAY_AGG(DISTINCT c.name) as categories,
                           COALESCE(pv.min_price, 0) as min_price
                    FROM products p
                    LEFT JOIN brands b ON p.brand_id = b.id
                    LEFT JOIN "_ProductCategories" pc ON p.id = pc."A"
                    LEFT JOIN categories c ON pc."B" = c.id
                    LEFT JOIN (
                        SELECT product_id, MIN(price) as min_price
                        FROM product_variants
                        GROUP BY product_id
                    ) pv ON p.id = pv.product_id
                    WHERE p.status = 'IN_STOCK'
                    GROUP BY p.id, p.name, p.ratings, p.features, b.name, pv.min_price
                """

                products = await conn.fetch(products_query)

                for product in products:
                    self.products_data[product['id']] = {
                        'name': product['name'],
                        'categories': product['categories'] or [],
                        'brand': product['brand_name'],
                        'features': product['features'] or [],
                        'ratings': float(product['ratings'] or 0),
                        'price': float(product['min_price'] or 0)
                    }


                interactions_query = """
                    SELECT user_id, product_id, type, timestamp, metadata
                    FROM user_interactions
                    WHERE timestamp >= NOW() - INTERVAL '90 days'
                    ORDER BY timestamp DESC
                """

                interactions = await conn.fetch(interactions_query)

                # Build user-item interaction matrix
                user_items = defaultdict(lambda: defaultdict(float))

                for interaction in interactions:
                    user_id = interaction['user_id']
                    product_id = interaction['product_id']
                    interaction_type = interaction['type']
                    metadata = json.loads(interaction['metadata'])
                    weight = self._get_weight(interaction_type=interaction_type.upper(), metadata=metadata)
                    user_items[user_id][product_id] += weight

                # Convert to numpy arrays for efficient computation
                self.user_item_matrix = self._create_sparse_matrix(user_items)

                preferences_query = """
                    SELECT user_id, category, brand, score
                    FROM user_preferences
                """

                preferences = await conn.fetch(preferences_query)
                logger.info(f"preferences: {preferences}")

                for pref in preferences:
                    user_id = pref['user_id']
                    if user_id not in self.user_profiles:
                        self.user_profiles[user_id] = {'categories': {}, 'brands': {}}

                    if pref['category']:
                        self.user_profiles[user_id]['categories'][pref['category']] = float(pref['score'])
                    if pref['brand']:
                        self.user_profiles[user_id]['brands'][pref['brand']] = float(pref['score'])

                logger.info(f"self.user_profiles: {self.user_profiles}")

                logger.info(f"Loaded {len(self.products_data)} products and {len(user_items)} user profiles")

        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise


    def _get_weight(self, interaction_type: str, metadata: dict) -> float:
        """
        Compute interaction weight based on type and timeSpent if VIEW.
        """
        base_weights = self.interaction_weights

        if interaction_type == 'VIEW':
            return self.compute_view_weight(metadata, base_weight=base_weights['VIEW'])
        
        return base_weights.get(interaction_type, 1.0)


    def compute_view_weight(self, metadata: dict, base_weight: float = 1.0) -> float:
        """
        Adjust VIEW weight using time spent in milliseconds (max 60 seconds considered).
        """
        try:
            time_spent = metadata.get("timeSpent", 0)
            seconds = min(time_spent / 1000.0, 60)
            scaled_weight = base_weight + (seconds / 60) * 2.0
            return scaled_weight
        except Exception as e:
            logger.warning(f"Invalid metadata format for view weighting: {metadata} - {e}")
            return base_weight

    def _create_sparse_matrix(self, user_items):
        """Create sparse user-item matrix"""
        users = list(user_items.keys())
        items = list(set(item for user_data in user_items.values() for item in user_data.keys()))

        # Create mapping dictionaries
        user_to_idx = {user: idx for idx, user in enumerate(users)}
        item_to_idx = {item: idx for idx, item in enumerate(items)}

        matrix = np.zeros((len(users), len(items)), dtype=np.float32)

        for user, items_dict in user_items.items():
            user_idx = user_to_idx[user]
            for item, rating in items_dict.items():
                item_idx = item_to_idx[item]
                matrix[user_idx, item_idx] = rating

        return {
            'matrix': matrix,
            'user_to_idx': user_to_idx,
            'item_to_idx': item_to_idx,
            'idx_to_user': {idx: user for user, idx in user_to_idx.items()},
            'idx_to_item': {idx: item for item, idx in item_to_idx.items()}
        }

    def _build_content_features(self):
        """Build content-based features matrix"""
        if not self.products_data:
            return

        # Create feature strings for each product
        feature_strings = []
        product_ids = []

        for product_id, data in self.products_data.items():
            features = []

            if data.get('categories', []):
                features.extend(str(cat) for cat in data['categories'] if cat is not None)

            if data.get('brand'):
                features.append(data['brand'])

            if data.get('features'):
                features.extend([str(feat) for feat in data['features'] if feat])

            price = data.get('price', 0)
            if price < 100:
                features.append('budget')
            elif price < 500:
                features.append('mid-range')
            else:
                features.append('premium')

            rating = data.get('ratings', 0)
            if rating >= 4.5:
                features.append('highly-rated')
            elif rating >= 3.5:
                features.append('well-rated')

            feature_strings.append(' '.join(features))
            product_ids.append(product_id)

        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            lowercase=True
        )

        tfidf_matrix = self.tfidf_vectorizer.fit_transform(feature_strings)

        num_features = tfidf_matrix.shape[1]
        n_components = min(50, num_features)
        self.svd_model = TruncatedSVD(n_components=n_components, random_state=42)
        reduced_features = self.svd_model.fit_transform(tfidf_matrix)

        self.item_features_matrix = {
            'features': reduced_features,
            'product_ids': product_ids
        }

        self.item_similarity_matrix = cosine_similarity(reduced_features)

    def _compute_user_similarity(self):
        """Compute user similarity matrix using collaborative filtering"""
        if not self.user_item_matrix or self.user_item_matrix['matrix'].shape[0] == 0:
            return

        # Use truncated SVD for dimensionality reduction
        matrix = self.user_item_matrix['matrix']

        # Apply SVD if matrix is large
        if matrix.shape[0] > 100:
            svd = TruncatedSVD(n_components=min(50, matrix.shape[0]-1), random_state=42)
            reduced_matrix = svd.fit_transform(matrix)
        else:
            reduced_matrix = matrix

        self.user_similarity_matrix = cosine_similarity(reduced_matrix)

    async def update_models(self):
        """Update recommendation models"""
        try:
            self._build_content_features()
            self._compute_user_similarity()
            self.model_last_updated = datetime.now()
        except Exception as e:
            logger.error(f"Error updating models: {str(e)}")

    def get_collaborative_recommendations(self, user_id: int, num_recommendations: int = 10) -> List[Dict]:
        """Get collaborative filtering recommendations"""
        if not self.user_item_matrix or user_id not in self.user_item_matrix['user_to_idx']:
            return []

        user_idx = self.user_item_matrix['user_to_idx'][user_id]
        user_ratings = self.user_item_matrix['matrix'][user_idx]

        # Find similar users
        if self.user_similarity_matrix is not None:
            user_similarities = self.user_similarity_matrix[user_idx]
            similar_users = np.argsort(user_similarities)[-11:-1]  # Top 10 similar users (excluding self)

            # Get recommendations based on similar users
            recommendations = defaultdict(float)

            for similar_user_idx in similar_users:
                similarity = user_similarities[similar_user_idx]
                if similarity > 0.1:  # Minimum similarity threshold
                    similar_user_ratings = self.user_item_matrix['matrix'][similar_user_idx]

                    for item_idx, rating in enumerate(similar_user_ratings):
                        if rating > 0 and user_ratings[item_idx] == 0:  # User hasn't interacted with this item
                            item_id = self.user_item_matrix['idx_to_item'][item_idx]
                            recommendations[item_id] += similarity * rating

            # Sort and return top recommendations
            sorted_recommendations = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)

            results = []
            for item_id, score in sorted_recommendations[:num_recommendations]:
                if item_id in self.products_data:
                    results.append({
                        'product_id': item_id,
                        'score': float(score),
                        'name': self.products_data[item_id]['name'],
                        'price': self.products_data[item_id]['price'],
                        'ratings': self.products_data[item_id]['ratings']
                    })

            return results

        return []

    def get_content_based_recommendations(self, user_id: int, num_recommendations: int = 10) -> List[Dict]:
        """Get content-based recommendations"""
        if not self.item_features_matrix or user_id not in self.user_profiles:
            return self._get_popular_items(num_recommendations)

        user_profile = self.user_profiles[user_id]
        recommendations = defaultdict(float)

        # Score items based on user preferences
        for i, product_id in enumerate(self.item_features_matrix['product_ids']):
            if product_id in self.products_data:
                product_data = self.products_data[product_id]
                score = 0

                # Category preferences
                for category in product_data['categories']:
                    if category in user_profile.get('categories', {}):
                        score += user_profile['categories'][category]

                # Brand preferences
                if product_data['brand'] and product_data['brand'] in user_profile.get('brands', {}):
                    score += user_profile['brands'][product_data['brand']]

                # Rating bonus
                score += product_data['ratings'] * 0.1

                recommendations[product_id] = score

        # Sort and return top recommendations
        sorted_recommendations = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)

        results = []
        for item_id, score in sorted_recommendations[:num_recommendations]:
            if item_id in self.products_data:
                results.append({
                    'product_id': item_id,
                    'score': float(score),
                    'name': self.products_data[item_id]['name'],
                    'price': self.products_data[item_id]['price'],
                    'ratings': self.products_data[item_id]['ratings']
                })

        return results

    def get_hybrid_recommendations(self, user_id: int, num_recommendations: int = 10) -> List[Dict]:
        """Get hybrid recommendations combining collaborative and content-based"""
        collaborative_recs = self.get_collaborative_recommendations(user_id, num_recommendations * 2)
        content_recs = self.get_content_based_recommendations(user_id, num_recommendations * 2)

        # Combine recommendations with weighted scores
        combined_scores = defaultdict(float)

        # Weight collaborative filtering more heavily
        for rec in collaborative_recs:
            combined_scores[rec['product_id']] += rec['score'] * 0.7

        # Add content-based scores
        for rec in content_recs:
            combined_scores[rec['product_id']] += rec['score'] * 0.3

        # Sort and return top recommendations
        sorted_recommendations = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)

        results = []
        for item_id, score in sorted_recommendations[:num_recommendations]:
            if item_id in self.products_data:
                results.append({
                    'product_id': item_id,
                    'score': float(score),
                    'name': self.products_data[item_id]['name'],
                    'price': self.products_data[item_id]['price'],
                    'ratings': self.products_data[item_id]['ratings']
                })

        return results

    def _get_popular_items(self, num_recommendations: int = 10) -> List[Dict]:
        """Fallback to popular items when no personalized recommendations available"""
        popular_items = sorted(
            self.products_data.items(),
            key=lambda x: x[1]['ratings'],
            reverse=True
        )[:num_recommendations]

        return [
            {
                'product_id': item_id,
                'score': data['ratings'],
                'name': data['name'],
                'price': data['price'],
                'ratings': data['ratings']
            }
            for item_id, data in popular_items
        ]


async def get_recommendation_dependency(request: Request):
    logger.info(f"RecommendationEngine initialized: {request}")
    return recommendation_engine


recommendation_engine = RecommendationEngine()
