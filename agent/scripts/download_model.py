"""
Bakes the FastEmbed model into the Docker image at build time.
"""
import os
from fastembed import TextEmbedding

cache_dir: str = os.environ.get("FASTEMBED_CACHE_PATH", "/app/models")
os.makedirs(cache_dir, exist_ok=True)

print(f"Downloading model to {cache_dir}...")
TextEmbedding("sentence-transformers/all-MiniLM-L6-v2", cache_dir=cache_dir)
print("Done.")