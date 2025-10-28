import json
import requests
from PIL import Image
from io import BytesIO
from google import genai
from config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL = settings.GEMINI_MODEL

def get_enrichment(img_url: str) -> dict:
    response = requests.get(img_url)
    img = Image.open(BytesIO(response.content)).convert("RGB")

    prompt = (
        "Here is an image of a product. "
        "Generate a concise product title (max 60 characters) and "
        "a descriptive paragraph for e-commerce + SEO. "
        "Include features like material, color, usage. "
        "Return JSON keys: title, description, features ONLY."
    )

    resp = client.models.generate_content(
        model=MODEL, contents=[prompt, img]
    )
    text = resp.text.strip()

    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:].strip()

    return json.loads(text)
