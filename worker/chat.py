import google.generativeai as genai
from datetime import datetime
from config import settings
from rag import format_search_results_for_llm, smart_search

genai.configure(api_key=settings.GEMINI_API_KEY)


class ConversationalRAG:
    """
    Stateful conversational assistant that remembers context.
    Industry standard approach for production chatbots.
    """
    
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model = genai.GenerativeModel(model_name)
        self.chat = self.model.start_chat(history=[])
        self.conversation_history = []
        
        self.system_prompt = """You are a knowledgeable e-commerce assistant for a Nigerian online store. 

        Your capabilities:
        - Help customers find products based on their needs
        - Answer questions about product availability, sizes, colors, and prices
        - Provide recommendations based on customer preferences
        - Handle inquiries about categories and collections

        Guidelines:
        - Always use the product search results provided to answer questions
        - Be specific when mentioning products (include names, prices, sizes)
        - If a product isn't available, suggest alternatives from the search results
        - Be warm, professional, and helpful
        - Use Nigerian Naira (₦) for all prices
        - Remember previous exchanges in our conversation"""
    
    def chat(self, user_message: str, top_k: int = 5) -> str:
        """Send a message and get a response with product context."""
        
        # Retrieve relevant products
        results = smart_search(user_message, top_k=top_k)
        context = format_search_results_for_llm(results)
        
        # Build message with context
        full_message = f"""{self.system_prompt}

        CURRENT PRODUCT SEARCH RESULTS:
        {context}

        CUSTOMER MESSAGE: {user_message}"""
        
        # Get response
        response = self.chat.send_message(full_message)
        assistant_reply = response.text
        
        # Store in history
        self.conversation_history.append({
            "user": user_message,
            "assistant": assistant_reply,
            "products_shown": [r['meta'].get('name') for r in results if r.get('meta')],
            "timestamp": datetime.now().isoformat()
        })
        
        return assistant_reply
    
    def get_history(self) -> List[Dict]:
        """Get conversation history."""
        return self.conversation_history
    
    def reset(self):
        """Reset conversation."""
        self.chat = self.model.start_chat(history=[])
        self.conversation_history = []

assistant = ConversationalRAG()
