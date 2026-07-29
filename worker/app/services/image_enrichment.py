import asyncio
import json
import httpx
from io import BytesIO
from PIL import Image
from google import genai
from app.config import settings
from app.logger import logger

# Initialize Gemini Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL = settings.GEMINI_MODEL

async def get_enrichment(img_url: str) -> dict:
    """
    Fetches product data from Gemini. Bypasses APIs in development mode.
    """
    # 🚀 DEV MODE
    if settings.ENVIRONMENT == "development":
        logger.info(f"🛡️ [AI MOCK] Bypassing Gemini API and image download for: {img_url}")
        return {
            "title": "Mock Premium Product Title",
            "description": "This is a local development mock description generated to save API units.",
            "features": ["Feature One", "Feature Two", "Feature Three"],
            "slug": "mock-premium-product-title-slug-id-dev"
        }


    async with httpx.AsyncClient() as httpx_client:
        response = await httpx_client.get(img_url, timeout=10.0)
        response.raise_for_status()
        
    img = Image.open(BytesIO(response.content))
    if img.mode != "RGB":
        img = img.convert("RGB")

    prompt = (
        "Here is an image of a product. "
        "Generate a concise product title (max 60 characters), slug and "
        "a descriptive paragraph for e-commerce + SEO, and also product features. "
        "Include material, color, key features, usage scenario. "
        "Return your response as a JSON object with four keys: 'title', 'slug','description' and 'features'. "
        "Do not include any markdown formatting or code blocks, just the raw JSON. "
        "For the slug, include a distinguishing detail (fit, wash, pattern, or notable feature) "
        "so it stays unique even across similar products — not just 'blue-denim-shorts' but "
        "'distressed-light-wash-denim-shorts-frayed-hem'."
    )

    # Wrap the synchronous Gemini SDK call in asyncio executor so it runs smoothly
    loop = asyncio.get_running_loop()
    resp = await loop.run_in_executor(
        None, 
        lambda: client.models.generate_content(model=MODEL, contents=[prompt, img])
    )
    
    generated_text = resp.text.strip()

    if generated_text.startswith("```"):
        generated_text = generated_text.split("```")[1]
        if generated_text.startswith("json"):
            generated_text = generated_text[4:].strip()

    return json.loads(generated_text)

