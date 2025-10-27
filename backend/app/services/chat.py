from google import genai
from datetime import datetime
from app.core.config import settings
from app.services.rag import format_search_results_for_llm, smart_search
from typing import List, Dict

client = genai.Client(api_key=settings.GEMINI_API_KEY)


class ConversationalRAG:
    """
    Stateful conversational assistant that remembers context.
    """
    
    def __init__(self):
        self.client = client
        self.model_name = settings.GEMINI_MODEL
        self.conversation_history = []
        
        self.system_prompt = """You are a knowledgeable e-commerce assistant for our online store.

        **Always respond in Markdown format** so your answers look clean and well-structured in the chat UI.

        Your capabilities:
        - Help customers find products based on their needs
        - Answer questions about product availability, sizes, colors, ages, and prices
        - Provide recommendations based on customer preferences
        - Handle inquiries about categories and collections

        Guidelines:
        - Always use the product search results provided to answer questions
        - Be specific when mentioning products (include names, prices, sizes)
        - If a product isn't available, suggest alternatives from the search results
        - Be warm, professional, and helpful
        - Use Nigerian Naira (₦) for all prices
        - Remember previous exchanges in our conversation

        Answer naturally. Do NOT say "based on the search results".

        When recommending or describing products, respond in **Markdown format** with clear and attractive structure.

        Example format:
        **{{
        Product Name
        }}**
        - 💰 Price: ₦{{price}}
        - 🎨 Color: {{color}}
        - 📏 Sizes: {{sizes}}
        - 🛒 [View Product](/products/{{slug}})
        - 🖼️ Image: ![{{name}}]({{image_url}})

        When recommending collections the path is /collections/{{slug}}
        When recommending products the path is /products/{{slug}}
        - Be conversational, concise, and friendly.
        """
    
    async def chat(self, user_message: str, history: str, top_k: int = 5) -> str:
        """Send a message and get a response with product context."""
        
        results = await smart_search(user_message, top_k=top_k)
        context = await format_search_results_for_llm(results)
        
        full_message = f"""{self.system_prompt}

        CURRENT PRODUCT SEARCH RESULTS:
        {context}

        {history}

        CUSTOMER MESSAGE: {user_message}"""
        
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_message,
        )
        
        assistant_reply = response.text
        
        self.conversation_history.append({
            "user": user_message,
            "assistant": assistant_reply,
            "products_shown": [r['meta'].get('name') for r in results if r.get('meta')],
            "timestamp": datetime.now().isoformat()
        })
        
        return assistant_reply
    
    async def get_history(self) -> List[Dict]:
        """Get conversation history."""
        return self.conversation_history
    
    async def reset(self):
        """Reset conversation."""
        self.conversation_history = []

assistant = ConversationalRAG()
