import httpx
from app.core.config import settings

HF_API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"

async def get_embedding_from_hf(text: str):
    """Call Hugging Face Inference API to get embeddings."""
    headers = {
        "Authorization": f"Bearer {settings.HF_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {"inputs": text}

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(HF_API_URL, headers=headers, json=payload)

    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list) and isinstance(data[0], list):
            data = [float(x) for x in data[0]]
        return data
    else:
        raise Exception(f"HuggingFace error {response.status_code}: {response.text}")
