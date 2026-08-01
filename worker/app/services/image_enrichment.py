import asyncio
import json
import re
import httpx
from io import BytesIO
from PIL import Image
from google import genai
from app.config import settings
from app.logger import logger

client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL: str = settings.GEMINI_MODEL

def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def _build_unique_slug(title: str, sku: str) -> str:
    """
    Deterministic, DB-independent uniqueness: title provides the readable
    part, sku (already unique per product) guarantees no collision — two
    products can share a similar title but never a sku.
    """
    base = _slugify(title)[:80]  # leave room for the sku suffix
    sku_part = _slugify(sku)
    return f"{base}-{sku_part}"


async def get_enrichment(img_url: str, sku: str) -> dict:
    """
    Fetches product data from Gemini. Bypasses APIs in development mode.
    `sku` is required so the slug can be built deterministically unique.
    """
    if settings.ENVIRONMENT == "development":
        logger.info(f"🛡️ [AI MOCK] Bypassing Gemini API and image download for: {img_url}")
        return {
            "title": "Mock Premium Product Title",
            "description": "This is a local development mock description generated to save API units.",
            "features": ["Feature One", "Feature Two", "Feature Three"],
            "slug": _build_unique_slug("Mock Premium Product Title", sku),
        }

    async with httpx.AsyncClient() as httpx_client:
        response = await httpx_client.get(img_url, timeout=10.0)
        response.raise_for_status()

    img = Image.open(BytesIO(response.content))
    if img.mode != "RGB":
        img = img.convert("RGB")

    prompt = (
        "Here is an image of a product. "
        "Generate a concise product title (max 60 characters) and "
        "a descriptive paragraph for e-commerce + SEO, and also product features. "
        "Include material, color, key features, usage scenario. "
        "Return your response as a JSON object with three keys: 'title', 'description' and 'features'. "
        "Do not include any markdown formatting or code blocks, just the raw JSON."
    )

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

    data = json.loads(generated_text)
    data["slug"] = _build_unique_slug(data["title"], sku)
    return data